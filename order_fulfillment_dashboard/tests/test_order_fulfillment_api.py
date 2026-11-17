import unittest
from unittest.mock import patch

import frappe

from order_fulfillment_dashboard import permissions
from order_fulfillment_dashboard.api import order_fulfillment
from order_fulfillment_dashboard.services.order_fulfillment import customer_lookup, woo_client


def sample_row(**overrides):
	row = {
		"id": "2062",
		"order_id": 47375,
		"current_phase": "enqueueing",
		"created_at": "2026-07-28 16:42:28",
		"enqueueing_start": "2026-07-28 16:42:28",
		"enqueueing_end": None,
		"enqueueing_elapsed": 0,
		"picking_start": None,
		"picking_end": None,
		"picking_elapsed": 0,
		"sorting_start": None,
		"sorting_end": None,
		"sorting_elapsed": 0,
		"checking_start": None,
		"checking_end": None,
		"checking_elapsed": 0,
		"loading_start": None,
		"loading_end": None,
		"loading_elapsed": 0,
	}
	row.update(overrides)
	return row


class TestGetOrders(unittest.TestCase):
	def setUp(self):
		self.resolve_patcher = patch.object(customer_lookup, "resolve_customers", return_value={})
		self.resolve_patcher.start()

	def tearDown(self):
		self.resolve_patcher.stop()

	def test_returns_normalized_response(self):
		with patch.object(woo_client, "get_orders", return_value=[sample_row()]):
			result = order_fulfillment.get_orders()

		self.assertTrue(result["success"])
		self.assertEqual(result["total"], 1)
		self.assertEqual(result["count"], 1)
		self.assertEqual(len(result["orders"]), 1)

	def test_normalizes_order_fields(self):
		with patch.object(woo_client, "get_orders", return_value=[sample_row()]):
			result = order_fulfillment.get_orders()

		order = result["orders"][0]
		self.assertEqual(order["id"], "2062")
		self.assertEqual(order["order_id"], 47375)
		self.assertEqual(order["current_phase"], "enqueueing")
		self.assertEqual(order["created_at"], "2026-07-28 16:42:28")
		self.assertIsNone(order["customer"])

	def test_normalizes_phase_timing(self):
		with patch.object(
			woo_client,
			"get_orders",
			return_value=[
				sample_row(
					picking_start="2026-07-29 08:00:00",
					picking_end="2026-07-29 08:05:00",
					picking_elapsed=300,
				)
			],
		):
			result = order_fulfillment.get_orders()

		phases = result["orders"][0]["phases"]
		self.assertEqual(phases["enqueueing"]["start"], "2026-07-28 16:42:28")
		self.assertIsNone(phases["enqueueing"]["end"])
		self.assertEqual(phases["enqueueing"]["elapsed"], 0)
		self.assertEqual(phases["picking"]["start"], "2026-07-29 08:00:00")
		self.assertEqual(phases["picking"]["end"], "2026-07-29 08:05:00")
		self.assertEqual(phases["picking"]["elapsed"], 300)
		self.assertIsNone(phases["loading"]["start"])
		self.assertIsNone(phases["loading"]["end"])

	def test_all_phases_present(self):
		with patch.object(woo_client, "get_orders", return_value=[sample_row()]):
			result = order_fulfillment.get_orders()

		self.assertEqual(
			list(result["orders"][0]["phases"]),
			list(order_fulfillment.PHASE_FIELDS),
		)

	def test_empty_orders(self):
		with patch.object(woo_client, "get_orders", return_value=[]):
			result = order_fulfillment.get_orders()

		self.assertTrue(result["success"])
		self.assertEqual(result["orders"], [])
		self.assertEqual(result["total"], 0)
		self.assertEqual(result["count"], 0)

	def test_attaches_customer_from_lookup(self):
		with patch.object(woo_client, "get_orders", return_value=[sample_row()]):
			with patch.object(
				customer_lookup,
				"resolve_customers",
				return_value={"47375": {"id": "CUST-00001", "name": "ABC Construction"}},
			):
				result = order_fulfillment.get_orders()

		order = result["orders"][0]
		self.assertEqual(order["customer"], {"id": "CUST-00001", "name": "ABC Construction"})

	def test_missing_customer_keeps_order(self):
		with patch.object(woo_client, "get_orders", return_value=[sample_row()]):
			result = order_fulfillment.get_orders()

		order = result["orders"][0]
		self.assertIsNone(order["customer"])
		self.assertEqual(order["order_id"], 47375)


