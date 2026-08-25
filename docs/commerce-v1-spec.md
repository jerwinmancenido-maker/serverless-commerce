# PepStack Labs Commerce v1 Specification

Status: accepted product direction, implementation in progress.

This specification controls the local Medusa build. It does not authorize a
Neon migration, deployment, payment activation, shipping-provider connection,
marketplace connection, or publication of product data.

## Store identity

- Store name: PepStack Labs
- Tagline: Precision in Every Molecule
- Primary country: Philippines (`ph`)
- Store currency: Philippine peso (`php`)

## Accounts and checkout

- A customer account is required before storefront checkout.
- Authentication uses Medusa customer accounts.
- Storefront checkout must redirect unauthenticated customers to the account
  flow instead of completing a guest checkout.
- Marketplace-imported orders may not have a local customer account and will
  use a separate integration workflow later.

## Payments

- Payment behavior is implemented through Medusa payment providers.
- Administrators must be able to enable or disable providers without changing
  storefront code.
- The storefront must tolerate a newly enabled provider through a generic
  fallback presentation.
- The intended initial provider is manually reviewed QR payment.
- QR images, account details, instructions, proof storage, reviewer roles, and
  expiry periods are configuration or private operational data. They must not
  be committed to source control.
- `docs/manual-qr-phase-5-contract.md` defines the deferred-authorization,
  proof-submission, staff-review, audit, storage, and verification boundaries.
- Phase 5 customer upload and Admin review interfaces are implemented in
  source. Payment authorization/capture, persistent storage activation, region
  enablement, and shared-database migration remain separate runtime gates.
- `docs/manual-qr-phase-5b-settlement-contract.md` separates proof review from
  financial settlement and defines the authorization, capture, reconciliation,
  concurrency, compensation, and failure boundaries that must be implemented
  before Manual QR can be activated.
- Phase 5B Slice 1 settlement projection and audit models are implemented in
  source, with a generated migration that has not been applied to any database.

## Shipping and fulfillment

- Shipping options and prices are managed through Medusa fulfillment and
  shipping-option data.
- Administrators must be able to add, disable, reorder, or change available
  options without rebuilding the storefront.
- The intended initial carrier is J&T Express.
- Service levels, coverage, rates, parcel rules, tracking URLs, and future API
  credentials remain configuration data.

## Promotions and vouchers

- Medusa promotions are the source of truth for voucher codes.
- Fixed PHP discounts and percentage discounts are required.
- Minimum order value, maximum discount, validity periods, total usage limits,
  and per-customer limits are required.
- Exact launch codes and promotion rules will be entered later through Admin.

## Inventory and BOM

- Medusa owns sellable products, variants, inventory items, reservations, and
  stock movements.
- Medusa's native inventory-kit links associate a sellable variant with one or
  more component inventory items and their required quantities.
- Recipe and inventory quantities use positive integer base units. Version 1
  base units are micrograms, microliters, and pieces; decimal display units are
  converted before inventory operations.
- A custom BOM module will add unit metadata, validation, explanatory
  availability, and audit snapshots without creating a parallel stock ledger.
- Available sellable quantity is the lowest whole number of units supported by
  all recipe components.
- Checkout reserves recipe components transactionally.
- Confirmed payment retains the reservation and permits packing. Fulfillment
  consumes the reserved component stock through Medusa's inventory workflows.
- Cancellation or expiry releases reservations.
- The preserved Drizzle implementation is reference behavior only and must not
  remain a second runtime source of truth.
- `docs/bom-phase-1-contract.md` defines the quantity, recipe, availability,
  lifecycle, adjustment, and acceptance-test contract.
- `docs/bom-phase-2-native-foundation.md` defines the Medusa-native workflow,
  recipe immutability rule, and disposable-database verification gates.
- `docs/bom-phase-3-metadata-audit.md` defines component profiles, module links,
  recipe audit snapshots, and the generated custom-module migration boundary.
- `docs/bom-phase-4-admin-interfaces.md` defines the authenticated Admin API,
  component-profile editor, recipe-history viewer, and source-only verification
  boundary.

## Orders and printables

- Medusa orders are the canonical order records.
- Required printable documents are receipt, packing list, box label, and bottle
  label.
- Generated documents require persistent object storage before production.
- Printables must use immutable order, address, item, payment, and fulfillment
  snapshots appropriate to the document.

## Marketplaces

- Lazada, TikTok Shop, and Shopee remain deferred until the storefront,
  checkout, inventory, payment, fulfillment, and printing workflows pass.
- Each integration will have an external-SKU mapping module, signature adapter,
  webhook-event deduplication, and reconciliation workflow.
- Production credentials and callback contracts must be verified against the
  current official marketplace documentation before activation.

## Delivery order

1. Establish the Medusa monorepo and preserve the previous foundation.
2. Configure PHP region, sales channel, inventory location, and publishable key
   in an isolated development database.
3. Enforce customer-account-only storefront checkout.
4. Implement and test the BOM inventory module and workflows.
5. Implement Manual QR payment proof and review workflow.
6. Implement J&T as configurable fulfillment data, beginning manually.
7. Implement voucher rules and printable documents.
8. Complete the PepStack storefront and Admin extensions.
9. Integrate marketplaces one at a time.

## Milestone acceptance

- Medusa is the only active commerce engine.
- The backend builds and both applications pass source compilation from the
  monorepo. The full storefront build remains runtime-gated by a reachable
  Medusa API and publishable key.
- Store identity and the account-only rule are represented in source.
- Payment and shipping choices remain provider/data driven.
- Database or provider operations remain explicit, reviewed actions.
