# UI Component Registry

Central registry of all UI components used by the Order Fulfillment Dashboard.

**Last Updated:** 2026-09-17

---

## Registry Rules

- Every reusable component belongs in this registry.
- Status legend: `Planned` / `In Progress` / `Done` / `Removed`
- Update this file after every feature (AGENTS.md rule).
- Styling follows the rules in `architecture.md`: Tailwind utilities + design tokens only — never hardcoded hex or raw color classes.

---

## Layout Components

| Component    | Status   | Notes                              |
| ------------ | -------- | ---------------------------------- |
| Dashboard    | Done     | Page shell, 20/80 sidebar split    |
| GlassPanel   | Done     | Primary/secondary glass surface    |
| GlassSidebar | Done     | Left nav, ~20% width               |
| OrderGrid    | Done     | 6-col desktop / 4 / 2 / 1 grid     |

## Order Components

| Component  | Status   | Notes                              |
| ---------- | -------- | ---------------------------------- |
| OrderCard  | Done     | Order ID, phase, customer, created |
| PhaseBadge | Done     | Badge per fulfillment phase        |
| PhaseFilter| Done     | Sidebar filter with counts         |

## Status / Feedback Components

| Component       | Status   | Notes                              |
| --------------- | -------- | ---------------------------------- |
| RefreshButton   | Done     | Manual refresh, press feedback     |
| LastUpdated     | Done     | "Last updated: HH:MM:SS" indicator |
| LoadingSkeleton | Done     | Mirrors card layout, shimmer+stagger |
| EmptyState      | Done     | "No orders found." + refresh CTA   |
| ErrorState      | Done     | WooCommerce connection / auth errors |

## Controls / Navigation (Phase 11)

| Component        | Status | Notes                                  |
| ---------------- | ------ | -------------------------------------- |
| SidebarDrawer    | Done   | Mobile slide-over, lg:hidden, inert    |
| AutoRefreshSwitch| Done   | role="switch" toggle in header         |
| FullscreenToggle | Done   | Fullscreen API, header icon button     |
| HeroUIButton     | Done   | HeroUI v3 smoke test in header (`data-smoke-test="heroui"`) |

## Design Tokens

Token categories defined in `architecture.md` §44:

```text
Border Radius   Small / Medium / Large
Glass           Background opacity / border opacity / blur
Spacing         XS / SM / MD / LG / XL
Typography      Heading / Body / Label / Caption
```

Tokens implemented in `src/index.css` via `@theme` (Tailwind v4).

---

## Change Log

| Date       | Change                    |
| ---------- | ------------------------- |
| 2026-08-10 | Registry initialized with planned components |
| 2026-08-10 | Phase 6 complete: all components implemented |
| 2026-08-11 | Phase 11 complete: tokenized design system, sidebar/card/phase polish, mobile drawer, auto-refresh switch + fullscreen toggle |
| 2026-09-17 | Added HeroUI v3 (`@heroui/styles` imported after Tailwind); HeroUI Button smoke test in header |