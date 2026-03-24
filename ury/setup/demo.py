import json
import os
from random import randint

import frappe
from frappe import _, scrub
from frappe.utils import add_days, getdate



from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry
from erpnext.accounts.utils import get_fiscal_year
from erpnext.buying.doctype.purchase_order.purchase_order import make_purchase_invoice
from erpnext.selling.doctype.sales_order.sales_order import make_sales_invoice
from erpnext.stock.doctype.material_request.material_request import make_purchase_order
from erpnext.stock.doctype.material_request.material_request import make_stock_entry
from ury.setup.pos_demo import generate_pos_demo


def setup_ury_demo_data(company):
    from frappe.utils.telemetry import capture

    capture("demo_data_creation_started", "ury")
    try:
        frappe.defaults.set_user_default("Company", company)
        process_masters(company)
        process_transactions(company)
        generate_pos_demo()
        frappe.cache.delete_keys("bootinfo")
        frappe.publish_realtime("demo_data_complete")
    except Exception:
        frappe.log_error("Failed to create demo data")
        capture("demo_data_creation_failed", "ury", properties={"exception": frappe.get_traceback()})
        raise
    capture("demo_data_creation_completed", "ury")



def process_masters(company):
    for doctype in frappe.get_hooks("ury_demo_master_doctypes"):
        data = read_data_file_using_hooks(doctype)
        if data:
            for item in json.loads(data):
                replace_placeholders(item, company)
                create_demo_record(item)
                document = frappe.get_doc(item)
                if document.meta.is_submittable:
                    document.submit()


def create_demo_record(doctype):
    frappe.get_doc(doctype).insert(ignore_permissions=True)


def process_transactions(company):
    frappe.db.set_single_value("Stock Settings", "allow_negative_stock", 1)
    from erpnext.accounts.utils import FiscalYearError

    try:
        start_date = get_fiscal_year(date=getdate())[1]
    except FiscalYearError:
        # User might have setup fiscal year for previous or upcoming years
        active_fiscal_years = frappe.db.get_all("Fiscal Year", filters={"disabled": 0}, as_list=1)
        if active_fiscal_years:
            start_date = frappe.db.get_value("Fiscal Year", active_fiscal_years[0][0], "year_start_date")
        else:
            frappe.throw(_("There are no active Fiscal Years for which Demo Data can be generated."))

    for doctype in frappe.get_hooks("ury_demo_transaction_doctypes"):
        data = read_data_file_using_hooks(doctype)
        if data:
            for item in json.loads(data):
                replace_placeholders(item, company)
                create_transaction(item, company, start_date)
    convert_material_requests()
    convert_order_to_invoices()
    frappe.db.set_single_value("Stock Settings","allow_negative_stock", 0)


def create_transaction(doctype, company, start_date):
    document_type = doctype.get("doctype")
    warehouse = get_warehouse(company)
    if document_type == "Purchase Order":
        posting_date = get_random_date(start_date, 1, 25)
    else:
        posting_date = get_random_date(start_date, 31, 350)
    doctype.update(
        {
        "company": company,
        "set_posting_time": 1,
        "transaction_date": posting_date,
        "schedule_date": posting_date,
        "delivery_date": posting_date,
        "set_warehouse": warehouse
        }
    )
    if document_type == "Material Request":
        for item in doctype.get("items", []):
            item["warehouse"] = get_warehouse(company)
            if doctype.get("material_request_type") == "Material Transfer":
                w1, w2 = get_two_warehouses(company)
                item["from_warehouse"] = w1
                item["warehouse"] = w2
    if document_type == "Purchase Order":
        for item in doctype.get("items", []):
            if not item.get("rate"):
                item["rate"] = 100
    doc = frappe.get_doc(doctype)
    doc.save(ignore_permissions=True)
    doc.submit()

