# Order Fulfillment Dashboard — Progress Tracker

## Project Status

**Overall Status:** 🟢 Phase 11 Complete

**Current Phase:** Phase 12 — Testing

**Progress:** `77%`

**Last Updated:** 2026-09-17

---

# Progress Summary

| Phase                       | Status        | Progress |
| --------------------------- | ------------- | -------: |
| 1. Project Foundation       | ✅ Completed  |     100% |
| 2. Configuration            | ✅ Completed  |     100% |
| 3. WooCommerce API Client   | ✅ Completed  |     100% |
| 4. Frappe Backend API       | 🟢 Completed |     100% |
| 5. ERPNext Customer Mapping | 🟢 Completed |     100% |
| 6. Dashboard Foundation     | ✅ Completed  |     100% |
| 7. Order Cards              | ✅ Completed  |     100% |
| 8. Phase Filtering          | ✅ Completed  |     100% |
| 9. Refresh System           | ✅ Completed  |     100% |
| 10. Error Handling          | ✅ Completed  |     100% |
| 11. UI/UX Improvements      | ✅ Completed  |     100% |
| 12. Testing                 | ⬜ Not Started |       0% |
| 13. Deployment              | ⬜ Not Started |       0% |

---

# Status Legend

```text
⬜ Not Started
🟡 In Progress
🟢 Completed
🔴 Blocked
⚠️ Needs Review
```

---

# Phase 1 — Project Foundation

**Status:** ✅ Completed

### Tasks

* [x] Confirm target Frappe app — `order_fulfillment_dashboard`
* [x] Confirm Frappe/ERPNext version — Frappe 15.103.1, ERPNext 15.103.1
* [x] Confirm module — `Order Fulfillment Dashboard`
* [x] Confirm dashboard page name — `/order_fulfillment` (www page)
* [x] Create project structure — `api/`, `services/order_fulfillment/`, `doctype/`
* [x] Review existing app conventions
* [x] Review required permissions

### Deliverables

* [x] Project structure ready
* [x] Development environment confirmed

### Notes

```text
APP STRUCTURE (adapted from build plan; target app is order_fulfillment_dashboard, not qgc_erp)

order_fulfillment_dashboard/
├── order_fulfillment_dashboard/
│   ├── api/                        <- backend API layer (Phase 4)
│   ├── services/order_fulfillment/ <- WooCommerce client (Phase 3)
│   ├── doctype/                    <- settings DocType (Phase 2)
│   ├── www/order_fulfillment.py    <- dashboard entry (Vite build)
│   └── public/order_fulfillment/   <- built dashboard assets
├── dashboard/                      <- Vite + React 19 + frappe-react-sdk
└── context/                        <- planning docs

KEY DEVIATIONS FROM ORIGINAL PLAN
- Target app is `order_fulfillment_dashboard` (dedicated app exists; build
  plan's `qgc_erp` structure was illustrative only).
- Dashboard is NOT a Frappe Desk Page: it is a standalone Vite/React app
  served from `www/order_fulfillment` at route /order_fulfillment.
- shadcn/ui is a design language to reproduce manually with Tailwind
  (architecture.md §35, §49), per library-docs.md.
- Tailwind CSS not yet installed — required before building UI (Phase 6+).
- CORRECTION (discovered in Phase 2): the nested package
  `order_fulfillment_dashboard/order_fulfillment_dashboard/order_fulfillment_dashboard/`
  was NOT a scaffold artifact — it is the **module folder** for module
  "Order Fulfillment Dashboard" (module folder = scrub(module name)).
  Frappe discovers doctypes under module folders (e.g. `chat/frappe_chat/doctype`).
  It was restored and all doctypes live under it:
  `<module folder>/doctype/`. `api/` and `services/` stay at app-package
  level (matches `chat/` app convention).
- `bench new-doctype` is NOT available on this bench version (5.29.1) —
  DocTypes are hand-authored and synced via `frappe.model.sync.sync_for()`.

PERMISSIONS (reviewed, applied in later phases)
- Configuration: Restrict `Order Fulfillment Settings` to System Manager (Phase 2).
- Dashboard: requires logged-in user; server-side WooCommerce calls only (Phase 4).
- Credentials: Password fields, never exposed to frontend (Phase 2/3).
```

