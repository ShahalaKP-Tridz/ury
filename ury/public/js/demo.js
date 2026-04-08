frappe.provide("ury.demo");

$(document).on("toolbar_setup", function () {
	if (frappe.boot.sysdefaults.demo_company) {
		render_clear_demo_action();
	}
});

function render_clear_demo_action() {
	// Instead of injecting a second button and attempting to hide the first one, 
	// we simply intercept ERPNext's native implementation and route it to our unified endpoint.
	// This inherently guarantees only ONE button renders.
	if (typeof erpnext !== "undefined" && erpnext.demo) {
		erpnext.demo.clear_demo = ury.demo.clear_demo;
	}
}

ury.demo.clear_demo = function () {
	frappe.confirm(__("Are you sure you want to clear all demo data?"), () => {
		frappe.call({
			method: "ury.setup.demo.clear_demo_data",
			freeze: true,
			freeze_message: __("Clearing Demo Data..."),
			callback: function (r) {
				frappe.ui.toolbar.clear_cache();
				frappe.show_alert({
					message: __("Demo data cleared"),
					indicator: "green",
				});
			},
		});
	});
};
