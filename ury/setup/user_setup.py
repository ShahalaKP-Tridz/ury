import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_user_setup():
    roles = ["URY Cashier", "Cashier"]
    cashier_roles = [r.name for r in frappe.get_all("Role", filters={"name": ["in", roles]})]
    
    cashiers = []
    if cashier_roles:
        users = frappe.get_all("Has Role", filters={"role": ["in", cashier_roles], "parenttype": "User"}, fields=["parent as user"])
        user_list = list(set([u.user for u in users]))
        if user_list:
            cashiers = frappe.get_all("User", filters={"name": ["in", user_list]}, fields=["name", "username", "full_name", "email"])
            
    return {
        "status": "success",
        "data": {
            "cashier_users": cashiers
        }
    }

@frappe.whitelist(allow_guest=True)
def update_user_setup(users=None):
    if users:
        if isinstance(users, str):
            users = frappe.parse_json(users)
        for u in users:
            if u.get("email") and frappe.db.exists("User", u.get("email")):
                user = frappe.get_doc("User", u.get("email"))
                if u.get("full_name"):
                    user.full_name = u.get("full_name")
                if u.get("password"):
                    user.new_password = u.get("password")
                user.save(ignore_permissions=True)
            elif u.get("email"):
                # Create default cashier
                user = frappe.new_doc("User")
                user.email = u.get("email")
                user.first_name = u.get("full_name", "Cashier")
                user.send_welcome_email = 0
                if u.get("password"):
                    user.new_password = u.get("password")
                user.append("roles", {"role": "URY Cashier"})
                user.insert(ignore_permissions=True)
                
    return {"status": "success"}
