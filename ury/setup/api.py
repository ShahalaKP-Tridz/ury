import frappe
import json
import csv
import io
from frappe import _
from frappe.utils.password import update_password
from erpnext.setup.setup_wizard.operations.taxes_setup import setup_taxes_and_charges
from ury.setup.demo import setup_ury_demo_data

from functools import wraps

def check_setup_lock():
    if frappe.db.get_single_value("System Settings", "setup_complete"):
        frappe.throw(_("Setup has already been completed. These endpoints are securely locked."), frappe.PermissionError)

def setup_api(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        check_setup_lock()
        original_user = frappe.session.user
        frappe.set_user("Administrator")
        frappe.flags.ignore_permissions = True
        try:
            return fn(*args, **kwargs)
        finally:
            frappe.flags.ignore_permissions = False
            if frappe.session.user == "Administrator":
                frappe.set_user(original_user)
    return wrapper

@frappe.whitelist(allow_guest=True, methods=["POST"])
@setup_api
def setup_organization(**kwargs):
    """
    API for Minimal Installation Page 1 (Organization Setup)
    """
    company_name = kwargs.get("company_name")
    abbr = kwargs.get("abbr")
    country = kwargs.get("country")
    timezone = kwargs.get("timezone")
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
        
        # Attach every active role explicitly to simulate Administrator access
        all_roles = frappe.get_all("Role", filters={"disabled": 0}, pluck="name")
        for role in all_roles:
            if role not in ["Guest", "All", "Employee", "Employee Self Service"]:
                user.append("roles", {"role": role})
                
        user.insert(ignore_permissions=True)
            
        if password:
            user.new_password = password
            user.save(ignore_permissions=True)

    # 2. Company Creation
    if not frappe.db.exists("Company", company_name):
        # ERPNext strictly seeks this Warehouse Type when allocating default locations for a new Company
        if not frappe.db.exists("Warehouse Type", "Transit"):
            wt = frappe.new_doc("Warehouse Type")
            wt.name = "Transit" # Standard ID
            wt.warehouse_type = "Transit"
            wt.insert(ignore_permissions=True, ignore_mandatory=True)
            
        company = frappe.new_doc("Company")
        company.company_name = company_name
        company.abbr = abbr
        company.country = country
        company.default_currency = currency
        company.chart_of_accounts_based_on = "Standard Template"
        company.enable_perpetual_inventory = 1 
        company.insert(ignore_permissions=True)
        frappe.db.commit()
    else:
        company = frappe.get_doc("Company", company_name)
    
    frappe.db.set_single_value("Global Defaults", "default_company", company.name)
    frappe.db.set_default("company", company.name)
    if timezone:
        frappe.db.set_default("time_zone", timezone)

    # 3. Tax Setup Implementation
    try:
        setup_taxes_and_charges(company.name, company.country)
        frappe.db.commit()
    except Exception as e:
        frappe.log_error(f"Tax setup failed for {company.name}", str(e))

    # 4. Demo Data Script
    if generate_demo_data in [1, "1", True, "true"]:
        frappe.db.set_default("demo_data_type", "ury")
        frappe.db.set_single_value("Global Defaults", "demo_company", company.name)
        try:
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


@frappe.whitelist(allow_guest=True, methods=["POST"])
def upload_menu_csv(file_url=None):
    """
    Parses an uploaded CSV file from Frappe generic attachment or explicit multipart file uploads.
    """
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
@setup_api
def setup_menu(**kwargs):
    """
    API for Minimal Installation Page 2 (Menu & Pricing Setup)
    """
    company_name = kwargs.get("company_name") or frappe.db.get_single_value("Global Defaults", "default_company")
    items = kwargs.get("items")
    tax_calculation = kwargs.get("tax_calculation")
    
    if not company_name:
        frappe.throw(_("Company is required to setup the menu."))
        
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except Exception:
            frappe.throw(_("Items payload should be a valid JSON array."))
            
    if not isinstance(items, list):
        frappe.throw(_("items must be a list"))

    is_tax_inclusive = 1 if (tax_calculation and tax_calculation.lower() == "inclusive") else 0

    item_group = "Products"
    if not frappe.db.exists("Item Group", item_group):
        root_group = frappe.db.get_value("Item Group", {"is_group": 1, "parent_item_group": ("in", ["", None])}, "name")
        if not root_group:
            root_ig = frappe.new_doc("Item Group")
            root_ig.item_group_name = "All Item Groups"
            root_ig.is_group = 1
            root_ig.insert(ignore_permissions=True, ignore_mandatory=True)
            frappe.db.commit()
            root_group = root_ig.name

        ig = frappe.new_doc("Item Group")
        ig.item_group_name = item_group
        ig.parent_item_group = root_group
        ig.is_group = 0
        ig.insert(ignore_permissions=True)
        
    price_list = "Standard Selling"
    if not frappe.db.exists("Price List", price_list):
        pl = frappe.new_doc("Price List")
        pl.price_list_name = price_list
        pl.selling = 1
        pl.insert(ignore_permissions=True)
        
    branch = kwargs.get("branch") or "Main Branch"
    if not frappe.db.exists("Branch", branch):
        b = frappe.new_doc("Branch")
        b.branch = branch
        b.insert(ignore_permissions=True, ignore_mandatory=True)
        frappe.db.commit()
        
    created_items = []
    
    ury_menu_name = f"Menu - {branch}"
    if frappe.db.exists("URY Menu", ury_menu_name):
        ury_menu = frappe.get_doc("URY Menu", ury_menu_name)
    else:
        ury_menu = frappe.new_doc("URY Menu")
        ury_menu.name = ury_menu_name
        ury_menu.branch = branch
        ury_menu.price_list = price_list
        ury_menu.enabled = 1
    
    # POS Profile Creation with advanced ERPNext configuration
    pos_profile_name = f"Default POS - {company_name}"
    if not frappe.db.exists("POS Profile", pos_profile_name):
        pos_profile = frappe.new_doc("POS Profile")
        pos_profile.name = pos_profile_name
        pos_profile.company = company_name
        pos_profile.currency = frappe.db.get_value("Company", company_name, "default_currency")
        pos_profile.warehouse = frappe.db.get_value("Warehouse", {"company": company_name, "is_group": 0}, "name")
        pos_profile.selling_price_list = price_list
        
        default_cost_center = frappe.db.get_value("Company", company_name, "cost_center")
        if not default_cost_center:
            default_cost_center = frappe.db.get_value("Cost Center", {"company": company_name, "is_group": 0}, "name")
        pos_profile.cost_center = default_cost_center
        pos_profile.write_off_cost_center = default_cost_center
        
        write_off_acc = frappe.db.get_value("Company", company_name, "default_expense_account")
        if not write_off_acc:
            write_off_acc = frappe.db.get_value("Account", {"company": company_name, "account_type": "Expense", "is_group": 0}, "name")
        pos_profile.write_off_account = write_off_acc
        
        cash_account = frappe.db.get_value("Company", company_name, "default_cash_account")
        if not cash_account:
            cash_account = frappe.db.get_value("Account", {"company": company_name, "account_type": "Cash", "is_group": 0}, "name")
            
        mop_name = "Cash"
        mop_needs_save = False
        
        if not frappe.db.exists("Mode of Payment", mop_name):
            mop = frappe.new_doc("Mode of Payment")
            mop.mode_of_payment = mop_name
            mop.type = "Cash"
            mop.enabled = 1
            mop_needs_save = True
        else:
            mop = frappe.get_doc("Mode of Payment", mop_name)
            
        has_company_account = False
        for acc in mop.get("accounts", []):
            if acc.company == company_name:
                if not acc.default_account and cash_account:
                    acc.default_account = cash_account
                    mop_needs_save = True
                has_company_account = True
                break
                
        if not has_company_account and cash_account:
            mop.append("accounts", {
                "company": company_name,
                "default_account": cash_account
            })
            mop_needs_save = True
            
        if mop_needs_save:
            if mop.is_new():
                mop.insert(ignore_permissions=True, ignore_mandatory=True)
            else:
                mop.save(ignore_permissions=True)
                
        pos_profile.append("payments", {
            "mode_of_payment": mop_name,
            "default": 1
        })
        
        pos_profile.insert(ignore_permissions=True)
        frappe.db.commit()
        
    default_uom = "Nos"
    if not frappe.db.exists("UOM", default_uom):
        uom = frappe.new_doc("UOM")
        uom.uom_name = default_uom
        uom.must_be_whole_number = 1
        uom.insert(ignore_permissions=True, ignore_mandatory=True)
    
    for item_data in items:
        item_name = item_data.get("item_name")
        price = item_data.get("price")
        
        if not item_name:
            continue
            
        item_code = frappe.scrub(item_name)
        if frappe.db.exists("Item", item_code):
            item_code = item_name

        if not frappe.db.exists("Item", item_code):
            item = frappe.new_doc("Item")
            item.item_code = item_code
            item.item_name = item_name
            item.item_group = item_group
            item.stock_uom = default_uom
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


@frappe.whitelist(allow_guest=True, methods=["GET"])
def check_setup_status():
    """
    Checks if the minimum setup (Company + Menu) has been completed.
    Returns: {"setup_complete": bool}
    """
    company = frappe.db.get_single_value("Global Defaults", "default_company")
    if not company:
        return {"setup_complete": False}
    if not frappe.db.exists("URY Menu", {"enabled": 1}):
        return {"setup_complete": False}
    return {"setup_complete": True}


@frappe.whitelist(allow_guest=True, methods=["POST"])
@setup_api
def setup_printer(**kwargs):
    """
    API for Minimal Installation Page 3 - Printer Setup
    """
    server_ip = kwargs.get("server_ip") or "localhost"
    port = kwargs.get("port") or 631
    printer_name = kwargs.get("printer_name")
    bill_checked = kwargs.get("bill", 1)
    
    if not printer_name:
        frappe.throw(_("Printer Name is required for setup."))
        
    if not frappe.db.exists("Network Printer Settings", printer_name):
        nps = frappe.new_doc("Network Printer Settings")
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

    company_name = frappe.db.get_single_value("Global Defaults", "default_company")
    if not company_name:
        frappe.throw(_("Company is not configured. Please complete Page 1 setup first."))
        
    pos_profiles = frappe.get_all("POS Profile", filters={"company": company_name}, pluck="name")
    
    mapped_profiles = 0
    if pos_profiles:
        for profile_name in pos_profiles:
            profile = frappe.get_doc("POS Profile", profile_name)
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
    branches = frappe.get_all("Branch", pluck="name")
    if branch and branch not in branches:
        branches.append(branch)
        
    printers = frappe.get_all("Network Printer Settings", pluck="name")
    if printer and printer not in printers:
        printers.append(printer)
    
    room_types = ["AC", "NON-AC"]
    
    return {
        "status": "success",
        "branches": branches,
        "printers": printers,
        "room_types": room_types
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
@setup_api
def setup_ury_room(**kwargs):
    """
    API for Minimal Installation Page 3 - URY Room Setup
    """
    room_name = kwargs.get("room_name")
    branch = kwargs.get("branch")
    room_type = kwargs.get("room_type")
    printers = kwargs.get("printers")
    
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
@setup_api
def setup_ury_table(**kwargs):
    """
    API for Minimal Installation Page 3 - URY Table Setup
    """
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
    companies = frappe.get_all("Company", pluck="name")
    
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
@setup_api
def setup_mop(**kwargs):
    """
    API for Minimal Installation Page 3 - URY Mode of Payment Setup
    """
    mode_of_payment = kwargs.get("mode_of_payment")
    payment_type = kwargs.get("type", "Cash") # Cash, Bank, General
    accounts_payload = kwargs.get("accounts")
    
    if not mode_of_payment:
        frappe.throw(_("Mode of Payment name is mandatory."))
        
    if isinstance(accounts_payload, str):
        try:
            accounts_payload = json.loads(accounts_payload)
        except Exception:
            accounts_payload = []
            
    if not isinstance(accounts_payload, list):
        accounts_payload = []
        
    for acc_info in accounts_payload:
        company = acc_info.get("company")
        acc_name = acc_info.get("default_account")
        
        if company and acc_name and not frappe.db.exists("Account", acc_name):
            if not frappe.db.exists("Company", company):
                frappe.throw(_(f"Cannot create '{acc_name}' because Company '{company}' is not saved in the database yet. Please ensure Page 1 is submitted first!"))
                
            company_doc = frappe.get_doc("Company", company)
            
            parent = None
            if payment_type == "Bank":
                parent = company_doc.default_bank_account or frappe.db.get_value("Account", {"account_type": "Bank", "company": company, "is_group": 1}, "name")
            else:
                parent = company_doc.default_cash_account or frappe.db.get_value("Account", {"account_type": "Cash", "company": company, "is_group": 1}, "name")
                
            if not parent:
                parent = frappe.db.get_value("Account", {"root_type": "Asset", "company": company, "is_group": 1}, "name")
                
            new_acc = frappe.new_doc("Account")
            new_acc.account_name = acc_name.replace(f" - {company_doc.abbr}", "") if company_doc.abbr else acc_name
            new_acc.parent_account = parent
            new_acc.company = company
            if payment_type in ["Bank", "Cash"]:
                new_acc.account_type = payment_type
            
            new_acc.insert(ignore_permissions=True, ignore_mandatory=True)
            frappe.db.commit()
            
            acc_info["default_account"] = new_acc.name
            
    if not frappe.db.exists("Mode of Payment", mode_of_payment):
        mop = frappe.new_doc("Mode of Payment")
        mop.mode_of_payment = mode_of_payment 
    else:
        mop = frappe.get_doc("Mode of Payment", mode_of_payment)
        
    mop.type = payment_type
    mop.enabled = 1
    
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
@setup_api
def setup_branch_restaurant(**kwargs):
    """
    API for Minimal Installation Page 3 - Branch and URY Restaurant Setup
    """
    branch_name = kwargs.get("branch")
    if not branch_name:
        frappe.throw(_("Branch is mandatory."))
        
    if not frappe.db.exists("Branch", branch_name):
        b = frappe.new_doc("Branch")
        b.branch = branch_name
        b.insert(ignore_permissions=True, ignore_mandatory=True)
        frappe.db.commit()
        
    restaurant_name = kwargs.get("restaurant")
    if not restaurant_name:
        return {"status": "success", "message": _("Branch created successfully without Restaurant details.")}
        
    company = kwargs.get("company")
    if company and not frappe.db.exists("Company", company):
        frappe.throw(_(f"Cannot link Restaurant. Company '{company}' is not formally saved in the database yet. Submit Page 1 first!"))
        
    address_payload = kwargs.get("address")
    address_name = None
    if isinstance(address_payload, dict):
        addr = frappe.new_doc("Address")
        addr.address_title = restaurant_name
        addr.address_type = "Office"
        addr.address_line1 = address_payload.get("address_line1") or "N/A"
        addr.city = address_payload.get("city") or "N/A"
        addr.country = address_payload.get("country") or frappe.db.get_default("country") or "India"
        
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
            addr.address_line1 = address_payload
            addr.city = "N/A"
            addr.country = frappe.db.get_default("country") or "India"
            addr.append("links", {
                "link_doctype": "Branch",
                "link_name": branch_name
            })
            addr.insert(ignore_permissions=True, ignore_mandatory=True)
            address_name = addr.name
            frappe.db.commit()
            
    if not frappe.db.exists("URY Restaurant", restaurant_name):
        rest = frappe.new_doc("URY Restaurant")
        rest.name = restaurant_name
    else:
        rest = frappe.get_doc("URY Restaurant", restaurant_name)
        
    rest.branch = branch_name
    if company: 
        rest.company = company
    
    if kwargs.get("invoice_series_prefix"):
        rest.invoice_series_prefix = kwargs.get("invoice_series_prefix")
    if kwargs.get("aggregator_series_prefix"):
        rest.aggregator_series_prefix = kwargs.get("aggregator_series_prefix")
        
    if address_name:
        rest.address = address_name
        
    if kwargs.get("default_tax_template"):
        rest.default_tax_template = kwargs.get("default_tax_template")
    if kwargs.get("active_menu"):
        rest.active_menu = kwargs.get("active_menu")
    if kwargs.get("default_room"):
        rest.default_room = kwargs.get("default_room")
        
    rest.room_wise_menu = int(kwargs.get("room_wise_menu", 0))
    rest.order_type_wise_menu = int(kwargs.get("order_type_wise_menu", 0))
    
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
    roles = frappe.get_all("Role", filters={"disabled": 0}, pluck="name")
    
    return {
        "status": "success",
        "roles": roles
    }


@frappe.whitelist(allow_guest=True, methods=["POST"])
@setup_api
def setup_user_management(**kwargs):
    """
    API for Minimal Installation Page 6 - User Management Setup
    """
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
            
        if not frappe.db.exists("User", email):
            user = frappe.new_doc("User")
            user.email = email
            user.first_name = first_name
            user.send_welcome_email = 0
            
            if isinstance(roles, str):
                roles = [roles]
            for role in roles:
                if frappe.db.exists("Role", role):
                    user.append("roles", {"role": role})
                    
            user.insert(ignore_permissions=True)
        else:
            user = frappe.get_doc("User", email)
            
            if isinstance(roles, str):
                roles = [roles]
            for role in roles:
                if frappe.db.exists("Role", role) and not frappe.db.exists("Has Role", {"parent": email, "role": role}):
                    user.append("roles", {"role": role})
                    
            user.save(ignore_permissions=True)
        
        if password:
            update_password(user.name, password)
            
        created_users.append(user.email)
            
    frappe.db.commit()
    
    if int(finish_setup) == 1:
        frappe.db.set_single_value("System Settings", "setup_complete", 1)
        frappe.db.commit()
        return {"status": "success", "message": _("Users created. Setup is completely finalized and securely locked!"), "users": created_users}
        
    return {"status": "success", "message": _("Users configured successfully."), "users": created_users}
