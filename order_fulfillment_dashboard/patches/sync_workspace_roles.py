import frappe

WORKSPACE = "Order Fulfillment"
ROLES = ("Fulfillment User", "System Manager")


def execute():
	"""Restrict the Order Fulfillment workspace to dashboard roles on existing sites."""
	if not frappe.db.exists("Workspace", WORKSPACE):
		return

	workspace = frappe.get_doc("Workspace", WORKSPACE)
	existing_roles = {row.role for row in workspace.roles}
	missing_roles = [
		role for role in ROLES if role not in existing_roles and frappe.db.exists("Role", role)
	]

	if not missing_roles:
		return

	for role in missing_roles:
		workspace.append("roles", {"role": role})

	workspace.save(ignore_permissions=True)
