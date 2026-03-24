console.log("🔥 URY setup_wizard.js loaded");

frappe.setup.on("before_load", function () {
    if (!window.erpnext || !erpnext.setup?.slides_settings) return;

    const slide = erpnext.setup.slides_settings.find(
        s => s.name === "organization"
    );
    if (!slide) return;

    // Prevent duplicate field
    if (slide.fields.find(f => f.fieldname === "setup_ury_demo")) return;

    const idx = slide.fields.findIndex(f => f.fieldname === "setup_demo");
    if (idx === -1) return;

    slide.fields.splice(idx + 1, 0, {
        fieldname: "setup_ury_demo",
        label: __("Generate URY Demo Data"),
        fieldtype: "Check",
        default: 0,
        description: __("Select only ONE demo option"),
    });
});


// --------------------------------------------------
// ✅ FINAL VALIDATION (SAFE HOOK)
// --------------------------------------------------
frappe.setup.on("complete", function (values) {

    if (values.setup_demo && values.setup_ury_demo) {
        frappe.msgprint({
            title: __("Invalid Selection"),
            message: __("Please select either ERPNext Demo OR URY Demo — not both."),
            indicator: "red",
        });

        // ⛔ BLOCK COMPLETION
        throw new Error("Invalid demo selection");
    }
});