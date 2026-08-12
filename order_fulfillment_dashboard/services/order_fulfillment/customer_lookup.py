import frappe
from frappe.utils import cstr

SALES_ORDER_DOCTYPE = "Sales Order"
WOO_ORDER_FIELD = "custom_woo_job_order_id"
WOO_ORDER_NO_FIELD = "custom_woo_job_order_no"
CUSTOMER_QUERY_CHUNK_SIZE = 500
ERROR_LOG_TITLE = "Order Fulfillment Customer Lookup"


def resolve_customer(order_id):
	"""Resolve the ERPNext Customer for a single WooCommerce order ID.

	Returns ``{"id": ..., "name": ...}`` or ``None`` when no Sales Order
	is linked to the order ID.
	"""
	return resolve_customers([order_id]).get(cstr(order_id))


def resolve_customers(order_ids):
	"""Resolve ERPNext Customers for a batch of WooCommerce order IDs.

	Returns a dict keyed by the string form of each ``order_id`` with values
	``{"id": ..., "name": ...}``. Order IDs without a linked Sales Order are
	omitted so callers can fall back to their own "not found" handling.

	Lookup failures never raise: they are logged and treated as unresolved
	so a customer problem cannot break order retrieval.
	"""
	ids = {cstr(order_id).strip() for order_id in order_ids if cstr(order_id).strip()}
	if not ids:
		return {}

	so_map = {}
	try:
		so_map = _query_sales_orders(WOO_ORDER_FIELD, ids)
		missing = ids - set(so_map)
		if missing:
			so_map.update(_query_sales_orders(WOO_ORDER_NO_FIELD, missing))
	except Exception:
		frappe.log_error(frappe.get_traceback(), ERROR_LOG_TITLE)
		so_map = {}

	return {order_id: _customer_payload(so) for order_id, so in so_map.items()}


def _query_sales_orders(field, ids):
	if not frappe.db.has_column(SALES_ORDER_DOCTYPE, field):
		return {}

	rows = []
	for chunk in _chunked(list(ids), CUSTOMER_QUERY_CHUNK_SIZE):
		rows.extend(
			frappe.db.sql(
				f"""
				SELECT `{field}` AS woo_id, `name`, `customer`, `customer_name`
				FROM `tabSales Order`
				WHERE `{field}` IN %s
				""",
				(chunk,),
				as_dict=True,
			)
		)

	return {cstr(row["woo_id"]): row for row in rows if row.get("woo_id")}


def _customer_payload(so):
	customer_type = frappe.get_cached_value("Customer", so.get("customer"), "customer_type")

	return {"id": so.get("customer"), "name": so.get("customer_name"), "type": customer_type}


def _chunked(values, size):
	for index in range(0, len(values), size):
		yield values[index : index + size]
