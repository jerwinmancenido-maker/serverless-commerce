# PepStack Manual QR Phase 5B Settlement Contract

Status: Slice 1 source complete. Settlement workflow logic, API and Admin
activation, migration application, provider activation, shared-database
mutation, and deployment remain unimplemented or unauthorized.

## Purpose

Phase 5B connects an authenticated staff decision about a Manual QR proof to
Medusa's financial workflows without treating proof state as payment state.
The proof module remains an operational review and audit domain. Medusa's
Payment Module remains the only source of truth for payment sessions, payments,
captures, refunds, payment collections, and order payment status.

The central rule is:

> A valid-looking proof is evidence for a settlement attempt. It is not proof
> that Medusa has authorized or captured a payment.

## Slice 1 implementation record

The `manualPayment` module now defines:

- one settlement projection per proof ID and proof revision;
- separate proof-review and settlement status fields;
- Medusa payment and capture identifiers as reconciliation hints only;
- sanitized failure categories instead of raw provider errors; and
- an immutable settlement-event stream keyed by proof revision, attempt ID,
  and event type.

`Migration20260825111859.ts` was generated for review. It has not been applied
to the disposable local database, Neon, or any other database.

## State separation

The Admin interface must display two independent states:

- **Proof review:** `pending`, `approved`, `rejected`, or `expired`.
- **Payment settlement:** `not_started`, `authorizing`, `authorized`,
  `capturing`, `captured`, or `failed`.

`approved` must not be presented as `paid`. An order is paid only when Medusa
contains the expected capture for the payment created from the proof's payment
session. The order's payment status must be derived from Medusa; the custom
module must not write a parallel paid flag.

The proof projection may record the Medusa payment identifier, settlement
status, last settlement error, attempt timestamps, and capture confirmation for
operator visibility and retry coordination. These fields are not a financial
ledger and must be reconciled against Medusa before every retry.

## Admin command boundary

Rejection and settlement are separate commands:

- `POST /admin/manual-payment-proofs/:id/review` rejects a pending proof and
  requires the existing review permission plus a reason.
- `POST /admin/manual-payment-proofs/:id/settle` accepts the proof evidence and
  attempts full authorization and capture. It requires a dedicated settlement
  permission.

The Admin action must be labeled **Approve and capture payment**, not merely
**Approve**. Before submission, the interface must explain that the command
will attempt a financial state transition. The response must return both proof
review state and Medusa payment/capture state.

## Settlement workflow

All settlement mutations run in one custom Medusa workflow. Routes and Admin UI
must not call module services or payment providers directly.

The workflow must:

1. Acquire a lock scoped to the proof and payment-session identifiers.
2. Retrieve the proof and current Medusa payment session, payment, captures,
   payment collection, and linked order.
3. Validate that the proof is current, pending, belongs to the Manual QR
   provider, and matches the linked order and payment session.
4. Reconcile any prior attempt from Medusa's actual payment and capture records.
5. Persist a settlement-attempt audit record without changing the proof to
   `approved`.
6. Set the trusted provider review marker to `approved` while preserving the
   rest of the payment-session data.
7. Reuse Medusa's pinned
   `authorizePaymentSessionForOrderWorkflow` when authorization is still
   required.
8. Require a non-null Medusa payment in `authorized` state before capture.
9. Reuse Medusa's pinned `capturePaymentWorkflow` for the full outstanding
   payment amount when no complete capture exists.
10. Re-query Medusa and confirm the expected capture and order transaction.
11. Only after that confirmation, transition the proof to `approved`, mark the
    settlement projection `captured`, and append immutable audit events.
12. Release the lock and return the proof, payment, capture, and order payment
    states.

The implementation must reuse built-in Medusa workflows as nested workflow
steps. It must not reproduce Payment Module authorization, capture, or order
transaction behavior in the custom proof module.

## Failure and compensation rules

Payment capture is an external financial boundary and must never be
automatically compensated with a cancellation or refund.

- A validation failure makes no state change.
- A failure before authorization may restore the previous provider marker and
  settlement projection through ordinary workflow compensation.
- If authorization succeeds but capture fails, the proof remains pending, the
  authorized Medusa payment remains intact, and the settlement projection is
  recorded as `failed` with a sanitized operator-facing error.
- If capture succeeds but a later custom projection or audit write fails, the
  payment remains captured. A retry must reconcile Medusa and finalize the
  proof without capturing again.
- Provider or internal error details must not be returned to customers or
  stored with credentials, private account data, stack traces, or request
  secrets.

An operator must use an explicit refund workflow for a captured payment that
needs reversal. Phase 5B must never infer or trigger a refund as compensation.

