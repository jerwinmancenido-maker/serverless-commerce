# Research Tracking RT-2 Ownership and Store API Contract

Status: documentation contract for review. This document does not authorize
workflow, API, model, migration, storefront, database, deployment, private-data,
or provider changes.

RT-2 depends on the approved RT-0 boundary and the committed RT-1 module
foundation. If this contract is approved, implementation must occur on a
separate feature branch and pass source checks plus an explicitly authorized
disposable-database test before any persistent database is considered.

## Purpose

RT-2 establishes the minimum authenticated ownership and privacy boundary for
Research & Tracking. It allows a signed-in Medusa customer to opt in, retrieve
their own minimal research profile, maintain locale and timezone preferences,
renew or withdraw consent, and submit or cancel a deletion request.

RT-2 does not make the feature available in the storefront and does not collect
measurements, journals, routines, usage, administration, outcomes, or other
health information.

## Normative authority

- `docs/research-tracking-rt-0-contract.md` remains authoritative for research-
  only language, privacy gates, domain separation, and deferred features.
- `docs/research-tracking-rt-1-foundation.md` records the implemented module,
  model, link, quantity, and disposable-migration baseline.
- Medusa remains authoritative for authentication and customer identity.
- The `researchTracking` module owns private Research & Tracking records.
- A publishable API key identifies storefront access but never authenticates a
  customer or substitutes for a customer session or bearer token.

If an implementation detail conflicts with RT-0, RT-0 wins until a separately
reviewed contract revision explicitly supersedes it.

## Scope

RT-2 implementation may add only:

- authenticated Store API routes beneath
  `/store/customers/me/research-tracking/*`;
- Zod request schemas and named middleware arrays where body validation is
  required;
- ownership and lifecycle workflows with compensating steps;
- read helpers that always filter by the authenticated customer;
- an append-only research consent event model;
- a durable research privacy request model for deletion requests;
- a generated `researchTracking` migration for those new models and indexes;
- unit and integration tests for authentication, ownership, lifecycle,
  idempotency, data minimization, and rollback; and
- private, structured audit events that contain identifiers and state changes,
  not customer-entered private content.

RT-2 implementation must not add:

- account navigation, storefront pages, forms, or SDK calls;
- protocols, documents, or calculator behavior;
- purchased-order-item activation, tracked-material creation, or supplies;
- routines, schedules, occurrences, logs, or quantity adjustments;
- measurements, journals, symptoms, diagnoses, goals, routes, body sites,
  recommendations, or outcome fields;
- Admin access to private Research & Tracking data;
- customer lookup or mutation by client-supplied customer ID;
- marketplace, advertising, behavioral-analytics, or support-system sharing;
- automatic profile creation during registration, login, purchase, fulfillment,
  import, or migration; or
- migration application to Neon or another persistent database.

## Data classification and minimization

All RT-2 records are private customer data. RT-2 does not classify them as
health data because it does not collect health, administration, or outcome
fields. That narrower classification does not make the records public or
appropriate for marketing use.

The customer profile may contain only the existing RT-1 fields:

- Medusa customer identifier;
- IANA timezone;
- supported locale;
- current accepted consent version and server-recorded acceptance timestamp;
  and
- lifecycle status.

RT-2 must not copy the customer's name, email, phone number, addresses, orders,
or authentication data into `researchTracking`.

Free-text reasons, notes, IP addresses, full user-agent strings, request bodies,
session tokens, and bearer tokens must not be stored in RT-2 records or logs.

## Required RT-2 model additions

RT-1 stores the current consent version and timestamp on `research_profile` for
fast eligibility checks. RT-2 requires append-only evidence so later consent
cannot silently overwrite earlier consent history.

### Research consent event

Each `research_consent_event` belongs to one research profile and stores:

- event identifier;
- event type: `accepted` or `withdrawn`;
- consent version;
- immutable notice digest using SHA-256;
- server-recorded occurrence timestamp;
- request idempotency key; and
- standard created timestamp.

The pair of research profile and idempotency key must be unique. Consent events
are append-only: normal customer and Admin APIs cannot update or delete them.

### Research privacy request

Each `research_privacy_request` belongs to one research profile and stores:

- request identifier;
- request type: `deletion` in RT-2;
- status: `requested`, `cancelled`, `processing`, `completed`, or `rejected`;
- prior profile status: `active` or `closed`;
- server-recorded requested, cancelled, started, and completed timestamps as
  applicable;
