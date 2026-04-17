(() => {
  // ../ury/ury/public/js/ury_setup_wizard.js
  console.log("\u{1F525} URY setup wizard file loaded");
  frappe.setup.on("before_load", function() {
    var _a, _b;
    console.log("\u{1F525} URY before_load fired");
    if (!((_b = (_a = window.erpnext) == null ? void 0 : _a.setup) == null ? void 0 : _b.slides_settings))
      return;
    const org_slide = erpnext.setup.slides_settings.find(
      (s) => s.name === "organization"
    );
    if (!org_slide)
      return;
    if (org_slide.fields.some((f) => f.fieldname === "setup_ury_demo"))
      return;
    const demo_index = org_slide.fields.findIndex(
      (f) => f.fieldname === "setup_demo"
    );
    if (demo_index === -1)
      return;
    org_slide.fields.splice(demo_index + 1, 0, {
      fieldname: "setup_ury_demo",
      label: __("Generate URY Demo Data"),
      fieldtype: "Check",
      description: __("Create URY-specific demo data")
    });
    console.log("\u2705 URY checkbox injected");
  });

  // ../ury/ury/public/js/ury.bundle.js
  console.log("\u{1F525}\u{1F525} URY BUNDLE LOADED \u{1F525}\u{1F525}");
})();
//# sourceMappingURL=ury.bundle.JSH4DNJW.js.map
