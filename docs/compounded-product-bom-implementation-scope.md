# Shared BOM Product Recipes — Implementation Scope

Status: Phase 7 locally verified; Phase 8 browser acceptance remains
Branch: `feat/shared-bom-product-recipes`

## Goal

Connect the unified, template-free Add Product workflow to shared Medusa
inventory through configurable BOM recipes. The same finished-vial inventory
item must be reused by every sellable variant with the same compound and net
content.

## Fixed merchant model

- Products arrive as already compounded finished vials.
- Variation names and values remain configurable; the initial operating setup
  uses `Inclusion` and `Net Content`.
- Initial Inclusion values are `Vial Only`, `Vial + BAC`, and `SubQ Set`.
- Net Content values are merchant-defined and preserve explicit `mcg`, `mg`,
  `mL`, or `IU` context.
- Blank SKUs are generated automatically.
- Inventory is currently operated from one stock location.

## Initial component rules

Receiving conversions:

- Alcohol pads: 1 box = 100 pieces.
- 1 cc syringes: 1 box = 100 pieces.
- 3 cc syringes: 1 box = 100 pieces.

Initial Inclusion recipes:

- Vial Only: finished compounded vial x 1.
- Vial + BAC: finished compounded vial x 1; BAC Water 10 mL vial x 1.
- SubQ Set: finished compounded vial x 1; BAC Water 10 mL vial x 1;
  1 cc syringe x 6; 3 cc syringe x 1; alcohol pad x 10.
- Common packaging: mailer box x 1 and individually counted packing items
  selected by the merchant.

These are Admin-managed configuration records, not hardcoded product logic.

## Existing architecture to preserve

- Native Medusa inventory items remain the physical stock authority.
- The existing `bom` module owns component profiles and immutable recipe audit
  snapshots.
- Recipe mutations continue through Medusa workflows.
- Variant-to-inventory relationships use Medusa inventory-kit links and
  `required_quantity`.
- The compounded-product module owns configuration, product creation,
  governance, and publication readiness; it does not duplicate stock counts.
- Cross-module reads use Medusa query/link mechanisms, not SQL joins.

## In-scope phases

1. Reconcile and isolate the existing unified Add Product work.
2. Add receiving-unit conversions and component classification needed by the
   component inventory workflow.
3. Add configurable finished-vial, Inclusion, and common-packaging recipe rules.
4. Resolve every enabled variant combination to an explicit recipe.
5. Calculate location-aware available-to-sell quantity and limiting component.
6. Present recipe status, shared inventory, and availability in Add Product.
7. Verify reservation, concurrent purchase, fulfillment, and cancellation.
8. Smoke-test the exact merchant path in the VS Code built-in browser.

## Drift exclusions

The following are not part of this feature:

- Research Tracking or RT-6 work.
- Account, homepage, or general storefront redesign.
- Marketplace integrations.
- Payment-provider or fulfillment-provider changes.
- Neon, hosted infrastructure, deployment, or production activation.
- Branding work unrelated to product inventory.
- A second inventory ledger or duplicated per-variant stock quantity.

## Acceptance rules

- All variants for one compound and net content reference the same finished-vial
  inventory item.
- Inclusion variants share stock; their displayed capacities are never summed.
- Component availability is `stocked - reserved` for the selected location.
- Available to sell is the minimum whole-number component capacity.
- The limiting component is displayed by name.
- A draft can be incomplete, but publication is blocked until every enabled,
  inventory-managed variant has a valid recipe.
- Future compounds, net contents, Inclusion values, and packaging components can
  be added without source-code changes.
- No workflow mutation is performed directly from an API route or Admin page.

## Phase 0 ownership map

Relevant prerequisite work currently in the worktree:

- Unified Add Product Admin route, direct variation builder, rich description,
  automatic matrix preview, automatic SKU handling, and native route redirect.