class TestGetOrder(unittest.TestCase):
	def setUp(self):
		self.resolve_patcher = patch.object(customer_lookup, "resolve_customer", return_value=None)
		self.resolve_patcher.start()

	def tearDown(self):
		self.resolve_patcher.stop()

	def test_returns_normalized_order(self):
		with patch.object(woo_client, "get_order", return_value=sample_row()):
			result = order_fulfillment.get_order(47375)

		self.assertTrue(result["success"])
		self.assertEqual(result["order"]["order_id"], 47375)
		self.assertEqual(result["order"]["current_phase"], "enqueueing")

	def test_not_found_returns_none(self):
		with patch.object(woo_client, "get_order", return_value=None):
			result = order_fulfillment.get_order(999)

		self.assertTrue(result["success"])
		self.assertIsNone(result["order"])

	def test_missing_order_id_returns_invalid_request(self):
		result = order_fulfillment.get_order(None)

		self.assertFalse(result["success"])
		self.assertEqual(result["error"]["code"], "INVALID_REQUEST")

	def test_passes_order_id_to_client(self):
		with patch.object(woo_client, "get_order", return_value=sample_row()) as mock_get_order:
			order_fulfillment.get_order(47375)

		mock_get_order.assert_called_once_with(47375)

	def test_attaches_customer_from_lookup(self):
		with patch.object(woo_client, "get_order", return_value=sample_row()):
			with patch.object(
				customer_lookup,
				"resolve_customer",
				return_value={"id": "CUST-00001", "name": "ABC Construction"},
			):
				result = order_fulfillment.get_order(47375)

		self.assertEqual(
			result["order"]["customer"],
			{"id": "CUST-00001", "name": "ABC Construction"},
		)

	def test_passes_order_id_to_customer_lookup(self):
		with patch.object(woo_client, "get_order", return_value=sample_row()):
			with patch.object(customer_lookup, "resolve_customer", return_value=None) as mock_resolve:
				order_fulfillment.get_order(47375)

		mock_resolve.assert_called_once_with(47375)

	def test_missing_customer_keeps_order(self):
		with patch.object(woo_client, "get_order", return_value=sample_row()):
			result = order_fulfillment.get_order(47375)

		self.assertIsNone(result["order"]["customer"])
		self.assertEqual(result["order"]["order_id"], 47375)


class TestErrorMapping(unittest.TestCase):
	def assert_error(self, result, code):
		self.assertFalse(result["success"])
		self.assertEqual(result["error"]["code"], code)
		self.assertTrue(result["error"]["message"])

	def test_disabled_integration(self):
		with patch.object(woo_client, "get_orders", side_effect=woo_client.IntegrationDisabledError("off")):
			result = order_fulfillment.get_orders()
		self.assert_error(result, "INTEGRATION_DISABLED")

	def test_not_configured(self):
		with patch.object(
			woo_client, "get_orders", side_effect=woo_client.IntegrationNotConfiguredError("missing")
		):
			result = order_fulfillment.get_orders()
		self.assert_error(result, "INTEGRATION_NOT_CONFIGURED")

	def test_connection_error(self):
		with patch.object(
			woo_client, "get_orders", side_effect=woo_client.WooCommerceConnectionError("down")
		):
			result = order_fulfillment.get_orders()
		self.assert_error(result, "WOOCOMMERCE_CONNECTION_ERROR")
		self.assertEqual(
			result["error"]["message"],
			"Unable to connect to WooCommerce. Please try again later.",
		)

	def test_authentication_error(self):
		with patch.object(
			woo_client, "get_orders", side_effect=woo_client.WooCommerceAuthenticationError("denied")
		):
			result = order_fulfillment.get_orders()
		self.assert_error(result, "WOOCOMMERCE_AUTHENTICATION_ERROR")
		self.assertEqual(
			result["error"]["message"],
			"WooCommerce authentication failed. Please check the integration settings.",
		)

	def test_api_error(self):
		with patch.object(woo_client, "get_orders", side_effect=woo_client.WooCommerceAPIError("500")):
			result = order_fulfillment.get_orders()
		self.assert_error(result, "WOOCOMMERCE_API_ERROR")

	def test_invalid_response(self):
		with patch.object(
			woo_client, "get_orders", side_effect=woo_client.WooCommerceInvalidResponseError("shape")
		):
			result = order_fulfillment.get_orders()
		self.assert_error(result, "WOOCOMMERCE_INVALID_RESPONSE")

	def test_unexpected_error_is_logged_and_masked(self):
		with patch.object(woo_client, "get_orders", side_effect=RuntimeError("boom")):
			with patch.object(order_fulfillment.frappe, "log_error") as mock_log:
				result = order_fulfillment.get_orders()

		self.assert_error(result, "INTERNAL_ERROR")
		mock_log.assert_called_once()
		self.assertNotIn("boom", result["error"]["message"])

	def test_error_mapping_applies_to_get_order(self):
		with patch.object(
			woo_client, "get_order", side_effect=woo_client.WooCommerceAuthenticationError("denied")
		):
			result = order_fulfillment.get_order(47375)
		self.assert_error(result, "WOOCOMMERCE_AUTHENTICATION_ERROR")


class TestPermission(unittest.TestCase):
	def test_guest_rejected_for_get_orders(self):
		with patch.object(frappe.local, "session", frappe._dict(user="Guest")):
			with self.assertRaises(frappe.PermissionError):
				order_fulfillment.get_orders()

	def test_guest_rejected_for_get_order(self):
		with patch.object(frappe.local, "session", frappe._dict(user="Guest")):
			with self.assertRaises(frappe.PermissionError):
				order_fulfillment.get_order(47375)

	def test_user_without_allowed_role_rejected(self):
		with patch.object(frappe.local, "session", frappe._dict(user="employee@example.com")):
			with patch.object(permissions.frappe, "get_roles", return_value=["Employee"]):
				with self.assertRaises(frappe.PermissionError):
					order_fulfillment.get_orders()

	def test_fulfillment_user_allowed(self):
		with patch.object(
			frappe.local, "session", frappe._dict(user="fulfillment@example.com")
		):
			with patch.object(
				permissions.frappe, "get_roles", return_value=["Fulfillment User"]
			):
				with patch.object(woo_client, "get_orders", return_value=[]):
					result = order_fulfillment.get_orders()

		self.assertTrue(result["success"])

	def test_system_manager_allowed(self):
		with patch.object(frappe.local, "session", frappe._dict(user="manager@example.com")):
			with patch.object(permissions.frappe, "get_roles", return_value=["System Manager"]):
				with patch.object(woo_client, "get_orders", return_value=[]):
					result = order_fulfillment.get_orders()

		self.assertTrue(result["success"])


if __name__ == "__main__":
	unittest.main()
