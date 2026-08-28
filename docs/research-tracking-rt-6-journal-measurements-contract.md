# Research Tracking RT-6 Journal and Measurements Contract

Status: approved documentation contract. This file does not authorize
RT-6 implementation, migration generation or application, database access,
testing, commit, push, deployment, or customer-data activation.

## Purpose

RT-6 defines how an authenticated customer may eventually create private
journal entries and a narrowly approved set of numeric measurement entries
inside **Research & Tracking**.

RT-6 is an organizational record feature. It is not a medical record, patient
portal, treatment diary, prescription system, clinical decision-support tool,
adverse-event system, or diagnostic product. The platform must not interpret,
score, recommend, optimize, or alert on customer entries.

## RT-5 closure and dependency

RT-5 Personal Routines is remotely checkpointed at implementation commit
`be8fbdf3b9fa90602a148bc678ab077a23baf7af` on
`feat/rt-5-personal-routines`.

RT-6 starts from that checkpoint and must preserve all RT-0 through RT-5
ownership, consent, caching, idempotency, concurrency, supply-ledger, and
commerce-isolation guarantees.

RT-6 may relate a customer entry to an existing owned tracked material,
routine, occurrence log, or supply only when the customer explicitly selects
that relation. No purchase, activation, routine, or log creates an RT-6 record
automatically.

## Governing project boundaries

- `docs/research-tracking-rt-0-contract.md` remains authoritative for the
  **Research & Tracking** name, domain separation, research-only language,
  privacy gates, and prohibited human-administration fields.
- `docs/research-tracking-rt-2-contract.md` remains authoritative for customer
  authentication, ownership, private caching, lifecycle, and error behavior.
- `docs/research-tracking-rt-5-contract.md` remains authoritative for personal
  routines, projected occurrences, confirmed logs, and customer-supply
  adjustments.
- Medusa remains the source of truth for customers, products, orders, payments,
  fulfillment, inventory, returns, and refunds.
- RT-6 records belong only to the `researchTracking` module. They must not be
  stored in Medusa customer, product, order, line-item, or analytics metadata.
- RT-6 must not add an Admin or support interface for private entries.
- RT-6 must not send private data to marketplaces, advertising systems,
  customer-support notes, product analytics, or behavioral analytics.

## Privacy classification

Journal and measurement entries are classified as **sensitive private customer
data** for the entire RT-6 lifecycle, even when a particular entry appears
innocuous. Free text can contain unexpected sensitive information, and numeric
measurements can become health information when connected to an identifiable
customer.

Philippine Republic Act No. 10173 identifies information about an individual's
health as sensitive personal information. Its general principles require a
declared purpose, lawful and fair processing, proportional collection,
appropriate accuracy, limited retention, and appropriate safeguards.

References for privacy and legal review:

- [Republic Act No. 10173 - Data Privacy Act of 2012](https://privacy.gov.ph/data-privacy-act/)
- [Implementing Rules and Regulations of the Data Privacy Act](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/)
- [National Privacy Commission - Five Pillars of Compliance](https://privacy.gov.ph/5-pillars-of-compliance-2/)

These references establish planning gates only. This contract is not legal
advice and does not claim compliance.

## Product decisions

The following decisions are approved:

1. The public account label remains **Research & Tracking**, not Health Profile,
   Patient Profile, Treatment Tracking, or Medical Journal.
2. Journal and measurement records are optional and customer-created only.
3. A separate versioned RT-6 sensitive-data consent is required before the
   first RT-6 mutation.
4. Existing profile consent alone does not silently authorize RT-6 collection.
5. Journal entries are classified as sensitive in full; content is not parsed
   to determine whether stronger protection applies.
6. Measurements use a server-controlled type and unit allowlist. Free-form
   measurement types and units are prohibited.
7. No concrete measurement type is approved by this contract. The allowlist must
   pass a privacy-impact and legal review before measurement source work begins.
8. RT-6 stores observations without medical interpretation, scoring, ranges,
   targets, trends, correlations, recommendations, or alerts.
9. Customer-selected relations to materials, routines, logs, or supplies record
   organization only. They do not establish use, causation, efficacy, safety,
   administration, or outcome.
10. Journal and measurement changes use immutable revisions and explicit void
    and restore operations.
11. RT-6 never changes a customer-supply balance or any Medusa commerce record.
12. Admin and support access to private RT-6 entries is excluded.
13. Attachments, photos, files, imports, device synchronization, and third-party
    health integrations are excluded.
14. RT-8 remains responsible for final export, retention, deletion, audit, rate
    limiting, and browser privacy acceptance before production activation.

## Consent and availability states

RT-6 has its own server-owned activation configuration:

- `enabled`;
- active consent version;
- privacy notice URL;
- SHA-256 digest of the approved notice;
- approved measurement allowlist version; and
- activation effective timestamp.

The storefront receives only public configuration values required to display
the notice and availability state. It never receives the notice digest or
internal policy controls.

An RT-6 mutation requires all of the following:

- authenticated Medusa customer;
- active Research & Tracking profile;
- current general Research & Tracking consent;
- current purpose-specific RT-6 consent;
- complete server-owned activation configuration; and
- for measurements, an approved active measurement allowlist.

Closed profiles, deletion-requested profiles, withdrawn RT-6 consent, and
outdated general or RT-6 consent remain readable to the owning customer but are
read-only. Export, closure, and deletion-request controls remain available
through their separately governed privacy workflows.

Unexpected authentication, configuration, database, or provider failures must
show a neutral unavailable state. The storefront must not claim that records do
or do not exist when retrieval failed.

## Journal contract

### Allowed fields

A journal entry revision contains only:

- customer-selected local date and local time;
- snapshotted timezone;
- optional title, maximum 120 Unicode characters;
- note body, maximum 4,000 Unicode characters;
- optional owned tracked-material ID;
- optional owned supply ID;
- optional owned routine ID;
- optional owned confirmed-log ID; and
- immutable creation timestamp.

At least one non-whitespace note character is required. HTML, Markdown
execution, embedded scripts, remote images, and arbitrary structured payloads
are prohibited. Rendering must treat customer text as plain text.

The system may display a brief reminder not to enter third-party personal data,
diagnoses, prescriptions, contact details, government identifiers, or emergency
information. That reminder does not lower the entry's sensitive classification.

### Journal behavior

- Create requires an explicit review step and confirmation.
- Edit creates a new immutable revision and updates the entry's current revision
  pointer atomically.
- Void hides the entry from the default timeline without erasing revision
  history.
- Restore requires review and creates an auditable state transition.
- Exact idempotent replay returns the original result.
- Reusing one idempotency key with a different fingerprint returns conflict.
- Concurrent edits to one expected revision permit at most one winner.
- The customer can request correction or deletion through the RT privacy
  lifecycle; final erasure behavior remains blocked on RT-8 policy approval.

## Measurement contract

### Approval boundary

This contract approves the measurement architecture but approves **zero concrete
measurement types**.

The measurement feature remains unavailable until a separately reviewed
allowlist records, for each type:

- stable type key;
- customer-facing neutral label;
- declared collection purpose;
- privacy classification;
- allowed canonical unit;
- accepted input units and exact conversions;
- minimum and maximum storage bounds used only for data-quality validation;
- numeric precision and rounding rule;
- retention classification;
- export representation; and
- legal and privacy approval reference.

Bounds must not be described as healthy, unhealthy, safe, unsafe, normal,
abnormal, therapeutic, effective, or diagnostic.

### Candidate disposition for later review

| Candidate field                                 | Draft disposition             | Reason                                                |
| ----------------------------------------------- | ----------------------------- | ----------------------------------------------------- |
| Body mass                                       | Hold for privacy/legal review | Identifiable health-related information               |
| Body circumference or dimensions                | Hold for privacy/legal review | Potentially sensitive bodily information              |
| Temperature                                     | Excluded from initial RT-6    | Clinical interpretation risk                          |
| Heart rate                                      | Excluded from initial RT-6    | Clinical interpretation risk                          |
| Blood pressure                                  | Excluded from initial RT-6    | Clinical interpretation risk                          |
| Blood glucose                                   | Excluded from initial RT-6    | Clinical and diagnostic interpretation risk           |
| Laboratory or biomarker result                  | Prohibited in RT-6            | Requires a separately governed clinical-data contract |
| Symptom, diagnosis, condition, or adverse event | Prohibited structured field   | Outside research-only commerce scope                  |
| Administration route or body site               | Prohibited                    | Outside RT-0 boundary                                 |
| Arbitrary custom numeric type                   | Prohibited                    | Defeats minimization and allowlist controls           |

### Measurement record behavior

When and only when a type becomes approved, a measurement revision contains:

- allowlisted measurement type and allowlist version;
- decimal value represented without binary floating-point ambiguity;
- canonical unit;
- customer-selected local date and time;
- snapshotted timezone;
- optional owned tracked-material ID;
- optional owned supply ID;
- optional owned routine ID;
- optional owned confirmed-log ID; and
- immutable creation timestamp.

No free-text note belongs on a measurement. A customer may create a separate
journal entry and explicitly relate it if journal collection is active.

Create, revise, void, restore, idempotency, concurrency, and ownership behavior
matches the journal contract. A measurement never triggers a notification,
recommendation, supply adjustment, routine mutation, cart action, or support
workflow.

## Conceptual module records

RT-6 proposes these concepts in the existing `researchTracking` module. Names
are conceptual until source implementation is separately authorized.

### `ResearchJournalEntry`

- profile ID;
- status: `active` or `voided`;
- current revision ID;
- created, updated, voided, and restored timestamps; and
- soft-deletion fields supplied by the Medusa data-model layer.

### `ResearchJournalEntryRevision`

- journal entry ID;
- revision sequence;
- recorded local date and time;
- timezone;
- title and plain-text body;
- optional owned relation identifiers;
- prior revision ID; and
- immutable created timestamp.

### `ResearchMeasurement`

- profile ID;
- status: `active` or `voided`;
- current revision ID;
- created, updated, voided, and restored timestamps; and
- soft-deletion fields supplied by the Medusa data-model layer.

### `ResearchMeasurementRevision`

- measurement ID;
- revision sequence;
- allowlist type and version;
- exact decimal value and canonical unit;
- recorded local date and time;
- timezone;
- optional owned relation identifiers;
- prior revision ID; and
- immutable created timestamp.

### RT-6 consent event

- profile ID;
- consent scope: `journal` and, separately, `measurements`;
- notice version and SHA-256 digest;
- accepted or withdrawn state;
- effective timestamp; and
- immutable created timestamp.

### Mutation records

Journal and measurement mutations use their own durable idempotency records,
not RT-5 routine mutation records. Each mutation stores:

- profile ID;
- operation;
- idempotency key;
- request fingerprint SHA-256;
- pending, completed, or failed state;
- target record and revision IDs when completed;
- stable response projection for exact replay;
- neutral failure code without private field values; and
- timestamps.

Database uniqueness must enforce one mutation identity per profile, operation,
and idempotency key.

## Transaction and concurrency invariants

- Every mutation runs through a Medusa workflow.
- API routes never call the module service directly for a mutation.
- Ownership and consent are revalidated inside workflow steps.
- Entry, revision, current-revision pointer, state transition, and mutation
  completion commit atomically.
- A failed workflow leaves no partial entry, revision, state transition, or
  completed mutation.
- Concurrent mutation of one expected revision permits at most one winner.
- Exact replay remains durable across processes and deployments.
- In-memory mutexes are not a correctness boundary.
- No RT-6 transaction writes to RT-5 supply, routine, occurrence, or log tables.
- No RT-6 transaction writes to Medusa commerce, BOM, payment, fulfillment,
  voucher, or marketplace tables.

## Authentication and ownership

All endpoints live beneath
`/store/customers/me/research-tracking/*`, use Medusa customer authentication,
and derive customer identity only from the authentication context.

Every read and mutation resolves the customer's active or readable profile and
filters records by that profile. Cross-customer identifiers return the same
not-found response as nonexistent identifiers.

Optional related material, routine, log, and supply identifiers must belong to
the same profile. Identifier knowledge alone never establishes access.

Admin, support, seller, marketplace, and anonymous callers cannot read or
mutate RT-6 entries.

## Proposed Store API

The endpoint names are approved for future source planning:

### Journal

- `GET /store/customers/me/research-tracking/journal`
- `POST /store/customers/me/research-tracking/journal`
- `GET /store/customers/me/research-tracking/journal/:id`
- `POST /store/customers/me/research-tracking/journal/:id/revise`
- `POST /store/customers/me/research-tracking/journal/:id/void`
- `POST /store/customers/me/research-tracking/journal/:id/restore`

### Measurements

- `GET /store/customers/me/research-tracking/measurements`
- `POST /store/customers/me/research-tracking/measurements`
- `GET /store/customers/me/research-tracking/measurements/configuration`
- `GET /store/customers/me/research-tracking/measurements/:id`
- `POST /store/customers/me/research-tracking/measurements/:id/revise`
- `POST /store/customers/me/research-tracking/measurements/:id/void`
- `POST /store/customers/me/research-tracking/measurements/:id/restore`

### Consent

- `GET /store/customers/me/research-tracking/private-records/configuration`
- `POST /store/customers/me/research-tracking/private-records/consents`

Mutations require a validated `Idempotency-Key` header and plain-object request
bodies. Only GET and POST are used. Journal list queries use bounded offset
pagination in the development implementation. Cursor pagination remains a
production-readiness decision and must be resolved before activation. All
success and error responses use
`Cache-Control: private, no-store`.

## Error contract

| Condition                                                  | HTTP status | Write behavior                    |
| ---------------------------------------------------------- | ----------- | --------------------------------- |
| Missing or invalid customer authentication                 | `401`       | No write                          |
| Missing or cross-customer record                           | `404`       | No write                          |
| Invalid body, date range, type, unit, or value             | `400`       | No write                          |
| Closed profile, outdated consent, or disabled RT-6 scope   | `403`       | No write                          |
| Conflicting idempotency key, revision, or state transition | `409`       | No partial write                  |
| Required server configuration is unavailable               | `503`       | No write; neutral message         |
| Unexpected internal failure                                | `500`       | No partial write; neutral message |

Validation responses must not echo journal text or other sensitive values.
Application logs and observability fields must contain identifiers and stable
codes only, never customer text or measurement values.

## Storefront contract

RT-6 activates the existing **Journal** and **Measurements** areas only when the
relevant server-owned scope is available.

### Journal experience

The customer can:

- view a newest-first private timeline;
- create a draft in the browser;
- review the complete local date, time, title, note, and selected relations;
- explicitly confirm the save;
- revise an existing entry without replacing history;
- void and restore with confirmation; and
- see read-only records when profile or consent state prevents mutation.

Customer text is rendered as plain text. Search indexing, server-side full-text
search, sentiment analysis, summarization, AI analysis, and recommendations are
excluded.

### Measurements experience

Until the allowlist is approved, Measurements shows an honest unavailable state
and collects nothing.

After a separately authorized allowlist is active, the customer can:

- select only an approved measurement type;
- see its required canonical unit and input constraints;
- enter a value and local timestamp;
- review normalized value and unit before confirmation;
- view a chronological list; and
- revise, void, or restore with explicit confirmation.

Charts, ranges, color-coded interpretations, goals, streaks, correlations,
predictions, alerts, and comparisons to population norms are excluded from
RT-6.

### Storefront integration rules

- Built-in Medusa resources use existing Medusa SDK methods.
- Custom endpoints use `sdk.client.fetch` with plain objects.
- Regular `fetch` and manually serialized JSON bodies are prohibited.
- Loading, empty, unavailable, error, read-only, review, success, and retry
  states are explicit.
- Mutations disable duplicate submission while pending.
- One stable submission key survives an ambiguous retry and rotates only after
  confirmed success or refreshed source state.
- Private entries are never placed in public Next.js cache tags, shared caches,
  page metadata, analytics, or browser persistent storage.

## Explicit exclusions

RT-6 does not include:

- diagnoses, symptoms, conditions, therapeutic goals, or medical history;
- prescription, medication, treatment, administration route, or body-site data;
- adverse-event collection, triage, emergency response, or clinician messaging;
- laboratory reports, genetic data, sexual-life information, photos, or files;
- wearable, Apple Health, Google Health Connect, device, spreadsheet, or bulk
  imports;
- staff-created, staff-edited, or staff-viewed private entries;
- product recommendations or personalized protocol selection;
- automatic links inferred from purchases or routines;
- automatic measurement or journal creation;
- reminders, notifications, background jobs, or persistent future occurrences;
- AI summaries, sentiment, diagnosis, risk scoring, predictions, or advice;
- advertising, segmentation, marketplace, or customer-support use; or
- production activation before RT-8 completion.

## Acceptance criteria

- `RT6-001`: purchasing, activating, scheduling, or confirming activity creates
  no journal or measurement automatically.
- `RT6-002`: unauthenticated requests return `401` without private disclosure.
- `RT6-003`: cross-customer identifiers are indistinguishable from missing
  records.
- `RT6-004`: every mutation requires an active profile and current consent for
  the exact RT-6 scope.
- `RT6-005`: closed or outdated-consent profiles can read owned entries but
  cannot mutate them.
- `RT6-006`: journal text is length-bounded, stored as plain text, and never
  written to application logs.
- `RT6-007`: a related material, routine, log, or supply must belong to the same
  customer profile.
- `RT6-008`: creating an entry requires review and explicit confirmation.
- `RT6-009`: revisions preserve immutable prior content.
- `RT6-010`: void and restore are auditable and exactly replayable.
- `RT6-011`: exact idempotent replay returns the original response without a
  duplicate revision.
- `RT6-012`: conflicting key reuse returns `409` with no partial write.
- `RT6-013`: concurrent edits to one expected revision allow at most one winner.
- `RT6-014`: failed workflows leave no partial entry, revision, transition, or
  completed mutation.
- `RT6-015`: measurement creation is unavailable while the allowlist is empty or
  unapproved.
- `RT6-016`: approved measurements accept only the configured type, unit, value
  bounds, precision, and conversion rules.
- `RT6-017`: measurements produce no interpretation, score, range, goal, alert,
  recommendation, or automatic relation.
- `RT6-018`: journal and measurement changes never modify customer-supply
  balances, routines, occurrences, or logs.
- `RT6-019`: commerce, BOM, warehouse inventory, payment, fulfillment, voucher,
  and marketplace records remain unchanged.
- `RT6-020`: Admin, support, anonymous, and marketplace callers cannot retrieve
  RT-6 entries.
- `RT6-021`: every success and error response uses private no-store caching.
- `RT6-022`: storefront requests use the Medusa SDK and customer-scoped refresh
  behavior.
- `RT6-023`: private content does not enter analytics, shared caches, persistent
  browser storage, or error telemetry.
- `RT6-024`: disposable synthetic data and the disposable database are removed
  after authorized integration verification.

## Verification gates

Each state-changing item requires separate authorization:

1. formally review this documentation contract;
2. locally commit this documentation contract;
3. push the documentation branch;
4. create a separate RT-6 implementation branch;
5. approve the RT-6 privacy-impact assessment, data classification, privacy
   notice, consent scopes, retention decision, and journal collection boundary
   before any RT-6 customer-data source implementation;
6. separately approve the measurement type and unit allowlist before
   measurement source work;
7. implement source-only models, workflows, authenticated APIs, and storefront
   surfaces within the approved scopes;
8. formally review source changes;
9. create a local source commit;
10. generate migrations without applying them;
11. review and separately commit migration artifacts;
12. rehearse the complete RT-1 through RT-6 migration chain against a newly
    created disposable local PostgreSQL database;
13. execute dedicated authenticated ownership, consent, lifecycle, idempotency,
    concurrency, compensation, cache, telemetry, and commerce-isolation HTTP
    integration tests;
14. push the completed implementation branch;
15. separately evaluate Neon migration readiness; and
16. separately authorize deployment and website activation after RT-8.

Passing source checks is not database evidence. Disposable local database
evidence is not Neon, deployment, privacy approval, or production evidence.

## Blocked implementation and production decisions

Contract approval retains the following decisions as blocked until separately
reviewed and approved:

- Journal source implementation may proceed independently while the measurement
  allowlist remains empty; this does not authorize production collection;
- the exact declared purpose and lawful basis for each consent scope;
- the approved journal privacy notice and consent language;
- the first measurement type and unit allowlist, if any;
- maximum active and archived record counts per customer;
- mutation and list-query rate limits;
- retention period for active, voided, and revised entries;
- customer export representation;
- correction, withdrawal, erasure, backup, and account-closure behavior;
- whether customers under the applicable age threshold may use RT-6;
- encryption, key management, backup, incident response, and access-monitoring
  controls;
- approved production observability fields and redaction tests;
- processor and subprocessor data locations and contracts; and
- legal review of research-only positioning alongside customer-authored private
  records.

## Deferred work

- Final export, retention, deletion, access audit, rate limits, and browser
  privacy verification remain RT-8.
- Versioned product protocols, product documents, and the non-persistent
  transparent calculator remain RT-7.
- Notifications, reminders, device integrations, imports, attachments, charts,
  trends, correlations, and AI features require separate future contracts.
- Clinical data, adverse-event reporting, medical-provider access, or patient
  features are outside the current commerce roadmap.

## Completion boundary

This approved contract records RT-6 planning only.

### Development implementation reconciliation

Subsequent explicit gates authorized a development-only Journal implementation.
That source is required to remain default-off and now includes:

- server-owned Journal availability, notice, consent version, digest, and
  effective-timestamp configuration;
- a purpose-specific immutable Journal consent-event boundary separate from the
  general Research & Tracking consent;
- owner-authenticated Journal reads and workflow-only mutations;
- bounded offset pagination in the account UI; and
- an empty Measurements allowlist with no measurement collection source.

This reconciliation records the authorized development state. It does not
approve a privacy notice, establish legal compliance, authorize live customer
collection, or remove any migration, database, HTTP-verification, push, Neon,
deployment, or production-activation gate.

It does not authorize:

- changes to the approved decisions without a new formal review;
- collection of journal or measurement data;
- additional RT-6 models, workflows, API routes, storefront code, or Admin code
  beyond separately authorized development gates;
- a measurement allowlist;
- migration generation or application;
- local, disposable, existing, or Neon database access;
- tests, build, or website startup;
- commit or push;
- legal or privacy approval;
- deployment; or
- website activation.