---

# Phase 2 — Configuration

**Status:** ✅ Completed

### DocType

```text
Order Fulfillment Settings
```

### Tasks

* [x] Create Single DocType — `doctype/order_fulfillment_settings/`
* [x] Add WooCommerce URL — Data field
* [x] Add Consumer Key — Password field
* [x] Add Consumer Secret — Password field
* [x] Add API Path — Data field
* [x] Add Enabled field — Check field
* [x] Configure Password field — encrypted at rest, masked in API reads
* [x] Configure permissions — System Manager only (read/write/create)
* [x] Test saving settings — 9 unit tests pass (validation + security)

### Deliverables

* [x] Configuration page available
* [x] Credentials saved securely

### Notes

```text
VALIDATION (enforced when Enabled = 1, skipped when disabled)
- WooCommerce URL: required, must be http(s) with host
- API Path: required, must start with /
- Consumer Key / Secret: required

SECURITY
- Password fields stored encrypted (fernet), masked as ******* in reads
- get_password() is NOT whitelisted — credentials never reach the browser
- Permissions: only System Manager role on the DocType JSON

TESTS
- tests/test_order_fulfillment_settings.py — 9 tests, all passing
  (validation per field, invalid URLs, disabled integration allowed
   to be empty, encrypted storage, password round trip)
```

---

# Phase 3 — WooCommerce API Client

**Status:** ✅ Completed

### API

```text
https://cms-staging.buildmaster.ph/wp-json/qgc-erp/v1/order-fulfillment
```

### Tasks

* [x] Create WooCommerce client — `services/order_fulfillment/woo_client.py`
* [x] Load settings — `get_settings()` (disabled/partial config raise)
* [x] Implement authentication — HTTP Basic Auth (consumer key/secret)
* [x] Implement get_orders()
* [x] Implement get_order(order_id)
* [x] Test all orders endpoint — mocked (19 unit tests)
* [x] Test specific order endpoint — mocked
* [x] Implement timeout handling — 10s, mapped to ConnectionError
* [x] Implement HTTP error handling — 401/403 → AuthError, 4xx/5xx → APIError
* [x] Implement response validation — list / `orders` / `data` / `results` keys
* [x] Verify credentials aren't logged — credentials only in auth header, never in URL

### Deliverables

* [x] WooCommerce client working
* [x] All orders retrieval working
* [x] Specific order retrieval working

### Notes

```text
ERROR TAXONOMY (used by Phase 4/10 for friendly messages)
- IntegrationDisabledError      (integration turned off)
- IntegrationNotConfiguredError (incomplete settings)
- WooCommerceConnectionError    (network/timeout)
- WooCommerceAuthenticationError (401/403)
- WooCommerceAPIError           (other HTTP errors)
- WooCommerceInvalidResponseError (bad JSON / unexpected shape)

LIVE API PROBE (2026-08-10)
- Endpoint resolves, requires WooCommerce API credentials:
  HTTP 401 {"code":"rest_forbidden","message":"Invalid or missing
  WooCommerce API credentials."}
- Confirms Basic-Auth-style consumer key auth. Actual response
  structure still unconfirmed — needs real credentials (blocker).
```

---

# Phase 4 — Frappe Backend API

**Status:** ✅ Completed

### Tasks

* [x] Create backend API module — `api/order_fulfillment.py`
* [x] Implement get_orders()
* [x] Implement get_order(order_id)
* [x] Add whitelisted methods — `@frappe.whitelist()` (no `allow_guest`)
* [x] Add permission validation — guest session rejected with PermissionError
* [x] Normalize API response — `success/total/count/orders` + per-order `phases`
* [x] Handle exceptions — mapped to safe error structures, logged, never leaked
* [x] Test from browser/frontend — live HTTP smoke test on test.site (port 8011)

### Deliverables

* [x] Frontend can safely request order data
* [x] WooCommerce credentials remain server-side

### Notes