- Direct-snapshot backend validation and preview support.
- Shared research unit definitions and storefront description sanitization.
- Removal of the apparel sample catalog from initialization.

Preserved but excluded from this feature:

- Session persistence changes in `.env.template` and `medusa-config.ts`.
- `.agents/skills/medusa-project-loop/`.
- `docs/research-tracking-rt-6-privacy-approval-proposal.md`.
- `docs/research-tracking-rt-6-source-implementation-plan.md`.

## Phase 1 decisions

- Component classification is a configurable enum: `finished_product`,
  `included_supply`, or `packaging`. It does not encode product names.
- Supplier receiving units are `box`, `pack`, `roll`, or `piece`.
- `inventory_units_per_supplier_unit` is a positive whole-number conversion.
  Individually received pieces are fixed at `1 piece = 1 inventory piece`.
- Component profiles retain their canonical BOM ledger unit. The current
  finished products, included supplies, and packaging are configured as
  individually tracked pieces.
- Native Medusa inventory levels continue to own stock-location quantities.
  The BOM profile does not duplicate a stock location or stock balance; the
  active shared location will be resolved through Medusa inventory workflows.
- The generated BOM migration is `Migration20260830042613.ts`. It has not been
  applied to any existing or hosted database.

## Phase 2 decisions

- Recipe configuration is stored in the immutable compounded-product
  presentation snapshot. It does not create a second stock ledger.
- `finished_product` rules map a configurable variation value to exactly one
  inventory item classified as a finished product.
- `variation_value` rules map a configurable variation value to zero or more
  inventory items classified as included supplies. Zero components is an
  explicit valid recipe for options that include no extra supplies.
- `common_packaging` rules apply packaging components to every sellable
  combination.
- Rules reference native Medusa inventory-item IDs and display quantities.
  Create and revise workflows validate profile existence, classification, and
  conversion to the component's canonical base unit.
- The unified Add Product page lets the merchant choose which current
  variation axis controls finished products and which controls included
  supplies. It does not depend on product names, axis labels, or fixed recipe
  quantities in source code.
- Phase 2 changes only JSON configuration stored in the existing revision
  snapshot, so it requires no new compounded-product database migration.

## Phase 3 decisions

- Saving a governed product draft resolves every sellable matrix row into one
  complete native Medusa inventory-kit recipe before the creation request is
  marked complete.
- Every configured row must resolve exactly one `finished_product` rule. The
  resolver then adds every matching `variation_value` rule and all
  `common_packaging` rules.
- If multiple rules reference the same native inventory item, their canonical
  integer base-unit quantities are summed. This preserves one reusable stock
  balance for the same finished vial or supply across multiple variants.
- Created native variants are matched back to matrix rows using the immutable
  `compounded_product.matrix_row_key` metadata written during product creation;
  array position is not used as identity.
- Resolved component inventory is supplied to Medusa's native product workflow
  when each variant is created. This prevents Medusa from creating a redundant
  per-variant inventory item before the shared BOM links are attached. Every
  affected variant remains managed inventory without backorders, and an
  immutable recipe audit snapshot is written for each variant.
- The recipe workflow is nested inside the governed product-creation workflow.
  Link creation, product-variant updates, and recipe snapshots therefore retain
  workflow compensation if a later creation step fails.
- Add Product blocks a partially configured finished-product map, and the
  post-save product review shows the generated recipe components. Drafts with
  no recipe rules remain possible, but publication readiness continues to flag
  managed variants without BOM recipes.
- Phase 3 changes workflow and JSON-backed configuration behavior only. It does
  not add a new DML model and requires no additional migration.

## Phase 4 decisions

- Calculated stock reads native `product_variant_inventory_item` recipe links
  and native inventory levels for one explicitly selected stock location. It
  does not persist or cache a second availability balance.
- Component availability is `max(0, stocked_quantity - reserved_quantity)`.
  The zero floor prevents a negative sellable quantity when reservations
  temporarily exceed stocked quantity.
