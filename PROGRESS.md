# Progress Tracker: Medusa Admin & Customer Portal Hardening (v1)

## Phase 0: Safety Checkpoint & Rollback Setup
- [x] Clean baseline committed (`03b288e`)
- [x] Immutable checkpoint tag created: `checkpoint-medusa-baseline`
- [x] Feature branch active: `feat/medusa-human-hardening`
- [x] Rollback command ready: `git reset --hard checkpoint-medusa-baseline`

---

## Phase 1: Section 3 Usability & Clinical Laboratory Standard Hardening
- [ ] **Input Component Form Ergonomics**: Contextual placeholders, field-level error messages below inputs, red border highlighting (`apps/storefront/src/modules/common/components/input/index.tsx`)
- [ ] **Currency Decimal & Integrity**: Enforce standard thousands separator & 2 decimal places (`minimumFractionDigits: 2`, `maximumFractionDigits: 2`) in `apps/storefront/src/lib/util/money.ts` and `apps/storefront/src/modules/products/components/product-actions/index.tsx`
- [ ] **Monospace Telemetry**: Apply `font-mono tracking-tight font-extrabold` to:
  - Order numbers & amounts in `order-card/index.tsx`
  - Order details & status in `order-details/index.tsx`
  - Order summary line items in `order-summary/index.tsx`
  - Stepper tracking numbers in `fulfillment-stepper/index.tsx`
  - Cart totals in `cart-totals/index.tsx`
  - Product price in `product-price/index.tsx`
  - Line item price in `line-item-price/index.tsx`
- [ ] **Actionable Empty States**:
  - Address Book: Add dedicated empty state illustration, title ("No Saved Addresses Found"), explanation, and CTA ("Add Delivery Address →") in `address-book/index.tsx`
  - Order Overview: Title ("No Research Orders Found"), 1-sentence explanation, and CTA ("Browse Research Catalog →") in `order-overview/index.tsx`
- [ ] **Order Details Action Bar**: Printable "Download Invoice" action and "Re-order Items" CTA in `order-details-template.tsx`

---

## Phase 2: Workflow 1 — Storefront Customer Account & Research Cockpit
- [ ] Verify customer login with authenticated Store API session (`jerwin@example.com`)
- [ ] Verify profile inspection & address management (Add address, field validation, edit, database persistence)
- [ ] Verify order history, line items, thumbnails, status pills, tracking links, download invoice, re-order
- [ ] Verify single/multi-dosage selector: multi-dosage items switch titration matrices smoothly, single-dosage products lock gracefully to default vial mass

---

## Phase 3: Workflow 2 — End-to-End Checkout & Order Mutation
- [ ] Add in-stock compound (e.g. BPC-157 / MOTS-c) to cart
- [ ] Test real-time cart quantity adjustments (+ / - quantity, remove item), subtotal, shipping, and taxes
- [ ] Complete checkout: Contact Email -> Shipping Address -> Shipping Method -> Payment (Manual QR)
- [ ] Verify order confirmation summary page (`/order/<order_id>/confirmed`)
- [ ] Database assertion: Query PostgreSQL `order`, `order_line_item`, and `payment_collection` for new order

---

## Phase 4: Workflow 3 — Medusa Admin Order Fulfillment & Inventory Audit
- [ ] Ensure `admin@test.com` admin user is linked in PostgreSQL
- [ ] Log into Medusa Admin dashboard at `http://localhost:9000/app`
- [ ] Locate placed order in `/app/orders` and verify customer name, items, and financial totals
- [ ] Execute fulfillment: Create Fulfillment -> Mark as Shipped with J&T tracking number
- [ ] Assert status updates to "Fulfilled" / "Shipped" in Admin and propagates to Customer Portal
- [ ] Inspect product inventory in `/app/products`: verify stock decrement and test updating title/price in database

---

## Phase 5: Workflow 4 — Protocol Series & Custom Metadata Sync
- [ ] Verify custom protocol relationships in Medusa Admin product views
- [ ] Verify public visibility policy: unauthenticated visitors load monographs (`/ph/research-protocols/bpc-157`) and library (`/ph/research-library`) with HTTP 200

---

## Phase 6: Monorepo Quality Gate & Completion
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm run test` (backend: 84 suites, 543 tests) passes
- [ ] `cd apps/storefront && npm run test` (105 tests) passes
- [ ] Clean working tree with atomic commits
