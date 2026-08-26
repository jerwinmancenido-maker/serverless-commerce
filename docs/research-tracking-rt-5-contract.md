# Research Tracking RT-5 Personal Routines Contract

Status: Approved documentation contract. RT-5 implementation, migration
generation, database access, testing, commit, push, deployment, and website
activation remain separately gated and are not authorized by this document.

## Purpose

RT-5 defines private, customer-authored personal routines and review-first
activity records for Research Tracking.

The slice lets an authenticated customer:

- organize an owned active tracked material into a private routine;
- view deterministic scheduled occurrences over a bounded date range;
- review a planned material quantity before recording activity;
- explicitly choose an eligible owned supply when confirming a record;
- revise, void, or restore a record through auditable compensating entries; and
- inspect their own routines and records without exposing them to Admin or
  support interfaces.

RT-5 is not a prescribing, treatment, adherence, coaching, or automated
inventory feature. It does not infer a routine from a purchase, protocol,
calculator, staff action, or product content.

## Authority and dependencies

This contract is subordinate to:

1. `docs/commerce-v1-spec.md` for product and commerce requirements;
2. `docs/architecture.md` for runtime boundaries;
3. `docs/research-tracking-rt-0-contract.md` for Research Tracking safety and
   privacy principles;
4. the RT-2 ownership and preference contract for authenticated customer
   isolation;
5. the reconciled RT-3 account navigation and empty-state checkpoint; and
6. `docs/research-tracking-rt-4-contract.md` for tracked materials, private
   supplies, activation evidence, quantity units, and supply balances.

The Medusa `researchTracking` module remains the only owner of private routine,
occurrence projection, activity record, mutation receipt, and supply-adjustment
data introduced by this slice.

The required architecture is:

```text
researchTracking module
  -> workflow and compensating workflow steps
  -> authenticated customer API routes
  -> Medusa JS SDK client
  -> private account UI
```

API routes must not call module mutation services directly. All mutations must
execute workflows with compensating behavior.

## Non-negotiable boundaries

RT-5 must not:

- create a routine automatically from an order, order item, product, protocol,
  calculator result, content page, staff action, or tracked-material activation;
- recommend or prefill a material quantity, frequency, route, injection site,
  therapeutic goal, outcome, adherence target, or treatment duration;
- describe a record as a dose, administration, treatment, prescription, medical
  protocol, or clinical instruction;
- classify a customer as adherent, missed, late, successful, improved, or
  non-compliant;
- alter Medusa orders, order items, products, variants, BOM components,
  warehouse inventory, payments, fulfillment, vouchers, or marketplace state;
- grant Admin, merchant-support, or staff access to private routines or records;
- persist future activity records merely because scheduled time passes;
- create a supply deduction without explicit customer confirmation; or
- treat a research-use-only label as resolving privacy, retention, export,
  deletion, consent, or legal obligations.

Permitted neutral customer-facing terms include:

- `planned material quantity`;
- `personal routine`;
- `scheduled research record`;
- `confirm record`;
- `tracked material`; and
- `private supply`.

## Data classification and minimization

All RT-5 routine and activity data is private customer data.

The minimum necessary fields are:

- owning customer identifier;
- referenced owned tracked-material identifier;
- customer-authored neutral label;
- planned material quantity and compatible unit;
- recurrence fields defined by this contract;
- timezone snapshot;
- immutable revision timestamps;
- confirmed quantity and selected owned supply for an activity record;
- mutation idempotency metadata; and
- append-only supply adjustment evidence.

RT-5 must not collect free-text health goals, symptoms, diagnoses, conditions,
medical history, clinical outcomes, injection locations, prescriber details, or
other health narrative.

Customer APIs must return `Cache-Control: private, no-store` on success and
error responses. Storefront queries must not use shared or public caching.

## Core records

### Research routine

`research_routine` is the stable identity and ownership envelope for a personal
routine.

Required behavior:

- owned by exactly one customer;
- references exactly one owned, active tracked material;
- has `active` or `archived` lifecycle state;
- records the effective archive boundary when archived;
- points to its current immutable revision;
- retains historical revisions after edit or archive; and
- cannot be transferred between customers or tracked materials.

Archiving is reversible. Deletion is deferred until the RT-8 privacy and data
completion contract defines deletion and retention behavior.

