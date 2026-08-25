# Research Tracking RT-4 Purchased Products and Supplies Contract

Status: planning contract for review. This document authorizes no application
source, model, workflow, API, storefront, migration, database, Neon,
deployment, or activation change.

## Purpose

RT-4 connects an authenticated customer's eligible Medusa order line item to
the private Research & Tracking domain only after the customer explicitly
selects **Start tracking**. It adds the planned **My Products & Supplies**
workspace without changing Medusa commerce records or implying product use.

## Authority and dependencies

- RT-0 remains authoritative for research-only language, domain separation,
  information architecture, privacy gates, and delivery order.
- RT-2 remains authoritative for authenticated ownership, consent, lifecycle,
  idempotency, private projections, caching, and error behavior.
- RT-3 remains authoritative for the protected account shell and activation
  gating.
- Medusa remains the source of truth for customers, products, variants,
  orders, line items, fulfillments, cancellations, returns, refunds, and
  commerce inventory.
- `researchTracking` owns private tracked materials, customer supplies, and
  activation evidence.
- `researchContent` owns the verified variant material profile used to
  normalize quantity. RT-4 may read that published profile but does not expose
  calculator behavior or protocol content.

## Non-negotiable boundaries

- A purchase, payment, fulfillment, or marketplace event never creates a
  private tracking record automatically.
- Activation does not mean possession, use, administration, adherence, or
  intent to use.
- RT-4 creates no routine, occurrence, log, measurement, journal entry,
  protocol acknowledgement, calculator session, cart, order, or inventory
  adjustment.
- Warehouse BOM quantities and commerce inventory are never used as customer
  supply quantities.
- Product metadata, order metadata, customer metadata, analytics events,
  support notes, and marketplace payloads never store RT-4 private data.
- Lot and batch values remain optional and visually secondary. Their absence
  is never an error and never blocks activation.
- A SKU-level or formulation-level document is never represented as a
  batch-specific certificate.
- No Admin route or page may expose customer tracked materials or supplies.

## Existing model behavior

RT-1 already provides:

- one `tracked_material` per research profile and product variant;
- one or more `research_supply` records per tracked material;
- a unique supply source order-line-item identifier;
- read-only links from tracked material to product variant and from supply to
  Medusa order line item; and
- optional lot, batch, expiry, and storage fields on a supply.

When a customer purchases the same variant again, RT-4 reuses the active
tracked material and creates a separate supply for the new eligible line item.
It never increases or rewrites the earlier supply.

The current model permits only one non-deleted tracked material per profile and
variant, including when that material is archived. RT-4 must not silently
reactivate an archived material. The implementation contract must first choose
and test a customer-visible restore flow, an ineligibility response, or a
reviewed model change.

## Required activation evidence

RT-4 requires a durable `research_supply_activation` record or an equivalent
reviewed model that preserves:

- research profile ID;
- tracked material ID and created supply ID;
- source Medusa order ID and order line item ID;
- source product variant ID;
- normalized eligible commerce quantity;
- material-profile key and revision;
- material quantity per commerce unit and normalized base unit;
- activation idempotency key and SHA-256 request fingerprint;
- activation timestamp; and
- immutable customer-safe label snapshot.

The implementation must enforce unique activation evidence for the source
order line item and unique idempotency-key use within one research profile. Raw
fingerprints, idempotency keys, and internal ownership IDs never appear in
storefront responses.

This evidence model requires a separately generated migration. This contract
does not authorize generating or applying it.

## Variant material profile

Quantity normalization must use the current published
`calculator_material_profile` linked to the purchased variant. Reusing this
verified profile avoids duplicating product strength or net-content data.

RT-4 may read only a profile that:

- has `status = published`;
- is effective at the activation time;
- has an evidence scope of `sku` or `formulation`;
- has positive integer base quantities and a supported base unit; and
- is the single deterministic current revision for the variant.

A batch-scoped profile is ineligible in RT-4 because the order item has no
verified batch association. Missing, ambiguous, draft, withdrawn, future, or
invalid material profiles make the item ineligible. RT-4 must not fall back to
BOM data, catalog metadata, free text, or a guessed quantity.

Reading this profile for normalization does not activate the RT-7 calculator
or publish calculator UI.

## Order-item eligibility

An order line item is eligible only when all of these conditions hold:

1. the authenticated customer has an active Research & Tracking profile and
   the current server-owned consent version;
2. Medusa confirms the order belongs to that customer;
3. the order and line item exist and have not been deleted;
4. the line item has a valid linked product variant;
5. the current line-item quantity is fully fulfilled using authoritative
   Medusa order-item detail quantities;
