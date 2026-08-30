# Unified Inventory and BOM UX Contract

**Status:** Approved for local source implementation after Phase 0 discovery

**Date:** 2026-08-30

**Scope:** Medusa Admin information architecture and merchant workflows

**Implementation state:** Phase 0 discovery and Phase 1/2 local source implementation complete; exact-route VS Code built-in browser acceptance remains pending

## 0. Phase 0 installed-version evidence

Discovery was performed against the installed project source rather than an assumed Medusa version.

| Evidence | Verified finding | Contract consequence |
| --- | --- | --- |
| `@medusajs/medusa`, framework, Admin SDK, JS SDK, and Dashboard `2.19.0`; `@medusajs/ui` `4.2.1` | The project is consistently on Medusa v2.19.0 for the relevant Admin and backend packages. | Implementation must use the verified v2 APIs and extension zones below. |
| Installed Dashboard Inventory list source | `inventory_item.list` is a supported widget zone. | Inventory can expose a compact Buildable products entry point without replacing the native list. |
| Installed Dashboard Inventory detail source | `inventory_item.details` is a supported widget zone and uses a two-column layout composer. | Component and receiving configuration can be added contextually to the native item detail. Exact widget ordering is not guaranteed and must remain compatible with Admin layout editing. |
| Native Inventory item detail | Medusa already provides General, Location levels, Reservations, Associated variants, and Attributes sections. | The consolidation must preserve these sections and must not duplicate the generic Associated variants list. |
| Current `/app/bom` page | It combines component-profile configuration with a location-aware recipe-availability report. | Those two capabilities are relocated separately: configuration to Inventory item detail and reporting to Buildable products. |
| Current BOM models and availability service | BOM stores profiles and immutable recipe snapshots; stock is read from native Inventory as stocked minus reserved. | No stock data migration or second inventory model is required. |
| Current Add Product and product-readiness surfaces | Recipe editing, completeness, calculated stock, limiting components, and audit history already exist in product context. | The consolidation reuses these engines and aligns links and terminology instead of rebuilding recipe ownership. |

### 0.1 Approved relocation map

| Current capability | Approved destination | Implementation action |
| --- | --- | --- |
| `/app/bom` component-profile table and drawer | Native Inventory item detail | Add a `Component and receiving` widget in `inventory_item.details`; retain the existing profile workflow and native inventory item identifier. |
| `/app/bom` Recipe availability table | `/app/buildable-products` | Create a custom read-only report route with no sidebar route configuration; link it from an `inventory_item.list` widget. The top-level path avoids collision with the native `/app/inventory/:id` route. |
| Recipe-history drawer opened from the BOM table | Product detail/readiness context, with a compatible report link where useful | Keep recipe editing and audit history product-owned; do not create stock controls in the report. |
| Native Inventory Associated variants | Native Inventory item detail | Preserve it unchanged. Add only supplemental BOM usage information that native Medusa does not show, such as required quantity and recipe status. |
| `/app/bom` bookmark | `/app/buildable-products` | Retain a deterministic compatibility redirect after relocated capabilities pass browser acceptance. |

### 0.2 Phase 0 disposition

- **PASS — ownership:** native Medusa Inventory is already the only physical stock ledger.
- **PASS — extension support:** `inventory_item.list` and `inventory_item.details` are verified in the installed Dashboard source.
- **PASS — calculation source:** calculated availability already reads native location inventory and reservations.
- **FIX — navigation:** the standalone BOM Inventory entry duplicates the merchant mental model and must be removed only after parity is verified.
- **FIX — read scalability:** the current component-profile list endpoint is unbounded and needs item-specific and paginated reads for the contextual UI.
- **FIX — relationship display:** BOM-specific usage needs a focused read contract; the native Associated variants section must not be reimplemented.
- **APPROVED:** the information architecture, ownership boundary, relocation map, and phased implementation sequence in this contract are approved for local source implementation.
- **NOT INCLUDED:** migration generation/application, database access, commit, push, deployment, hosted-provider work, and production activation.

## 1. Purpose

This contract defines one understandable merchant experience for physical inventory and bill-of-materials (BOM) recipes.