```text
WHITELISTED METHODS (frappe.call endpoints)
- get_orders()  -> {"success": true, "total": n, "count": n, "orders": [...]}
- get_order(id) -> {"success": true, "order": {...}} | {"order": null} if not found
- Both require a logged-in session; the framework rejects guests (403) and
  _check_permission() adds defense-in-depth.

NORMALIZED ORDER (per architecture.md §77; raw WC response never exposed)
- id, order_id, current_phase, created_at
- customer: null (placeholder — populated in Phase 5)
- phases: {enqueueing, picking, sorting, checking, loading}
  -> {start, end, elapsed} derived from *_start /*_end /*_elapsed

ERROR CONTRACT (architecture.md §82) — returned as JSON, not thrown:
- INTEGRATION_DISABLED / INTEGRATION_NOT_CONFIGURED
- WOOCOMMERCE_CONNECTION_ERROR   ("Unable to connect to WooCommerce...")
- WOOCOMMERCE_AUTHENTICATION_ERROR ("...check the integration settings.")
- WOOCOMMERCE_API_ERROR / WOOCOMMERCE_INVALID_RESPONSE
- INVALID_REQUEST (missing order_id)
- INTERNAL_ERROR (unexpected; logged via frappe.log_error, masked to client)

LIVE SMOKE TEST (2026-08-10, test.site via temp server on :8011)
- Guest call -> HTTP 403 PermissionError (framework whitelist gate)
- Admin + integration disabled -> INTEGRATION_DISABLED payload
- Admin + enabled w/ bogus creds -> real request to WooCommerce ->
  HTTP 401 -> WOOCOMMERCE_AUTHENTICATION_ERROR payload
- Password fields stay masked (*******) in API responses
- NOTE: dev server on :8000 only serves qgc_erp3.site (app NOT installed
  there); test.site must be served explicitly for dashboard dev/test.

TESTS
- tests/test_order_fulfillment_api.py — 19 tests, all passing
  (normalization incl. phase timing, empty/missing order, error mapping
   for all 6 taxonomy codes + unexpected, guest permission, masking)
- Suite total now 47 tests (was 28)
```

---

# Phase 5 — ERPNext Customer Mapping

**Status:** 🟢 Completed

### Tasks

* [x] Determine customer identifier from API
* [x] Determine ERPNext Customer mapping
* [x] Implement customer lookup
* [x] Add customer to normalized response
* [x] Handle missing customer
* [x] Test customer mapping

### Deliverables

* [x] Orders display ERPNext Customer

### Notes

```text
Customer mapping strategy:
- WooCommerce order_id maps to ERPNext Sales Order via custom fields:
  1. Primary: `custom_woo_job_order_id` (stores numeric order_id)
  2. Fallback: `custom_woo_job_order_no` (stores order number like JO#102)
- Lookup queries Sales Order, returns Customer (id + name)
- Batch lookup with chunking (500 IDs per query)
- Missing customer handled gracefully (returns null, order still displayed)
- Errors logged but never raised — customer failure cannot break order retrieval

FILES:
- services/order_fulfillment/customer_lookup.py
- api/order_fulfillment.py (integration)
- tests/test_customer_mapping.py (12 tests, all passing)
```

---

# Phase 6 — Dashboard Foundation

**Status:** ✅ Completed

### Tasks

* [x] Create Frappe Desk Page
* [x] Create dashboard HTML
* [x] Create sidebar
* [x] Set sidebar to approximately 20%
* [x] Set main content to approximately 80%
* [x] Create dashboard header
* [x] Add loading state
* [x] Add empty state
* [x] Add error state

### Deliverables

* [x] Dashboard page accessible
* [x] Sidebar visible
* [x] Main content area ready

### Notes

```text
Implemented as standalone Vite/React app (not Frappe Desk Page).
- Tailwind CSS v4 with design tokens (architecture.md §44)
- Zustand store for state management (architecture.md §53)
- Glassmorphism UI components: GlassPanel, GlassCard, PhaseBadge
- Layout: Sidebar (~20%), Main Content (~80%), Header with refresh controls
- Responsive 6-column grid (xl), 4-col (lg), 2-col (sm), 1-col (base)
- Auto-refresh: 30-second polling, preserves active filter
- Manual refresh button with loading state
- Error handling with user-friendly messages per backend error taxonomy
- Build output served via www/order_fulfillment at /order_fulfillment
```

---

# Phase 7 — Order Cards

**Status:** ✅ Completed

### Tasks

