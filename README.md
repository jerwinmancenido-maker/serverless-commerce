# Research Compounds Commerce

Research Compounds Commerce is a Medusa v2 monorepo with a Next.js storefront. The
storefront is designed for Vercel, while the Medusa backend and Admin run as a
persistent Node.js service.

## Active architecture

- `apps/backend` — Medusa v2 backend and Admin dashboard
- `apps/storefront` — Medusa Next.js starter storefront
- `docs` — accepted product and architecture specifications
- `legacy/next-drizzle-foundation` — preserved pre-Medusa implementation for
  reference while BOM and marketplace behavior are ported

Medusa owns products, variants, customers, carts, promotions, orders, payment
providers, fulfillment providers, and inventory. Payment providers and shipping
options are data-driven; Manual QR and J&T are intended initial configurations,
not hardcoded storefront choices.

## Current business decisions

- Brand: Research Compounds
- Market: Philippines
- Currency: PHP
- Customer account required before storefront checkout
- Vouchers and printable fulfillment documents required
- Marketplace integrations deferred until the core store is complete

See [docs/commerce-v1-spec.md](docs/commerce-v1-spec.md) and
[docs/architecture.md](docs/architecture.md) for the accepted boundaries.
The database-free BOM behavior is defined in
[docs/bom-phase-1-contract.md](docs/bom-phase-1-contract.md).
The native Medusa inventory-kit foundation is documented in
[docs/bom-phase-2-native-foundation.md](docs/bom-phase-2-native-foundation.md).
The custom metadata and immutable audit module is documented in
[docs/bom-phase-3-metadata-audit.md](docs/bom-phase-3-metadata-audit.md).
The Admin component-profile editor and recipe-history viewer are documented in
[docs/bom-phase-4-admin-interfaces.md](docs/bom-phase-4-admin-interfaces.md).

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 or lower for the storefront)
- npm 11
- PostgreSQL for a running Medusa backend
- Redis for production

## Install

```bash
npm ci
```

The scaffold was created with database setup skipped. Installing dependencies,
linting, and compiling source do not authorize or perform a Neon migration.

## Environment setup

Create local environment files only when a development database is ready:

```bash
cp apps/backend/.env.template apps/backend/.env
cp apps/storefront/.env.template apps/storefront/.env.local
```

Never commit either local environment file. The required variables and
deployment topology are documented in `docs/architecture.md`.

## Development commands

```bash
npm run backend:dev
npm run storefront:dev
```

The Medusa backend and Admin use `http://localhost:9000`; the storefront uses
`http://localhost:8000`.

## Verification

```bash
npm run check
```

This runs lint and TypeScript checks for both applications, plus the Medusa
backend build. A complete `npm run build` additionally requires a reachable
Medusa backend and publishable API key because the storefront fetches regions
and catalog data while collecting pages. Backend integration tests and runtime
verification require an isolated PostgreSQL database. Do not point those
commands at production.

## Database safety

No database migration, seed, user creation, deployment, or external provider
connection is part of repository setup. Those operations require a reviewed
environment and explicit authorization.