- request idempotency key; and
- standard created and updated timestamps.

The pair of research profile and idempotency key must be unique. Only one
non-terminal deletion request may exist for a profile. RT-2 must not store a
free-text reason. Export requests and the actual deletion processor remain
deferred to RT-8.

Any model change requires a newly generated `researchTracking` migration. The
migration must not be applied merely because it was generated or committed.

## Authentication boundary

Every RT-2 endpoint lives under Medusa's automatically protected
`/store/customers/me/*` prefix. Route handlers must use
`AuthenticatedMedusaRequest` and derive the customer identifier only from
`req.auth_context.actor_id`.

Because the route prefix is already protected, RT-2 must not add redundant
`authenticate` middleware. Mutating routes still require body validation with
Zod imported from `@medusajs/framework/zod` and
`validateAndTransformBody`. Middleware files export named `MiddlewareRoute[]`
arrays that are spread into the root API middleware configuration.

The following inputs are prohibited in every request body and query:

- `customer_id`;
- `profile_id`;
- an arbitrary consent occurrence timestamp;
- lifecycle or request status chosen by the client; and
- any record identifier belonging to another customer.

Authentication failure must occur before validation or workflow execution.
Session and bearer authentication are allowed; Admin API keys are not customer
authentication.

## Ownership rules

- A customer may have at most one non-deleted research profile.
- Every read filters by the authenticated customer identifier at the data-query
  boundary. It must not retrieve a record by identifier and filter it later in
  JavaScript.
- Every mutation passes the authenticated customer identifier into a workflow.
- Workflow steps perform ownership and lifecycle validation before mutation.
- Routes do not call the `researchTracking` module service for mutations.
- Knowing a profile, consent event, or privacy request identifier never grants
  access.
- Cross-customer and missing resources return the same non-disclosing `404`
  outcome when a record-specific response is necessary.
- Responses never expose `customer_id`, internal link state, deletion metadata,
  idempotency keys, notice digests, or records belonging to another customer.

Administrative access to these records remains denied. RT-2 adds no Admin API
route, Admin page, support override, or impersonation behavior.

## Server-owned consent notice

The active consent version and notice SHA-256 digest are server-owned
configuration. They must come from one validated configuration source and must
not be independently hardcoded in routes, workflows, and storefront code.

The client must echo the version it reviewed and explicitly submit
`accepted: true`. The server rejects a missing, false, unsupported, expired, or
stale version. The server supplies the authoritative digest and occurrence
timestamp; the client cannot override either value.

RT-2 does not publish consent copy. Deployment must not activate the endpoints
until approved notice text, its version, and its digest are configured.

## Store API contract

All successful responses must include `Cache-Control: private, no-store`.
Responses use a minimal `research_profile` or `privacy_request` envelope and do
not support caller-selected fields in RT-2.

### Retrieve profile

`GET /store/customers/me/research-tracking/profile`

- Returns `200` with `{ "research_profile": null }` when the customer has not
  opted in.
- Otherwise returns the customer's minimal profile projection: timezone,
  locale, current consent version, consent timestamp, lifecycle status, and
  created and updated timestamps.
- Does not create a profile or refresh consent.

### Create profile and accept consent

`POST /store/customers/me/research-tracking/profile`

Validated body:

```json
{
  "timezone": "Asia/Manila",
  "locale": "en-PH",
  "consent_version": "server-published-version",
  "accepted": true
}
```

- Requires an `Idempotency-Key` header within the documented length and
  character limits.
- Creates the profile and first `accepted` consent event atomically.
- Returns `201` on first creation and the original `200` representation on an
  exact replay.
- If an active profile already exists under a different idempotency key, returns
  `409` and directs the client to retrieve the existing profile.
- A closed profile cannot be silently recreated or reactivated in RT-2.

### Update locale or timezone

`POST /store/customers/me/research-tracking/profile/preferences`

Validated body contains at least one of `timezone` or `locale` and no other
fields. The workflow validates the IANA timezone and supported locale allowlist.
It requires an active profile and an `Idempotency-Key` header.

The update does not alter consent version, consent timestamp, or lifecycle
status. An exact replay returns the existing result without another mutation.

### Renew consent

`POST /store/customers/me/research-tracking/profile/consents`

Validated body:

```json
{
  "consent_version": "server-published-version",
  "accepted": true
}
```

The workflow requires an active profile, verifies the server-owned version,
appends one `accepted` consent event, and updates the profile's current consent
version and timestamp atomically. It requires an `Idempotency-Key` header.