### Research routine revision

`research_routine_revision` is immutable and append-only.

Each revision snapshots:

- routine identifier;
- customer-authored neutral label;
- planned material quantity;
- compatible base unit;
- timezone;
- recurrence type and recurrence parameters;
- local scheduled time;
- start date;
- optional end date;
- effective-from local date;
- creation timestamp; and
- superseded revision reference when applicable.

Editing a routine creates a revision. Existing confirmed records retain their
original routine-revision and occurrence snapshots.

### Projected occurrence

An occurrence is a deterministic projection derived from one routine revision
for a requested local date range.

An occurrence is not persisted merely because time passes. It becomes durable
only when an explicit confirmed activity record references its snapshot.

Occurrence identity must be deterministic for the routine revision, local date,
and local time so repeated reads return the same logical occurrence.

### Research routine log

`research_routine_log` is the stable identity and ownership envelope for one
explicitly confirmed scheduled research record.

Its lifecycle state is:

- `confirmed`; or
- `voided`.

The stable record points to its current immutable revision. A record is never
silently overwritten.

### Research routine log revision

`research_routine_log_revision` is immutable and append-only.

Each revision snapshots:

- log identifier;
- owning customer identifier;
- routine identifier and routine-revision identifier;
- deterministic occurrence identity;
- local date, local time, and timezone;
- confirmed material quantity and compatible unit;
- selected owned supply identifier;
- operation type: `confirm`, `revise`, `void`, or `restore`;
- prior revision reference when applicable; and
- creation timestamp.

No clinical result, symptom, outcome, efficacy, or adherence field belongs in
this record.

### Research supply adjustment

`research_supply_adjustment` is an append-only ledger entry recording a signed
change to an RT-4 private supply balance.

Each adjustment records:

- owning customer identifier;
- supply identifier;
- log and log-revision identifiers;
- signed integer quantity in the supply base unit;
- operation type;
- idempotency mutation receipt identifier; and
- creation timestamp.

A confirmation deduction is negative. A void or revision compensation is
positive. A revised or restored confirmed quantity creates a new negative entry.

`research_supply.remaining_quantity_base_units` remains the current materialized
balance. The adjustment ledger is its audit trail and must reconcile exactly to
that balance.

### Durable mutation request

Every RT-5 mutation uses a durable request record containing:

- owning customer identifier;
- operation name;
- client-provided idempotency key;
- canonical request fingerprint;
- processing, completed, or failed state;
- stable result reference or safe error classification; and
- timestamps.

The unique scope is customer, operation, and idempotency key.

Durable records, transactional constraints, and database isolation protect
against duplicate and concurrent mutations. An in-memory mutex is not an
acceptable correctness boundary.

## Routine recurrence contract

RT-5 supports only these recurrence types:

1. `once`;
2. `daily`, with an interval from 1 through 30 days; and
3. `weekly`, with selected weekdays and an interval from 1 through 12 weeks.

Every revision requires:

- a local scheduled time;
- a start date;
- a timezone snapshot; and
- a valid planned material quantity and compatible unit.

An end date is optional but, when provided, cannot precede the start date.

A weekly routine must include at least one unique weekday. Weekday ordering is
canonicalized before fingerprinting and occurrence calculation.

Monthly recurrence, arbitrary cron expressions, RRULE input, reminder delivery,
push notifications, email notifications, and background occurrence persistence
are deferred.

## Timezone behavior

The routine revision snapshots the customer's current Research Tracking
timezone at creation.

A later profile-timezone change must not silently move an existing routine. The
customer must explicitly review and create a new routine revision to use another
timezone.

Occurrence calculation uses the timezone stored on the selected revision.
Daylight-saving behavior, where relevant, must use a named IANA timezone and a
documented deterministic disambiguation rule rather than a server-local offset.

## Occurrence projection

The customer occurrence endpoint accepts an inclusive local date range with a
maximum span of 31 calendar days.

Projection must:

- include only occurrences from customer-owned active routines;
- honor the revision start date and optional end date;
- use the revision timezone and local scheduled time;
- produce deterministic stable occurrence identities;
- exclude dates before the current revision takes effect;
- exclude future dates after a routine was archived; and
- identify whether a projected occurrence already has a customer-owned log.

