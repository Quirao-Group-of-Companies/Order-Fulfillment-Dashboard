from urllib.parse import urlencode

import frappe
from frappe import _

ALLOWED_ROLES = ("Fulfillment User", "System Manager")


def has_dashboard_access(user: str | None = None) -> bool:
	"""Return True when the user may access Order Fulfillment data."""
	user = user or frappe.session.user

	if not user or user == "Guest":
		return False

	if user == "Administrator":
		return True

	return bool(set(frappe.get_roles(user)).intersection(ALLOWED_ROLES))


def require_dashboard_access() -> None:
	"""Guard the website page.

	Guests are redirected to the login page; logged-in users without an allowed
	role get the standard Frappe "Not Permitted" page.
	"""
	if frappe.session.user == "Guest" or not frappe.session.user:
		request = getattr(frappe.local, "request", None)
		redirect_to = request.path if request else "/order_fulfillment"
		frappe.redirect(f"/login?{urlencode({'redirect-to': redirect_to})}")

	if not has_dashboard_access():
		frappe.throw(
			_("You do not have permission to access the Order Fulfillment dashboard."),
			frappe.PermissionError,
		)


def check_api_access() -> None:
	"""Reject guests and users without an allowed role from API methods."""
	if not has_dashboard_access():
		frappe.throw(
			_("You do not have permission to access order fulfillment data."),
			frappe.PermissionError,
		)


def has_app_permission() -> bool:
	"""Used by the Apps screen to decide whether the dashboard is visible."""
	return has_dashboard_access()
