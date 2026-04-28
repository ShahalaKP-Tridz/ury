import frappe

def execute():
    meta = frappe.get_meta('POS Profile User')
    fields = [df.fieldname for df in meta.fields]
    print(fields)
