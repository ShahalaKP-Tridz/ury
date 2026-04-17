import frappe
from frappe import _
import json
from erpnext.setup.setup_wizard.operations.taxes_setup import setup_taxes_and_charges
from ury.setup.demo import setup_ury_demo_data

def check_setup_lock():
    if frappe.db.get_single_value("System Settings", "setup_complete"):
        frappe.throw(_("Setup has already been completed. These endpoints are securely locked."), frappe.PermissionError)

@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_organization(**kwargs):
    """
    API for Minimal Installation Page 1 (Organization Setup)
    """
    #check_setup_lock()
    company_name = kwargs.get("company_name")
    abbr = kwargs.get("abbr")
    country = kwargs.get("country")
    timezone = kwargs.get("timezone")
    tax_system = kwargs.get("tax_system") # e.g. GST/VAT
    currency = kwargs.get("currency")
    user_name = kwargs.get("user_name")
    email = kwargs.get("email")
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

    return {"status": "success", "message": _("Organization setup completed successfully.")}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def upload_menu_csv(file_url=None):
    """
    Parses an uploaded CSV file from Frappe generic attachment or explicit multipart file uploads.
    """
    #check_setup_lock()
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


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_menu(**kwargs):
    """
    API for Minimal Installation Page 2 (Menu & Pricing Setup)
    """
    #check_setup_lock()
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
        
    # Get or create custom branch or default to Main Branch
    branch = kwargs.get("branch") or "Main Branch"
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


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_printer(**kwargs):
    """
    API for Minimal Installation Page 3 - Printer Setup
    """
    #check_setup_lock()
    server_ip = kwargs.get("server_ip") or "localhost"
    port = kwargs.get("port") or 631
    printer_name = kwargs.get("printer_name")
    bill_checked = kwargs.get("bill", 1)  # Using bill field as seen in URY Printer Settings
    
    if not printer_name:
        frappe.throw(_("Printer Name is required for setup."))
        
    # 1. Provide/manage the Network Printer Settings
    if not frappe.db.exists("Network Printer Settings", printer_name):
        nps = frappe.new_doc("Network Printer Settings")
        # In standard frappe, autoname for Network Printer Settings is Prompt, 
        # so we MUST set the name explicitly:
        nps.name = printer_name
        nps.server_ip = server_ip
        nps.port = int(port)
        nps.printer_name = printer_name
        nps.insert(ignore_permissions=True, ignore_mandatory=True)
        frappe.db.commit()
    else:
        nps = frappe.get_doc("Network Printer Settings", printer_name)
        nps.server_ip = server_ip
        nps.port = int(port)
        nps.save(ignore_permissions=True)
        frappe.db.commit()

    # 2. Wire the Printer to the POS Profile
    company_name = frappe.db.get_single_value("Global Defaults", "default_company")
    if not company_name:
        frappe.throw(_("Company is not configured. Please complete Page 1 setup first."))
        
    # Get active POS Profiles for the company
    pos_profiles = frappe.get_all("POS Profile", filters={"company": company_name}, pluck="name")
    
    mapped_profiles = 0
    if pos_profiles:
        for profile_name in pos_profiles:
            profile = frappe.get_doc("POS Profile", profile_name)
            
            # Check if this printer is already in the URY Printer Settings table inside POS Profile
            exists = False
            default_table_field = "printer_settings"
            
            if profile.meta.has_field(default_table_field):
                for row in profile.get(default_table_field, []):
                    if row.printer == nps.name:
                        row.bill = int(bill_checked)
                        exists = True
                        break
                        
                if not exists:
                    profile.append(default_table_field, {
                        "bill": int(bill_checked),
                        "printer": nps.name
                    })
                
                profile.save(ignore_permissions=True)
                mapped_profiles += 1
                
        frappe.db.commit()
        
    return {
        "status": "success", 
        "message": _("Printer settings configured successfully."), 
        "network_printer": nps.name,
        "mapped_to_pos_profiles": mapped_profiles
    }


