import unittest
from unittest.mock import patch

import frappe

from order_fulfillment_dashboard import permissions


class TestDashboardAccess(unittest.TestCase):
	def setUp(self):
		frappe.flags.redirect_location = None

	def test_guest_redirected_to_login(self):
		with patch.object(frappe.local, "session", frappe._dict(user="Guest")):
			with self.assertRaises(frappe.Redirect):
				permissions.require_dashboard_access()

		self.assertTrue(frappe.flags.redirect_location.startswith("/login?redirect-to="))

	def test_user_without_role_is_not_permitted(self):
		with patch.object(frappe.local, "session", frappe._dict(user="employee@example.com")):
			with patch.object(permissions.frappe, "get_roles", return_value=["Employee"]):
				with self.assertRaises(frappe.PermissionError):
					permissions.require_dashboard_access()

	def test_fulfillment_user_is_permitted(self):
		with patch.object(
			frappe.local, "session", frappe._dict(user="fulfillment@example.com")
		):
			with patch.object(
				permissions.frappe, "get_roles", return_value=["Fulfillment User"]
			):
				permissions.require_dashboard_access()

	def test_system_manager_is_permitted(self):
		with patch.object(frappe.local, "session", frappe._dict(user="manager@example.com")):
			with patch.object(permissions.frappe, "get_roles", return_value=["System Manager"]):
				permissions.require_dashboard_access()

	def test_administrator_is_permitted(self):
		with patch.object(frappe.local, "session", frappe._dict(user="Administrator")):
			permissions.require_dashboard_access()

	def test_has_dashboard_access_false_for_guest(self):
		self.assertFalse(permissions.has_dashboard_access("Guest"))

	def test_has_app_permission_reflects_current_user(self):
		with patch.object(frappe.local, "session", frappe._dict(user="employee@example.com")):
			with patch.object(permissions.frappe, "get_roles", return_value=["Employee"]):
				self.assertFalse(permissions.has_app_permission())

		with patch.object(
			frappe.local, "session", frappe._dict(user="fulfillment@example.com")
		):
			with patch.object(
				permissions.frappe, "get_roles", return_value=["Fulfillment User"]
			):
				self.assertTrue(permissions.has_app_permission())


if __name__ == "__main__":
	unittest.main()