## Idempotency and concurrency

- Settlement is serialized per payment session using Medusa's locking module.
- Two concurrent settlement requests may produce at most one authorization,
  one full capture, one order transaction per capture, and one terminal proof
  approval event.
- Replaying settlement after a complete capture returns the existing terminal
  result without contacting the provider again.
- Retrying after authorization reuses the existing payment and attempts only
  the missing capture.
- Retrying after capture but before proof finalization reconciles the capture
  and finishes the projection/audit writes.
- Rejection cannot race with, overwrite, or follow a started or completed
  settlement attempt.
- A different proof revision cannot inherit another revision's settlement
  attempt.

Idempotency decisions must use Medusa payment and capture records as the
authority. Custom settlement fields alone are insufficient proof of a
financial operation.

## Rejection behavior

Rejecting a pending proof records the reason and immutable audit event but does
not authorize, capture, cancel, refund, expire, or otherwise mutate Medusa
payment state. A rejected proof may be resubmitted under the existing Phase 5
revision rules.

Once settlement has started, rejection is blocked until the workflow reaches a
known reconciled state. A captured proof cannot be rejected; financial reversal
requires a separately authorized refund operation.

## Inventory boundary

Phase 5B does not change BOM quantities or reservations directly. Successful
capture permits later packing and fulfillment according to the commerce
contract. Rejection leaves the unpaid order and its current reservations
unchanged. Expiring unpaid orders and releasing reservations belong to the
separate Phase 5C expiry workflow.

## Audit requirements

The immutable proof audit stream must distinguish at least:

- settlement requested;
- authorization confirmed;
- capture confirmed;
- settlement failed;
- proof approved after capture.

Each event records proof ID, proof revision, payment-session ID, order ID,
acting Admin ID, Medusa payment/capture identifiers when available, sanitized
reason or error category, and occurrence time. Audit events must not contain
proof bytes, QR account secrets, credentials, authorization headers, cookies,
or stack traces.

## Acceptance tests

| ID      | Scenario                                        | Expected result                                                 |
| ------- | ----------------------------------------------- | --------------------------------------------------------------- |
| QRB-001 | Reject a pending proof                          | Proof rejected; no payment mutation                             |
| QRB-002 | Settle a valid pending proof                    | One authorization, one full capture, proof approved afterward   |
| QRB-003 | Authorization remains pending                   | No capture; proof remains pending; settlement not reported paid |
| QRB-004 | Authorization fails                             | No capture; safe retry state and sanitized failure audit        |
| QRB-005 | Capture fails after authorization               | Authorized payment retained; proof pending; retry captures once |
| QRB-006 | Retry after successful capture                  | Existing result returned; provider is not called again          |
| QRB-007 | Capture succeeds before projection failure      | Retry reconciles and finalizes proof without another capture    |
| QRB-008 | Two concurrent settlement commands              | At most one authorization and one capture                       |
| QRB-009 | Settlement races with rejection                 | Lock permits one valid transition; conflicting command fails    |
| QRB-010 | Different proof revision retries old settlement | Request rejected; no payment mutation                           |
| QRB-011 | Staff lacks settlement permission               | Request forbidden before workflow execution                     |
| QRB-012 | Approval UI renders proof as paid prematurely   | UI test fails                                                   |
| QRB-013 | Successful capture changes BOM directly         | Test and review fail                                            |
| QRB-014 | Workflow failure triggers automatic refund      | Test and review fail                                            |
| QRB-015 | Disposable database migration is applied twice  | First run migrates; second run is idempotent                    |

Integration tests must cover the failure boundaries by using an isolated test
provider or controlled provider responses. Source-only mocks are insufficient
evidence for payment collection, payment, capture, order transaction, and
locking behavior.

## Implementation slices

1. **Complete in source:** add settlement projection/audit contracts and
   generate the reviewed module migration without applying it.
2. Implement reconciliation, provider-marker, and audit workflow steps with
   explicit compensation inputs.
3. Compose the settlement workflow from custom validation/reconciliation steps
   and Medusa's built-in authorization and capture workflows.
4. Split rejection from settlement APIs and add the dedicated settlement RBAC
   policy.
5. Update Admin terminology and show separate proof and payment states.
6. Add unit, concurrency, failure-injection, and disposable-PostgreSQL
   integration tests.
7. Perform a local browser acceptance test before any provider or Neon
   activation.

## Runtime gates

Implementation requires a separately reviewed migration and an explicitly
authorized disposable database test. Neon migration, Manual QR region
enablement, persistent File Module activation, reviewer/settler role
assignment, real payment acceptance, refund testing, and deployment remain
separate explicit actions.
