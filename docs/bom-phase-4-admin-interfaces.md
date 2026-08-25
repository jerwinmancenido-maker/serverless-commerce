# PepStack BOM Phase 4 Admin Interfaces

Status: source implementation complete; database and browser runtime remain
unverified.

Phase 4 adds authenticated Medusa Admin APIs and an Admin dashboard page around
the Phase 3 `pepstack_bom` module. It does not create a parallel inventory
ledger, alter the module schema, or replace Medusa's native inventory-kit
links.

## Admin API

The following routes are under Medusa's authenticated `/admin` namespace:

- `GET /admin/bom/component-profiles` lists the component metadata profiles.
- `POST /admin/bom/component-profiles` creates or updates the one profile tied
  to an inventory item by running `setComponentProfileWorkflow`.
- `GET /admin/bom/recipe-history/:variantId` returns the selected product
  variant and its immutable recipe snapshots in newest-first order.

The component-profile write contract accepts integer base-unit conversions,
integer display precision, integer reorder thresholds, category, and lot/expiry
tracking flags. Unknown fields and invalid base units are rejected before the
workflow runs. The route cannot directly write stock quantities or recipe audit
records.

## Admin dashboard

The Medusa Admin sidebar contains a `BOM Inventory` page with two sections:

1. Component profiles — a searchable, paginated inventory-item table. Selecting
   a row opens a drawer to create or edit unit metadata, reorder threshold,
   category, and tracking flags.
2. Recipe history — a searchable, paginated product-variant table. Selecting a
   row opens a read-only drawer containing each immutable recipe version, its
   hash, note, actor, and component quantities.

The dashboard uses the official Medusa JS SDK with Admin session
authentication. Profile mutations invalidate and reload the profile query after
success.

## Security and ownership boundaries

- Admin routes use Medusa's standard Admin authentication. No custom public
  authentication bypass is registered.
- Profile writes continue through the Phase 3 workflow and its compensation
  behavior.
- Recipe history is read-only. The BOM service continues to reject audit
  snapshot updates.
- Payment methods, shipping options, voucher rules, and credentials remain
  configurable and outside this phase.

## Database boundary

Phase 4 does not change any model, module link, or database migration. No
migration, seed, Admin user, Neon mutation, deployment, or provider connection
is authorized or performed by this phase.

Runtime verification requires a disposable or approved development PostgreSQL
database plus a Medusa Admin user. Until that gate is explicitly authorized,
successful source checks are not evidence that the page has been exercised in
a browser or that the API has been exercised against Neon.

## Source verification

The Phase 4 source gate includes:

- Medusa lint
- TypeScript type checking
- database-free unit tests, including the Admin API request contract
- Medusa backend build, including Admin extension bundling

Database-backed HTTP integration tests and browser-runtime verification remain
deferred to the approved disposable-database stage.
