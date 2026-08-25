# Research Tracking RT-2 Customer Experience Addendum

Status: source-only implementation addendum. This addendum records the direct
authorization to implement the authenticated RT-2 Store API and its first
customer account surface. It does not authorize migration generation,
migration application, database testing, pushing, deployment, customer-data
collection, or production activation.

## Relationship to earlier contracts

- RT-0 remains authoritative for the **Research & Tracking** name, research-only
  language, domain separation, privacy gates, and deferred measurements,
  journals, routines, purchased-item activation, protocols, and calculator.
- The RT-2 ownership and API contract remains authoritative for endpoint,
  authentication, ownership, lifecycle, idempotency, projection, caching, and
  error behavior.
- This addendum supersedes only the earlier statement that Store API routes and
  storefront UI were deferred. It does not relax any privacy or production
  gate.

## Source scope

The source implementation may add:

- the authenticated Store API routes already specified by RT-2;
- one protected account entry point named **Research & Tracking**;
- opt-in, preferences, consent renewal, closure, deletion-request, and
  cancellation controls backed by those routes;
- honest unavailable, empty, active, closed, and deletion-requested states;
- preview cards for later RT slices that do not collect or persist deferred
  data; and
- a server-owned activation configuration with an approved notice URL,
  version, and SHA-256 digest;
- stable per-form idempotency keys that are reused for an ambiguous storefront
  retry and rotated after a refreshed account render; and
- a durable preference-mutation replay record so exact retries return the
  original projection and conflicting key reuse is rejected.

The implementation must not enable opt-in unless all server-owned activation
configuration is present. The storefront receives the active version and
notice URL but never the notice digest. No production notice content is added
by this source slice.

## Runtime boundary

The new customer API depends on the unapplied RT-2 model changes. Until a
separately authorized migration and disposable-database verification succeed,
the implementation is source-only and must not be represented as runnable or
production-ready. The account shell may compile, but production activation
remains blocked by the unresolved gates in the RT-2 decision record.

The preference-mutation replay record is a new source model. Its required
database migration remains intentionally ungenerated and unapplied until a
separate authorization is granted. When customer access is disabled, account
navigation and direct placeholder access remain hidden. Unexpected API,
authentication, or database failures must use a neutral unavailable state and
must not claim that customer data does or does not exist.
