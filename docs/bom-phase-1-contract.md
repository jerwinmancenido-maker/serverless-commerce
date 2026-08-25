# Research Compounds BOM Phase 1 Contract

Status: accepted implementation contract.

This document defines the behavior that the Medusa BOM implementation must
preserve. It does not create a database schema, run a migration, seed inventory,
or authorize a deployment.

## Source of truth

Medusa is the only operational inventory engine.

- A sellable item is a Medusa product variant.
- A physical component is a Medusa inventory item.
- Stock is held in Medusa inventory levels at stock locations.
- A variant recipe is represented by Medusa's native product-variant to
  inventory-item links and each link's `required_quantity`.
- Medusa reservation and fulfillment workflows own reserved and stocked
  quantities.
- The custom BOM module may add unit metadata, validation, explanatory
  availability, and audit snapshots. It must not create a parallel stock,
  reservation, or movement ledger.

The preserved Drizzle implementation is a behavioral reference only.

## Version 1 inventory scope

- Version 1 operates from one configured stock location.
- Stock-location IDs are configuration or database data, never source-code
  constants.
- The design must remain compatible with additional locations later.
- Marketplace-specific stock pools and synchronization are out of scope.

## Quantity contract

Medusa Admin 2.19 validates inventory-kit `required_quantity` values as whole
numbers. Version 1 therefore represents every component in its smallest
controlled base unit.

Supported base units:

| Base unit  | Code         | Intended use                                                | Example                   |
| ---------- | ------------ | ----------------------------------------------------------- | ------------------------- |
| Microgram  | `microgram`  | Raw powder or other mass-controlled material                | 10 mg = 10,000 micrograms |
| Microliter | `microliter` | Liquid-controlled material                                  | 1 mL = 1,000 microliters  |
| Piece      | `piece`      | Vials, stoppers, labels, cartons, and other countable parts | 1 vial = 1 piece          |

Rules:

1. Stocked, reserved, ordered, and required quantities are integers.
2. A recipe component's `required_quantity` must be a positive safe integer.
3. An inventory level quantity must be a non-negative safe integer.
4. Recipe quantities are converted to base units before they reach Medusa.
5. Floating-point quantities are rejected rather than rounded silently.
6. Display units and conversion factors are presentation metadata and never
   change the base-unit inventory ledger.
7. No inventory arithmetic may exceed JavaScript's safe-integer range at an
   application boundary.

## Recipe contract

An active recipe must satisfy all of the following:

- It belongs to exactly one sellable Medusa product variant.
- It contains at least one inventory item.
- Every inventory item occurs at most once in the recipe.
- Every required quantity is a positive safe integer in the component's base
  unit.
- Every component is managed through Medusa inventory.
- The variant has `manage_inventory` enabled.
- Backorders remain disabled unless an administrator explicitly changes the
  variant policy.
- Activating a recipe validates the complete recipe before changing any native
  Medusa inventory-kit links.
- After the variant appears on an order line, changing its operational recipe
  is prohibited. A materially different recipe requires a new variant. An
  idempotent write of the same recipe remains allowed.

Recipe editing must be atomic from the application's perspective: validation
failure leaves the previously active recipe unchanged.

## Availability contract

For a recipe with components `c`, buildable variant stock at a location is:

```text
min over c of floor(available_component_quantity(c) / required_quantity(c))
```

Where Medusa's available component quantity accounts for reservations.

- A missing or empty recipe is not interpreted as unlimited stock.
- A missing inventory level contributes zero availability at that location.
- The result is a non-negative whole number.
- Every component that produces the minimum ratio is a limiting component.
- The storefront consumes Medusa's canonical availability result.
- A custom BOM preview may explain the calculation and limiting components but
  must not maintain an independent cached stock count.

## Order and inventory lifecycle

```text
cart completed
  -> Medusa order created
  -> BOM component reservations created
  -> payment awaiting review
     -> rejected, canceled, or expired: release reservations
     -> approved: retain reservations and allow fulfillment
  -> fulfillment created: consume reserved component stock exactly once
  -> fulfillment canceled: follow Medusa's restoration workflow
  -> return received: restore only reusable inventory
```