The endpoint must reject an invalid or oversized range. It must never generate
unbounded future results.

## Routine creation and editing

Creating or editing a routine requires the customer to choose an owned active
tracked material and enter all schedule and quantity fields explicitly.

The workflow must validate:

- authenticated customer ownership;
- active Research Tracking profile and current consent gate;
- tracked material is active and not closed or deleted;
- quantity is a positive integer in a compatible RT-4 base unit;
- recurrence fields are internally valid; and
- timezone is a supported IANA timezone.

Creating, editing, archiving, or resuming a routine must not change any supply
balance.

Resuming creates a new revision with an explicit effective date. It does not
retroactively project occurrences during the archived interval.

## Review-first activity recording

The required customer flow is:

1. select a projected occurrence;
2. review the planned material quantity;
3. explicitly select one eligible owned private supply;
4. request a read-only preview;
5. inspect current and projected remaining balance plus the research-use notice;
6. submit confirmation with one stable idempotency key; and
7. receive the confirmed log and updated private supply balance.

The preview is a stateless, read-only projection. It is not authorization to
mutate later if ownership, eligibility, or balance changes.

Confirmation must revalidate all rules inside one database transaction and
produce exactly:

- one completed durable mutation request;
- one log identity when it is a new confirmation;
- one immutable log revision;
- one negative supply adjustment; and
- one matching materialized supply-balance update.

An insufficient balance returns conflict and creates none of those domain
records or adjustments.

## Eligible private supplies

A supply is eligible only when:

- it belongs to the authenticated customer;
- it belongs to the routine's tracked material;
- it is active, not deleted, and has a positive remaining balance;
- its unit matches the routine quantity unit;
- it has sufficient remaining balance at transaction time; and
- it remains valid under the current consent and privacy gates.

An optional RT-4 expiry date remains customer-entered informational metadata.
RT-5 does not infer that it blocks selection until a separate approved contract
defines authoritative expiry behavior.

The system must not choose a supply automatically. The customer explicitly
selects the supply during review.

## Revision, void, and restore

### Revise

Revising a confirmed record requires a fresh preview and idempotency key.

The workflow atomically:

1. restores the prior revision's deduction through a positive adjustment;
2. validates the newly selected supply and quantity;
3. creates the replacement immutable log revision;
4. applies the new negative adjustment; and
5. updates both affected materialized balances.

If any step fails, compensation restores the pre-workflow state.

### Void

Voiding a confirmed record creates a void revision and restores the active
deduction exactly once. Replaying the same request returns the same result and
does not restore twice.

### Restore

Restoring a voided record requires a fresh preview, explicit supply selection,
and enough current balance. It creates a restore revision and a new negative
adjustment. It does not reuse stale balance approval from the original record.

## Concurrency and idempotency

The following invariants are mandatory:

- an exact replay of a completed request returns the same stable result;
- the same key with a different canonical fingerprint returns conflict;
- concurrent confirmation requests cannot overspend one supply;
- concurrent requests for one deterministic occurrence cannot create duplicate
  active confirmations;
- a failure before completion cannot leave a partial adjustment or balance;
- workflow compensation cannot create a second restoration; and
- durable database state, not one Node.js process, is the authority.

Supply mutation requires transaction-safe balance validation and an atomic
conditional update or equivalent database constraint.

## Customer API contract

All endpoints are under:

```text
/store/customers/me/research-tracking
```

All endpoints require authenticated customer context. Mutation bodies are plain
JSON objects when called through the Medusa JS SDK.

### Routines

- `GET /routines` lists only the authenticated customer's routines.
- `POST /routines` creates a routine and its first revision.
- `POST /routines/:id` creates a reviewed replacement revision.
- `POST /routines/:id/archive` archives the routine.
- `POST /routines/:id/resume` resumes through a new explicit revision.

### Occurrences

- `GET /occurrences?from=YYYY-MM-DD&to=YYYY-MM-DD` returns a deterministic,
  bounded projection for active owned routines.

### Activity records

- `GET /logs` lists only the authenticated customer's records.
- `POST /logs/preview` previews a new confirmation without mutation.
- `POST /logs` confirms a reviewed activity record.
- `POST /logs/:id/preview` previews revision, void, or restore impact.
- `POST /logs/:id/revise` replaces the current confirmed revision.
- `POST /logs/:id/void` voids and compensates the current confirmation.
- `POST /logs/:id/restore` restores a voided record after fresh review.