6. cancelled, returned, or otherwise reversed quantities are excluded;
7. `written_off_quantity` is zero;
8. the remaining eligible commerce quantity is a positive safe integer;
9. a valid current published variant material profile exists;
10. the normalized base-unit result is a positive PostgreSQL-safe integer; and
11. the order belongs to an explicitly allowed first-party sales channel.

Implementation must use Medusa's authoritative order quantities and relations,
not infer eligibility from a display status string alone. If the selected
Medusa version cannot distinguish fulfilled, cancelled, returned, and reversed
quantities safely, implementation stops for a contract amendment.

For the installed Medusa 2.19.0 contract, the workflow reads the raw big-number
values for `quantity`, `fulfilled_quantity`, `return_requested_quantity`,
`return_received_quantity`, `return_dismissed_quantity`, and
`written_off_quantity`. It requires `fulfilled_quantity = quantity` and
`written_off_quantity = 0`, then derives:

```text
eligible fulfilled commerce units
  = fulfilled_quantity
  - return_requested_quantity
  - return_received_quantity
  - return_dismissed_quantity
```

The calculation uses Medusa `MathBN` operations before conversion to a number.
Every input must be a non-negative integer, and the result must be a positive
integer. A canceled order, canceled fulfillment reflected by a reduced
fulfilled quantity, a negative result, or an inconsistent detail record is
ineligible. This rule excludes returned, pending-return, and dismissed-return
units without rejecting an otherwise eligible remaining unit. A line with any
written-off quantity is wholly ineligible because Medusa claim and damaged
return processing can overlap written-off and return counters; RT-4 does not
guess how to de-duplicate those events.

RT-4 permits only orders whose `sales_channel_id` appears in the server-owned
`RESEARCH_TRACKING_ELIGIBLE_SALES_CHANNEL_IDS` comma-separated allowlist. The
allowlist is deployment configuration and must not be hardcoded in source. A
missing or empty allowlist makes purchased activation unavailable. Marketplace
channels and unknown channels are denied even when the order customer ID
matches. Marketplace-origin orders remain ineligible until a separately
approved account-linking contract establishes ownership.

## Quantity calculation

For an eligible order line item:

```text
initial supply base units
  = eligible fulfilled commerce units
  × published material quantity per commerce unit
```

Both operands and the result must be positive safe integers. The workflow must
reject overflow, fractional commerce units, unsupported units, or an
ambiguous profile revision before creating any record.

On activation:

- `initial_quantity_base_units` equals the calculated result;
- `remaining_quantity_base_units` initially equals the same result;
- `base_unit` comes from the published material profile;
- `source_order_line_item_id` comes from the verified owned line item;
- `product_variant_id` and label come from the immutable activation snapshot;
- `source` is `purchased`;
- lot, batch, expiry, and storage remain null unless the customer later adds
  optional private details; and
- `acquired_at` records the server activation time, is labeled **Added to
  tracking**, and is never presented as proof of physical delivery or use.

RT-4 displays remaining quantity but does not deduct or manually adjust it.
Supply adjustments remain RT-5.

## Customer API contract

Every endpoint is under Medusa's authenticated
`/store/customers/me/research-tracking/*` prefix, derives the customer from
`req.auth_context.actor_id`, and returns `Cache-Control: private, no-store`.

### List activation candidates

`GET /store/customers/me/research-tracking/purchased-items`

Returns a paginated customer-safe projection of owned order items and their
activation state. The projection may include order display reference, line-item
ID, title snapshot, variant title or SKU when available, commerce quantity, an
authoritative fulfillment timestamp when the installed Medusa version exposes
one safely, eligibility state, and a non-sensitive ineligibility reason.

It never returns another customer's order, payment data, address, marketplace
credentials, internal activation evidence, or private records.

### Activate an owned order item

`POST /store/customers/me/research-tracking/purchased-items/activate`

Validated body:

```json
{
  "order_id": "order_...",
  "line_item_id": "ordli_..."
}
```

The request requires a validated `Idempotency-Key` header. Client-supplied
customer, profile, variant, quantity, unit, eligibility, label, material
profile, and supply values are rejected.

First activation returns `201`. An exact replay or a later request for the same
owned line item returns `200` with the same durable activation resource without
creating another material, supply, or activation record. Reusing one
idempotency key for a different request returns `409`.

### List tracked materials and supplies

`GET /store/customers/me/research-tracking/materials`

Returns paginated active tracked materials with their private supplies and
customer-safe activation source references. Projections may expose opaque
tracked-material and supply IDs needed for later owned operations but never
customer IDs, fingerprints, idempotency keys, or internal link state.

### Update optional supply details

`POST /store/customers/me/research-tracking/supplies/:id/details`

