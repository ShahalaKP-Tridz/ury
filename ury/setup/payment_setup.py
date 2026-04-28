import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_payment_setup():
    company = frappe.get_all("Company", limit=1)
    company_name = company[0].name if company else ""
    
    modes = frappe.get_all("Mode of Payment", fields=["name", "type"])
    pos_profile = frappe.get_all("POS Profile", filters={"company": company_name}, limit=1)
    
    default_payments = []
    if pos_profile:
        profile_doc = frappe.get_doc("POS Profile", pos_profile[0].name)
        default_payments = profile_doc.get("payments", [])
        
    return {
        "status": "success",
        "data": {
            "available_modes": modes,
            "default_payments": [p.as_dict() for p in default_payments]
        }
    }

@frappe.whitelist(allow_guest=True)
def update_payment_setup(payments=None):
    if payments:
        if isinstance(payments, str):
            payments = frappe.parse_json(payments)
        company = frappe.get_all("Company", limit=1)
        company_name = company[0].name if company else ""
        
        pos_profile = frappe.get_all("POS Profile", filters={"company": company_name}, limit=1)
        if pos_profile:
            profile_doc = frappe.get_doc("POS Profile", pos_profile[0].name)
            profile_doc.set("payments", [])
            for p in payments:
                profile_doc.append("payments", p)
            profile_doc.save(ignore_permissions=True)
            
    return {"status": "success"}
