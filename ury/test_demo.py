import frappe
from ury.setup.demo import setup_ury_demo_data, clear_demo_data

def run():
    frappe.set_user("Administrator")
    print("Clearing leftover demo data...")
    try:
        clear_demo_data()
    except Exception as e:
        print("Clear demo data warning:", str(e))
        
    print("Deleting orphaned BOMs...")
    frappe.db.sql("DELETE FROM tabBOM")
    frappe.db.sql("DELETE FROM `tabBOM Item`")
    frappe.db.commit()

    print("Setting up demo data for Test Company...")
    try:
        # Provide prerequisite company
        if not frappe.db.exists("Company", "Test Company"):
            c = frappe.new_doc("Company")
            c.company_name = "Test Company"
            c.abbr = "TC"
            c.default_currency = "INR"
            c.country = "India"
            c.insert(ignore_permissions=True)

        frappe.db.set_single_value("Global Defaults", "default_company", "Test Company")
        frappe.db.set_single_value("Global Defaults", "demo_company", "Test Company")
        frappe.db.commit()

        setup_ury_demo_data("Test Company")
        frappe.db.commit()
        print("Demo Data Setup OK")
    except Exception as e:
        print("Demo Data Setup FAILED")
        import traceback
        traceback.print_exc()
