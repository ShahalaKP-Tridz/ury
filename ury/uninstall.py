import click
import frappe



def before_uninstall():
    try:
        print("Removing customizations created by the Frappe URY app...")
        # remove_custom_fields()

    except:
        print("Failed To Remove Customizations.")

def uninstall():
	ROLES = ["URY Manager", "URY Captain", "URY Cashier"]

	frappe.db.delete("Custom DocPerm",{"role": ["in", ROLES]})

	print ("* removing URY Roles...")
	frappe.db.delete("Role", {"name": ["in", ROLES]})