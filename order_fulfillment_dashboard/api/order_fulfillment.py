import frappe
from frappe import _
from frappe.utils import cstr

from order_fulfillment_dashboard.services.order_fulfillment import customer_lookup, woo_client

PHASE_FIELDS = ("enqueueing", "picking", "sorting", "checking", "loading")


@frappe.whitelist(allow_guest=True)
def get_orders():
	_check_permission()

	try:
		orders = woo_client.get_orders()
	except Exception as error:
		return _handle_error(error)

	customer_map = customer_lookup.resolve_customers([order.get("order_id") for order in orders])

	normalized_orders = []
	print("\n\n\n\n\n", orders)
	for order in orders:
		# get sales order no
		cur_order_id = cstr(order.get("order_id"))
		so_order_no = (
			frappe.db.get_value("Sales Order", {"custom_woo_job_order_no": cur_order_id}, "name") or ""
		)

		normalized = _normalize_order(order)
		normalized["customer"] = customer_map.get(cstr(order.get("order_id")))
		normalized["so_order_no"] = so_order_no
		# attach company (sales order's company) when we have a linked Sales Order
		company = ""
		if so_order_no:
			company = frappe.db.get_value("Sales Order", so_order_no, "company") or ""
		normalized["company"] = company
		# Prefer items from the ERP Sales Order if linked; fall back to WooCommerce line_items
		if so_order_no:
			try:
				sales_items = _get_sales_order_items(so_order_no)
				if sales_items:
					normalized["items"] = sales_items
			except Exception:
				frappe.log_error(frappe.get_traceback(), "Order Fulfillment: fetch sales order items")
		normalized_orders.append(normalized)

	return {
		"success": True,
		"total": len(normalized_orders),
		"count": len(normalized_orders),
		"orders": normalized_orders,
	}


@frappe.whitelist(allow_guest=True)
def get_order(order_id):
	_check_permission()

	if not order_id:
		return _error("INVALID_REQUEST", _("An order ID is required."))

	try:
		order = woo_client.get_order(order_id)
	except Exception as error:
		return _handle_error(error)

	normalized = _normalize_order(order) if order else None
	if normalized:
		normalized["customer"] = customer_lookup.resolve_customer(order_id)

	return {"success": True, "order": normalized}


def _check_permission():
	if frappe.session.user == "Guest":
		frappe.throw(
			_("Authentication is required to access order fulfillment data."), frappe.PermissionError
		)


def _handle_error(error):
	if isinstance(error, woo_client.IntegrationDisabledError):
		return _error("INTEGRATION_DISABLED", _("WooCommerce integration is disabled."))

	if isinstance(error, woo_client.IntegrationNotConfiguredError):
		return _error("INTEGRATION_NOT_CONFIGURED", _("WooCommerce integration is not fully configured."))

	if isinstance(error, woo_client.WooCommerceConnectionError):
		return _error(
			"WOOCOMMERCE_CONNECTION_ERROR",
			_("Unable to connect to WooCommerce. Please try again later."),
		)

	if isinstance(error, woo_client.WooCommerceAuthenticationError):
		return _error(
			"WOOCOMMERCE_AUTHENTICATION_ERROR",
			_("WooCommerce authentication failed. Please check the integration settings."),
		)

	if isinstance(error, woo_client.WooCommerceAPIError):
		return _error("WOOCOMMERCE_API_ERROR", _("WooCommerce returned an error. Please try again later."))

	if isinstance(error, woo_client.WooCommerceInvalidResponseError):
		return _error(
			"WOOCOMMERCE_INVALID_RESPONSE",
			_("WooCommerce returned an unexpected response. Please try again later."),
		)

	frappe.log_error(f"Order Fulfillment API: {error}", "Order Fulfillment API")
	return _error("INTERNAL_ERROR", _("An unexpected error occurred. Please try again later."))


def _normalize_order(order):
	return {
		"id": order.get("id"),
		"order_id": order.get("order_id"),
		"current_phase": order.get("current_phase"),
		"created_at": order.get("created_at"),
		# include raw line items from WooCommerce so UI can display item details
		"items": order.get("line_items", []),
		"customer": None,
		"phases": {
			phase: {
				"start": order.get(f"{phase}_start"),
				"end": order.get(f"{phase}_end"),
				"elapsed": order.get(f"{phase}_elapsed"),
			}
			for phase in PHASE_FIELDS
		},
	}


def _get_sales_order_items(so_name):
	"""Return list of item dicts from the Sales Order with common fields.

	This tries to map ERP fields to the UI-friendly keys the frontend expects:
	- atum_sku: value from Item.custom_atum_sku if available, otherwise item_code
	- brand: Item.brand if available
	- name: sales order item name
	- quantity: qty
	- uom: uom or stock_uom
	- sku: item_code

	If Item fields referenced here don't exist in your ERP customization,
	adjust the field names accordingly.
	"""
	rows = frappe.db.sql(
		"""
		SELECT item.item_code, item.item_name, item.qty, item.uom
		FROM `tabSales Order Item` item
		WHERE item.parent = %s
		ORDER BY item.idx
		""",
		(so_name,),
		as_dict=True,
	)
	items = []
	for r in rows:
		item_code = r.get("item_code")
		item_name = r.get("item_name")
		qty = r.get("qty")
		uom = r.get("uom")
		# try to get brand and a custom atum sku from the Item master
		item_meta = {}
		if item_code:
			try:
				item_meta = (
					frappe.db.get_value("Item", item_code, ["brand", "custom_atum_sku"], as_dict=True) or {}
				)
			except Exception:
				item_meta = {}

		atum_sku = (item_meta.get("custom_atum_sku") if isinstance(item_meta, dict) else None) or item_code
		brand = (item_meta.get("brand") if isinstance(item_meta, dict) else None) or None

		items.append(
			{
				"atum_sku": atum_sku,
				"sku": item_code,
				"brand": brand,
				"name": item_name,
				"quantity": qty,
				"uom": uom,
			}
		)

	return items


def _error(code, message):
	return {"success": False, "error": {"code": code, "message": message}}
