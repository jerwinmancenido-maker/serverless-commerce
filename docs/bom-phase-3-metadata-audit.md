# Research Compounds BOM Phase 3 Metadata and Audit Module

Status: implemented and verified against disposable local PostgreSQL.

Phase 3 adds the `pepstack_bom` custom module around Medusa's native
inventory-kit behavior. The module stores component interpretation metadata and
immutable recipe snapshots. Medusa remains the only owner of stock,
reservations, inventory levels, operational recipe links, and fulfillment
movements.

## Component profiles

Each Medusa inventory item can have one `component_profile` record containing:

- Base ledger unit: `microgram`, `microliter`, or `piece`.
- Configurable display unit and integer conversion scale.
- Configurable display precision.
- Configurable category label.
- Reorder threshold in base units.
- Lot-tracking and expiry-tracking requirement flags.

The profile workflow verifies that the Medusa inventory item exists and then
creates or updates the single associated profile. It rejects empty labels,
unsupported base units, fractional values, negative values, and values that
cannot fit the generated PostgreSQL integer columns.

The category and display unit are data, not source-code enums, so administrators
can introduce new component classifications or presentation units later without
a code change. Conversion scales never alter Medusa's inventory ledger.

## Recipe audit snapshots

Every material change made through `setVariantInventoryKitWorkflow` creates a
new `recipe_audit_snapshot` after the native inventory-kit links are replaced.
Each snapshot stores:

- The Medusa product-variant ID.
- A monotonically increasing per-variant version.
- A deterministic SHA-256 recipe hash.
- The sorted inventory-item IDs and required base-unit quantities.
- The component unit/display metadata that applied at the time.
- Optional actor and note context.

Reapplying an identical recipe remains idempotent and does not create another
snapshot. Existing snapshots are never updated by an application workflow, so
later component-profile edits do not rewrite historical recipe interpretation.
The database enforces one snapshot per variant and version.

If a component profile is missing, snapshot creation fails and workflow
compensation restores the prior native inventory-kit links and variant inventory
policy. This keeps recipe activation atomic from the application's perspective.

## Module links

Read-only Medusa module links expose:

- `component_profile.inventory_item_id` to the Inventory Module's inventory
  item.
- `recipe_audit_snapshot.variant_id` to the Product Module's product variant.

These links are virtual relations backed by the IDs on the custom records. They
do not create foreign keys across isolated modules and do not duplicate the
native product-variant-to-inventory-item operational link.

## Generated migration

`Migration20260825071832` creates only:

- `component_profile` and its uniqueness/index constraints.
- `recipe_audit_snapshot` and its version/hash indexes.

The migration was generated with the Medusa 2.19 CLI using the module name
`pepstack_bom`, reviewed, and applied only by the integration-test runner to
disposable local databases. The generator's disposable database and all test
databases were removed afterward.

This phase does not authorize or perform a Neon migration, seed, Admin user
creation, deployment, provider connection, or production-data change.

## Verification gates

Database-free:

- Component profile normalization and integer constraints.
- Deterministic snapshot ordering and hashing.
- Existing quantity, recipe, and availability contract tests.

Disposable PostgreSQL:

- Profile create/update behavior and inventory-item existence checks.
- Read-only module-link traversal to inventory items and product variants.
- Snapshot versioning and idempotent recipe writes.
- Historical metadata preservation after a component-profile edit.
- Native inventory-kit rollback when a component profile is missing.
- All Phase 2 native inventory-kit scenarios.

Admin routes and UI for editing component profiles and viewing recipe history
are deferred to a later phase. The Phase 3 workflows are the owning business
logic for those future interfaces.