Allows the owning customer to set or clear optional lot text, batch text,
expiry date, and a bounded storage note through a workflow. All fields remain
optional. Lot and batch text are trimmed, reject control characters, and have a
maximum length of 64 Unicode code points. The storage note follows the same
rules with a maximum length of 500 Unicode code points. Expiry accepts only a
strict `YYYY-MM-DD` calendar date, may be in the past, cannot be more than 50
years in the future, and is normalized to midnight UTC. The route cannot
change source links, variant, label, acquired time, initial quantity, remaining
quantity, base unit, or status.

This mutation requires an idempotency key, durable fingerprint conflict
handling, ownership validation, bounded text, and compensation. It is deferred
to a separately contracted RT-4B checkpoint. RT-4 core displays these optional
fields as read-only and does not include the mutation route or editing UI.

## Activation workflow

The mutation route runs one Medusa workflow. The workflow must:

1. normalize the idempotency key and request fingerprint;
2. load the active owned research profile and current consent state;
3. retrieve the order, line item, variant, fulfillments, cancellations,
   returns, and reversals from Medusa;
4. validate customer ownership without trusting request data;
5. evaluate marketplace exclusion and eligible fulfilled quantity;
6. resolve one valid published material-profile revision;
7. calculate normalized supply quantity with overflow protection;
8. return the existing exact activation when present;
9. create or reuse the customer's active tracked material for the variant;
10. create one research supply and one activation-evidence record atomically;
11. compensate every earlier private write if a later step fails; and
12. return the minimal private projection without changing commerce state.

Routes must not call module services for mutations. Workflow steps perform all
ownership and business validation. Built-in workflow steps and read-only
module links are used where applicable.

## Concurrency and idempotency

The workflow must remain correct when two requests activate the same line item
concurrently:

- at most one supply exists for the source line item;
- at most one activation-evidence record exists for the source line item;
- at most one active tracked material exists for the profile and variant;
- exact replays return the same result;
- conflicting key reuse returns `409`; and
- a uniqueness race is converted to the existing private projection rather
  than an internal error or duplicate write.

The workflow transaction identifier must be deterministic for the customer,
operation, and normalized idempotency key. Durable fingerprint evidence remains
authoritative for conflict detection.

## Commerce changes after activation

RT-4 never listens to order, return, refund, fulfillment, marketplace, or
inventory events to mutate private tracking data. A later cancellation or
return does not silently rewrite the immutable activation snapshot or supply.

The UI may show a neutral **source order changed** state after a fresh owned
order query, but any reconciliation or private adjustment requires a later
reviewed customer action. RT-4 does not invent that action.

## Storefront contract

The protected Research & Tracking account area adds **My Products & Supplies**.
It must:

- use Medusa SDK methods for built-in order resources;
- use `sdk.client.fetch` with plain bodies for custom RT-4 endpoints;
- avoid regular `fetch`, shared caches, and public cache tags;
- show loading, empty, unavailable, retry, ineligible, already-tracked, and
  success states without exposing internal errors;
- require an explicit review step before **Start tracking** submission;
- state that tracking is private organization and not proof of use;
- display active materials and separate supplies for repeat purchases;
- display remaining quantity without enabling deductions in RT-4;
- keep lot and batch controls optional and visually secondary;
- mark protocols, product documents, COA access, and calculator actions as
  unavailable until RT-7; and
- avoid creating routines or suggesting amounts, frequencies, routes, or
  outcomes.

An order history page may link to the activation review, but opening an order
or My Products & Supplies never activates an item automatically.

## Error behavior

| Condition                                               | Outcome                                     |
| ------------------------------------------------------- | ------------------------------------------- |
| No customer authentication                              | `401`                                       |
| RT feature or first-party channel allowlist unavailable | `503`                                       |
| No active/current-consent profile                       | `409` with renewal or activation required   |
| Missing or invalid idempotency key                      | `400`                                       |
| Malformed body or unknown fields                        | `400`                                       |
| Order, item, or ownership probe fails                   | non-disclosing `404`                        |
| Item is not yet eligible                                | `409` with an approved customer-safe reason |
| Material profile missing or ambiguous                   | `409` without guessed quantity              |
| Quantity invalid or overflows                           | `409`; no private writes                    |
| Exact activation replay                                 | same durable activation resource            |
| Conflicting idempotency-key reuse                       | `409`                                       |
| Unexpected internal failure                             | generic `500`; no private values logged     |

Cross-customer and missing-resource probes must be indistinguishable.

Candidate responses may expose only these stable ineligibility reason codes:

- `not_fulfilled`;
- `order_cancelled`;
- `returned_or_reversed`;
- `unsupported_order_source`;
- `material_profile_unavailable`;
- `quantity_unavailable`;
- `already_tracked`; and
- `archived_material_action_required`.

Unexpected internal inconsistencies use `quantity_unavailable` or
`material_profile_unavailable`; they never expose internal identifiers,
provider details, ownership probes, or arithmetic values.

## Acceptance criteria