The current Admin exposes both Medusa's native **Inventory** area and a custom **BOM Inventory** sidebar page. Although they do not represent two physical stock ledgers, their overlapping inventory-item lists make them appear to be separate inventory systems.

The unified experience must make this distinction explicit:

- **Inventory** answers: “What physical items do we have, where are they, and how many are available?”
- **BOM recipes** answer: “Which physical inventory items does a sellable variant consume?”
- **Calculated stock** answers: “How many units of this variant can we assemble from the available shared components?”

## 2. Binding product decisions

1. Medusa native Inventory is the only physical stock ledger.
2. The Admin will expose one merchant-facing Inventory navigation entry.
3. BOM is configuration and derived availability, not a second inventory.
4. Existing BOM component profiles and immutable recipe snapshots remain authoritative for their current responsibilities.
5. BOM configuration is surfaced contextually inside Inventory and Product workflows.
6. A secondary **Buildable products** report may exist, but it must be reached from Inventory and must not be presented as another inventory ledger.
7. The same inventory item is shared by every recipe that consumes it. It must never be copied per product or variant.
8. The initial merchant operation uses one shared stock location, while query and UI contracts remain location-aware for future locations.
9. Product names, presentations, inclusion names, component names, units, supplier conversions, and recipe quantities remain configurable. No peptide, kit, or recipe is hardcoded.

## 3. Data ownership boundary

### 3.1 Medusa native Inventory owns

- Inventory item identity and SKU
- Stock locations
- Stocked quantity
- Reserved quantity
- Available quantity at a location
- Inventory levels and adjustments
- Native product-variant inventory links
- Reservation and fulfillment effects on physical stock

### 3.2 BOM module owns

- Component classification attached to a native inventory item
- Inventory and display units
- Supplier receiving unit and conversion into the inventory unit
- Reorder threshold
- Lot- and expiry-tracking requirements
- Variant recipe definitions
- Immutable recipe audit snapshots
- Recipe completeness and validation results
- Derived component capacity, calculated stock, and limiting component

### 3.3 BOM module must not own

- A second stock-on-hand value
- A second reserved quantity
- A second stock location ledger
- Per-variant copies of a shared component's stock
- A manually maintained calculated-stock value

The BOM module references native Inventory identifiers. Cross-module reads and links must use supported Medusa module-link and query mechanisms rather than direct cross-module SQL joins.

## 4. Merchant terminology

The interface must use these terms consistently:

| Term | Definition |
| --- | --- |
| **Stocked** | Physical quantity recorded at the selected stock location. |
| **Reserved** | Quantity committed to open commerce operations but not yet consumed. |
| **Available** | `stocked - reserved`, using Medusa's native location-aware inventory values. |
| **Required** | Quantity of one component consumed by one sellable variant. |
| **Component capacity** | `floor(available component quantity / required quantity)`. |
| **Calculated stock** | Lowest component capacity across the variant's complete resolved recipe. |
| **Limiting item** | Component that determines the calculated stock. |
| **Recipe incomplete** | A variant lacks a valid, resolved recipe and therefore has no trustworthy calculated stock. |

“Calculated stock” must never be labeled simply “Stock” where a merchant could confuse it with the physical ledger.

## 5. Navigation and information architecture

### 5.1 Sidebar

The final Admin sidebar contains one inventory-related entry:

```text
Inventory
```

The standalone `BOM Inventory` sidebar entry is removed after its useful functions have been relocated and verified.

### 5.2 Inventory surfaces

The unified experience uses three contextual surfaces:

1. **Inventory list** — browse and search all physical inventory items.
2. **Inventory item detail** — manage physical levels and the item's BOM/receiving configuration.
3. **Buildable products report** — inspect variant recipe completeness and calculated availability at a selected location.

The report is a secondary view linked from Inventory. It is not labeled Inventory and does not offer physical stock adjustments.

### 5.3 Product surfaces

- **Add Product** maps generated variants to shared native inventory items through their recipes.
- **Product detail** shows each variant's resolved recipe, calculated stock, limiting item, and recipe history.
- Physical stock adjustments link back to the relevant native Inventory item rather than creating stock controls inside the product recipe editor.

