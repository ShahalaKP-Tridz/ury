import frappe
from frappe import _
from erpnext.setup.setup_wizard.operations.taxes_setup import setup_taxes_and_charges
from ury.setup.demo import setup_ury_demo_data

@frappe.whitelist(allow_guest=True)
def setup_organization(**kwargs):
    """
    API for Minimal Installation Page 1 (Organization Setup)
    """
    company_name = kwargs.get("company_name")
    abbr = kwargs.get("abbr")
    country = kwargs.get("country")
    timezone = kwargs.get("timezone")
    tax_system = kwargs.get("tax_system") # e.g. GST/VAT
    currency = kwargs.get("currency")
    user_name = kwargs.get("user_name")
    email = kwargs.get("email")
    password = kwargs.get("password")
    generate_demo_data = kwargs.get("generate_demo_data")

    if not (company_name and abbr and country and currency and email and user_name):
        frappe.throw(_("Missing required fields for organization setup."))

    # 1. User Creation
    if not frappe.db.exists("User", email):
        user = frappe.new_doc("User")
        user.email = email
        user.first_name = user_name
        user.send_welcome_email = 0
        user.insert(ignore_permissions=True)
        
        # Assign System Manager Role explicitly so they can be the initial owner
        if not frappe.db.exists("Has Role", {"parent": email, "role": "System Manager"}):
            user.append("roles", {"role": "System Manager"})
            
        if password:
            user.new_password = password
            
        user.save(ignore_permissions=True)

    # 2. Company Creation
    if not frappe.db.exists("Company", company_name):
        company = frappe.new_doc("Company")
        company.company_name = company_name
        company.abbr = abbr
        company.country = country
        company.default_currency = currency
        company.chart_of_accounts_based_on = "Standard Template"
        company.enable_perpetual_inventory = 1 
        company.insert(ignore_permissions=True)
        frappe.db.commit() # Ensure company is saved before tax generation
    else:
        company = frappe.get_doc("Company", company_name)
    
    # Set Global Defaults
    frappe.db.set_single_value("Global Defaults", "default_company", company.name)
    frappe.db.set_default("company", company.name)
    if timezone:
        frappe.db.set_default("time_zone", timezone)

    # 3. Tax Setup Implementation
    try:
        # Utilizing ERPNext's standard tax setup for the provided country
        setup_taxes_and_charges(company.name, company.country)
        frappe.db.commit()
    except Exception as e:
        frappe.log_error(f"Tax setup failed for {company.name}", str(e))

    # 4. Demo Data Script
    if generate_demo_data in [1, "1", True, "true"]:
        frappe.db.set_default("demo_data_type", "ury")
        frappe.db.set_single_value("Global Defaults", "demo_company", company.name)
        
        try:
            # We call the existing script to populate dummy items, tables, POS invoices
            # This data will be automatically flagged by the demo logic
            setup_ury_demo_data(company.name)
        except Exception as e:
            frappe.log_error("Failed to generate demo data during minimal installation", str(e))
            return {"status": "success", "message": _("Organization setup completed successfully, but demo data generation encountered an issue.")}

    # 5. Automatic Login for the newly created user
    if password:
        try:
            from frappe.auth import LoginManager
            frappe.local.login_manager = LoginManager()
            frappe.local.login_manager.login_as(email)
        except Exception as e:
            frappe.log_error("Automatic login failed during setup", str(e))

    return {"status": "success", "message": _("Organization setup completed successfully.")}


@frappe.whitelist(allow_guest=True)
def upload_menu_csv(file_url=None):
    """
    Parses an uploaded CSV file from Frappe generic attachment or explicit multipart file uploads.
    """
    import csv, io
    content = ""
    
    if file_url:
        file_doc = frappe.get_doc("File", {"file_url": file_url})
        content = file_doc.get_content().decode("utf-8")
    elif getattr(frappe.request, "files", None) and "file" in frappe.request.files:
        file_obj = frappe.request.files["file"]
        content = file_obj.read().decode("utf-8")
    else:
        frappe.throw(_("No file provided for upload."))

    try:
        stream = io.StringIO(content)
        reader = csv.DictReader(stream)
        items = []
        for row in reader:
            keys = list(row.keys())
            name_key = next((k for k in keys if "name" in k.lower() or "item" in k.lower()), None)
            price_key = next((k for k in keys if "price" in k.lower() or "rate" in k.lower()), None)
            
            if name_key and price_key and row[name_key]:
                try:
                    price = float(row[price_key])
                except ValueError:
                    price = 0.0
                items.append({
                    "item_name": row[name_key].strip(),
                    "price": price
                })
        return {"status": "success", "items": items}
    except Exception as e:
        frappe.log_error("CSV Parsing Error", str(e))
        frappe.throw(_("Failed to parse the uploaded CSV file. Please strictly ensure it has headers for 'Item Name' and 'Price'."))