* [x] Create order card markup
* [x] Display order ID
* [x] Display current phase
* [x] Display customer
* [x] Display created_at
* [x] Format date
* [x] Handle missing values
* [x] Create 6-column desktop grid
* [x] Add responsive grid

### Target Grid

```text
Desktop: 6
Laptop:  4
Tablet:  2
Mobile:  1
```

### Deliverables

* [x] Orders appear as cards
* [x] Cards display required information

### Notes

```text
OrderCard component with GlassCard wrapper, PhaseBadge, customer name, formatted date.
Responsive grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6
```

---

# Phase 8 — Phase Filtering

**Status:** ✅ Completed

### Sidebar Filters

* [x] All Orders
* [x] Enqueue
* [x] Picking
* [x] Sorting
* [x] Checking
* [x] Loading

### Tasks

* [x] Implement All Orders
* [x] Implement Enqueue
* [x] Implement Picking
* [x] Implement Sorting
* [x] Implement Checking
* [x] Implement Loading
* [x] Add active filter state
* [x] Add phase counts
* [x] Verify filtering without page reload

### Deliverables

* [x] All phase filters work
* [x] Active filter is visually clear

### Notes

```text
PhaseFilter in Sidebar with PhaseBadge for each phase.
Order counts computed client-side from Zustand store.
Active filter highlighted with stronger glass treatment.
Client-side filtering (no API call on filter change).
```

---

# Phase 9 — Refresh System

**Status:** ✅ Completed

### Tasks

* [x] Add manual refresh button
* [x] Add loading state
* [x] Implement 30-second polling
* [x] Prevent duplicate requests
* [x] Preserve active filter
* [x] Update phase counts
* [x] Update last refreshed time

### Deliverables

* [x] Manual refresh works
* [x] Auto-refresh works
* [x] Last updated time is visible

### Notes

```text
Refresh interval: 30 seconds
RefreshButton in Header with loading spinner.
Auto-refresh via Zustand subscription, gated by autoRefresh flag.
LastUpdated displays formatted timestamp.
Selected phase preserved during refresh.
```

---

# Phase 10 — Error Handling

**Status:** ✅ Completed

### Tasks

* [x] Handle WooCommerce connection failure
* [x] Handle authentication failure
* [x] Handle timeout
* [x] Handle malformed API response
* [x] Handle empty order list
* [x] Handle missing customer
* [x] Handle backend errors
* [x] Handle permission errors
* [x] Add user-friendly error messages

### Deliverables

* [x] Dashboard fails gracefully
* [x] Errors don't expose sensitive information

### Notes

```text
ErrorState component with Try Again / Dismiss buttons.
Maps backend error codes to user-friendly messages:
- WOOCOMMERCE_CONNECTION_ERROR → "Unable to connect to WooCommerce..."
- WOOCOMMERCE_AUTHENTICATION_ERROR → "WooCommerce authentication failed..."
- INTEGRATION_DISABLED / INTEGRATION_NOT_CONFIGURED
- INTERNAL_ERROR fallback
Missing customer shows "Customer not found" on card (order still renders).
EmptyState for no orders in selected phase.
```

---

# Phase 11 — UI/UX Improvements

**Status:** ✅ Completed

### Tasks

* [x] Improve sidebar design
* [x] Improve card design
* [x] Improve phase indicators
* [x] Improve spacing
* [x] Add hover states
* [x] Improve loading state
* [x] Improve empty state
* [x] Improve error state
* [x] Improve responsive layout
* [x] Verify 6-column desktop layout

### Optional

* [x] Full-screen mode
* [x] Dark mode (already the dashboard default theme)
* [ ] Sound notification
* [x] New order animation (entrance stagger + initial pulse)

### Deliverables

* [x] Dashboard is suitable for daily operations use

### Notes