All mutation routes require an idempotency key. Preview routes must not write a
domain record, mutation receipt, adjustment, or balance.

## Ownership and disclosure behavior

A missing identifier and an identifier owned by another customer both return
the same not-found response. No response may reveal whether another customer's
routine, occurrence, log, tracked material, or supply exists.

Ownership validation belongs in workflows and query constraints, not only in
route handlers or storefront controls.

Admin and staff routes for RT-5 private records are out of scope and must not be
added by implementation.

## Error behavior

| Condition | HTTP behavior | Mutation behavior |
| --- | --- | --- |
| Missing customer authentication | `401` | no writes |
| Missing or cross-owner record | `404` | no writes |
| Invalid request or recurrence | `400` | no writes |
| Closed profile or outdated consent | `403` | no writes |
| Archived or ineligible tracked material | `409` | no writes |
| Ineligible or insufficient private supply | `409` | no writes |
| Reused key with conflicting fingerprint | `409` | no writes |
| Concurrent balance or occurrence conflict | `409` | no partial writes |
| Unexpected workflow failure | safe `5xx` | fully compensated |

All responses, including errors, use private no-store cache headers.

## Storefront contract

RT-5 activates the existing `Today` and `Personal Routines` account previews.

### Today

The Today view presents a bounded, private occurrence projection and lets the
customer begin the review-first confirmation flow. It must distinguish:

- loading;
- empty schedule;
- scheduled and unconfirmed;
- confirmed;
- routine archived;
- consent or profile blocked;
- insufficient eligible supply; and
- retryable error.

It must not label an unconfirmed occurrence as missed or late.

### Personal Routines

The Personal Routines view lets the customer:

- list active and archived routines;
- create a routine through explicit neutral fields;
- review and revise a routine;
- archive or resume a routine; and
- inspect the next bounded projected occurrences.

The UI must not provide product-derived presets, suggested quantities,
protocol-to-routine actions, calculator-to-routine actions, adherence scores,
reminder promises, or medical claims.

### Data access

The storefront must:

- use the configured Medusa JS SDK for every custom API call;
- pass plain object bodies without manual JSON serialization;
- use hierarchical customer-scoped query keys;
- invalidate only affected private routine, occurrence, log, and supply queries;
- handle loading, pending, empty, blocked, conflict, and error states; and
- prevent shared or long-lived cache reuse.

## Commerce isolation

RT-5 routines and activity records are downstream private tracking data.

They must not modify or reserve:

- Medusa product or variant inventory;
- BOM raw-material inventory;
- order or order-item state;
- payment or manual-proof state;
- fulfillment or J&T state;
- voucher balances or eligibility;
- marketplace SKU mappings or inventory; or
- RT-4 activation evidence.

A private supply balance is not warehouse inventory and must never be synced to
a marketplace or used as sellable-stock authority.

## Acceptance criteria

- `RT5-001`: unauthenticated requests return `401` with no private disclosure.
- `RT5-002`: cross-customer identifiers are indistinguishable from missing
  identifiers and return `404`.
- `RT5-003`: all mutations require an active profile with current consent;
  closed profiles remain read-only under RT-2, and deletion-state reads follow
  the RT-2 privacy lifecycle without creating new RT-5 records.
- `RT5-004`: creating, revising, archiving, or resuming a routine does not
  mutate any supply balance.
- `RT5-005`: only the approved once, daily, and weekly recurrence forms are
  accepted.
- `RT5-006`: projected occurrence identities are deterministic across repeated
  reads of the same revision and range.
- `RT5-007`: occurrence queries reject a range longer than 31 calendar days.
- `RT5-008`: archived routines produce no future occurrences after their
  effective archive boundary.
- `RT5-009`: a preview is read-only and leaves no mutation or supply record.
- `RT5-010`: confirmation creates exactly one log revision, one deduction, and
  one matching balance change.
- `RT5-011`: insufficient balance returns conflict with no partial writes.
- `RT5-012`: exact idempotent replay returns the same result without another
  log, deduction, or balance update.