Rules:

- Checkout reserves `ordered variant quantity * required_quantity` for every
  component.
- Payment approval does not directly decrement stocked quantity.
- Payment approval makes the order eligible for packing and fulfillment while
  its component reservations remain active.
- Fulfillment is the stock-consumption boundary.
- Cancellation or payment expiry releases reservations.
- Payment-expiry duration is provider configuration and will be selected during
  the Manual QR phase; it is not a BOM constant.
- Replayed requests or events must not reserve, release, or consume inventory a
  second time.
- Partial fulfillment changes quantities only for the fulfilled portion.
- Damaged, discarded, or consumed returns are not restored as sellable
  inventory.

## Adjustments, waste, and corrections

- Receipts, cycle-count corrections, damage, and production waste use Medusa
  inventory adjustment workflows.
- Negative adjustments require a reason code and actor context in the custom
  workflow metadata.
- A correction never rewrites historical order or reservation records.
- Direct SQL stock changes are prohibited.
- Version 1 records component-level adjustments. Lot allocation, expiry-first
  selection, and batch genealogy are deferred until their operational process
  is approved.

## Custom module boundary

The planned `pepstack_bom` module may own:

- Component base-unit and display-unit metadata.
- Conversion-scale and display-precision metadata.
- Component category and reorder threshold.
- Lot-tracking and expiry-tracking requirement flags.
- Recipe validation policy.
- Read-only recipe revision snapshots for audit.

Medusa module links will associate custom records with product variants and
inventory items. The custom module must not own:

- Product or variant records.
- Stocked, reserved, or available quantities.
- Operational recipe links used during checkout.
- Reservation records.
- Inventory movements created by fulfillment or returns.

## Acceptance scenarios

| ID      | Scenario                                                   | Required outcome                                              |
| ------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| BOM-001 | One component has 10 available and requires 2              | Buildable quantity is 5                                       |
| BOM-002 | Components support 5, 3, and 8 variants                    | Buildable quantity is 3 and the second component is limiting  |
| BOM-003 | Two components tie for the lowest ratio                    | Both are reported as limiting                                 |
| BOM-004 | A recipe is empty                                          | Validation fails; availability is not treated as unlimited    |
| BOM-005 | Required quantity is zero, negative, fractional, or unsafe | Validation fails without changing the active recipe           |
| BOM-006 | Available quantity is negative, fractional, or unsafe      | Contract calculation fails                                    |
| BOM-007 | Two variants share one component                           | Reservations for either variant reduce availability for both  |
| BOM-008 | Two customers race for the last buildable unit             | At most one checkout obtains the reservation                  |
| BOM-009 | An unpaid order expires                                    | All of its component reservations are released exactly once   |
| BOM-010 | Payment is approved                                        | Reservations remain; stocked quantity is unchanged            |
| BOM-011 | A paid order is fulfilled                                  | Reserved and stocked component quantities change exactly once |
| BOM-012 | An order is partially fulfilled                            | Only the fulfilled portion is consumed                        |
| BOM-013 | A reusable return is received                              | The corresponding component stock is restored once            |
| BOM-014 | A damaged return is received                               | Sellable component stock is not restored                      |
| BOM-015 | A reservation or fulfillment event is replayed             | No duplicate inventory mutation occurs                        |
| BOM-016 | A component has no level at the active location            | Buildable quantity is zero                                    |

Scenarios BOM-001 through BOM-006 are database-free contract tests. The
remaining scenarios require Medusa integration tests against a disposable
PostgreSQL database and are implementation gates for later phases.

## Phase 1 completion gate

Phase 1 is complete when:

- This contract is reflected in the canonical commerce and architecture
  specifications.
- Database-free quantity and availability contract tests pass.
- No Medusa data model, migration, inventory record, or provider state has been
  created.
- Open operational choices are explicitly deferred rather than hardcoded.