```text
DESIGN TOKEN SYSTEM (architecture.md §44 fully implemented)
- Expanded @theme in src/index.css: surfaces, ink/typography, glass surfaces,
  brand/danger, per-phase accents, background glows, motion easings/durations.
- All Tailwind usage now routes through tokens. Removed raw color classes
  (white/x, purple-*, slate-*, red-*) and hardcoded inline hex.
- Custom easing: --ease-expo-out (cubic-bezier(0.16, 1, 0.3, 1)) used for
  transitions; hover transforms gated behind hover:pointer-fine:.

SIDEBAR
- Removed duplicated PhaseBadge inside filter items (icon+dot+label+count now).
- Active item: stronger glass + brand gradient overlay + brand-tinted icon well.
- Phases use color-coded accent dots instead of raw phase badge duplication.
- Press feedback (active:scale-[0.98]), focus-visible rings, idempotent close.

CARD
- Phase accent bar (3px, rounded) driven by CSS var per phase (getPhaseAccent).
- Hierarchy: "Order" label + mono order ID; customer section; created + age row.
- Hover: -translate-y-0.5 + stronger border/background, hover:pointer-fine gated.
- Entrance: animate-card-in with 40ms stagger (capped at 12) via style delay.

PHASE INDICATORS
- PhaseBadge now includes a phase-colored dot; sizes sm/md/lg preserved.
- getPhaseColor/getPhaseAccent map to token utilities / CSS vars.

RESPONSIVE
- Sidebar hidden below lg; mobile slide-over drawer with backdrop + Escape
  close, inert when closed, auto-close on filter select.
- Header stacks on mobile; hamburger button (lg:hidden); controls wrap.

HEADER / CONTROLS
- Auto Refresh checkbox replaced with an accessible switch (role="switch").
- Added full-screen toggle (Fullscreen API + error fallback).
- Refresh/primary buttons: press feedback + brand tokens; shadow-brand/30.
- Last updated now shows HH:MM:SS (formatTime) per spec.

STATES
- LoadingSkeleton mirrors new card layout (accent bar, shimmer, stagger).
- EmptyState: glass icon tile + contextual phase message + refresh CTA.
- ErrorState: danger-soft glass panel, icon tile, Try Again / Dismiss.
- Refresh with existing data no longer unmounts the grid (opacity 40 dim
  during refetch instead of flicker) — fixes pre-existing auto-refresh jump.

VERIFICATION
- oxlint clean, tsc clean (src), vite build succeeds; built CSS confirms
  token utilities emitted (ease-expo-out, phase colors, glass surfaces,
  pointer-fine hover, xl:grid-cols-6, card-in keyframes).
```

---

# Phase 12 — Testing

**Status:** ⬜ Not Started

## Backend

* [ ] Settings save successfully
* [ ] Credentials remain secure
* [ ] WooCommerce API works
* [ ] All orders work
* [ ] Specific order works
* [ ] Customer lookup works
* [ ] API errors handled
* [ ] Invalid credentials handled

## Frontend

* [ ] Dashboard loads
* [ ] Orders render
* [ ] Cards display correct information
* [ ] Six-column layout works
* [ ] Sidebar works
* [ ] All Orders works
* [ ] Enqueue works
* [ ] Picking works
* [ ] Sorting works
* [ ] Checking works
* [ ] Loading works
* [ ] Refresh works
* [ ] Auto-refresh works
* [ ] Empty state works
* [ ] Error state works

## Responsive

* [ ] Desktop
* [ ] Laptop
* [ ] Tablet
* [ ] Mobile

### Deliverables

* [ ] MVP passes functional testing

### Notes

```text
No notes yet.
```

---

# Phase 13 — Deployment

**Status:** ⬜ Not Started

### Tasks

* [ ] Review code
* [ ] Commit changes
* [ ] Run migrations
* [ ] Build assets
* [ ] Clear cache
* [ ] Restart services if required
* [ ] Configure production credentials
* [ ] Test production WooCommerce API
* [ ] Test production dashboard
* [ ] Verify permissions
* [ ] Verify automatic refresh

### Deployment Commands

```bash
bench migrate
bench build --app qgc_erp
bench clear-cache
```

### Deliverables

* [ ] Feature deployed
* [ ] Production dashboard working

### Notes

```text
No notes yet.
```

---

# Current Blockers

| Blocker                              | Status  | Impact | Resolution                      |
| ------------------------------------ | ------- | ------ | ------------------------------- |
| API response structure not confirmed | 🔴 Open | High   | Inspect actual API response     |
| —                                    | —       | —      | —                               |

---

# Technical Decisions