An exact replay returns the original result without another event. Reusing the
same idempotency key with a different body returns `409`.

### Withdraw consent and close profile

`POST /store/customers/me/research-tracking/profile/closure`

Validated body:

```json
{
  "acknowledge_closure": true
}
```

The workflow appends one `withdrawn` consent event and transitions an active
profile to `closed` atomically. It requires an `Idempotency-Key` header. Closing
a profile does not delete the Medusa customer, orders, payments, fulfillment,
or legally retained commerce records.

RT-2 has no reopen operation. Closed profiles are read-only except for privacy
requests.

### Request deletion

`POST /store/customers/me/research-tracking/privacy/deletion-requests`

Validated body:

```json
{
  "acknowledge_deletion_request": true
}
```

The workflow requires an existing profile and an `Idempotency-Key` header. It
creates one `requested` privacy request and transitions the profile to
`deletion_requested` atomically. A replay returns the original request. A
second non-terminal request returns the existing request without duplication.

The response is `202` because RT-2 records the request but does not perform data
deletion. It must state that commerce records are governed separately and that
submission is not proof of completed deletion.

### Retrieve current deletion request

`GET /store/customers/me/research-tracking/privacy/deletion-requests/current`

Returns `200` with the customer's current non-terminal request or `null`.
Response fields are request type, status, and applicable lifecycle timestamps.

### Cancel deletion request

`POST /store/customers/me/research-tracking/privacy/deletion-requests/cancel`

Validated body:

```json
{
  "acknowledge_cancellation": true
}
```

The workflow requires an `Idempotency-Key` header. Cancellation is allowed only
while the current request is `requested`; `processing`, `completed`, and
`rejected` requests cannot be cancelled. Successful cancellation returns the
profile to `active` only if consent has not been withdrawn and the profile was
active immediately before the deletion request. Otherwise it returns the
profile to `closed`.

## Profile lifecycle

Allowed RT-2 transitions are:

```text
none ──accept consent──> active
active ──renew consent──> active
active ──withdraw consent──> closed
active ──request deletion──> deletion_requested
closed ──request deletion──> deletion_requested
deletion_requested ──cancel while requested──> prior active or closed state
deletion_requested ──RT-8 processor──> closed
```

All other transitions return `409` or `not_allowed`. The prior state needed for
cancellation must be stored deterministically on the privacy request rather
than inferred from mutable timestamps.

## Workflow contract

Each mutation uses a dedicated Medusa workflow. Composition functions are
regular synchronous functions; execution-time transformations use `transform`,
and conditional branches use `when`. Routes perform no ownership or lifecycle
business logic.

Required workflows are:

- `create-research-profile`;
- `update-research-profile-preferences`;
- `record-research-consent`;
- `close-research-profile`;
- `request-research-profile-deletion`; and
- `cancel-research-profile-deletion`.

Each workflow must:

1. accept the authenticated customer identifier as trusted route context;
2. normalize and validate the idempotency key;
3. retrieve only records owned by that customer;
4. validate current lifecycle state in a workflow step;
5. make one mutation per step;
6. return explicit compensation input from each mutating step;
7. restore earlier state if a later step fails;
8. return only a serializable minimal projection; and
9. produce the same durable result on exact replay.

The implementation must use built-in Medusa workflow steps where applicable.
Custom steps must not duplicate built-in link, query, or event operations.

## Error and disclosure behavior

| Condition                                      | Required outcome |
| ---------------------------------------------- | ---------------- |
| No customer authentication                     | `401`             |
| Missing or invalid body                        | `400`             |
| Missing or invalid idempotency key             | `400`             |
| Missing customer-owned record                  | `404`             |
| Another customer's identifier is probed        | same `404` shape  |
| Stale or unsupported consent version           | `409`             |
| Invalid lifecycle transition                   | `409`             |
| Exact idempotent replay                        | original result   |
| Idempotency key reused with different input    | `409`             |
| Unexpected internal failure                    | generic `500`     |

Error responses must not disclose whether another customer owns a record,
database constraint names, internal IDs, tokens, configuration, or private
request content.

## Logging, caching, and telemetry

- Successful and failed responses use `private, no-store` caching.
- Private responses must never enter shared Next.js caches or public cache tags.
- Logs may contain an internal request or workflow identifier, operation name,
  coarse result, and error type.
