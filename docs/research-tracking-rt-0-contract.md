# Research Tracking RT-0 Contract

Status: documentation baseline for review. No module, workflow, API, Admin UI,
storefront UI, migration, seed, database mutation, deployment, or provider
activation is authorized by this document.

## Purpose

RT-0 defines how authenticated customers may eventually organize purchased
research materials, supplies, research schedules, measurements, journal
entries, product documents, and calculations without changing Medusa's
commerce ownership or presenting research material as a medicine.

The feature name is **Research & Tracking**. The storefront must not label the
area **Health & Tracking** until a separate privacy, regulatory, and product
review explicitly approves collecting and presenting health information.

## Non-negotiable boundaries

- Medusa remains the source of truth for customers, products, variants, orders,
  order items, payments, fulfillment, returns, and refunds.
- Purchasing a product does not establish that the customer used it, intends to
  use it, or follows any routine.
- A customer must explicitly choose **Start tracking** before a purchased order
  item creates a private tracking record.
- Product protocols are research-reference content. They must not prescribe,
  recommend, optimize, or personalize human administration, dosing,
  reconstitution, injection, treatment, or outcomes.
- Personal routines are customer-authored organizational records. Store content
  must not automatically create or alter them.
- Calculators perform transparent unit and quantity arithmetic only. They must
  not recommend an amount, frequency, route, body site, treatment, or outcome.
- Lot and batch identifiers are optional. The UI must not imply that an
  SKU-level document is a batch-specific certificate.
- Private tracking records must not be placed in Medusa customer metadata,
  product metadata, order metadata, analytics events, logs, or support notes.
- No marketplace receives Research & Tracking data.

## Account information architecture

```text
Account
├── Overview
├── Profile
├── Addresses
├── Orders
└── Research & Tracking
    ├── Today
    ├── Measurements
    ├── My Products & Supplies
    ├── Personal Routines
    ├── Journal
    ├── Research Protocols
    ├── Calculator
    └── Privacy & Data
```

The account shell may show this navigation only after RT storefront activation.
RT-0 does not add placeholder routes to the production account interface.

## Domain separation

Two future custom Medusa modules are required.

### `researchContent`

Merchant-authored, product-facing content:

- versioned research protocols;
- product or variant links;
- calculator material profiles with verified units and quantities;
- document references, evidence scope, and publication state; and
- revision and publication audit records.

Only published content may appear in the storefront. Draft or withdrawn
content remains unavailable to customers. Product and variant records remain
owned by Medusa's Product Module; module links associate them with content.

### `researchTracking`

Private customer-owned records:

- research profile and timezone preferences;
- tracked materials;
- supplies and remaining quantities;
- customer-created routines;
- scheduled occurrences and confirmed logs;
- supply adjustments and log revisions;
- measurement entries;
- journal entries; and
- consent, export, and deletion-request records.

The module name is camel case because it will be a Medusa container key. All
mutations must run through workflows. API routes must never call the module
service directly.

## Conceptual records

RT-0 defines concepts, not a final migration schema.

### Research profile

- One profile per authenticated Medusa customer.
- Stores timezone, locale, consent version, consent timestamp, and privacy
  preferences.
- Does not duplicate the customer's name, email, phone, or addresses.

### Tracked material

- Belongs to one research profile.
- May link to a Medusa product variant and source order item.
- May instead be a customer-created material with no store product link.
- Stores a customer-facing label and active or archived state.
- Does not copy product claims or mutable catalog descriptions.

### Supply

- Belongs to one tracked material.
- Stores an initial quantity, remaining quantity, normalized unit, acquisition
  date, and active, depleted, or archived state.
- May contain optional lot or batch text, expiry date, and customer storage
  note.
- A reorder creates a separate supply. It must not silently increase an older
  supply.
- Commerce inventory and customer supply are different domains: changing one
  must never change the other.

### Personal routine

- Belongs to one customer and tracked material.
- Stores a customer-defined label, quantity, unit, timezone, recurrence, start
  date, and active or archived state.
