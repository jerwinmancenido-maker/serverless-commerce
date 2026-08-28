# Research Tracking RT-6 Privacy Decision Record

Status: preliminary development decision record. Separately authorized,
default-off Journal source exists for local development, but this record does
not approve production privacy compliance, live customer-data collection,
migration generation or application, database access, commit, push, deployment,
or activation.

## Purpose

This record supports the privacy gate defined by
`docs/research-tracking-rt-6-journal-measurements-contract.md`. It inventories
the proposed RT-6 Journal and Measurements data flow, records preliminary
privacy risks and controls, drafts journal consent language, defines the
retention decisions that remain unresolved, and confirms that the measurement
allowlist is empty.

This is a product and engineering risk record, not legal advice or a completed
Privacy Impact Assessment signed by a qualified privacy or legal owner.

## Gate disposition

Overall disposition: **development-only Journal source authorized; live
customer-data collection and production activation blocked**.

The following decisions are suitable for formal product review:

- classify the entire RT-6 journal domain as sensitive private customer data;
- require separate purpose-specific consent for Journal and Measurements;
- permit customer-authored journal records only after review and confirmation;
- prohibit staff, Admin, marketplace, advertising, analytics, and support access;
- use the existing authenticated Medusa Store API boundary;
- use private no-store responses and avoid browser-persistent storage;
- permit Journal to proceed independently of Measurements only after every
  Journal-specific privacy blocker in this record is resolved and approved;
- keep measurement types and units controlled by a server allowlist; and
- keep that measurement allowlist empty until a separate legal and privacy
  review approves individual types.

The following gates are not complete:

- qualified Philippine privacy or legal review;
- accountable privacy owner and Data Protection Officer confirmation;
- final purpose and lawful-basis determination;
- approved customer notice and consent copy;
- approved time-bound consent validity, expiry, and renewal rules;
- numeric retention and backup-erasure periods;
- maximum active and archived Journal record counts per customer;
- Journal mutation and list-query rate limits;
- production processor and subprocessor inventory;
- production data-location and cross-border-transfer review;
- production encryption, access-management, backup, incident-response, and
  continuity evidence;
- approved operational telemetry and redaction tests;
- minor-account eligibility policy; and
- RT-8 export, correction, deletion, access-audit, and browser acceptance.

### Journal and Measurements sequencing decision

Journal and Measurements are independent collection scopes. Journal source work
may proceed while the measurement allowlist remains empty only after the Journal
purpose, lawful basis, notice, consent duration, collection limits, retention,
processor, security, eligibility, and RT-8 dependencies identified in this
record have been separately resolved and approved.

An approved Journal scope does not activate Measurements. Measurements must
remain unavailable and reject every write until a non-empty type and unit
allowlist receives its own privacy, legal, retention, and implementation
approval.

## Regulatory planning basis

Philippine Republic Act No. 10173 defines information about an individual's
health as sensitive personal information and generally requires a specific
lawful condition before processing. It also requires transparency, legitimate
purpose, proportionality, accuracy, limited retention, data-subject rights, and
reasonable organizational, physical, and technical safeguards.

The National Privacy Commission's current security guidance extends to private
sector personal-data processing and identifies Privacy Impact Assessment,
access management, storage controls, business continuity, and periodic review
as important safeguards.

References:

- [Republic Act No. 10173 - Data Privacy Act of 2012](https://privacy.gov.ph/data-privacy-act/)
- [Implementing Rules and Regulations of the Data Privacy Act](https://privacy.gov.ph/implementing-rules-regulations-data-privacy-act-2012/)
- [NPC Circular No. 2023-06 - Security of Personal Data](https://privacy.gov.ph/npc-issues-circulars-to-strengthen-personal-data-protection-in-ph/)
- [NPC Guidelines on Privacy Impact Assessment](https://privacy.gov.ph/wp-content/uploads/2022/01/NPC_AdvisoryNo.2017-03.pdf)

These references identify review obligations. This record does not certify that
the project satisfies them.

## Scope

### Included in the preliminary assessment

- authenticated Research Compounds customer account;
- optional customer-authored journal entry drafts and confirmations;
- immutable journal revisions, void, and restore operations;
- optional customer-selected relations to an owned tracked material, supply,
  routine, or confirmed routine log;
- purpose-specific consent and withdrawal events;
- durable idempotency and mutation records;
- bounded customer-owned list and detail reads;
- future measurement architecture with no approved types; and
- eventual RT-8 export, correction, deletion, and retention integration.

### Excluded

- Admin or staff access to private records;
- medical, clinical, diagnostic, treatment, prescription, adverse-event, or
  emergency workflows;
- structured symptoms, diagnoses, outcomes, routes, body sites, or goals;
- product recommendations or personalized protocols;
- images, files, audio, video, or attachments;
- wearable, device, spreadsheet, bulk, or third-party health imports;
- AI analysis, search indexing, sentiment, summarization, scoring, alerts, or
  recommendations;
- marketing, advertising, segmentation, support, or marketplace use;
- measurement collection while the allowlist remains empty; and
- real customer data during source-only and disposable-database verification.

## Roles and accountability

| Role                                               | Preliminary responsibility                                                                      | Status                              |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| Product owner                                      | Approve purpose, minimization, customer experience, and exclusions                              | Owner not recorded in this document |
| Personal information controller                    | Determine lawful basis, notice, rights, retention, and processors                               | Unknown                             |
| Data Protection Officer or qualified privacy owner | Review PIA, risk treatment, registration duties, and production controls                        | Unknown                             |
| Engineering owner                                  | Implement approved Medusa boundaries and verification evidence                                  | Development-only Journal source authorized; owner not recorded |
| Infrastructure owner                               | Prove encryption, access, backups, incident response, continuity, and deletion behavior         | Unknown                             |
| Customer                                           | Create, review, confirm, revise, void, restore, withdraw, export, correct, and request deletion | Future feature only                 |

No role in this table is granted access by this document.

## Proposed processing purpose

The only proposed Journal purpose is:

> Provide an optional private space in the authenticated customer's Research &
> Tracking account where the customer can create, view, revise, void, restore,
> export, correct, and request deletion of their own organizational notes.

The following are not compatible purposes:

- diagnosing, treating, monitoring, preventing, or predicting a condition;
- determining safety, effectiveness, response, or outcome;
- recommending products, quantities, routines, protocols, or purchases;
- customer scoring, profiling, segmentation, or advertising;
- staff support, seller operations, marketplace operations, or fraud profiling;
- model training, product analytics, or research unrelated to providing the
  private customer feature; or
- using journal content to infer human use of a Research Compounds product.

Any new purpose requires a new PIA, contract decision, notice, consent analysis,
and separately authorized implementation.

## Preliminary lawful-basis decision

The proposed engineering boundary assumes explicit, freely given, specific,
informed, evidenced, and withdrawable consent for each sensitive RT-6 scope.

This is a design assumption only. A qualified privacy or legal owner must
confirm the lawful basis and whether consent is sufficient for the exact
operator, customer population, processors, locations, and production purpose.

Consent is not bundled with:

- store account creation;
- general terms of sale;
- checkout or payment;
- Research & Tracking profile creation;
- personal routines;
- purchased-supply tracking;
- Journal and Measurements together; or
- marketing consent.

Declining Journal or Measurements consent cannot prevent purchasing, account
access, order history, fulfillment, or other ordinary commerce functions.

## Data inventory

### Journal content

| Field category     | Proposed values                                               | Classification             | Required?        | Source                                          |
| ------------------ | ------------------------------------------------------------- | -------------------------- | ---------------- | ----------------------------------------------- |
| Entry identity     | Opaque journal-entry and revision IDs                         | Sensitive private metadata | System-generated | Medusa workflow                                 |
| Owner relation     | Research profile ID derived from authenticated customer       | Sensitive private metadata | Yes              | Medusa authentication and `researchTracking`    |
| Recorded time      | Local date, local time, snapshotted timezone                  | Sensitive private metadata | Yes              | Customer and profile                            |
| Title              | Plain text, maximum 120 Unicode characters                    | Sensitive private content  | No               | Customer                                        |
| Body               | Plain text, maximum 4,000 Unicode characters                  | Sensitive private content  | Yes              | Customer                                        |
| Optional relations | Owned tracked-material, supply, routine, or confirmed-log IDs | Sensitive private metadata | No               | Customer selection, server ownership validation |
| Lifecycle          | Active or voided state, revision and transition timestamps    | Sensitive private metadata | Yes              | Medusa workflow                                 |

The body remains sensitive in full. The system must not inspect the body to
downgrade its classification.

### Consent and mutation metadata

| Field category         | Proposed values                                                 | Classification                  | Purpose                             |
| ---------------------- | --------------------------------------------------------------- | ------------------------------- | ----------------------------------- |
| Consent scope          | `journal` or `measurements`                                     | Sensitive private metadata      | Prove scope-specific state          |
| Notice evidence        | Version, SHA-256 digest, accepted or withdrawn state, timestamp | Sensitive private metadata      | Evidence notice and customer action |
| Idempotency            | Key, operation, request-fingerprint digest                      | Sensitive private metadata      | Prevent duplicate writes            |
| Mutation state         | Pending, completed, failed, target IDs, stable safe result      | Sensitive private metadata      | Replay and workflow recovery        |
| Failure classification | Stable neutral code only                                        | Restricted operational metadata | Troubleshooting without content     |

Raw journal content and measurement values must never appear in consent,
mutation, error, or observability records.

### Authentication data

Customer authentication credentials and tokens remain owned by Medusa's Auth
and Customer boundaries. RT-6 uses the authenticated customer identity but must
not copy passwords, tokens, email, phone, addresses, or customer profile fields
into `researchTracking` records.

### Measurements

The approved inventory contains no measurement fields because the measurement
allowlist is empty. The conceptual type, unit, decimal value, and timestamp
fields in the RT-6 contract do not authorize collection.

## Data-flow inventory

### Proposed journal write

```text
Authenticated customer browser
  -> Next.js account UI draft held in page memory
  -> explicit review and confirmation
  -> Next.js server action
  -> Medusa JS SDK client request with customer authentication
  -> authenticated Store API validation middleware
  -> Medusa workflow and ownership/consent steps
  -> researchTracking module service
  -> PostgreSQL records for entry, revision, consent/mutation state
  -> private no-store response
  -> customer-owned account UI
```

### Proposed journal read

```text
Authenticated customer browser
  -> Next.js server-rendered account request
  -> Medusa JS SDK custom Store API request
  -> authenticated ownership-filtered query
  -> researchTracking PostgreSQL records
  -> private no-store response
  -> customer-owned account UI
```

### Proposed withdrawal and deletion

```text
Customer confirmation
  -> Medusa SDK
  -> authenticated Store API
  -> workflow revalidates ownership and current state
  -> append consent/privacy lifecycle event
  -> disable mutations immediately
  -> retain customer read/export/delete-request access
  -> RT-8 processor applies approved deletion and retention policy later
```

### Prohibited flows

RT-6 content must not flow to:

- Next.js public cache tags, static generation, or shared response caches;
- browser local storage, session storage, IndexedDB, URL parameters, page
  metadata, or client analytics;
- Medusa Admin, support notes, customer metadata, order metadata, product
  metadata, payment, fulfillment, inventory, or BOM records;
- application logs, request tracing payloads, error messages, crash reports, or
  performance telemetry;
- email, SMS, push notifications, marketplace APIs, advertising systems, or
  social platforms; or
- model training, AI providers, search engines, data warehouses, or reporting
  tools.

## Confirmed source boundaries

The current source inspection confirms only:

- a Next.js storefront app exists;
- the storefront has a configured Medusa JS SDK wrapper;
- current Research Tracking data functions use custom SDK requests with
  `cache: "no-store"`;
- a Medusa backend and custom `researchTracking` module exist;
- current customer Research Tracking endpoints are placed beneath
  `/store/customers/me/research-tracking/*`; and
- current contracts exclude Admin access to private tracking records.

This source evidence does not prove deployed TLS, production encryption,
processor terms, data location, runtime headers, database controls, backup
deletion, incident response, or production access restrictions.

## Repository and processor inventory

| Repository or processor         | Proposed role                                          | Current evidence                          | Production disposition                                                             |
| ------------------------------- | ------------------------------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Customer browser                | Displays and temporarily holds the customer's draft    | Conceptual and storefront source          | Persistent storage prohibited; browser verification pending                        |
| Next.js storefront              | Server-rendered account UI and server actions          | Source exists                             | Deployment provider and logging configuration unknown                              |
| Medusa backend                  | Authentication, validation, workflows, and private API | Source exists                             | Production host and runtime controls unknown                                       |
| `researchTracking` module       | Owns private RT-6 records                              | Existing custom module source             | RT-6 models not implemented                                                        |
| PostgreSQL                      | Future RT-6 persistence                                | Local/disposable test architecture exists | Production database and encryption evidence not established here                   |
| Vercel                          | Planned storefront hosting                             | Project architecture context only         | Processor terms, region, logs, and production project not verified                 |
| Neon                            | Planned PostgreSQL provider                            | Project architecture context only         | No access in this gate; region, controls, backup, and deletion evidence unresolved |
| Redis or workflow-lock provider | Potential cache/locking dependency                     | Configuration-dependent                   | Production provider and private-data exclusion unknown                             |
| Observability provider          | Operational monitoring                                 | No approved RT-6 provider identified      | Private content and values prohibited; provider review required                    |

No provider in this table is approved or activated by this record.

## Risk and control register

Ratings are preliminary: impact and likelihood are `low`, `medium`, or `high`.
Residual status is `controlled for source planning`, `open`, or `blocked`.

| ID     | Risk                                                                          | Impact | Likelihood | Required control                                                                                                                             | Residual status                                        |
| ------ | ----------------------------------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| PIA-01 | One customer reads or mutates another customer's entry                        | High   | Medium     | Medusa customer authentication; derive owner from auth context; workflow ownership checks; indistinguishable `404`; authenticated HTTP tests | Open until implementation and runtime tests            |
| PIA-02 | Journal content appears in logs, traces, errors, or telemetry                 | High   | Medium     | Never log request/response bodies; stable codes and opaque IDs only; automated redaction tests; provider configuration review                | Blocked pending observability inventory                |
| PIA-03 | Shared or public caches expose private entries                                | High   | Medium     | `Cache-Control: private, no-store`; SDK `no-store`; no shared Next.js tags; test success and error responses                                 | Open until HTTP and browser tests                      |
| PIA-04 | Browser persistence leaves sensitive drafts on a shared device                | High   | Medium     | Hold drafts in page memory only; prohibit local storage, IndexedDB, URL, and service-worker caching; clear on logout/navigation              | Open until storefront implementation and browser tests |
| PIA-05 | Customer text executes script or loads remote content                         | High   | Medium     | Plain-text input and rendering; length limits; no HTML/Markdown execution, attachments, or remote images; security tests                     | Open until implementation                              |
| PIA-06 | Bundled or ambiguous consent does not match purpose                           | High   | Medium     | Separate Journal and Measurements scopes; versioned notice and digest; explicit affirmative action; no preselected option                    | Blocked pending notice and legal review                |
| PIA-07 | Withdrawal does not stop new processing                                       | High   | Medium     | Immediate read-only gate; revalidate consent inside every mutation workflow; HTTP tests for every mutation                                   | Open until implementation                              |
| PIA-08 | Records are retained indefinitely                                             | High   | High       | Versioned retention policy; record policy snapshot and expiry; RT-8 lifecycle processor; backup-erasure evidence                             | Blocked pending numeric retention approval             |
| PIA-09 | Deletion claims exceed actual primary or backup erasure                       | High   | Medium     | Distinguish request, scheduled, completed, and backup-expiry states; no completion claim without evidence                                    | Blocked pending RT-8 and provider evidence             |
| PIA-10 | Admin, support, or seller staff gain private-record access                    | High   | Low        | No Admin routes/UI; deny-by-default permissions; route inventory and negative tests                                                          | Open until implementation and deployment review        |
| PIA-11 | Optional product/routine relations imply use, causation, or efficacy          | High   | Medium     | Customer-selected relation only; neutral association label; no automated relation or interpretation                                          | Controlled for source planning                         |
| PIA-12 | Free text includes third-party data or unexpected clinical information        | High   | Medium     | Data-minimizing notice; no structured clinical fields; classify all content as sensitive; correction/deletion controls                       | Residual risk remains; legal review required           |
| PIA-13 | Measurement fields enable clinical interpretation                             | High   | High       | Empty allowlist; reject all measurement writes; separate future type-level approval                                                          | Controlled while allowlist remains empty               |
| PIA-14 | Idempotent retry creates duplicate or conflicting revisions                   | Medium | Medium     | Durable mutation record, fingerprint conflict, database uniqueness, concurrent HTTP tests                                                    | Open until implementation                              |
| PIA-15 | Workflow failure leaves partial sensitive records                             | High   | Low        | Transactional workflow, compensation, failure injection, atomic entry/revision/mutation update                                               | Open until database-backed tests                       |
| PIA-16 | Processor, data location, or cross-border use is undisclosed                  | High   | Medium     | Complete processor inventory, agreements, regions, data-flow review, customer notice                                                         | Blocked pending production architecture evidence       |
| PIA-17 | Encryption, backup, access, incident, or continuity controls are insufficient | High   | Medium     | Infrastructure-owner evidence against approved control baseline and NPC Circular 2023-06                                                     | Blocked pending production evidence                    |
| PIA-18 | Minor accounts submit sensitive records without an approved policy            | High   | Unknown    | Decide eligibility and consent authority before activation; enforce server-side                                                              | Blocked pending policy decision                        |
| PIA-19 | Private records change commerce, supplies, or marketplace state               | High   | Low        | Module isolation; workflow boundary; database fingerprint tests                                                                              | Open until integration tests                           |
| PIA-20 | Production is activated before PIA and RT-8 closure                           | High   | Medium     | Server-owned disabled-by-default configuration; release checklist; explicit activation gate                                                  | Controlled for source planning                         |
| PIA-21 | Consent remains active beyond an approved purpose-bound validity period       | High   | Medium     | Server-owned consent validity and expiry policy; read-only transition at expiry; explicit renewal; clock-boundary tests                      | Blocked pending validity-period approval               |
| PIA-22 | Unbounded records or requests create excessive collection or abuse exposure   | High   | Medium     | Approved active and archived record limits; bounded queries; mutation and list-query rate limits; neutral limit errors                       | Blocked pending collection-limit approval              |

## Required control baseline

The following controls are required before production activation:

- data protection and infrastructure owners recorded by role;
- completed PIA with approved risk treatments;
- published plain-language privacy notice;
- versioned, purpose-specific, evidenced, and time-bound consent;
- server-owned disabled-by-default activation configuration;
- least-privilege production access and access review;
- managed encryption in transit and at rest;
- protected secrets and key-management evidence;
- processor and subprocessor agreements and data-location review;
- private no-store response and browser-cache tests;
- no sensitive values in application, platform, database, or observability logs;
- backup, restore, business-continuity, incident-response, and breach procedures;
- versioned retention, correction, export, withdrawal, deletion, and backup-expiry
  procedures;
- approved active and archived record limits, bounded queries, rate limits, and
  abuse controls;
- authenticated ownership, idempotency, concurrency, rollback, and commerce
  isolation tests; and
- RT-8 completion plus separately authorized Neon, deployment, and browser
  acceptance gates.

## Draft journal privacy notice

The following copy is a product draft for qualified privacy and legal review. It
must not be published or used to collect consent without separate approval.

### Short notice

> Journal is an optional private area in your Research & Tracking account. You
> choose what to enter. Entries may contain sensitive personal information. We
> use them only to store and display your private journal, preserve the changes
> you make, and support your access, correction, export, withdrawal, and
> deletion requests. We do not use journal content to provide medical advice,
> recommend products, evaluate outcomes, advertise to you, or share information
> with marketplaces. Journal access is limited to your authenticated account.

### Consent action

> I have read the Journal Privacy Notice and consent to the collection and
> processing of the journal entries I choose to submit for the stated private
> journal purpose. I understand that Journal is optional, is not medical advice,
> and is separate from purchasing and order fulfillment. I can withdraw consent,
> after which new journal changes will be disabled while available privacy and
> deletion controls remain accessible.

### Required full-notice fields still missing

Before approval, the full notice must state:

- legal identity and contact information of the personal information controller;
- Data Protection Officer or privacy contact;
- exact declared purpose and confirmed lawful basis;
- complete field categories;
- processing methods and repositories;
- named recipients and processor categories;
- data locations and cross-border transfers;
- exact active, withdrawn, voided, audit, and backup retention periods;
- exact consent validity period, expiry behavior, and renewal conditions;
- access, correction, portability, withdrawal, deletion, and complaint rights;
- effects of declining or withdrawing consent;
- security summary appropriate for customers;
- notice effective date and version; and
- how material changes trigger renewed consent.

## Consent-state contract

```text
not accepted
  -> accept current Journal notice -> active

active
  -> withdraw Journal consent -> withdrawn and read-only
  -> general RT profile closes -> closed and read-only
  -> deletion requested -> deletion_requested and read-only
  -> approved consent validity expires -> outdated and read-only until renewed
  -> Journal notice changes -> outdated and read-only until renewed

withdrawn or outdated
  -> accept current Journal notice -> active, if the general RT profile is active

deletion_requested
  -> cancel within approved window -> return to prior read-only or active state
  -> RT-8 processor completes approved lifecycle -> closed/deleted projection
```

Consent renewal never restores a voided entry, cancels a deletion request, or
changes an existing journal revision automatically.

No consent validity duration is approved by this record. The duration and its
calculation rule must be purpose-bound, versioned, server-owned, and approved by
the accountable privacy or legal owner. Source implementation must not hardcode
an arbitrary production duration.

## Withdrawal and deletion lifecycle

### Withdrawal

1. Customer reviews a withdrawal notice.
2. Workflow revalidates customer, profile, current Journal consent, and
   idempotency key.
3. Append one immutable withdrawal event.
4. Disable every Journal mutation immediately.
5. Keep owned Journal reads and available privacy controls accessible.
6. Do not claim that withdrawal itself deleted stored records.
7. Apply the approved retention/deletion process only through RT-8.

### Journal void

Voiding one journal entry is not consent withdrawal or account deletion. It:

- creates an auditable state transition;
- hides the entry from the default active timeline;
- preserves revisions under the same unresolved retention policy; and
- remains reversible until an approved deletion workflow makes it irreversible.

### Deletion request

1. Customer explicitly requests deletion through the RT privacy workflow.
2. Record request state and disable Journal mutations.
3. Display `requested`, not `deleted` or `completed`.
4. Allow cancellation only within the approved window and only when policy
   permits.
5. RT-8 determines primary-record erasure, audit minimization, legal hold,
   processor instructions, backup expiry, and completion evidence.
6. Commerce records remain governed separately and are never erased by an RT-6
   request merely because they were optionally related to a journal entry.

### Correction

Customer correction creates a new immutable revision and preserves the prior
revision only for the approved retention period. The customer-facing projection
shows the current corrected version and does not expose internal mutation data.

## Retention matrix

No numeric production retention duration is approved. Rows marked `BLOCKED`
must be resolved by the accountable privacy/legal and infrastructure owners
before customer-data source implementation under the RT-6 contract.

| Data category                             | Start event                      | Proposed retention principle                                            | End or transition                                                          | Status                                                |
| ----------------------------------------- | -------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Unsaved browser draft                     | Customer begins typing           | Page memory only; no browser-persistent storage                         | Submit, clear, logout, navigation, or page close                           | Approved design boundary; browser proof pending       |
| Active journal entry and current revision | Confirmed creation               | Only while necessary to provide the customer-requested Journal purpose  | Customer deletion lifecycle, account policy, or approved inactivity expiry | BLOCKED: numeric period absent                        |
| Superseded journal revisions              | Confirmed revision               | Minimum period necessary for correction history and conflict resolution | Approved expiry or deletion workflow                                       | BLOCKED: purpose and numeric period absent            |
| Voided journal entries and revisions      | Confirmed void                   | Minimum period necessary for restore and customer rights                | Approved expiry or deletion workflow                                       | BLOCKED: restore window and numeric period absent     |
| Journal consent events                    | Acceptance or withdrawal         | Minimum period necessary to evidence notice and consent state           | Approved legal/audit expiry                                                | BLOCKED: legal and numeric period absent              |
| Journal mutation/idempotency records      | Mutation starts                  | Minimum period necessary for replay, recovery, and dispute handling     | Approved operational expiry                                                | BLOCKED: numeric period absent                        |
| Failed mutation metadata                  | Failure recorded                 | Stable code and opaque IDs only; no content                             | Short approved operational expiry                                          | BLOCKED: numeric period absent                        |
| Deletion requests                         | Request created                  | Through request, cancellation, processing, and proof window             | Approved audit-minimized terminal state                                    | Deferred to RT-8                                      |
| Primary PostgreSQL deleted content        | Approved deletion execution      | No longer than required to complete verified erasure                    | Verified primary deletion                                                  | Deferred to RT-8 and provider evidence                |
| Database backups and replicas             | Provider snapshot or replication | Provider-defined minimum necessary recovery window                      | Verified expiry or inaccessible state                                      | BLOCKED: provider inventory and maximum absent        |
| Application and platform logs             | Request or workflow execution    | Sensitive content and values prohibited; identifiers and codes only     | Short approved operational expiry                                          | BLOCKED: provider inventory and numeric period absent |
| Export artifacts                          | Customer export generated        | Short authenticated download window                                     | Automatic verified deletion                                                | Deferred to RT-8                                      |

Retention must be versioned and server-owned. Source implementation must not
hardcode an arbitrary production duration. Records must snapshot the applicable
policy version and any calculated expiry required by the approved policy.

## Empty measurement allowlist

Approved RT-6 measurement allowlist version: `empty-unapproved-v1`.

| Measurement type | Units | Collection status | Reason                                                                                                         |
| ---------------- | ----- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| None             | None  | Disabled          | No type has completed purpose, necessity, privacy, legal, retention, unit, bounds, export, and security review |

Required behavior while empty:

- Measurements displays an honest unavailable state.
- No measurement form or mutation control is rendered.
- All measurement create, revise, void, and restore requests are rejected
  without a write.
- No measurement model record, value, placeholder, demo value, analytics event,
  or customer metadata field is created.
- Product, order, routine, journal, calculator, or protocol activity cannot
  infer a measurement.
- Source tests must prove the disabled boundary before any future allowlist is
  considered.

Each future type requires a separately approved decision recording:

- stable key and neutral label;
- declared purpose and necessity;
- lawful basis and consent scope;
- canonical unit and exact conversion rules;
- numeric precision and non-interpretive data-quality bounds;
- retention and export representation;
- privacy and legal owner approval;
- storefront language and accessibility review; and
- no interpretation, scoring, target, range, alert, or recommendation.

## Preliminary PIA conclusion

### Source-only conclusion

The architecture can be designed with strong ownership, minimization,
idempotency, transaction, caching, and domain-isolation controls. The empty
measurement allowlist prevents measurement collection. These controls make a
documentation and synthetic-data engineering plan possible.

### Customer-data conclusion

Later explicit gates authorized development-only Journal source while retaining
the privacy blockers in this record. The implementation must remain default-off
and must not collect live customer Journal data until purpose-owner approval,
full notice, consent validity, collection and request limits, numeric retention,
processor inventory, infrastructure controls, qualified privacy review, minor
eligibility, and RT-8 lifecycle behavior are resolved. Measurements remain
disabled with an empty allowlist.

### Production conclusion

No production readiness or legal compliance conclusion can be made. Production
activation requires a completed and approved PIA, all risk treatments evidenced,
RT-8 completion, credential-backed runtime and browser verification, Neon
readiness, deployment approval, and an independent activation gate.

## Review checklist

- [ ] Personal information controller identified.
- [ ] Data Protection Officer or qualified privacy owner identified.
- [ ] Journal purpose and lawful basis approved.
- [ ] Full journal notice approved.
- [ ] Journal consent copy approved.
- [ ] Journal consent validity, expiry, and renewal rules approved.
- [ ] Minor eligibility policy approved.
- [ ] Processor, subprocessor, and data-location inventory approved.
- [ ] Numeric retention matrix approved.
- [ ] Maximum active and archived Journal record counts approved.
- [ ] Journal mutation and list-query rate limits approved.
- [ ] Encryption, access, backup, incident, and continuity controls evidenced.
- [ ] Telemetry field allowlist and redaction tests approved.
- [ ] Withdrawal, correction, export, deletion, and backup-expiry behavior approved.
- [ ] RT-8 dependency accepted.
- [x] Journal classified as sensitive private customer data.
- [x] Journal and Measurements consent scopes separated.
- [x] Journal excluded from Admin, support, marketplace, advertising, and analytics.
- [x] Measurement allowlist is empty.
- [x] Production activation remains blocked.

## Completion boundary

Creating this preliminary decision record does not authorize:

- approval by a privacy officer, legal adviser, infrastructure owner, or
  regulator;
- customer-data collection or processing;
- additional journal or measurement models, workflows, APIs, or storefront
  implementation beyond separately authorized development gates;
- any non-empty measurement allowlist;
- migration generation or application;
- local, disposable, existing, or Neon database access;
- tests, build, website startup, or browser operation;
- commit or push;
- deployment; or
- production activation.
