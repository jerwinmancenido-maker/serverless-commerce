# PepStack Manual QR Phase 5 Contract

Status: provider, proof domain, authenticated customer upload, and Admin review
interfaces are implemented in source and verified against disposable local
PostgreSQL. No payment method is enabled in any region, and no migration has
been applied to Neon or another shared database.

## Purpose

Phase 5 adds a configurable manual QR payment provider and a payment-proof
domain around Medusa's Payment Module. It does not create a parallel payment
ledger. Medusa continues to own payment collections, sessions, payments,
captures, refunds, order payment status, and region-level provider enablement.

The provider uses Medusa's deferred authorization state. Completing checkout
with Manual QR creates the order while its payment session remains
`pending_authorization`. A later staff approval will authorize and capture the
payment through Medusa workflows; proof rejection does not represent received
funds.

## Configuration contract

The provider has a stable technical identifier,
`pp_manual-qr_manual-qr`, so stored payment sessions remain resolvable. The
following customer-facing values are runtime configuration and must not be
hardcoded in the storefront:

- display name;
- payment instructions;
- QR image URL;
- proof-expiry period.

Payment-provider credentials, private account data, and reviewer permissions
must never be placed in payment-session `data`, because that data is visible to
the storefront. Registering the provider does not enable it for a region.

## Proof ownership

The `manualPayment` module owns proof workflow state and audit events. It stores
references to Medusa records but does not duplicate their financial fields.

One current proof record belongs to one Medusa payment session and records:

- Medusa payment-session, order, customer, and provider identifiers;
- a File Module identifier plus non-sensitive validation metadata;
- `pending`, `approved`, `rejected`, or `expired` status;
- revision, submission, review, and expiry metadata.

The custom proof tables store only the File Module identifier and validation
metadata, never the proof binary. The upload passes through Medusa's workflow
engine and File Module; production acceptance must confirm the selected
persistent File Module provider and workflow-execution retention policy do not
retain proof bytes beyond the intended storage boundary.

## Submission rules

- Customer authentication and order ownership are enforced by the Store API
  boundary before a proof is accepted or returned.
- Accepted foundation formats are PNG, JPEG, and PDF up to 10 MiB.
- Every file must have a lowercase SHA-256 checksum.
- A payment session may have only one current proof record.
- An identical replay while pending is idempotent.
- A different file cannot replace a pending proof.
- A rejected proof may be resubmitted and increments its revision.
- Approved and expired proofs cannot be replaced.

## Review rules

- Only authenticated staff with the custom payment-proof review permission may
  review proof. Super Admin access follows Medusa's wildcard policy; narrower
  roles require an explicit policy assignment at activation time.
- Only pending proof may transition to approved or rejected.
- Rejection requires a reason; approval must not store a rejection reason.
- Replaying the same completed decision is idempotent.
- A conflicting second decision is rejected.
- Every state-changing submission and review creates an immutable audit event
  with a complete non-binary snapshot.

Proof approval alone is not financial state. The complete Phase 5 review
workflow must also update the trusted payment-session review marker, ask the
Manual QR provider to authorize, and capture the resulting Medusa payment.
That orchestration is intentionally deferred from the provider/module
foundation so it can be integration-tested separately.

## Expiry and inventory boundary

The configured payment expiry begins when the deferred payment session is
created. A later scheduled workflow will expire unpaid proof/payment sessions,
cancel the unpaid order when allowed, and release Medusa inventory reservations
exactly once. The Manual QR module must not adjust BOM or inventory quantities
directly.

## Foundation scope

The implemented Phase 5 slices include:

- the configurable deferred Manual QR payment provider;
- the `manualPayment` proof and audit models;
- normalized submission and review contracts;
- compensating submission and review workflows;
- generated custom-module migration source;
- authenticated customer proof status and multipart upload Store APIs;
- private File Module upload with customer/order/payment-session validation;
- customer order-details proof status and upload UI;
- authenticated, policy-protected Admin list, detail, audit, file, and review
  APIs;
- an Admin payment-proof queue and review drawer;
- database-free unit tests, disposable-database integration tests, and source
  compilation.

It does not include scheduled expiry, payment authorization/capture
orchestration, persistent object-storage provider activation, region
enablement, shared-database migration, seed, deployment, or production
configuration.

## Acceptance tests

| ID     | Scenario                                     | Expected result                                   |
| ------ | -------------------------------------------- | ------------------------------------------------- |
| QR-001 | Checkout authorization before proof approval | Provider returns `pending_authorization`          |
| QR-002 | Provider receives approved trusted marker    | Provider returns `authorized`                     |
| QR-003 | Duplicate pending submission                 | No new revision or audit event                    |
| QR-004 | Different file while proof is pending        | Submission is rejected                            |
| QR-005 | Resubmit after rejection                     | Revision increments and status returns to pending |
| QR-006 | Reject without reason                        | Review is rejected                                |
| QR-007 | Replay identical review decision             | No duplicate audit event                          |
| QR-008 | Conflicting completed review                 | Review is rejected                                |
| QR-009 | Update an audit event                        | Module rejects the mutation                       |
| QR-010 | Custom proof table or source stores file bytes | Test and review fail                            |
| QR-011 | Provider registered but not region-enabled   | Storefront cannot select it                       |
| QR-012 | Foundation migration on disposable database  | Tables migrate once and second run is idempotent  |
| QR-013 | Customer uploads proof for another customer  | Generic not-found response; no proof is created   |
| QR-014 | Customer replays an identical pending upload | Existing proof returned; no file or event duplicate |
| QR-015 | Staff lacks proof-review policy               | Admin review request is forbidden                 |

## Runtime gates

Database-backed tests use a disposable or explicitly approved development
PostgreSQL database. Neon migration, region enablement, persistent object
storage, reviewer-policy assignment, Admin-user creation, authorization and
capture orchestration, and deployment each require separate explicit
authorization.