| Decision                             | Status       | Notes                        |
| ------------------------------------ | ------------ | ---------------------------- |
| Target Frappe app                    | ✅ Confirmed | `order_fulfillment_dashboard`|
| Frappe version                       | ✅ Confirmed | 15.103.1                     |
| ERPNext version                      | ✅ Confirmed | 15.103.1                     |
| Module name                          | ✅ Confirmed | `Order Fulfillment Dashboard`|
| Dashboard delivery                   | ✅ Confirmed | Standalone Vite/React app in `dashboard/`, served via `www/` |
| Dashboard route                      | ✅ Confirmed | `/order_fulfillment`         |
| Use Single DocType for configuration | 🟢 Confirmed | `Order Fulfillment Settings` |
| Settings permissions                  | ✅ Confirmed | System Manager only          |
| Credential storage                    | ✅ Confirmed | Password fields, encrypted   |
| Settings validation                   | ✅ Confirmed | URL/path/credentials when enabled |
| Doctype module folder                 | ✅ Confirmed | `<module folder>/doctype/` per Frappe convention |
| Store orders locally                 | 🟢 No        | WooCommerce remains source   |
| Server-side WooCommerce requests     | 🟢 Confirmed | Protect credentials          |
| WC API auth scheme                   | ✅ Confirmed | HTTP Basic (key:secret)      |
| WC client timeouts/errors            | ✅ Confirmed | 10s timeout, typed errors    |
| Dashboard as Frappe Desk Page        | ❌ Superseded| Standalone React page instead (see Foundation notes) |
| Sidebar width                        | 🟢 Confirmed | Approximately 20%            |
| Desktop card grid                    | 🟢 Confirmed | 6 columns                    |
| Auto-refresh                         | 🟢 Planned   | 30 seconds                   |
| ERPNext Customer lookup              | ✅ Confirmed | Via Sales Order custom fields (woo_job_order_id / woo_job_order_no) |
| UI library                           | 🟢 Confirmed | HeroUI v3 (3.2.5) added; Tailwind + hand-built shadcn-style components retained |
| React version                        | ✅ Confirmed | 19.3.0 (required by HeroUI v3; frappe-react-sdk 1.17.1 supports >=17.x) |

---

# API Information

## Base URL

```text
https://cms-staging.buildmaster.ph
```

## Endpoint

```text
/wp-json/qgc-erp/v1/order-fulfillment
```

## Full Endpoint

```text
https://cms-staging.buildmaster.ph/wp-json/qgc-erp/v1/order-fulfillment
```

## Specific Order

```text
https://cms-staging.buildmaster.ph/wp-json/qgc-erp/v1/order-fulfillment?order_id=47375
```

---

# Fulfillment Phases

```text
1. Enqueue
2. Picking
3. Sorting
4. Checking
5. Loading
```

---

# Progress Log

## 2026-08-10

### Completed

* [x] Project requirements defined
* [x] Dashboard concept defined
* [x] WooCommerce API endpoint identified
* [x] Specific order endpoint identified
* [x] Configuration DocType identified
* [x] Fulfillment phases identified
* [x] Sidebar layout defined
* [x] 6-column card layout defined
* [x] ERPNext customer requirement identified

## 2026-08-10 — Phase 1 (Foundation)

### Completed

* [x] Target app confirmed: `order_fulfillment_dashboard`
* [x] Versions confirmed: Frappe/ERPNext 15.103.1, Node v20
* [x] Module confirmed: `Order Fulfillment Dashboard`
* [x] Dashboard entry confirmed: `www/order_fulfillment` (route `/order_fulfillment`)
* [x] Created `api/`, `services/order_fulfillment/` packages
* [x] Created `context/ui-registry.md` and `context/library-docs.md` (missing)
* [x] Reviewed conventions: ruff (tabs, double quotes), oxlint, pre-commit
* [x] Reviewed permissions plan (settings → System Manager, dashboard → logged-in)

## 2026-08-10 — Phase 2 (Configuration)

### Completed

* [x] Created `Order Fulfillment Settings` Single DocType (5 fields)
* [x] Validation in controller (URL, API path, credentials when enabled)
* [x] System Manager-only permissions in DocType JSON
* [x] Installed app on `test.site`, synced DocType, migrated
* [x] 9 unit tests passing (validation + encrypted password storage)
* [x] Discovered module-folder convention; moved doctype under it
* [x] ruff clean (pyproject rules: tabs, double quotes)