## 6. Screen contracts

### 6.1 Native Inventory list

The native list remains the primary physical-inventory screen. The verified `inventory_item.list` extension zone exposes a compact entry point to **Buildable products** and may show a concise component-profile summary or filter entry point.

The list must not be replaced merely to rename or restyle native functionality. The widget must remain compact and must not recreate the inventory table.

Required behavior:

- Search and native pagination continue to work.
- Physical counts remain native Medusa values.
- Loading, empty, and error states are distinct.
- Selecting an item opens its native Inventory detail page.

### 6.2 Inventory item detail: Component and receiving card

A contextual Admin widget titled **Component and receiving** shows BOM configuration for the current native inventory item.

Display state includes:

- Classification: finished product/vial, included supply, or packaging under the current controlled classification set
- Inventory unit
- Display unit and precision
- Supplier unit
- Receiving conversion, such as `1 box = 100 pieces`
- Reorder threshold in inventory units
- Lot-tracking requirement
- Expiry-tracking requirement
- Number of active recipes that use the item

The edit action opens a focused form. It edits configuration only and does not adjust stock.

Validation requirements:

- Conversion quantities must be positive and compatible with the inventory unit.
- Unit conversion must use the shared authoritative quantity helper.
- Unknown or unsupported conversion contexts must fail visibly rather than being guessed.
- Saving must invalidate both the detail configuration query and affected availability/report queries.

### 6.3 Inventory item detail: BOM usage supplement

Medusa's native Inventory detail already contains an **Associated variants** section. It remains the authoritative generic relationship list and must not be duplicated.

A compact **BOM usage** supplement shows only relationship information that the native section does not provide:

- Quantity required per sellable unit
- Recipe status
- Calculated stock at the selected location where space permits
- Link to the product/variant recipe context

The supplement may be combined with **Component and receiving** or presented as a compact linked view. It is read-only; recipes are edited from the product workflow. A longer list belongs in the Buildable products report rather than an oversized Inventory detail widget.

### 6.4 Buildable products report

The report is a compact, paginated table with:

- Product
- Variant
- SKU
- Recipe status
- Calculated stock
- Limiting item
- Selected stock location

Required controls:

- Location selector
- Search
- Recipe status filter
- “Limiting item” filter or search support when practical
- Link to product detail
- Link to the limiting Inventory item

Required states:

- **Loading:** table skeleton or progress state, never a premature “no records” message
- **Empty:** no matching variants
- **Incomplete:** recipe is missing or invalid; calculated stock is displayed as unavailable, not zero
- **Zero:** recipe is valid but at least one component has zero capacity
- **Error:** actionable retry state without stale values presented as current

The report is read-only. It does not provide stock adjustment or recipe mutation controls.

### 6.5 Add Product and Product detail

For every generated variant, the recipe interface must show:

- Resolved component inventory items
- Required quantity and unit per sellable unit
- Recipe completeness
- Available quantity for each component at the selected location
- Component capacity
- Calculated stock
- Limiting item

The merchant selects existing shared inventory items. Creating a recipe must not silently create duplicate inventory items.

Example behavior:

- `GHK-CU 50 mg — Vial Only` and `GHK-CU 50 mg — Vial + BAC` can reference the same finished-vial inventory item.
- The Vial + BAC recipe additionally references the configured BAC-water item.
- A SubQ Set can additionally reference individually counted syringes, alcohol pads, and packaging.
- All variants consume the same shared quantities from the one physical ledger.

The names above illustrate behavior only. They must not appear as hardcoded defaults or recipe rules.

## 7. Availability calculation contract

For variant `v`, location `l`, and each resolved recipe component `c`:

```text
available(c, l) = stocked(c, l) - reserved(c, l)
capacity(c, v, l) = floor(available(c, l) / required(c, v))
calculated_stock(v, l) = min(capacity(c, v, l))
```

Rules:

1. Every component quantity is normalized through the shared quantity/conversion service before division.
2. A complete recipe with no available component capacity returns calculated stock `0`.
3. An incomplete or invalid recipe returns an unavailable status, not `0`.
4. The limiting item is the component with the minimum capacity. Ties must be represented deterministically.
5. Calculation is location-aware and must not sum unrelated locations.
6. Display calculations do not replace transactional reservation and fulfillment safeguards.
7. Reservation, cancellation, and fulfillment changes must be reflected after the relevant Medusa inventory queries are refreshed.

## 8. Merchant journeys

### 8.1 Receive supplier stock

1. Open the native Inventory item.
2. Confirm its supplier conversion in **Component and receiving**.
3. Record the received quantity through the supported native inventory adjustment/receiving workflow.
4. The conversion produces inventory units for the native ledger.
5. Affected product availability queries refresh.

### 8.2 Investigate low calculated stock

1. Open **Buildable products** from Inventory.
2. Select the shared stock location.
3. Find the product variant.
4. Read its calculated stock and limiting item.
5. Open the limiting native Inventory item.
6. Review its physical levels, reservations, receiving configuration, and recipes that consume it.

### 8.3 Configure a sellable variant

1. Create or edit a product variant.
2. Select shared native Inventory items for its recipe.
3. Enter required quantities using valid units and conversion contexts.
4. Resolve and validate the recipe.
5. Review component capacities and calculated stock.
6. Save through the existing workflow and retain the immutable audit snapshot.

## 9. API and application boundaries

### 9.1 Admin data loading

- Use the Medusa JS SDK for all Admin requests.
- Use built-in SDK methods for native Inventory and Product endpoints.
- Use `sdk.client.fetch` for custom BOM endpoints.
- Display data loads when the screen mounts.
- Drawer/modal selection queries remain separate from display queries.
- Every query has explicit loading, empty, error, and stale-data behavior.
- Mutations invalidate the exact native and BOM query keys that affect visible data.

### 9.2 Custom read contracts

The implementation may consolidate existing custom BOM reads, but it must preserve these capabilities:

- Component profile by native inventory item ID
- Recipes that use a native inventory item
- Paginated location-aware variant availability
- Recipe history for a product variant

The current unbounded component-profile list is not the final contextual read contract. Source implementation must provide:

- An inventory-item-specific component-profile read
- Pagination and count for any multi-item profile query
- A BOM-usage read that returns required quantities and recipe state without duplicating the native variant relationship query

The first Buildable products slice may reuse the existing maximum-100, visible-variant availability request. Server-side pagination/filtering is required before the report offers global recipe-status or limiting-item filters that cannot be truthfully applied to only the visible page.

Read endpoints must be authenticated Admin routes and must not mutate state.

### 9.3 Mutation contracts

- Business mutations execute through Medusa workflows.
- Route handlers validate inputs and invoke workflows rather than implementing business logic.
- Component-profile edits never adjust stock.
- Stock changes use native inventory operations.
- Recipe changes preserve validation, replay protection where applicable, and audit snapshots.

## 10. Route compatibility

The current custom route `/app/bom` must not remain as a second merchant-facing inventory page.

After relocation is complete:

- Remove its sidebar route configuration.
- Preserve old bookmarks with a deterministic redirect to `/app/buildable-products`.
- Do not remove the old route until all relocated capabilities pass browser acceptance tests.
- Do not implement route shadowing or unsupported overrides of native Medusa routes.

The installed Medusa v2.19.0 Dashboard verifies `inventory_item.list` and `inventory_item.details` as the supported injection zones. The compatibility redirect mechanism still requires exact-route browser verification during implementation.

## 11. Permissions, security, and privacy

- Existing Admin authentication and authorization continue to apply.
- Custom endpoints must not become publicly accessible.
- UI hiding is not authorization; server routes enforce access.
- Stock, reservations, supplier conversion, and recipe data are operational commerce data and must not be cached publicly.
- Error messages may identify invalid configuration but must not expose credentials, database details, or stack traces.

## 12. Accessibility and responsive behavior

