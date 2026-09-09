# Progress Tracker: Medusa Admin & Customer Portal Hardening (v1)

## Phase 0: Safety Checkpoint & Rollback Setup
- [x] Clean baseline committed (`03b288e`)
- [x] Immutable checkpoint tag created: `checkpoint-medusa-baseline`
- [x] Feature branch active: `feat/medusa-human-hardening`
- [x] Rollback command ready: `git reset --hard checkpoint-medusa-baseline`

---

## Phase 1: Section 3 Usability & Clinical Laboratory Standard Hardening
- [x] **Input Component Form Ergonomics**: Contextual placeholders, field-level error messages below inputs, red border highlighting (`apps/storefront/src/modules/common/components/input/index.tsx`)
- [x] **Currency Decimal & Integrity**: Enforce standard thousands separator & 2 decimal places (`minimumFractionDigits: 2`, `maximumFractionDigits: 2`) in `apps/storefront/src/lib/util/money.ts` and `apps/storefront/src/modules/products/components/product-actions/index.tsx`
- [x] **Monospace Telemetry**: Apply `font-mono tracking-tight font-extrabold` to:
  - Order numbers & amounts in `order-card/index.tsx`
  - Order details & status in `order-details/index.tsx`
  - Order summary line items in `order-summary/index.tsx`
  - Stepper tracking numbers in `fulfillment-stepper/index.tsx`
  - Cart totals in `cart-totals/index.tsx`
  - Product price in `product-price/index.tsx`
  - Line item price in `line-item-price/index.tsx`
  - Line item unit price in `line-item-unit-price/index.tsx`
- [x] **Actionable Empty States**:
  - Address Book: Add dedicated empty state illustration, title ("No Saved Addresses Found"), explanation, and CTA ("Add Delivery Address →") in `address-book/index.tsx`
  - Order Overview: Title ("No Research Orders Found"), 1-sentence explanation, and CTA ("Browse Research Catalog →") in `order-overview/index.tsx`
- [x] **Order Details Action Bar**: Printable "Download Invoice" action and "Re-order Items" CTA in `order-details-template.tsx`

---

## Phase 2: Workflow 1 — Storefront Customer Account & Research Cockpit
- [x] Verify customer login with authenticated Store API session (`jerwin@example.com`)
- [x] Verify profile inspection & address management (Add address, field validation, edit, database persistence `cuaddr_01M21XEAV2BEBDAXK6SVJ4T14F`)
- [x] Verify order history, line items, thumbnails, status pills, tracking links, download invoice, re-order (Order #13 `order_01M1TKZFN965W7RNTZ7YRVRC92`)
- [x] Verify single/multi-dosage selector: multi-dosage items switch titration matrices smoothly, single-dosage products lock gracefully to default vial mass

---

## Phase 3: Workflow 2 — End-to-End Checkout & Order Mutation
- [x] Add in-stock compound (GHK-Cu 50MG / Vial Only `variant_01M1RR3WM732DQQHMY5NA2FSC1`) to cart
- [x] Test real-time cart quantity adjustments (+ / - quantity), subtotal doubled (₱720 -> ₱1,440 -> ₱720), shipping, and taxes
- [x] Complete checkout: Contact Email -> Shipping Address -> Shipping Method (J&T Express ₱150) -> Payment (Manual QR)
- [x] Verify order confirmation summary page (`/ph/order/order_01M21YFFAD15D512RKTH8XCZ78/confirmed`) with monospace telemetry `#15`, ₱870.00
- [x] Database assertion: Query PostgreSQL `order`, `order_item`, `order_line_item`, and `payment_collection` for new order #15

---

## Phase 4: Workflow 3 — Medusa Admin Order Fulfillment & Inventory Audit
- [x] Ensure `admin@test.com` admin user is linked in PostgreSQL (`usr_admin_test_01`)
- [x] Log into Medusa Admin dashboard via auth token (`admin@test.com` / `supersecret`)
- [x] Locate placed order #15 (`order_01M21YFFAD15D512RKTH8XCZ78`), verify Dr. Jerwin Mancenido, GHK-Cu, ₱870.00
- [x] Execute fulfillment: Create Fulfillment `ful_01M21YGSXHETA5XS629D6DJF3C` -> Mark as Shipped with J&T tracking number `JNT-PH-20260909-001`
- [x] Assert status updates to "shipped" in Admin and propagates to Customer Portal (`fulfillment_status: shipped`, tracking visible)
- [x] Inspect product inventory: verify stock decrement (100 -> 99 in `inventory_level`), test saving subtitle in database (`prod_01M1RR3WKPQQTXG5YEQ6W2SWDV`)

---

## Phase 5: Workflow 4 — Protocol Series & Custom Metadata Sync
- [x] Verify custom protocol relationships in Medusa Admin product views (`/admin/products/prod_01M1RR3WKPQQTXG5YEQ6W2SWDV/research-protocols`)
- [x] Verify public visibility policy: unauthenticated visitors load monographs (`/ph/research-protocols/bpc-157`, `ghk-cu`), catalog (`/ph/products/bpc-157`), and library (`/ph/research-library`) with HTTP 200 without 401/403 blocks

---

## Phase 6: Monorepo Quality Gate & Completion
- [x] `npm run typecheck` exits 0 across both backend and storefront workspaces
- [x] `npm run lint` exits 0 across both backend and storefront workspaces
- [x] `npm run test` (backend: 84 suites, 543 tests) passes
- [x] `cd apps/storefront && npm run test` (105 tests) passes
- [x] Clean working tree with atomic commits
