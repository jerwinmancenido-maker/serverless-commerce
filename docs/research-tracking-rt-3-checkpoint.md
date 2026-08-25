# Research Tracking RT-3 Account Shell Checkpoint

Status: reconciled source checkpoint. RT-3 requires no additional application
source because its account navigation and customer empty-state shell were
introduced with the reviewed RT-2 customer-experience source at commit
`fdcd589` and are present at the RT-2 completion commit `b3c7b3a`.

This checkpoint does not authorize RT-4 implementation, migration activity,
Neon access, customer-data activation, deployment, or publication.

## Authority and scope

RT-0 remains authoritative for the Research & Tracking information
architecture, research-only language, privacy boundaries, and delivery order.
RT-2 remains authoritative for authentication, ownership, consent, lifecycle,
idempotency, private caching, and customer mutation behavior.

RT-3 owns only:

- the protected account navigation entry named **Research & Tracking**;
- the localized account page and its unavailable and empty-state shell;
- Medusa SDK access to the RT-2 customer endpoints;
- server-owned activation gating for the navigation and direct route; and
- clearly deferred previews that cannot collect or persist later-slice data.

RT-3 does not own purchased-item activation, supplies, routines, logs,
measurements, journals, protocols, product documents, or calculator behavior.

## Existing source reconciliation

| RT-3 requirement | Existing source | Disposition |
| --- | --- | --- |
| Protected account navigation | `apps/storefront/src/modules/account/components/account-nav/index.tsx` | PASS |
| Navigation hidden when server activation is unavailable | account layout configuration lookup and `researchTrackingAvailable` gate | PASS |
| Localized protected route | `apps/storefront/src/app/[countryCode]/(main)/account/research-tracking/page.tsx` | PASS |
| Direct route hidden when configuration is disabled | route-level `notFound()` gate | PASS |
| Honest runtime-unavailable state | `ResearchTracking` neutral unavailable card | PASS |
| Empty customer state | opt-in card when no research profile exists | PASS |
| Medusa SDK usage | `apps/storefront/src/lib/data/research-tracking.ts` uses `sdk.client.fetch` | PASS |
| No shared/public caching | all RT-2 customer reads use `cache: "no-store"` | PASS |
| Later areas remain non-interactive | planned workspace cards render descriptions only | PASS |
| Purchased-item activation | intentionally deferred to RT-4 | PASS |
| Browser acceptance suite | intentionally deferred to RT-8 | UNKNOWN |

The account surface also contains the reviewed RT-2 opt-in, preference,
consent, closure, and privacy-request controls. Those controls remain RT-2
behavior and are not reclassified as RT-3.

## Verification receipt

The RT-2 completion gate at `b3c7b3a` established the source inherited by this
checkpoint:

- backend unit tests: 120 passed;
- storefront contract tests: 10 passed;
- RT-2 database-backed HTTP tests: 6 passed;
- backend and storefront lint and type checks passed;
- Medusa backend and Admin build passed; and
- the exact disposable HTTP-test database and template were removed.

The storefront checks were also run directly without relying on Turbo's cached
result. No browser acceptance claim is made by this checkpoint.

## Completion boundary

RT-3 is complete as a source checkpoint when this reconciliation is reviewed
and committed. It creates no new model, workflow, API, migration, or runtime
activation requirement.

The next allowed slice is a separately reviewed RT-4 contract for
purchased-order-item activation and **My Products & Supplies**. RT-4 source
work must not begin from this checkpoint without explicit authorization.