- Use Medusa UI components and design tokens.
- Tables must remain usable at Admin-supported breakpoints and may switch to stacked summaries where necessary.
- Links and buttons require visible focus states and accessible names.
- Location, status, and limiting-item meaning cannot rely on color alone.
- Drawers restore focus when closed.
- Long product, variant, SKU, and component names truncate visually without losing the full accessible value.

## 13. Configuration and no-hardcoding rules

The implementation must not hardcode:

- Peptide or compound names
- Presentation types
- Inclusion names
- Net-content values
- Product-option axes
- Recipe quantities
- Supplier pack sizes
- Stock-location IDs
- Product, variant, or inventory-item IDs
- Payment, fulfillment, or marketplace behavior

System-level classification and field-kind allowlists may be versioned application configuration when required for validation. Merchant catalog values and operational quantities remain stored configuration.

## 14. Acceptance criteria

### 14.1 Navigation and comprehension

- [ ] Exactly one inventory-related sidebar entry is visible: native **Inventory**.
- [ ] No merchant-facing page suggests that BOM maintains a second physical ledger.
- [ ] The old `/app/bom` URL redirects deterministically after relocation.
- [ ] Merchants can reach Buildable products from Inventory without a second sidebar entry.

### 14.2 Data integrity

- [ ] Existing native inventory items, levels, reservations, and locations are unchanged by the UX consolidation.
- [ ] Existing component profiles and recipe snapshots remain readable.
- [ ] Two or more variants can reference the same native inventory item without duplicating stock.
- [ ] A stock adjustment changes every affected variant's calculated stock after refresh.
- [ ] An incomplete recipe is distinguishable from a valid recipe with zero capacity.
- [ ] Calculations use the selected location only.

### 14.3 Inventory detail

- [ ] Component and receiving configuration appears on the correct native inventory item.
- [ ] Editing configuration cannot change physical stock.
- [ ] Native Associated variants remains intact, and the BOM usage supplement links to the correct native product details.
- [ ] Supplier conversion supports the current controlled units box, pack, roll, and piece without product-name rules.
- [ ] Adding another supplier-unit type requires an explicit controlled schema/API extension rather than a hardcoded merchant product rule.

### 14.4 Product workflow

- [ ] Add Product selects shared native inventory items for recipes.
- [ ] Each variant shows recipe completeness, component capacities, calculated stock, and limiting item.
- [ ] Blank SKUs continue to be generated through the established deterministic automatic-SKU behavior.
- [ ] Saving recipes retains immutable audit snapshots.

### 14.5 Order lifecycle

- [ ] Reservations reduce affected calculated stock.
- [ ] Cancellation releases reservations and restores calculated stock.
- [ ] Fulfillment consumes the correct shared components.
- [ ] Concurrent orders cannot oversell a shared component.
- [ ] Failed workflows compensate without leaving duplicate or orphaned inventory effects.

### 14.6 UI quality

- [ ] Search, pagination, deep links, refresh, loading, empty, zero, incomplete, and error states are tested.
- [ ] The UI uses compact Medusa-native display patterns and does not add oversized duplicate panels.
- [ ] No regular browser `fetch()` is used for Admin API data.
- [ ] The exact VS Code built-in browser journeys pass before the old page is removed.

## 15. Verification plan

### 15.1 Source and unit tests

- Availability and limiting-component calculations
- Unit normalization and supplier conversion
- Incomplete versus zero recipe status
- Deterministic tie handling
- Query-key invalidation behavior where practical
- Route redirect behavior

### 15.2 Database-backed integration tests

- Shared inventory item used by multiple variant recipes
- Location-aware quantities
- Reservation, cancellation, fulfillment, concurrency, and compensation
- Component-profile and recipe-query ownership boundaries
- Confirmation that no BOM stock ledger exists or is written

### 15.3 Admin browser acceptance

Using the VS Code built-in browser:

1. Open native Inventory and confirm one sidebar entry.
2. Open a finished-vial item and inspect component/receiving and BOM usage information while confirming native Associated variants remains intact.
3. Open an included-supply item and verify its supplier conversion.
4. Open Buildable products, select the shared location, and inspect limiting items.
5. Open a product and verify multiple variants share the same inventory item.
6. Adjust local test stock through the native workflow and verify derived availability refreshes.
7. Open `/app/bom` and verify its compatibility redirect.

