# Architecture and Environment Boundaries

## Runtime topology

```text
Customer
  -> Next.js storefront on Vercel
  -> Medusa store API on persistent Node.js hosting
  -> Neon PostgreSQL
  -> Redis

Staff
  -> Medusa Admin served by the Medusa backend
```

The Medusa backend is not a Vercel serverless function. Production requires a
long-running server process and background-worker capability. The intended
zero-cost evaluation topology is Vercel Free, Neon Free, Upstash Redis Free,
and an Oracle Cloud Always Free VM. This is an evaluation topology, not a claim
of production reliability.

## Repository ownership

- Medusa core modules own standard commerce entities and workflows.
- Medusa's native inventory-kit links are the operational BOM recipe and the
  custom BOM module owns unit metadata, validation, explanatory availability,
  and audit snapshots. It does not own a parallel inventory ledger.
- Later custom modules may own marketplace mapping.
- The `researchContent` module owns versioned, published, product-linked
  research protocols, calculator material profiles, and evidence scope. It
  must link to Medusa products or variants without duplicating them.
- The `researchTracking` module owns private, customer-created tracking
  records. It must not duplicate customer, product, order, payment,
  fulfillment, or commerce-inventory ownership.
- `researchContent` publication permission and private `researchTracking`
  access are separate security domains.
- `researchContent` also owns moderated protocol community comments. Customer
  submissions enter a pending state; Admin moderation is required before the
  Store API exposes them, and comments never become protocol revision content.
- `researchContent` enforces field-level public/member/purchaser/Admin
  projections. Public protocol APIs never return the complete published JSON by
  default, and protected community responses use private aliases.
- The separate `customerSupport` module owns private customer-to-staff
  conversations, customer-visible messages, staff-only notes, assignments,
  attachments, and status audit events. Support records never share a table or
  API response with protocol community or Research Hub private records.
- `docs/research-protocol-access-contract.md` defines the canonical access,
  community, and support boundaries.
- The storefront consumes the Medusa Store API through the official JS SDK.
- The preserved Drizzle code is read-only migration reference and is excluded
  from the npm workspace.

## Required environment variables

Backend:

- `DATABASE_URL`
- `REDIS_URL` for production infrastructure modules
- `STORE_CORS`
- `ADMIN_CORS`
- `AUTH_CORS`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `MEDUSA_WORKER_MODE` when server and worker are deployed separately

Storefront:

- `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_DEFAULT_REGION=ph`
- `NEXT_PUBLIC_BASE_URL`

Production will additionally need persistent object-storage and email-provider
configuration. Provider credentials must remain outside Git.

## Environment progression

1. Source-only scaffold and compile checks.
2. Disposable or isolated local PostgreSQL runtime.
3. Reviewed Neon development branch migration.
4. Public test backend and Vercel preview.
5. Production only after backups, object storage, monitoring, and credential
   handling are verified.

## Prohibited shortcuts

- Do not recreate Medusa products, carts, customers, promotions, orders,
  payments, fulfillment, or inventory as parallel Drizzle tables.
- Do not hardcode Manual QR, J&T, voucher codes, rates, or credentials in the
  storefront.
- Do not store uploaded files on an ephemeral application filesystem.
- Do not run migrations or seeds against an unreviewed database URL.
- Do not duplicate Medusa inventory-kit links, reservations, inventory levels,
  or fulfillment movements in custom BOM tables.
- Do not store private research-tracking data in customer, product, order, or
  analytics metadata.
- Do not create private tracking records automatically from purchases,
  fulfillment events, marketplace imports, or protocol views.
- Do not expose customer tracking records through public, product, cart, or
  marketplace API routes.
- Do not persist calculator inputs or outputs by default, or convert calculator
  results into routines, logs, carts, or orders. Published protocol calculator
  configuration remains part of the immutable research-content revision.
- Do not expose full protocol content or community identities through a public
  Store API response.
- Do not attach Journal, routine, measurement, reminder, timeline, or saved
  calculator data to customer support automatically.
- Do not use community threads as private customer support conversations.