@frappe.whitelist(allow_guest=True)
def setup_menu(**kwargs):
    """
    API for Minimal Installation Page 2 (Menu & Pricing Setup)
    """
    import json
    
    company_name = kwargs.get("company_name") or frappe.db.get_single_value("Global Defaults", "default_company")
    items = kwargs.get("items")
    tax_calculation = kwargs.get("tax_calculation") # 'Inclusive' or 'Exclusive'
    
    if not company_name:
        frappe.throw(_("Company is required to setup the menu."))
        
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except Exception:
            frappe.throw(_("Items payload should be a valid JSON array."))
            
    if not isinstance(items, list):
        frappe.throw(_("items must be a list"))

    # Default logic mapping user selection to ERPNext flags
    is_tax_inclusive = 1 if (tax_calculation and tax_calculation.lower() == "inclusive") else 0

    item_group = "Products"
    if not frappe.db.exists("Item Group", item_group):
        ig = frappe.new_doc("Item Group")
        ig.item_group_name = item_group
        ig.parent_item_group = "All Item Groups"
        ig.insert(ignore_permissions=True)
        
    price_list = "Standard Selling"
    if not frappe.db.exists("Price List", price_list):
        pl = frappe.new_doc("Price List")
        pl.price_list_name = price_list
        pl.selling = 1
        pl.insert(ignore_permissions=True)
        
    # Get or create default branch
    branch = "Main Branch"
    if not frappe.db.exists("Branch", branch):
        b = frappe.new_doc("Branch")
        b.branch = branch
        b.insert(ignore_permissions=True, ignore_mandatory=True)
        frappe.db.commit() # Ensure branch is visible to link validation
        
    created_items = []
    
    # We will also create a URY Menu, or append to an existing one.
    ury_menu_name = f"Menu - {branch}"
    if frappe.db.exists("URY Menu", ury_menu_name):
        ury_menu = frappe.get_doc("URY Menu", ury_menu_name)
    else:
        ury_menu = frappe.new_doc("URY Menu")
        ury_menu.name = ury_menu_name
        ury_menu.branch = branch
        ury_menu.price_list = price_list
        ury_menu.enabled = 1
    
    # Get or create default POS Profile for the company
    pos_profile_name = f"Default POS - {company_name}"
    if not frappe.db.exists("POS Profile", pos_profile_name):
        pos_profile = frappe.new_doc("POS Profile")
        pos_profile.name = pos_profile_name
        pos_profile.company = company_name
        pos_profile.currency = frappe.db.get_value("Company", company_name, "default_currency")
        pos_profile.warehouse = frappe.db.get_value("Warehouse", {"company": company_name, "is_group": 0}, "name")
        pos_profile.selling_price_list = price_list
        pos_profile.insert(ignore_permissions=True)
        frappe.db.commit()
    
    for item_data in items:
        item_name = item_data.get("item_name")
        price = item_data.get("price")
        
        if not item_name:
            continue
            
        item_code = frappe.scrub(item_name)
        if frappe.db.exists("Item", item_code):
            item_code = item_name # Use exact name if scrubbed exists

        if not frappe.db.exists("Item", item_code):
            item = frappe.new_doc("Item")
            item.item_code = item_code
            item.item_name = item_name
            item.item_group = item_group
            item.is_stock_item = 1
            item.is_sales_item = 1
            item.insert(ignore_permissions=True)
        else:
            item = frappe.get_doc("Item", item_code)
            
        existing_price = frappe.db.get_value("Item Price", {"item_code": item.item_code, "price_list": price_list}, "name")
        if existing_price:
            ip = frappe.get_doc("Item Price", existing_price)
            ip.price_list_rate = price
            ip.price_includes_tax = is_tax_inclusive
            ip.save(ignore_permissions=True)
        else:
            ip = frappe.new_doc("Item Price")
            ip.item_code = item.item_code
            ip.price_list = price_list
            ip.price_list_rate = price
            ip.price_includes_tax = is_tax_inclusive
            ip.insert(ignore_permissions=True)
            
        created_items.append(item.item_code)
        
        # Add to URY menu if not already present
        exists_in_menu = False
        for menu_item in ury_menu.items:
            if menu_item.item == item.item_code:
                menu_item.rate = price
                exists_in_menu = True
                break
                
        if not exists_in_menu:
            ury_menu.append("items", {
                "item": item.item_code,
                "item_name": item.item_name,
                "rate": price
            })
            
    ury_menu.save(ignore_permissions=True)
        
    return {"status": "success", "message": _("Menu items mapped successfully"), "created_items": created_items}


@frappe.whitelist(allow_guest=True)
def check_setup_status():
    """
    Checks if the minimum setup (Company + Menu) has been completed.
    Returns: {"setup_complete": bool}
    """
    # 1. Check if a default company is set
    company = frappe.db.get_single_value("Global Defaults", "default_company")
    if not company:
        return {"setup_complete": False}
    
    # 2. Check if at least one URY Menu exists and is enabled
    if not frappe.db.exists("URY Menu", {"enabled": 1}):
        return {"setup_complete": False}
        
    return {"setup_complete": True}
