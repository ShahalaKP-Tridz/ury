import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_sales_setup():
    company = frappe.get_all("Company", limit=1)
    company_name = company[0].name if company else ""
    
    taxes = frappe.get_all("Sales Taxes and Charges Template", filters={"company": company_name}, fields=["name", "title", "is_default"])
    groups = frappe.get_all("Item Group", filters={"is_group": 0}, fields=["name", "item_group_name"])
    
    return {
        "status": "success",
        "data": {
            "taxes": taxes,
            "menus": groups
        }
    }

@frappe.whitelist(allow_guest=True)
def update_sales_setup(taxes=None, menus=None):
    if taxes:
        if isinstance(taxes, str):
            taxes = frappe.parse_json(taxes)
        for tax in taxes:
            if tax.get("name") and frappe.db.exists("Sales Taxes and Charges Template", tax.get("name")):
                doc = frappe.get_doc("Sales Taxes and Charges Template", tax.get("name"))
                # Frontend might pass logic to set inclusive/exclusive defaults here
                doc.update(tax)
                doc.save(ignore_permissions=True)
                
    return {"status": "success"}
