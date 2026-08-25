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
  PepStack BOM module owns unit metadata, validation, explanatory availability,
  and audit snapshots. It does not own a parallel inventory ledger.
- Later PepStack custom modules may own marketplace mapping.
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
