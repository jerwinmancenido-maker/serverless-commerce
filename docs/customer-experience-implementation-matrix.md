# Customer experience implementation matrix

Baseline recorded on 2026-08-31 for `feat/research-protocol-admin` at `c04d098`.

| Capability | Current source | Implementation action |
|---|---|---|
| Versioned protocols and Admin publishing | Research Content module | Reuse |
| Product and variant protocol links | Research Content module | Reuse |
| Order revision binding and opaque QR | Research Content module | Reuse and add entitlement repair |
| Customer protocol entitlement | Research Tracking module | Reuse and reconcile |
| Routines and occurrence adjustments | Research Tracking module | Reuse; redesign customer routes |
| Measurements and graph queries | Research Tracking module | Reuse; remove component consent UI |
| Journal and revisions | Research Tracking module | Reuse; remove component consent UI |
| Timeline and replenishment | Research Tracking module | Reuse; split into Research Hub destinations |
| Protocol recommendations | Research Content module | Reuse with existing privacy boundary |
| Consolidated agreement | Missing | Add immutable agreement bundles and acceptances |
| Account navigation | Legacy Medusa starter navigation | Replace with task-oriented account navigation |
| Rewards | Missing | Add configurable rules, immutable ledger, and redemption records |

## Local implementation status

Implemented and verified locally on 2026-08-31:

- Consolidated agreement bundles, immutable customer acceptances, Admin editor,
  signup acceptance and one-time existing-customer setup.
- Task-oriented account navigation, Profile & Settings ownership of addresses,
  Research Hub destinations, Rewards, and Privacy & Data.
- Configurable reward programs and rules, idempotent onboarding and ongoing
  awards, payment-capture purchase awards, cumulative refund reversals, audited
  adjustments, balances and redemption records.
- Order protocol delivery visibility and repair, existing exact-revision QR and
  customer entitlement flow, routines, progress, Journal, timeline,
  replenishment and Admin-curated recommendations.
- Private Research Hub JSON export without copying Journal text or measurement
  values into rewards or merchant summaries.

Founder content gate:

- Signup remains unavailable until a real agreement bundle is published with
  the authoritative Terms, Privacy Policy and Research Hub URLs, versions and
  SHA-256 document digests. No placeholder policy content is created.

Rewards redemption creates a customer-limited, single-use native Medusa cart
promotion, applies it to the authenticated customer's current cart, and records
the applied redemption and ledger debit together. Failed application removes
the temporary promotion before returning an error.

## Runtime boundary

- Native Medusa remains authoritative for customers, addresses, products, orders,
  payments, promotions, and inventory.
- Private Journal content and measurement values are never copied into rewards or
  merchant-facing summaries.
- Existing component-level consent events remain immutable audit history.
- New database changes are additive. Production and Neon execution are outside
  this implementation gate.
- `apps/backend/static/` is generated runtime output and is excluded from source
  checkpoints.

## Daily Research Hub implementation

Implemented locally in the current worktree:

- Today, month/week/day/agenda calendar views, compact occurrence controls,
  routine-derived scheduling, and explicit complete/skip/reschedule/restore
  behavior. Calendar actions do not mutate Medusa warehouse inventory.
- Customer reminder preferences, quiet hours, multiple lead times, timezone,
  in-app notification inbox, snooze/read/dismiss operations, idempotent reminder
  scheduling, and privacy-limited Admin delivery operations. Email and push
  remain visibly disabled until providers are configured.
- Quick, exact-protocol-revision, and comparison calculator modes with explicit
  mass, volume, target-unit, IU-conversion, delivery-device, and rounding
  context. Calculations persist only when the customer explicitly saves them
  and can be attached to a routine or Journal entry.
- Personal goals, derived confirmed-activity streaks, Admin-configured badges,
  idempotent reward awards, configurable referral rules, referral qualification
  waiting periods, and refund reversals.
- Private Journal image/PDF attachments, protected access, removal, operational
  metadata, date-range progress comparisons, target lines, event markers, and
  CSV export. Malware-scanning status remains `unavailable` until a provider is
  configured; the UI does not imply that files were scanned.
- Customer supply projections, configurable Admin reorder thresholds, reminder
  snoozing/dismissal, exact-variant cart addition, and contextual Admin-curated
  recommendation placements.
- Privacy-limited customer status, protocol, order-entitlement, Research Hub,
  rewards, referral, replenishment, and recommendation controls in Admin.

Intentionally deferred boundaries:

- External email, browser-push, and mobile-push providers.
- External calendar synchronization and `.ics` export.
- Production malware scanning and physical object deletion by a configured file
  provider; removal immediately revokes customer access and retains auditable
  metadata locally.
- Hosted database migration, deployment, production activation, push, and merge.

## Local verification on 2026-09-01

- Generated and applied `researchTracking` and `rewards` module migrations to
  the local disposable PostgreSQL database.
- Lint: backend and storefront passed with zero issues.
- TypeScript: backend and storefront passed.
- Tests: 70 backend suites / 453 tests and 36 storefront tests passed.
- Builds: backend and storefront production builds passed using the existing
  local publishable key.
- Restart: local Medusa on port 9000 and storefront on port 8000 are running.
- HTTP route checks passed for Admin Research Hub/Rewards and confirmed that
  signed-out customer Research Hub destinations redirect to Account without a
  server error.
- Authenticated visual acceptance remains a separate gate because the VS Code
  built-in Browser was not attached to the current chat session.
