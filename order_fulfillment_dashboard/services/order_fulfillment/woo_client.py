import frappe
import requests
from datetime import datetime, timedelta



REQUEST_TIMEOUT = 10


class IntegrationDisabledError(Exception):
	pass


class IntegrationNotConfiguredError(Exception):
	pass


class WooCommerceConnectionError(Exception):
	pass


class WooCommerceAuthenticationError(Exception):
	pass


class WooCommerceAPIError(Exception):
	pass


class WooCommerceInvalidResponseError(Exception):
	pass


def get_settings():
	settings = frappe.get_cached_doc("Order Fulfillment Settings")
	if not settings.enabled:
		raise IntegrationDisabledError("WooCommerce integration is disabled.")

	if not settings.woocommerce_url or not settings.consumer_key or not settings.consumer_secret:
		raise IntegrationNotConfiguredError("WooCommerce integration is not fully configured.")

	return settings


def get_orders(start_date=None):
	end_date = datetime.now()
 
	if not start_date:
		start_date = end_date - timedelta(days=60)
    
	query = {"since": start_date, "per_page": 1000}
	response_data = _request_orders(query=query)
	return _extract_order_list(response_data)


def get_order(order_id):
	query = {"order_id": order_id}
	response_data = _request_orders(query=query)
	orders = _extract_order_list(response_data)
	if not orders:
		return None
	return orders[0]


def _request_orders(query=None):
	settings = get_settings()
	url = _build_url(settings)
	auth = (settings.get_password("consumer_key"), settings.get_password("consumer_secret"))

	try:
		response = requests.request("GET", url, auth=auth, params=query, timeout=REQUEST_TIMEOUT)
	except requests.exceptions.Timeout:
		raise WooCommerceConnectionError("The WooCommerce request timed out.")
	except requests.exceptions.ConnectionError:
		raise WooCommerceConnectionError("Unable to connect to WooCommerce.")
	except requests.exceptions.RequestException:
		raise WooCommerceConnectionError("An error occurred while contacting WooCommerce.")

	return _handle_response(response)


def _handle_response(response):
	if response.status_code in (401, 403):
		raise WooCommerceAuthenticationError("WooCommerce authentication failed.")
	if response.status_code >= 400:
		raise WooCommerceAPIError(f"WooCommerce returned HTTP {response.status_code}.")

	try:
		return response.json()
	except (ValueError, requests.exceptions.JSONDecodeError):
		raise WooCommerceInvalidResponseError("WooCommerce returned an invalid response.")


def _extract_order_list(response_data):
    if isinstance(response_data, list):
        return response_data

    if isinstance(response_data, dict):
        for key in ("orders", "data", "results", "rows"):
            value = response_data.get(key)

            if isinstance(value, list):
                return value

    raise WooCommerceInvalidResponseError(
        "WooCommerce returned an unexpected response structure."
    )


def _build_url(settings):
	return settings.woocommerce_url.rstrip("/") + settings.api_path.rstrip("/")