### 15.4 Project checks

- Unit tests
- Relevant authenticated HTTP integration suites
- Lint
- Typecheck
- Backend build
- Storefront build where affected

## 16. Implementation sequence

### Phase 0 — Installed-version discovery

- [x] Verify supported native Inventory list/detail Admin extension zones.
- [x] Inventory the existing BOM page capabilities and their current query boundaries.
- [x] Confirm the safe route/link architecture against the installed Medusa Admin version.
- [x] Record and approve the relocation map before removing anything.

### Phase 1 — Inventory item contextual configuration

- [x] Add the Component and receiving widget.
- [x] Add the compact BOM usage supplement or linked view without duplicating native Associated variants.
- [x] Reuse existing component-profile behavior and native inventory identifiers.

Source verification completed on 2026-08-30 with focused and complete unit tests,
lint, typecheck, and a Medusa backend/Admin build. Exact-route browser acceptance
remains pending because the VS Code built-in browser was unavailable during this
implementation pass.

### Phase 2 — Buildable products report

- [x] Implement the paginated, location-aware read model.
- [x] Add the secondary report route without a sidebar entry.
- [x] Link it from a verified supported Inventory surface.

The report now distinguishes incomplete recipes from valid zero capacity,
shows the limiting native Inventory items, exposes direct Product/Variant and
Inventory links, and has no stock mutation controls. Variant search and
pagination execute on the server. Global recipe-status and limiting-item
filters remain intentionally absent until they can be applied truthfully across
the complete result set rather than only the visible page. Source checks passed;
exact-route browser acceptance remains pending because the VS Code built-in
browser connection was unavailable during this implementation pass.

### Phase 3 — Product-context alignment

- Align Add Product and Product detail terminology and links.
- Ensure recipe views link to native Inventory items.
- Remove any physical-stock controls from BOM recipe forms.

### Phase 4 — Navigation consolidation

- Remove the BOM Inventory sidebar entry.
- Add the compatibility redirect for `/app/bom`.
- Remove the old duplicated list only after capability parity is verified.

### Phase 5 — Lifecycle verification and checkpoint

- Run unit, database-backed, HTTP, build, and browser acceptance checks.
- Verify that existing data and native inventory counts are unchanged.
- Create a clean local checkpoint before any push or deployment decision.

## 17. Migration, rollout, and rollback

This UX consolidation is expected to reuse the current native Inventory and BOM models. It must not generate a migration merely to reorganize navigation.

If implementation discovery identifies a necessary persistent read model, link, or index:

1. Document why existing models cannot satisfy the contract.
2. Keep native Inventory as the only physical ledger.
3. Generate and test the migration through the project's separate database gates.
4. Do not rewrite existing migrations.

Rollout is complete only after all relocated capabilities pass exact-route browser checks. Rollback restores the prior route and widgets; it must not require inventory-data restoration because the consolidation does not move physical stock.

## 18. Non-goals

This contract does not authorize or define:

- Replacing Medusa native Inventory
- A new physical stock ledger
- Hardcoded peptide recipes or kits
- Marketplace synchronization
- Changes to payment or fulfillment providers
- Research Tracking RT-7 or RT-8 work
- Neon access
- Production migration, deployment, or activation
- Destructive cleanup of existing inventory or BOM data

## 19. Implementation approval

Phase 0 confirms and approves the following source-implementation boundary:

- Native Inventory remains the single physical ledger.
- One Inventory sidebar entry is the intended final navigation.
- Buildable products is a secondary report, not another inventory.
- Component configuration belongs on native Inventory item context.
- Native Associated variants remains intact; BOM usage only supplements it.
- Recipe editing belongs on Product context.
- Existing BOM audit and lifecycle guarantees remain intact.
- `inventory_item.list` and `inventory_item.details` are verified installed-version extension zones.
- The consolidation is expected to require source/API changes but no schema migration.

If implementation uncovers a model, link, or index requirement, work stops at that discovery and records a separate migration decision before changing persistent structure.