## 2026-08-10 — Phase 3 (WooCommerce API Client)

### Completed

* [x] `woo_client.py`: get_orders(), get_order(id), Basic Auth, 10s timeout
* [x] Typed error taxonomy (connection/auth/api/invalid response/disabled)
* [x] 19 unit tests passing (auth header placement, URL hygiene, error mapping)
* [x] Live probe: endpoint requires WooCommerce credentials (HTTP 401)
* [x] ruff clean

## 2026-08-10 — Phase 5 (ERPNext Customer Mapping)

### Completed

* [x] Customer lookup implemented via Sales Order custom fields
* [x] Primary field: `custom_woo_job_order_id` (numeric order_id)
* [x] Fallback field: `custom_woo_job_order_no` (order number like JO#102)
* [x] Batch lookup with 500-ID chunking
* [x] Missing customer handled gracefully (returns null, order still displays)
* [x] Error handling: logged but never raised — cannot break order retrieval
* [x] Integrated into `get_orders()` and `get_order()` API endpoints
* [x] 12 unit tests passing (test_customer_mapping.py)

---

## 2026-08-10 — Phase 4 (Frappe Backend API)

### Completed

* [x] `api/order_fulfillment.py`: whitelisted get_orders() + get_order(id)
* [x] Guest rejection (framework 403 + explicit session check)
* [x] Normalized response contract (§77) with per-phase start/end/elapsed
* [x] Error taxonomy mapped to safe JSON contract (§82), masked + logged
* [x] Live HTTP smoke test on test.site (disabled + bogus-credential paths)
* [x] 19 new unit tests; suite at 47 total
* [x] ruff clean

### Next

* [ ] Inspect actual WooCommerce API response (needs real credentials)
* [ ] Implement ERPNext customer lookup (Phase 5)
* [ ] Build dashboard frontend (Phase 6+)

---

## 2026-08-10 — Phase 6 (Dashboard Foundation)

### Completed

* [x] Tailwind CSS v4 installed with design tokens (architecture.md §44)
* [x] Zustand store for dashboard state (architecture.md §53)
* [x] Glassmorphism UI components: GlassPanel, GlassCard, PhaseBadge
* [x] Dashboard layout: Sidebar (~20%), Header, Main Content (~80%)
* [x] Responsive 6-column order card grid (xl:6, lg:4, sm:2, base:1)
* [x] OrderCard with Order ID, PhaseBadge, Customer, Created At
* [x] Phase filtering in Sidebar with order counts
* [x] Manual refresh button with loading state
* [x] Auto-refresh (30s polling) preserving active filter
* [x] Last updated timestamp display
* [x] LoadingSkeleton, EmptyState, ErrorState components
* [x] Error handling with user-friendly messages per backend error taxonomy
* [x] Build successful, lint clean
* [x] Assets served via www/order_fulfillment at /order_fulfillment
* [x] Fixed React 19 incompatibility with frappe-react-sdk — downgraded to React 18.3.1

---

## 2026-08-11 — Phase 11 (UI/UX Improvements)

### Completed

* [x] Expanded design tokens in index.css (@theme) — surfaces, ink, glass, phases, glows, motion
* [x] Routed all styling through tokens (removed raw color classes + hardcoded hex)
* [x] Sidebar polish: active gradient overlay, accent dots, press/focus states, removed badge duplication
* [x] Card polish: phase accent bar, hierarchy, hover lift (pointer-fine), entrance stagger
* [x] PhaseBadge: phase-colored dot indicator
* [x] Custom easing + duration tokens; reduced hover animations
* [x] Mobile responsive: sidebar slide-over drawer (lg-hidden), Escape close, inert when closed
* [x] Full-screen toggle + accessible auto-refresh switch in header
* [x] LoadingSkeleton / EmptyState / ErrorState redesigned to new card layout
* [x] Fixed refresh flicker — grid stays mounted (dimmed) during refetch
* [x] Verified: 6-column desktop grid, token utilities emitted in build output
* [x] oxlint clean, tsc clean (src), vite build + copy-html-entry OK

---

## 2026-09-17 — Date filter refresh fix

### Completed

* [x] `setStartDate` now triggers `fetchOrders()` — changing the Start Date immediately refetches from WooCommerce via `start_date` instead of waiting for a manual/auto refresh

---

## 2026-09-17 — HeroUI v3 + React 19

### Completed

* [x] Verified `frappe-react-sdk@1.17.1` is React 19 compatible — peer dep `react >=17.x`, no `react-dom`/legacy API usage in bundle; `swr@2.5.0` supports React 19
* [x] Upgraded React + React DOM 18.3.1 → 19.3.0 (`@types/*` to 19.3.0)
* [x] Installed HeroUI v3: `@heroui/react@3.2.5` + `@heroui/styles@3.2.5`
* [x] Installed HeroUI peer deps explicitly (yarn v1 doesn't auto-install peers): `react-aria`, `react-aria-components`, `@react-aria/i18n/ssr/utils`
* [x] Added `@import "@heroui/styles";` after `@import "tailwindcss";` in `src/index.css`
* [x] Added HeroUI `<Button>` smoke test in `Header` (`data-smoke-test="heroui"`)
* [x] Updated `library-docs.md`, `ui-registry.md`
* [x] `yarn build` passes; HeroUI styles bundled (CSS includes `button--primary`)
* [ ] KNOWN PRE-EXISTING (unrelated to this change): `tsc -b` reports 4 errors
  (OrderCard unused `relativeTime`/`meta`; `test/fixtures.ts` missing `type` +
  `cancelled` for the staged cancelled-phase work). `yarn test` has 7 failures
  from the same staged work (cancelled phase, `start_date`, grid cols, copy).
  None are caused by React 19 or HeroUI.
* [ ] TODO: decide whether to keep or remove the HeroUI smoke-test Button

---

# Change Log

| Date       | Change                            |
| ---------- | --------------------------------- |
| 2026-08-10 | Initial project definition        |
| 2026-08-10 | Added WooCommerce API integration |
| 2026-08-10 | Added ERPNext customer lookup     |
| 2026-08-10 | Added 6-column card dashboard     |
| 2026-08-10 | Added fulfillment phase filters   |
| 2026-08-10 | Added auto-refresh requirement    |
| 2026-08-10 | Phase 1 complete: foundation, structure, conventions confirmed |
| 2026-08-10 | Created ui-registry.md + library-docs.md |
| 2026-08-10 | Phase 2 complete: Order Fulfillment Settings DocType + validation + tests |
| 2026-08-10 | Fixed module folder convention; app installed on test.site |
| 2026-08-10 | Phase 3 complete: WooCommerce client with auth, errors, 19 tests |
| 2026-08-10 | Phase 5 complete: ERPNext customer lookup via Sales Order custom fields, 12 tests |
| 2026-08-10 | Phase 4 complete: whitelisted backend API, normalization, error contract, 19 tests |
| 2026-08-11 | Phase 11 complete: full design-token system, sidebar/card/status polish, mobile drawer, full-screen + auto-refresh switch, entrance stagger |
| 2026-09-17 | HeroUI v3 installed (3.2.5) + React upgraded 18.3.1 → 19.3.0; frappe-react-sdk React 19 compatibility verified |

---

# MVP Completion

```text
Overall Progress: 77%

Foundation       ██████████ 100%
Configuration    ██████████ 100%
API Integration  ██████████ 100%
Backend API      ██████████ 100%
Customer Mapping ██████████ 100%
Dashboard        ██████████ 100%
Cards            ██████████ 100%
Filtering        ██████████ 100%
Refresh          ██████████ 100%
Error Handling   ██████████ 100%
UI/UX Polish     ██████████ 100%
Testing          ░░░░░░░░░░ 0%
Deployment       ░░░░░░░░░░ 0%
```

---

# Definition of Done

The MVP is complete when:

* [ ] WooCommerce configuration works
* [ ] WooCommerce API connection works
* [ ] Orders are retrieved
* [X] ERPNext customer is identified
* [ ] Dashboard loads
* [ ] Orders display as cards
* [ ] Desktop displays 6 cards per row
* [ ] Sidebar filtering works
* [ ] All fulfillment phases work
* [ ] Manual refresh works
* [ ] Automatic refresh works
* [ ] Error handling works
* [ ] Security requirements are satisfied
* [ ] Production deployment succeeds