- It must not be described as a prescription, treatment plan, medical protocol,
  or store recommendation.
- Human-administration fields such as injection site, route, diagnosis, symptom,
  or therapeutic goal are outside RT-0.

### Occurrence and log

- Scheduled occurrences are derived from a routine and timezone.
- A log is written only after an explicit review and confirmation step.
- Every mutation uses an idempotency identifier so retries cannot create
  duplicate logs or duplicate supply deductions.
- Editing a confirmed log creates a revision and an offsetting supply
  adjustment; it does not rewrite history silently.
- Deleting a log is represented as a reversible status transition with an
  adjustment that restores any linked supply quantity.

### Measurement and journal entry

- Entries are optional, customer-created, timestamped, and customer-owned.
- Measurement types and units must use an explicit allowlist before
  implementation; arbitrary executable formulas are prohibited.
- The platform does not interpret entries, score health, detect conditions, or
  provide alerts or recommendations.
- Measurements remain deferred until privacy classification, retention, export,
  and deletion behavior pass review.

### Calculator session

- Calculator input and output are not persisted by default.
- A published `researchContent` material profile may prefill verified product
  strength, net content, and compatible units.
- Every input remains visible and editable before calculation.
- Results show the formula, inputs, normalized units, output, rounding rule,
  and a research-use-only notice.
- A result never creates a routine, log, cart, order, or supply adjustment.

## Purchased-product connection

The storefront retrieves the authenticated customer's Medusa orders and
eligible fulfilled order items. For each item, it may offer **Start tracking**.

The activation workflow must:

1. authenticate the customer;
2. verify that the order belongs to that customer;
3. verify that the order item and variant exist and are eligible;
4. reject cancelled, returned, or otherwise ineligible quantities;
5. create or retrieve an idempotent tracked-material activation for that exact
   customer and order item;
6. create a separate supply using an immutable order-item snapshot; and
7. return the private tracking record without changing the order or commerce
   inventory.

An order can supply catalog identity and quantity. It cannot prefill a personal
routine, measurement, journal entry, or claim of use. Marketplace-imported
orders remain excluded until customer ownership is established through a
separate verified account-linking workflow.

## Protocol and document behavior

- Protocols are versioned and linked to a product or variant through module
  links.
- Customers may see the current published version and its effective date.
- Material changes require a new revision; existing historical records keep
  the revision that was viewed or acknowledged.
- Protocol content must identify whether supporting documents are SKU-level,
  formulation-level, or batch-specific.
- COA and product-document access must not invent a lot or batch relationship.
- Withdrawing content hides it from new access without rewriting customer logs.
- Viewing a protocol does not create or update a personal routine.

## Authentication and ownership

Customer endpoints must live beneath
`/store/customers/me/research-tracking/*`, use authenticated request types, and
derive the customer ID from Medusa authentication context. Client-supplied
customer IDs are never trusted.

Every workflow validates record ownership. Identifier knowledge alone must not
allow one customer to retrieve or mutate another customer's records.

Administrative access to private tracking data is denied by default. Any later
support-access capability requires a separately approved role, a stated reason,
least-privilege fields, immutable audit records, and customer-facing disclosure.
Published `researchContent` administration is a different permission from
private `researchTracking` access.

## Storefront integration

- Built-in Medusa resources use existing Medusa JS SDK methods.
- Custom RT endpoints use `sdk.client.fetch` with plain object bodies.
- The storefront handles loading, empty, permission, unavailable, and retry
  states without exposing internal errors.
- Customer data is not placed in public caches or shared Next.js cache tags.
- Mutations invalidate only the authenticated customer's related query keys.
- The UI distinguishes draft, review, confirmed, revised, and deleted states.

## Privacy and data lifecycle gates

Before storing any customer tracking data, implementation requires an approved
data classification and privacy notice covering purpose, fields, retention,
access, export, correction, and deletion.

Required controls include:

- explicit opt-in with a versioned consent record;
- data minimization and field-level validation;
- encryption in transit and managed encryption at rest;
- no secrets or private values in application logs;
- customer export in a documented portable format;
- customer deletion and account-closure workflows;
- documented retention for revisions, audit records, backups, and failed
  exports;
- rate limits and abuse controls for customer mutations; and
- separation from advertising, marketplace, and behavioral-analytics data.

RT-0 does not claim compliance with any specific law or standard. Legal and
privacy review is an activation gate.

## Peptide Companion reference boundary

The folder
`/Users/m5/Projects/peptide-companion-icloud-conflicts-20260715` contains
incomplete iCloud-conflict copies and is not runtime or source authority.

Reusable behavioral ideas are limited to:

- review before saving;
- timezone-aware occurrences;
- idempotent mutation identifiers;
- inventory preview before confirmation;
- append-only revisions with compensating adjustments; and
- clear insufficient-inventory and retry states.

Its code, schemas, human-administration fields, medical language, and local
storage design must not be copied into the commerce runtime.

## Brand ownership

**Research Compounds** owns this commerce storefront and the future Research &
Tracking area. Legacy brand names and taglines are not part of its public
identity. Protocols, product documents, claims, customer records, and analytics
must not cross into a different brand context by accident.

## Acceptance criteria

| ID     | Scenario                                     | Required outcome                                                    |
| ------ | -------------------------------------------- | ------------------------------------------------------------------- |
| RT-001 | Customer purchases an eligible variant       | No tracking record is created automatically                         |
| RT-002 | Customer starts tracking an owned order item | One idempotent tracked material and separate supply are created     |
| RT-003 | Customer submits another customer's order ID | Request is rejected without revealing record existence              |
| RT-004 | Customer creates a routine                   | It is labeled customer-created and contains no store recommendation |
| RT-005 | Customer reviews then confirms a log         | One log and one matching supply adjustment are committed            |
| RT-006 | Customer retries the same confirmation       | Existing result is returned without another deduction               |
| RT-007 | Customer revises or deletes a log            | Revision history and compensating adjustment remain auditable       |
| RT-008 | Customer opens a calculator from a purchase  | Verified material values may prefill; no routine or log is created  |
| RT-009 | Product protocol is revised                  | New content is versioned; historical references are preserved       |
| RT-010 | Product has no batch information             | UI remains usable and makes no batch-specific claim                 |
| RT-011 | Customer requests an export                  | Only that customer's documented portable dataset is produced        |
| RT-012 | Customer requests deletion                   | Approved lifecycle workflow handles active data, audit, and backups |
| RT-013 | Admin lacks private-data permission          | Customer tracking data remains inaccessible                         |
| RT-014 | Marketplace connector processes an order     | No tracking, routine, journal, or measurement data is transmitted   |
| RT-015 | Measurement interpretation is requested      | Platform provides no diagnosis, score, recommendation, or alert     |

## Delivery slices

1. **RT-0 — current branch:** approve this contract, brand ownership, privacy
   classification, information architecture, conceptual records, and gates.
2. **RT-1:** create the source-only `researchContent` and `researchTracking`
   module foundations, links, unit contracts, and generated migrations without
   applying them.
3. **RT-2:** implement authenticated ownership workflows and customer APIs,
   then test against a disposable PostgreSQL database only after explicit
   authorization.
4. **RT-3:** add the account navigation and empty-state Research & Tracking
   pages using the Medusa SDK.
5. **RT-4:** add purchased-order-item activation and My Products & Supplies.
6. **RT-5:** add customer routines, occurrences, review-first logs, revisions,
   and customer-supply adjustments.
7. **RT-6:** add the journal and only the measurement fields approved by the
   privacy review.
8. **RT-7:** add versioned research protocols, product documents, and the
   non-persistent transparent calculator.
9. **RT-8:** complete export, correction, deletion, access audit, rate-limit,
   and browser acceptance tests before any production activation.

Each slice requires its own review and checkpoint. Migration generation does
not authorize migration application. Disposable database tests, Neon changes,
deployment, content publication, and private-data activation remain separate
explicit actions.