- Logs must not contain customer profile bodies, consent tokens, idempotency
  keys, session data, bearer tokens, free text, or other customer private data.
- RT-2 events must not be forwarded to advertising, marketplace, or general
  behavioral-analytics systems.
- Rate limiting and abuse controls are activation gates even if they are not
  implemented in this slice.

## Test contract

### Source tests

- Body validators reject unknown keys, client-supplied ownership fields, false
  acknowledgements, unsupported locales, invalid timezones, and malformed
  idempotency keys.
- Route types use `AuthenticatedMedusaRequest`.
- Customer identifiers come only from authentication context.
- Mutation routes call workflows and never mutate through module services.
- Responses use the documented minimal projections and no-store headers.

### Workflow and module integration tests

- Profile creation atomically creates one profile and one consent event.
- Failure after profile creation compensates the profile creation.
- Exact creation replay produces no duplicate profile or consent event.
- Consent renewal appends an event and updates the current profile fields.
- Failure while updating consent restores the earlier profile state.
- Preference updates cannot alter consent or lifecycle state.
- Closure appends a withdrawal event and closes the profile atomically.
- Deletion request creation records prior profile state and changes status.
- Cancellation restores the recorded prior state only while request status is
  `requested`.
- Customer A cannot read or mutate Customer B's profile or privacy request.
- Cross-customer probes and missing identifiers have indistinguishable errors.
- Commerce customers, orders, payments, fulfillments, inventory, and products
  remain unchanged throughout every RT-2 workflow.

### Disposable-database verification

After source checks pass and the user explicitly authorizes it:

1. create a uniquely named empty local PostgreSQL database;
2. apply the full Medusa migration chain and RT-2 migration;
3. verify tables, indexes, enum checks, ownership relations, and uniqueness;
4. run authenticated ownership, idempotency, compensation, and lifecycle tests;
5. rerun migrations to prove idempotency;
6. rehearse generated down paths transactionally; and
7. delete the exact disposable database and verify its absence.

Generation, source checks, or disposable testing does not authorize Neon.

## Acceptance criteria

| ID      | Scenario                                      | Required outcome |
| ------- | --------------------------------------------- | ---------------- |
| RT2-001 | Logged-out request reaches any RT-2 endpoint  | `401`; no query or workflow runs |
| RT2-002 | Customer creates a profile with current notice | one profile and one consent event |
| RT2-003 | Customer retries exact profile creation       | original result; no duplicate |
| RT2-004 | Customer supplies `customer_id`               | `400`; field is rejected |
| RT2-005 | Customer A probes Customer B's record          | non-disclosing `404` |
| RT2-006 | Customer renews current consent                | one append-only event and updated profile |
| RT2-007 | Customer submits stale consent version         | `409`; profile remains unchanged |
| RT2-008 | Customer updates timezone                      | preference changes; consent does not |
| RT2-009 | Customer withdraws consent                     | event appended and profile closed |
| RT2-010 | Customer requests deletion                     | one request; profile becomes deletion requested |
| RT2-011 | Customer retries deletion request              | existing request; no duplicate |
| RT2-012 | Customer cancels a requested deletion          | prior profile state restored |
| RT2-013 | Customer cancels a processing request          | `409`; state unchanged |
| RT2-014 | Later workflow step fails                      | earlier mutations are compensated |
| RT2-015 | RT-2 workflow completes                       | commerce and marketplace data unchanged |

## Review decisions required before implementation

Implementation work on the RT-2 implementation branch must not begin until
review confirms:

1. the approved consent notice owner, version format, and SHA-256 digest source;
2. supported locale values, initially expected to include `en-PH`;
3. IANA timezone validation strategy;
4. idempotency-key syntax, retention, and conflict behavior;
5. deletion-request cancellation window and the authority that moves a request
   from `requested` to `processing`;
6. retention rules for consent events, privacy requests, closed profiles,
   backups, and application logs;
7. customer-facing wording explaining that deletion request submission is not
   completed deletion and does not erase required commerce records; and
8. whether a separate privacy review is required before even disposable
   authenticated API testing with synthetic customers.

## Completion boundary

RT-2 is complete only when the approved source implementation, generated but
unapplied migration, tests, lint, type checks, Medusa build, and explicitly
authorized disposable-database verification all pass.

RT-2 completion does not authorize storefront activation, production consent,
Neon migration, real customer data, Admin access, export processing, deletion
processing, deployment, or publication. Those remain separate reviewed actions.