- Each component capacity is the whole number
  `floor(available_quantity / required_quantity)`. Variant calculated stock is
  the lowest component capacity, and every component tied at that capacity is
  reported as limiting.
- Sibling variants calculate against the same current inventory-item balance.
  Their capacities are never summed, so the same finished vial remains reusable
  across Vial Only, Vial + BAC, and SubQ Set configurations.
- The Admin BOM page selects a stock location and displays calculated stock and
  limiting component names for every visible variant. A missing recipe is
  distinguished from a valid recipe with zero calculated stock.
- Availability is read-only derived data, so Phase 4 adds no DML model and
  requires no migration.

## Phase 5 decisions

- Unified Add Product previews availability before the native Medusa variants
  exist. A read-only authenticated Admin endpoint accepts the current matrix
  rows and immutable recipe rules, then evaluates them against native inventory
  at the explicitly selected stock location.
- The preview uses the same recipe normalization, component-capacity, and
  limiting-component functions as saved BOM inventory. It does not duplicate
  recipe semantics or maintain a browser-side conversion table.
- Recipe completeness is shown as mapped combinations out of total generated
  combinations. Availability is requested only after every row resolves one
  finished-product component.
- Shared components are listed once with their current available balance and
  the number of combinations that use them. This usage count is explanatory;
  it is never subtracted from or summed into inventory.
- Every generated combination displays its calculated stock, each component's
  capacity, and its limiting component names. A valid zero is displayed as
  zero, while unavailable or incomplete preview data is displayed separately.
- Preview responses are private and non-cacheable at the HTTP boundary. The
  Admin refreshes the read-only calculation periodically while the page is
  open. Phase 5 adds no DML model and requires no migration.

## Phase 6 decisions

- The unified Add Product page presents recipe completeness, shared component
  balances, per-component capacity, calculated variant stock, and limiting
  components in the same merchant workflow.
- Variation combinations update automatically from the configured variation
  axes; no separate combination-generation action is required.
- Inventory selection and recipe quantities remain configuration-driven.
  Product names, net contents, Inclusion labels, components, and packaging are
  not encoded as product-specific source constants.
- Shared inventory is shown once per native inventory item. Per-variant rows
  explain consumption without presenting duplicated stock ledgers.

## Phase 7 verification receipt

- A real authenticated local Admin draft created one native Medusa product,
  three native variants, three distinct deterministic automatic SKUs, native
  inventory links for the resolved BOM components, and three immutable recipe
  audit snapshots.
- The 50 mg finished-vial inventory item was linked to Vial Only, Vial + BAC,
  and SubQ Set. No redundant per-variant inventory item was created, and sibling
  calculated availability reused the same finished-vial balance.
- Two concurrent non-backorder reservations against one available Vial Only
  recipe produced exactly one success and one rejection. The successful
  reservation reduced calculated stock to zero.
- Cancelling the reserved order released every reservation and restored the
  calculated stock to one.
- Fulfilling a SubQ Set cleared its reservations and decremented the finished
  vial, BAC Water, 1 cc syringes, 3 cc syringe, alcohol pads, and mailer by their
  exact configured recipe quantities.
- A forced recipe-audit persistence failure compensated the native product,
  variant inventory links, and recipe snapshots.
- All nine authenticated HTTP suites passed (50 tests). All backend unit suites
  passed (42 suites, 341 tests), storefront tests passed (27 tests), lint and
  typecheck passed for both workspaces, and both production builds passed.
- The complete custom-module migration chain passed up, complete down, and up
  again on a fresh disposable local PostgreSQL database. The disposable
  database was deleted afterward; no existing database or Neon was changed.

## Verification cadence

Every implementation phase must report:

1. exact files changed;
2. focused tests run and their results;
3. broader typecheck/lint/build result when appropriate;
4. exact Admin route observed in the VS Code built-in browser;
5. remaining acceptance rules;
6. confirmation that excluded files were not staged or altered.
