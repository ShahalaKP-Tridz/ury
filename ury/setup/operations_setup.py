import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_operations_setup():
    company = frappe.get_all("Company", limit=1)
    company_name = company[0].name if company else ""
    
    rooms = frappe.get_all("URY Room", filters={"branch": company_name}, fields=["*"])
    tables = []
    
    if rooms:
        tables = frappe.get_all("URY Restaurant Table", filters={"room": ["in", [r.name for r in rooms]]}, fields=["*"])

    return {
        "status": "success",
        "data": {
            "rooms": rooms,
            "tables": tables
        }
    }

@frappe.whitelist(allow_guest=True)
def update_operations_setup(rooms=None, tables=None):
    if rooms:
        if isinstance(rooms, str):
            rooms = frappe.parse_json(rooms)
        for room in rooms:
            if room.get("name") and frappe.db.exists("URY Room", room.get("name")):
                rdoc = frappe.get_doc("URY Room", room.get("name"))
                rdoc.update(room)
                rdoc.save(ignore_permissions=True)
            else:
                rdoc = frappe.get_doc({"doctype": "URY Room", **room})
                rdoc.insert(ignore_permissions=True)
                
    if tables:
        if isinstance(tables, str):
            tables = frappe.parse_json(tables)
        for table in tables:
            if table.get("name") and frappe.db.exists("URY Restaurant Table", table.get("name")):
                tdoc = frappe.get_doc("URY Restaurant Table", table.get("name"))
                tdoc.update(table)
                tdoc.save(ignore_permissions=True)
            else:
                tdoc = frappe.get_doc({"doctype": "URY Restaurant Table", **table})
                tdoc.insert(ignore_permissions=True)
                
    return {"status": "success"}