def convert_order_to_invoices():
    for document in ["Purchase Order", "Sales Order"]:
        # Keep some orders intentionally unbilled/unpaid
        for i, order in enumerate(
            frappe.db.get_all(
                document, filters={"docstatus": 1}, fields=["name", "transaction_date"], limit=8
            )
        ):
            if document == "Purchase Order":
                invoice = make_purchase_invoice(order.name)
            elif document == "Sales Order":
                invoice = make_sales_invoice(order.name)
            invoice.set_posting_time = 1
            invoice.posting_date = order.transaction_date
            invoice.due_date = order.transaction_date
            invoice.bill_date = order.transaction_date

            if invoice.get("payment_schedule"):
                invoice.payment_schedule[0].due_date = order.transaction_date

            invoice.update_stock = 1
            invoice.submit()
            
            if i % 2 != 0:
                payment = get_payment_entry(invoice.doctype, invoice.name)
                payment.posting_date = order.transaction_date
                payment.reference_no = invoice.name
                payment.reference_date = order.transaction_date

                amount = invoice.outstanding_amount or invoice.grand_total

                if amount <= 0:
                    continue

                for ref in payment.references:
                    ref.allocated_amount = amount

                    # force totals
                payment.paid_amount = amount
                payment.received_amount = amount

                payment.set_amounts()
                print("Payment Type:", payment.payment_type)
                print("Paid Amount:", payment.paid_amount)
                print("Received Amount:", payment.received_amount)
                print("Allocated:", payment.references[0].allocated_amount)
                payment.insert(ignore_permissions=True)
                payment.submit()


def get_random_date(start_date, start_range, end_range):
    return add_days(start_date, randint(start_range, end_range))


def read_data_file_using_hooks(doctype):
    path = os.path.join(os.path.dirname(__file__), "demo_data")
    filename = scrub(doctype) + ".json"
    with open(os.path.join(path, filename)) as f:
        return f.read()

    
def convert_material_requests():
    material_requests = frappe.db.get_all(
        "Material Request",
        filters={"docstatus": 1},
        fields=["name", "material_request_type"]
    )
    for mr in material_requests:
        if mr.material_request_type == "Purchase":
            # Create Purchase Order
            po = make_purchase_order(mr.name)
            po.supplier = get_supplier()
            for item in po.items:
                item.schedule_date = po.transaction_date
            po.insert(ignore_permissions=True)
            po.submit()
        elif mr.material_request_type == "Material Transfer":
            # Create Stock Entry
            se = make_stock_entry(mr.name)
            se.insert(ignore_permissions=True)
            se.submit()

def get_two_warehouses(company):
    w1 = get_warehouse(company)
    w2 = get_warehouse(company)
    while w1 == w2:
        w2 = get_warehouse(company)
    return w1, w2


def get_bom_for_item(item_code, company):
    bom = frappe.db.get_value(
        "BOM",
        {
            "item": item_code,
            "company": company,
            "is_default": 1
        }
    )
    if not bom:
        frappe.throw(f"No default BOM found for Item {item_code}")
    return bom


def get_cash_account(company):
    return frappe.db.get_value(
        "Account",
        {"company": company, "account_type": "Cash", "is_group": 0},
        "name"
    )


def get_write_off_account(company):
    account = frappe.db.get_value(
        "Account",
        {
            "company": company,
            "root_type": "Expense",
            "is_group": 0
        },
        "name"
    )
    if not account:
        frappe.throw("No Expense Account found for Write Off")
    return account

def get_cost_center(company):
    return frappe.db.get_value(
        "Cost Center",
        {"company": company, "is_group": 0},
        "name"
    )

def replace_placeholders(data, company):
    if isinstance(data, dict):
        for key, value in data.items():
            if value == "__CASH_ACCOUNT__":
                data[key] = get_cash_account(company)
            elif value == "__WRITE_OFF_ACCOUNT__":
                data[key] = get_write_off_account(company)
            elif value == "__COST_CENTER__":
                data[key] = get_cost_center(company)
            elif value == "__WAREHOUSE__":
                data[key] = get_warehouse(company)
            elif isinstance(value, str) and value.startswith("__BOM_FOR_"):
                item_code = value.replace("__BOM_FOR_", "").replace("__", "")
                data[key] = get_bom_for_item(item_code, company)
            else:
                replace_placeholders(value, company)
    elif isinstance(data, list):
        for item in data:
            replace_placeholders(item, company)


def get_warehouse(company):
    warehouses = frappe.db.get_all("Warehouse", {"company": company, "is_group": 0})
    return warehouses[randint(0, 3)].name

def get_supplier():
    suppliers = frappe.db.get_all("Supplier", pluck="name")
    return suppliers[randint(0, len(suppliers) - 1)]