- `RT5-013`: one key with a conflicting request fingerprint returns conflict.
- `RT5-014`: concurrent confirmations cannot overspend a supply.
- `RT5-015`: concurrent confirmation of one occurrence cannot create duplicate
  active records.
- `RT5-016`: revision restores the prior deduction and applies the replacement
  atomically.
- `RT5-017`: void restores the active deduction exactly once.
- `RT5-018`: restore requires fresh review and sufficient current balance.
- `RT5-019`: injected workflow failure leaves no partial log, adjustment, or
  supply-balance mutation.
- `RT5-020`: success and error responses use private no-store cache headers.
- `RT5-021`: no Admin or support route exposes RT-5 private records.
- `RT5-022`: storefront calls use the Medusa JS SDK and customer-scoped cache
  invalidation.
- `RT5-023`: commerce, BOM, warehouse inventory, payment, fulfillment, voucher,
  and marketplace records remain unchanged through RT-5 tests.
- `RT5-024`: disposable test data and the disposable database are removed after
  authorized integration verification.

## Verification gates

Each item requires separate authorization where it changes state:

1. review this documentation contract;
2. locally commit the documentation contract;
3. push the documentation branch;
4. create an RT-5 source-only implementation branch;
5. implement module models, workflows, APIs, and storefront source;
6. formally review source changes;
7. create a local source commit;
8. generate migrations without applying them;
9. review and separately commit migration artifacts;
10. rehearse the complete RT-1 through RT-5 chain against a newly created
    disposable local PostgreSQL database;
11. execute dedicated authenticated, ownership, idempotency, concurrency,
    compensation, cache, and commerce-isolation HTTP integration tests;
12. push the completed implementation branch;
13. separately evaluate Neon migration readiness; and
14. separately authorize deployment and website activation.

Passing source checks is not database proof. Disposable local database evidence
is not Neon, deployment, or production evidence.

## Approved decision record

The following decisions are approved for the RT-5 contract:

1. Personal routines are private and customer-authored only.
2. Routine creation is never inferred from a purchase, content, protocol,
   calculator, or staff action.
3. Routine labels and quantities use neutral research-tracking language.
4. A routine references an owned active tracked material, not an order.
5. The customer explicitly selects an eligible private supply at confirmation.
6. Occurrences are deterministic projections, not pre-created future records.
7. RT-5 recurrence is limited to once, daily interval, and weekly interval.
8. Routine timezone is snapshotted per revision and changes only through explicit
   review.
9. Activity recording is preview-first and transactionally revalidated.
10. Revisions, voids, and restores use immutable revisions and append-only
    compensating supply adjustments.
11. Durable idempotency and database concurrency controls are mandatory.
12. Admin and support access to private routines and logs is excluded.
13. The existing Today and Personal Routines account areas are the only RT-5
    storefront surfaces.
14. Commerce, BOM, warehouse, payment, fulfillment, voucher, and marketplace
    records remain outside the RT-5 mutation boundary.

## Deferred work

- Standalone manual private-supply corrections are deferred to RT-5B.
- Journal and approved measurements are deferred to RT-6.
- Protocol content, product documents, and a non-persistent calculator are
  deferred to RT-7.
- Export, deletion, retention completion, audit access, rate limiting, and final
  browser privacy verification are deferred to RT-8.
- Monthly or arbitrary recurrence, reminders, notifications, and background
  occurrence creation require a future contract.

## Unresolved production gates

Before production activation, the project must separately resolve and verify:

- privacy notice and consent language for routine and activity data;
- retention, deletion, account closure, and export behavior;
- legal review of research-only terminology and prohibited health claims;
- production rate limits and abuse controls;
- production observability that excludes private field values;
- encryption, access control, backup, and incident-response expectations;
- regional timezone and date-boundary behavior;
- production concurrency behavior across multiple application instances;
- Neon migration rehearsal and rollback planning;
- real customer-data prohibition during pre-production tests; and
- credential-backed storefront, backend, and browser verification.

These gates remain unresolved even if local source, migration, and disposable
database tests pass.

## Completion boundary

Creating this contract branch and file records approved RT-5 decisions only.

It does not authorize:

- RT-5 model, workflow, API, or storefront implementation;
- migration generation or application;
- local or remote database access;
- tests, build, or website startup;
- commit or push;
- Neon access;
- deployment; or
- website activation.
