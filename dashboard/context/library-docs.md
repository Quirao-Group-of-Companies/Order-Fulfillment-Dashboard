# Library Docs — Project-Specific Rules

Project-specific usage rules for third party libraries.
**Last Updated:** 2026-09-17

---

## Reading Order

Before adding ANY third party library:

1. Load its installed skill (AGENTS.md rule).
2. Read this file for project rules.
3. Read `ui-registry.md` to see if a component already exists.

---

## Current Stack

| Library         | Version       | Status      | Notes                                   |
| --------------- | ------------- | ----------- | --------------------------------------- |
| React           | ^19.3.0       | Installed   | Frontend runtime (upgraded for HeroUI)  |
| React DOM       | ^19.3.0       | Installed   | Frontend runtime                        |
| Vite            | ^8.2.0        | Installed   | Build tool, dev server on :8080         |
| frappe-react-sdk| ^1.3.11→1.17.1| Installed   | Frappe backend communication            |
| Tailwind CSS    | ^4.3.3        | Installed   | Styling (design tokens)                 |
| HeroUI v3       | 3.2.5         | Installed   | Component library (`@heroui/*`)         |
| zustand         | ^5.0.14       | Installed   | Client state                            |

---

## HeroUI v3

- Packages: `@heroui/react` + `@heroui/styles`, pinned to 3.2.5.
- **Requires React 19+** (peer). React was upgraded from 18.3.1 → 19.3.0 to satisfy this.
- **Requires Tailwind CSS v4**; `@heroui/styles` must be imported **after** `tailwindcss`
  in the CSS entry (`src/index.css`). Import order matters.
- **No Provider wrapper needed** in v3 — components render standalone.
- Peer deps installed explicitly: `react-aria`, `react-aria-components`,
  `@react-aria/i18n`, `@react-aria/ssr`, `@react-aria/utils` (yarn v1 does not
  auto-install peers).
- Smoke test: `Button` rendered in `Header` (`data-smoke-test="heroui"`).
- Known benign warning: `@react-types/color` → optional peer
  `@react-spectrum/provider` unmet (only used by color components, unused here).

---

## frappe-react-sdk

- Already used in `src/main.tsx` (`FrappeProvider`) — the only sanctioned way for the dashboard to call the Frappe backend.
- All backend calls go through this SDK; never call WooCommerce directly from the browser (security requirement, `project-overview.md` §21).
- Dashboard API calls will use `useFrappeGetCall` / `frappe.call` against whitelisted methods (Phase 4+).

## shadcn/ui

- NOT a package — it is a **design language** reproduced by hand per `architecture.md` §35 and §49 clause 12-13.
- Components are hand-built with Tailwind + React following shadcn patterns; never `npm install` shadcn CLI components into this app.
- Before adding a component, load the `shadcn` skill and check the registry.

## Tailwind CSS

- Adding Tailwind requires: load installed skill first, then verify no duplicate tokens exist in `ui-registry.md`.
- Never use hardcoded hex values or raw color classes (AGENTS.md rule) — all styling via design tokens.

---

## Change Log

| Date       | Change                                 |
| ---------- | -------------------------------------- |
| 2026-08-10 | Initialized library docs               |
| 2026-09-17 | React upgraded to 19.3.0; added HeroUI v3 (3.2.5) + MCP-verified quick-start setup |