| ID      | Scenario                                                       | Required outcome                                                            |
| ------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| RT4-001 | Customer views eligible fulfilled items                        | only owned eligible items appear                                            |
| RT4-002 | Customer views an unfulfilled item                             | no activation is offered                                                    |
| RT4-003 | Customer probes another customer's item                        | non-disclosing `404`; no write                                              |
| RT4-004 | Customer opens an eligible item                                | no tracking record is created                                               |
| RT4-005 | Customer confirms Start tracking                               | one material, supply, and activation record are committed                   |
| RT4-006 | Customer replays the same activation                           | same durable activation resource; no duplicate                              |
| RT4-007 | Same key is reused for another item                            | `409`; both records remain unchanged                                        |
| RT4-008 | Same variant is purchased again                                | material is reused; a separate supply is created                            |
| RT4-009 | Item is fully returned/reversed, or has a written-off quantity | activation is rejected                                                      |
| RT4-010 | Item is partially returned before activation                   | returned units are excluded; eligible remainder is normalized               |
| RT4-011 | Material profile is missing or ambiguous                       | activation is rejected without fallback                                     |
| RT4-012 | Quantity calculation overflows                                 | activation is rejected and compensated                                      |
| RT4-013 | Supply creation fails after new material creation              | material creation is compensated                                            |
| RT4-014 | Two concurrent activations race                                | one durable activation result exists                                        |
| RT4-015 | Product has no batch information                               | activation and UI remain usable                                             |
| RT4-016 | Customer views optional supply details                         | fields remain optional and read-only until RT-4B                            |
| RT4-017 | Return occurs after activation                                 | no silent private supply mutation occurs                                    |
| RT4-018 | Marketplace-imported item lacks verified link                  | item remains ineligible                                                     |
| RT4-019 | RT-4 workflow completes                                        | orders, fulfillment, inventory, payment, and marketplace data are unchanged |
| RT4-020 | Existing material for the variant is archived                  | `409` with `archived_material_action_required`; no reactivation             |

## Verification gates

Implementation requires separate authorization for each gate:

1. source-only model, contract, workflow, API, and storefront implementation;
2. migration generation for approved model additions;
3. review and commit of generated migration artifacts;
4. full migration and rollback rehearsal on a uniquely named disposable local
   PostgreSQL database;
5. database-backed authenticated HTTP ownership, replay, concurrency,
   compensation, and commerce-non-mutation tests;
6. lint, type checks, unit tests, storefront contract tests, and Medusa build;
7. source checkpoint commit and branch push; and
8. later production privacy, content, provider, Neon, deployment, and browser
   acceptance gates.

No gate authorizes the next one implicitly.

## Approved decision record

Contract review approves these RT-4 decisions:

1. Medusa 2.19.0 raw order-item detail quantities and the formula in
   **Order-item eligibility** are authoritative for RT-4.
2. Only explicitly configured first-party sales-channel IDs are eligible.
   Marketplace and unknown channels are denied by default.
3. RT-4 reuses one current published `calculator_material_profile` for
   quantity normalization without exposing RT-7 calculator behavior.
4. RT-4 adds a dedicated immutable `research_supply_activation` evidence model
   with the fields listed in **Required activation evidence**, a unique source
   order-line-item constraint, and a unique profile-plus-idempotency-key
   constraint. The existing preference-mutation model is not repurposed.
5. Candidate ineligibility responses use only the stable customer-safe codes in
   **Error behavior**. Ownership probes remain non-disclosing `404` responses.
6. Optional-field limits and expiry normalization follow the rules in
   **Update optional supply details**.
7. An archived tracked material is not silently restored. RT-4 returns `409`
   with `archived_material_action_required`; restoration requires a later
   customer-controlled contract.
8. `acquired_at` records the server activation time. The UI labels it **Added
   to tracking** and never calls it a delivery, acquisition, or use date.
9. Optional supply-detail mutation and editing are deferred to RT-4B. RT-4 core
   implements activation, listing, and read-only optional fields only.
10. Activation evidence is immutable through customer and Admin APIs. Optional
    details become customer-correctable only in RT-4B. RT-8 must include RT-4
    records in export and deletion processing before production activation.

Decision 10 does not approve a production retention duration or deletion
processor. Those remain explicit privacy and production gates. Until RT-8 is
approved and tested, RT-4 may be developed and tested only with synthetic data
under the separately authorized gates below; it cannot be activated for real
customers.

## Completion boundary

This planning gate is complete when this approved contract is separately
authorized for a local commit and checkpointed. RT-4 implementation remains
unauthorized until a later source-only implementation request.

RT-4 completion will not authorize RT-5 routines or deductions, RT-6 journal
or measurements, RT-7 protocols/documents/calculator, RT-8 privacy processing,
Neon migration, real customer data, deployment, or production activation.
