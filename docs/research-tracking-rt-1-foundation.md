# Research Tracking RT-1 Module Foundation

Status: source-only module foundation. Migrations were generated and verified
on an isolated disposable local PostgreSQL database on 2026-08-25. The database
was removed after verification. The migrations have not been applied to Neon or
any persistent project database.

## Scope

RT-1 registers two camel-case Medusa modules:

- `researchContent` for versioned merchant-authored protocols and calculator
  material profiles; and
- `researchTracking` for private customer profiles, tracked materials, and
  supplies.

RT-1 adds no workflows, API routes, Admin pages, storefront pages, routine or
log tables, measurement or journal tables, customer data, published content,
or calculator behavior.

## `researchContent` foundation

### Research protocol

Each record is one protocol revision. The source stores a stable protocol key,
revision, Medusa product-variant identifier, title, optional summary, structured
content, publication status, evidence scope, lifecycle timestamps, and optional
actor identifier.

The unique protocol-key and revision index prevents revision replacement. A
read-only module link exposes the Medusa product variant without transferring
product ownership to the custom module.

### Calculator material profile

Each record is one material-profile revision. It stores a stable profile key,
revision, product-variant identifier, positive integer base quantity, base unit,
display conversion, display precision, publication status, evidence scope,
lifecycle timestamps, and optional actor identifier.

The allowed base units are `microgram`, `microliter`, and `piece`. The source
contract rejects zero, negative, fractional, unsupported, and quantities above
PostgreSQL's signed-integer limit of `2,147,483,647` base units. RT-1 does not
calculate or persist calculator results.

## `researchTracking` foundation

### Research profile

One profile may link to one authenticated Medusa customer. It stores only the
customer identifier, timezone, locale, consent version and timestamp, and
lifecycle status. It does not duplicate customer contact or address data.

### Tracked material

A tracked material belongs to one research profile and may reference a Medusa
product variant. Purchased and manually created sources are distinguished. A
profile can have at most one active lineage per linked variant in this
foundation; later workflows must enforce lifecycle behavior.

### Research supply

A supply belongs to one tracked material and may reference one Medusa order
line item. It stores initial and remaining positive integer base-unit
quantities, acquisition time, optional lot, batch, expiry, and storage notes,
and lifecycle status. Lot and batch remain optional.

The order-line-item identifier is unique when present so replaying purchased
item activation cannot create a second supply. RT-1 does not implement that
activation workflow or change Medusa commerce inventory.

## Module links

The source defines one read-only link per file:

- research protocol to product variant;
- calculator material profile to product variant;
- research profile to customer;
- tracked material to product variant; and
- research supply to order line item.

These links expose canonical Medusa records to queries while custom models keep
only their external identifiers. Medusa link synchronization completed without
error in the disposable-database verification. The read-only RT-1 links did not
require dedicated join tables.

## Deferred behavior

RT-2 must add authenticated ownership workflows and Store API routes before any
customer data is written. RT-4 adds purchased-order-item activation. RT-5 adds
routines, occurrences, logs, revisions, and supply adjustments. Measurements
and journals remain deferred to RT-6 and the RT-0 privacy gate.

## Verification gates

- Source models, services, module registration, links, and contracts must pass
  lint, type checks, unit tests, and Medusa build.
- Generated module migrations were applied twice to an isolated disposable
  database: the first run succeeded and the second reported both modules as up
  to date.
- The five RT-1 tables, indexes, enum checks, internal foreign keys, uniqueness
  constraints, link synchronization, transactional constraint behavior, and
  generated down paths were verified before the database was removed.
- Neon, deployment, private-data collection, and content publication remain
  separate explicit actions.