@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_ury_room_context(branch=None, printer=None):
    """
    API for Minimal Installation Page 3 - Fetch context for URY Room setup
    """
    #check_setup_lock()
    branches = frappe.get_all("Branch", pluck="name")
    if branch and branch not in branches:
        branches.append(branch)
        
    printers = frappe.get_all("Network Printer Settings", pluck="name")
    if printer and printer not in printers:
        printers.append(printer)
    
    # room_types are standard across the Select options in URY Room
    room_types = ["AC", "NON-AC"]
    
    return {
        "status": "success",
        "branches": branches,
        "printers": printers,
        "room_types": room_types
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_ury_room(**kwargs):
    """
    API for Minimal Installation Page 3 - URY Room Setup
    """
    #check_setup_lock()
    import json
    
    room_name = kwargs.get("room_name")
    branch = kwargs.get("branch")
    room_type = kwargs.get("room_type")
    printers = kwargs.get("printers") # expected JSON string or dict list
    
    if not room_name or not branch:
        frappe.throw(_("Room Name and Branch are mandatory."))
        
    if isinstance(printers, str):
        try:
            printers = json.loads(printers)
        except Exception:
            printers = []
            
    if not isinstance(printers, list):
        printers = []
        
    if not frappe.db.exists("URY Room", room_name):
        room = frappe.new_doc("URY Room")
        room.name = room_name # Satisfy 'Prompt' autoname
        room.branch = branch
        room.room_type = room_type
        
        for p in printers:
            printer_name = p.get("printer")
            if printer_name and frappe.db.exists("Network Printer Settings", printer_name):
                room.append("printer_settings", {
                    "printer": printer_name,
                    "bill": p.get("bill", 1)
                })
                
        room.insert(ignore_permissions=True, ignore_mandatory=True)
        frappe.db.commit()
    else:
        room = frappe.get_doc("URY Room", room_name)
        room.branch = branch
        room.room_type = room_type
        
        # Overwrite existing printer settings cleanly based on UI submission
        room.set("printer_settings", [])
        for p in printers:
            printer_name = p.get("printer")
            if printer_name and frappe.db.exists("Network Printer Settings", printer_name):
                room.append("printer_settings", {
                    "printer": printer_name,
                    "bill": p.get("bill", 1)
                })
                
        room.save(ignore_permissions=True)
        frappe.db.commit()
        
    return {"status": "success", "message": _("URY Room setup completed successfully.")}


@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_ury_table_context(restaurant=None, room=None, branch=None):
    """
    API for Minimal Installation Page 3 - Fetch context for URY Table setup
    """
    #check_setup_lock()
    restaurants = frappe.get_all("URY Restaurant", pluck="name")
    if restaurant and restaurant not in restaurants:
        restaurants.append(restaurant)
        
    rooms = frappe.get_all("URY Room", pluck="name")
    if room and room not in rooms:
        rooms.append(room)
        
    branches = frappe.get_all("Branch", pluck="name")
    if branch and branch not in branches:
        branches.append(branch)
    
    table_shapes = ["Rectangle", "Square", "Circle"]
    
    return {
        "status": "success",
        "restaurants": restaurants,
        "rooms": rooms,
        "branches": branches,
        "table_shapes": table_shapes
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_ury_table(**kwargs):
    """
    API for Minimal Installation Page 3 - URY Table Setup
    """
    #check_setup_lock()
    
    table_name = kwargs.get("table_name")
    restaurant = kwargs.get("restaurant")
    room = kwargs.get("restaurant_room")
    branch = kwargs.get("branch")
    
    no_of_seats = kwargs.get("no_of_seats", 0)
    minimum_seating = kwargs.get("minimum_seating", 0)
    table_shape = kwargs.get("table_shape")
    is_take_away = kwargs.get("is_take_away", 0)
    
    layout_x = kwargs.get("layout_x", 0.0)
    layout_y = kwargs.get("layout_y", 0.0)
    layout_width = kwargs.get("layout_width", 0.0)
    layout_height = kwargs.get("layout_height", 0.0)
    
    if not table_name or not restaurant or not room or not branch:
        frappe.throw(_("Table Name, Restaurant, Restaurant Room, and Branch are mandatory."))
        
    if not frappe.db.exists("URY Table", table_name):
        table = frappe.new_doc("URY Table")
        table.name = table_name # Satisfy 'Prompt' autoname
    else:
        table = frappe.get_doc("URY Table", table_name)
        
    table.restaurant = restaurant
    table.restaurant_room = room
    table.branch = branch
    table.no_of_seats = int(no_of_seats) if no_of_seats else 0
    table.minimum_seating = int(minimum_seating) if minimum_seating else 0
    table.table_shape = table_shape
    table.is_take_away = int(is_take_away) if is_take_away else 0
    
    table.layout_x = float(layout_x) if layout_x else 0.0
    table.layout_y = float(layout_y) if layout_y else 0.0
    table.layout_width = float(layout_width) if layout_width else 0.0
    table.layout_height = float(layout_height) if layout_height else 0.0
    
    if table.is_new():
        table.insert(ignore_permissions=True, ignore_mandatory=True)
    else:
        table.save(ignore_permissions=True)
        
    frappe.db.commit()
        
    return {"status": "success", "message": _("URY Table setup completed successfully.")}


@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_mop_context(company=None):
    """
    API for Minimal Installation Page 3 - Fetch context for Mode of Payment Setup
    """
    #check_setup_lock()
    
    companies = frappe.get_all("Company", pluck="name")
    
    # If the frontend passes a company that isn't saved yet (from Page 1), 
    # we dynamically inject it into the dropdown options for the UI
    if company and company not in companies:
        companies.append(company)
        
    filters = {}
    if company and frappe.db.exists("Company", company):
        filters["company"] = company
        
    accounts = frappe.get_all("Account", filters=filters, pluck="name")
    
    return {
        "status": "success",
        "companies": companies,
        "accounts": accounts
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_mop(**kwargs):
    """
    API for Minimal Installation Page 3 - URY Mode of Payment Setup
    """
    #check_setup_lock()
    
    mode_of_payment = kwargs.get("mode_of_payment")
    payment_type = kwargs.get("type", "Cash") # Cash, Bank, General
    accounts_payload = kwargs.get("accounts") # expected JSON string or dict list
    
    if not mode_of_payment:
        frappe.throw(_("Mode of Payment name is mandatory."))
        
    if isinstance(accounts_payload, str):
        try:
            accounts_payload = json.loads(accounts_payload)
        except Exception:
            accounts_payload = []
            
    if not isinstance(accounts_payload, list):
        accounts_payload = []
        
    # Check if we need to create any missing accounts on the fly
    for acc_info in accounts_payload:
        company = acc_info.get("company")
        acc_name = acc_info.get("default_account")
        
        if company and acc_name and not frappe.db.exists("Account", acc_name):
            if not frappe.db.exists("Company", company):
                frappe.throw(_(f"Cannot create '{acc_name}' because Company '{company}' is not saved in the database yet. Please ensure Page 1 is submitted first!"))
                
            company_doc = frappe.get_doc("Company", company)
            
            # Find an appropriate parent account to wedge this new account under
            parent = None
            if payment_type == "Bank":
                parent = company_doc.default_bank_account or frappe.db.get_value("Account", {"account_type": "Bank", "company": company, "is_group": 1}, "name")
            else:
                parent = company_doc.default_cash_account or frappe.db.get_value("Account", {"account_type": "Cash", "company": company, "is_group": 1}, "name")
                
            if not parent:
                parent = frappe.db.get_value("Account", {"root_type": "Asset", "company": company, "is_group": 1}, "name")
                
            new_acc = frappe.new_doc("Account")
            # Accounting usually scrubs the suffix ' - COM' if you provide just the base name
            new_acc.account_name = acc_name.replace(f" - {company_doc.abbr}", "") if company_doc.abbr else acc_name
            new_acc.parent_account = parent
            new_acc.company = company
            if payment_type in ["Bank", "Cash"]:
                new_acc.account_type = payment_type
            
            new_acc.insert(ignore_permissions=True, ignore_mandatory=True)
            frappe.db.commit()
            
            # Use the newly generated account id
            acc_info["default_account"] = new_acc.name
            
    # Apply to Mode of Payment Doctype
    if not frappe.db.exists("Mode of Payment", mode_of_payment):
        mop = frappe.new_doc("Mode of Payment")
        mop.mode_of_payment = mode_of_payment 
    else:
        mop = frappe.get_doc("Mode of Payment", mode_of_payment)
        
    mop.type = payment_type
    mop.enabled = 1
    
    # Overwrite accounts child table cleanly
    mop.set("accounts", [])
    for acc in accounts_payload:
        if acc.get("company") and acc.get("default_account"):
            mop.append("accounts", {
                "company": acc.get("company"),
                "default_account": acc.get("default_account")
            })
        
    if mop.is_new():
        mop.insert(ignore_permissions=True, ignore_mandatory=True)
    else:
        mop.save(ignore_permissions=True)
        
    frappe.db.commit()
    
    return {"status": "success", "message": _("Mode of Payment setup completed successfully.")}


@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_branch_restaurant_context(company=None, room=None, menu=None):
    """
    API for Minimal Installation Page 3 - Fetch context for Branch & Restaurant Setup
    """
    #check_setup_lock()
    
    companies = frappe.get_all("Company", pluck="name")
    if company and company not in companies:
        companies.append(company)
        
    menus = frappe.get_all("URY Menu", pluck="name")
    if menu and menu not in menus:
        menus.append(menu)
        
    rooms = frappe.get_all("URY Room", pluck="name")
    if room and room not in rooms:
        rooms.append(room)
        
    tax_templates = frappe.get_all("Sales Taxes and Charges Template", pluck="name")
    
    return {
        "status": "success",
        "companies": companies,
        "tax_templates": tax_templates,
        "menus": menus,
        "rooms": rooms
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_branch_restaurant(**kwargs):
    """
    API for Minimal Installation Page 3 - Branch and URY Restaurant Setup
    """
    #check_setup_lock()
    import json
    
    branch_name = kwargs.get("branch")
    if not branch_name:
        frappe.throw(_("Branch is mandatory."))
        
    # 1. Create standard Frappe Branch
    if not frappe.db.exists("Branch", branch_name):
        b = frappe.new_doc("Branch")
        b.branch = branch_name
        b.insert(ignore_permissions=True, ignore_mandatory=True)
        frappe.db.commit()
        
    restaurant_name = kwargs.get("restaurant")
    if not restaurant_name:
        return {"status": "success", "message": _("Branch created successfully without Restaurant details.")}
        
    # Enforce Company logic just like Mode of Payment
    company = kwargs.get("company")
    if company and not frappe.db.exists("Company", company):
        frappe.throw(_(f"Cannot link Restaurant. Company '{company}' is not formally saved in the database yet. Submit Page 1 first!"))
        
    # 2. Address Generation Logic
    address_payload = kwargs.get("address")
    address_name = None
    if isinstance(address_payload, dict):
        addr = frappe.new_doc("Address")
        addr.address_title = restaurant_name
        addr.address_type = "Office"
        addr.address_line1 = address_payload.get("address_line1") or "N/A"
        addr.city = address_payload.get("city") or "N/A"
        addr.country = address_payload.get("country") or frappe.db.get_default("country") or "India"
        
        # Link Address to the Branch
        addr.append("links", {
            "link_doctype": "Branch",
            "link_name": branch_name
        })
        addr.insert(ignore_permissions=True, ignore_mandatory=True)
        address_name = addr.name
        frappe.db.commit()
        
    elif isinstance(address_payload, str):
        if frappe.db.exists("Address", address_payload):
            address_name = address_payload
        else:
            addr = frappe.new_doc("Address")
            addr.address_title = restaurant_name
            addr.address_type = "Office"
            addr.address_line1 = address_payload  # Treat raw string as line 1
            addr.city = "N/A"
            addr.country = frappe.db.get_default("country") or "India"
            addr.append("links", {
                "link_doctype": "Branch",
                "link_name": branch_name
            })
            addr.insert(ignore_permissions=True, ignore_mandatory=True)
            address_name = addr.name
            frappe.db.commit()
            
    # 3. URY Restaurant Setup
    if not frappe.db.exists("URY Restaurant", restaurant_name):
        rest = frappe.new_doc("URY Restaurant")
        rest.name = restaurant_name
    else:
        rest = frappe.get_doc("URY Restaurant", restaurant_name)
        
    rest.branch = branch_name
    if company: 
        rest.company = company
    
    # Map raw text values
    if kwargs.get("invoice_series_prefix"):
        rest.invoice_series_prefix = kwargs.get("invoice_series_prefix")
    if kwargs.get("aggregator_series_prefix"):
        rest.aggregator_series_prefix = kwargs.get("aggregator_series_prefix")
        
    if address_name:
        rest.address = address_name
        
    # Map Linked properties
    if kwargs.get("default_tax_template"):
        rest.default_tax_template = kwargs.get("default_tax_template")
    if kwargs.get("active_menu"):
        rest.active_menu = kwargs.get("active_menu")
    if kwargs.get("default_room"):
        rest.default_room = kwargs.get("default_room")
        
    rest.room_wise_menu = int(kwargs.get("room_wise_menu", 0))
    rest.order_type_wise_menu = int(kwargs.get("order_type_wise_menu", 0))
    
    # Handle Menus for Room Table
    menu_for_room = kwargs.get("menu_for_room", [])
    if isinstance(menu_for_room, str):
        try: menu_for_room = json.loads(menu_for_room)
        except: menu_for_room = []
    
    rest.set("menu_for_room", [])
    for row in menu_for_room:
        rest.append("menu_for_room", {
            "room": row.get("room"),
            "menu": row.get("menu")
        })
        
    # Handle Order Type Menu Table
    order_type_menu = kwargs.get("order_type_menu", [])
    if isinstance(order_type_menu, str):
        try: order_type_menu = json.loads(order_type_menu)
        except: order_type_menu = []
        
    rest.set("order_type_menu", [])
    for row in order_type_menu:
        rest.append("order_type_menu", {
            "order_type": row.get("order_type"),
            "menu": row.get("menu")
        })

    # Save
    if rest.is_new():
        rest.insert(ignore_permissions=True, ignore_mandatory=True)
    else:
        rest.save(ignore_permissions=True)
        
    frappe.db.commit()
    
    return {"status": "success", "message": _("Branch and URY Restaurant setup completed successfully.")}


@frappe.whitelist(allow_guest=True, methods=["GET"])
def get_user_management_context():
    """
    API for Minimal Installation Page 6 - Fetch Roles Context
    """
    #check_setup_lock()
    roles = frappe.get_all("Role", filters={"disabled": 0}, pluck="name")
    
    return {
        "status": "success",
        "roles": roles
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
def setup_user_management(**kwargs):
    """
    API for Minimal Installation Page 6 - User Management Setup
    """
    #check_setup_lock()
    import json
    from frappe.utils.password import update_password
    
    users = kwargs.get("users")
    finish_setup = kwargs.get("finish_setup", 0)
    
    if isinstance(users, str):
        try:
            users = json.loads(users)
        except Exception:
            users = []
            
    if not isinstance(users, list):
        users = []
        
    if not users and int(finish_setup) == 0:
        frappe.throw(_("Please provide user data or set 'finish_setup': 1 in the payload."))
            
    created_users = []
            
    for user_data in users:
        email = user_data.get("email")
        first_name = user_data.get("first_name", "User")
        password = user_data.get("password")
        roles = user_data.get("roles", []) 
        
        if not email:
            continue
            
        # 1. Provide User Base
        if not frappe.db.exists("User", email):
            user = frappe.new_doc("User")
            user.email = email
            user.first_name = first_name
            user.send_welcome_email = 0 # Silence noisy onboarding emails
            
            # Attach roles before initial insert to suppress Frappe warnings
            if isinstance(roles, str):
                roles = [roles]
            for role in roles:
                if frappe.db.exists("Role", role):
                    user.append("roles", {"role": role})
                    
            user.insert(ignore_permissions=True)
        else:
            user = frappe.get_doc("User", email)
            
            # Update roles for existing user
            if isinstance(roles, str):
                roles = [roles]
            for role in roles:
                if frappe.db.exists("Role", role) and not frappe.db.exists("Has Role", {"parent": email, "role": role}):
                    user.append("roles", {"role": role})
                    
            user.save(ignore_permissions=True)
        
        # 3. Hard-set their explicit Password for instant UI authentication
        if password:
            update_password(user.name, password)
            
        created_users.append(user.email)
            
    frappe.db.commit()
    
    # Final Transition to Standard Security Lock
    if int(finish_setup) == 1:
        frappe.db.set_single_value("System Settings", "setup_complete", 1)
        frappe.db.commit()
        return {"status": "success", "message": _("Users created. Setup is completely finalized and securely locked!"), "users": created_users}
        
    return {"status": "success", "message": _("Users configured successfully."), "users": created_users}
