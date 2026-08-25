# Research Tracking RT-2 Decision Record

Status: source-implementation decisions for RT-2. These decisions authorize
local source work only. They do not approve a migration, database test,
storefront activation, real customer data, Neon, deployment, or production use.

This record applies to `docs/research-tracking-rt-2-contract.md` and the
`feat/rt-2-customer-ownership-api` source branch.

## Accepted source decisions

### Consent version and digest shape

- Consent versions use `YYYY-MM-DD.vN`, for example `2026-08-25.v1`.
- Notice digests are lowercase 64-character SHA-256 values.
- The active version and digest are server-owned workflow inputs that a future
  API layer must obtain from one validated configuration source.
- No production consent version, notice copy, or digest is approved here.

### Locale and timezone

- RT-2 supports `en-PH` only.
- New profiles default to `Asia/Manila` only when the client does not provide a
  timezone after the future API contract allows omission.
- Every stored timezone must be accepted by the JavaScript runtime's IANA
  timezone implementation. Fixed UTC offsets and arbitrary abbreviations are
  rejected.

### Idempotency keys

- Keys are trimmed strings from 8 through 128 characters.
- Allowed characters are ASCII letters, digits, period, underscore, colon, and
  hyphen.
- Consent events and privacy requests store the key plus a SHA-256 request
  fingerprint so reuse with different input is rejected.
- Cancellation keys are unique per profile when present so an old cancellation
  cannot replay against a later deletion request.
- Every future mutating API route must scope the Medusa workflow transaction
  identifier by authenticated customer, operation, and a one-way digest of the
  key. This is required for concurrent exact replays, including preference
  updates.
- Keys and request fingerprints are private operational fields and never appear
  in API responses or application logs.

### Deletion-request lifecycle

- Cancellation is permitted only while the request is `requested`.
- A nullable unique open-request key prevents concurrent non-terminal deletion
  requests for one profile.
- Each request records whether the profile was `active` or `closed` immediately
  before the request so cancellation restores a deterministic state.
- Only the future RT-8 privacy processor may move a request to `processing`,
  `completed`, or `rejected`.
- RT-2 records deletion requests but does not delete data.

### Customer ownership and workflow boundaries

- A future protected Store API route must derive `customerId` from
  `req.auth_context.actor_id`. A request body, query string, route parameter,
  cookie value, or profile identifier is never an ownership authority.
- Every profile lookup includes the authenticated `customer_id` in the module
  service filter. Consent and privacy records are resolved only after that
  owned profile has been found.
- Mutations run through six named Medusa workflows. Each step performs at most
  one persistent mutation, and every multi-step workflow restores or removes
  the preceding write if a later step fails.
- Responses use fixed projections. Internal IDs, customer IDs, idempotency
  keys, fingerprints, and relation fields remain private.
- Store API routes and storefront UI are deferred until this source-only model
  and workflow slice is reviewed.

### Synthetic verification

- Unit, type, lint, and build checks may run without a database.
- Migration generation and disposable-database tests remain separate explicit
  actions because both connect to PostgreSQL.
- Synthetic disposable testing does not authorize real customer data.

## Unresolved production gates

The following remain `UNKNOWN` and block production activation:

1. owner and approver of the customer privacy notice;
2. final notice copy, production version, and verified SHA-256 digest;
3. retention periods for profiles, consent events, privacy requests, workflow
   state, application logs, backups, and failed deletion work;
4. customer-facing deletion-request, cancellation, retention, and commerce-
   record wording;
5. production rate limits, abuse detection, and alert ownership;
6. verified encryption-at-rest behavior for the selected database and backups;
7. roles, procedures, audit evidence, and service-level target for the RT-8
   privacy processor;
8. legal and privacy review requirements for staging and production;
9. incident-response and customer-notification ownership for private RT data;
   and
10. a real Medusa publishable key and a successful credential-backed storefront
    production build.

No unresolved gate may be replaced with a placeholder in production.

## Source-only completion boundary

The current source slice may define models, contracts, pure validation, module
service registration, workflows, compensation behavior, and unit tests. It may
not add Store API routes or storefront UI until source review confirms that the
workflow inputs and outputs enforce the RT-2 contract.

Model changes require a newly generated migration before runtime use. Migration
generation, application, and disposable testing require their own explicit
authorization and evidence.

As of this source slice, no RT-2 migration has been generated or applied. No
RT-2 route, storefront UI, real customer record, or production consent notice
has been activated.
