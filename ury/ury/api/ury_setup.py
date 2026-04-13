import frappe
from frappe import _

@frappe.whitelist()
def check_setup_status():
    """Checks if the restaurant setup is complete."""
    # Logic: If at least one URY Restaurant is configured, setup is considered complete.
    restaurant_exists = frappe.db.exists("URY Restaurant")
    
    return {
        "setup_complete": bool(restaurant_exists)
    }

@frappe.whitelist()
def complete_onboarding(data):
    """
    Finalizes the onboarding by creating the necessary Frappe documents.
    Expected data: {
        organization: { companyName, abbreviation, country, currency, ... },
        menu: { items: [{ name, price }], taxType },
        ...
    }
    """
    if frappe.db.exists("URY Restaurant"):
        frappe.throw(_("Setup is already complete."))

    org = data.get("organization", {})
    menu_data = data.get("menu", {})
    
    # 1. Create Company if it doesn't exist
    company_name = org.get("companyName")
    if not frappe.db.exists("Company", company_name):
        company = frappe.get_doc({
            "doctype": "Company",
            "company_name": company_name,
            "abbr": org.get("abbreviation", company_name[:3].upper()),
            "default_currency": org.get("currency", "INR"),
            "country": org.get("country", "India")
        })
        company.insert(ignore_permissions=True)
    
    # 2. Create Branch
    branch_name = f"{company_name} Main"
    if not frappe.db.exists("Branch", branch_name):
        branch = frappe.get_doc({
            "doctype": "Branch",
            "branch": branch_name
        })
        branch.insert(ignore_permissions=True)

    # 3. Create URY Room (Default)
    room_name = "Dining Hall"
    if not frappe.db.exists("URY Room", room_name):
        room = frappe.get_doc({
            "doctype": "URY Room",
            "room_name": room_name
        })
        room.insert()

    # 4. Create URY Restaurant
    restaurant = frappe.get_doc({
        "doctype": "URY Restaurant",
        "name": company_name,
        "company": company_name,
        "branch": branch_name,
        "invoice_series_prefix": f"{org.get('abbreviation', 'URY')}/INV/",
        "default_room": room_name
    })
    restaurant.insert(ignore_permissions=True)

    # 5. Create Menu and Items
    if menu_data.get("items"):
        menu = frappe.get_doc({
            "doctype": "URY Menu",
            "menu_name": f"{company_name} Standard Menu",
            "is_active": 1
        })
        menu.insert()
        
        for item in menu_data.get("items"):
            if item.get("name") and item.get("price"):
                # Create Menu Item
                menu_item = frappe.get_doc({
                    "doctype": "URY Menu Item",
                    "item_name": item["name"],
                    "price": flt(item["price"]),
                    "menu": menu.name
                })
                menu_item.insert()

    return {"status": "success", "message": _("Onboarding completed successfully.")}

def flt(val):
    try:
        return float(val)
    except:
        return 0.0
