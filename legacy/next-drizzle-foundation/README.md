# Serverless Commerce Core

A superseded Next.js App Router backend and starter storefront for **Research Compounds**. It targets Vercel, Neon Serverless PostgreSQL, Drizzle ORM, Tailwind CSS, and TypeScript. Monetary records default to Philippine pesos (PHP).

## Included

- Products and sellable variants
- Raw warehouse inventory and multi-component BOM recipes
- Orders and idempotent order lines
- Lazada, TikTok Shop, and Shopee SKU mappings
- Webhook event audit/deduplication records
- Atomic BOM deductions with row locks and derived available stock
- Raw-body HMAC-SHA256 webhook authentication
- Provider-neutral customer accounts and Philippine shipping addresses
- Configurable payment and shipping methods (Manual QR and J&T are initial data choices, not hardcoded options)
- Carts, vouchers, payment review, shipments, printable documents, inventory reservations, and movement history

The accepted v1 business contract and pending decisions are documented in `docs/commerce-v1-spec.md`.

## Local setup

Requirements: Node.js 20.9 or newer and a Neon PostgreSQL database.

```bash
npm install
cp .env.example .env.local
```

Fill in `DATABASE_URL` and the three webhook secrets in `.env.local`. Marketplace API keys are placeholders for later outbound API work and are not required for inbound webhook verification.

Generate a migration without connecting to Neon:

```bash
npm run db:generate
```

Review the SQL in `drizzle/`, then apply it only when you intend to change the configured database:

```bash
npm run db:migrate
```

For local development:

```bash
npm run dev
```

## Inventory service

`deductRecipeInventory(variantId, quantity)` in `src/lib/inventory/service.ts`:

1. starts a database transaction;
2. locks every raw inventory row used by the variant, in stable ID order;
3. validates all component balances before changing any row;
4. deducts exact decimal component quantities; and
5. returns the variant's new available stock as `floor(min(on_hand / required))`.

Any missing recipe, insufficient component, or database error rolls back the entire deduction.

## Webhooks

Endpoints:

- `POST /api/webhooks/lazada`
- `POST /api/webhooks/tiktok`
- `POST /api/webhooks/shopee`

Each handler reads the body once with `request.text()`, verifies the HMAC over those exact UTF-8 bytes, then parses JSON. Accepted signature headers are documented in `src/lib/webhooks/route.ts`; signatures may be plain hex or prefixed with `sha256=`.

The normalizer accepts a common payload shape as well as common marketplace field names:

```json
{
  "event_id": "evt_123",
  "event_type": "order.paid",
  "order": { "id": "order_456" },
  "items": [
    {
      "line_id": "line_1",
      "external_sku": "MARKETPLACE-SKU",
      "quantity": 2,
      "unit_price_in_cents": 129900
    }
  ]
}
```

Before sending a webhook, create a `marketplace_sku_mappings` row for every external SKU. Order lines are unique per marketplace order, so retries and later events cannot deduct the same line twice. Webhook IDs are also deduplicated.

> Production note: marketplace signature envelopes and payload contracts can vary by app type and API version. This project implements the requested raw-body HMAC-SHA256 contract. Confirm each production app's current official webhook documentation and adjust the signature adapter/header list before enabling live callbacks.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

No migration, database seed, deployment, or external marketplace operation runs as part of these checks.
