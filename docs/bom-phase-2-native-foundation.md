# PepStack BOM Phase 2 Native Inventory Foundation

Status: implemented and verified against disposable local PostgreSQL.

Phase 2 establishes Medusa's native inventory-kit links as the operational BOM
without introducing a custom database model or migration.

## Implemented workflow

`setVariantInventoryKitWorkflow` accepts:

```ts
{
  variantId: string;
  components: Array<{
    inventoryItemId: string;
    requiredQuantity: number;
  }>;
}
```

The workflow:

1. Trims and validates the variant ID.
2. Normalizes component order and validates positive safe-integer quantities.
3. Rejects empty recipes and duplicate inventory items.
4. Confirms that every inventory item exists in Medusa.
5. Confirms that the product variant exists.
6. Enables managed inventory and disables backorders for the variant.
7. Replaces native variant-to-inventory-item links through compensating Medusa
   workflow steps.
8. Leaves an identical recipe unchanged.

No stock quantity is copied into custom storage.

## Recipe immutability after an order

Medusa 2.19 delivery calculation reads a variant's current inventory-kit links
when converting fulfillment component quantities back to order-line quantity.
Changing the kit after an order is created can therefore make historical
fulfillment interpretation unsafe.

Phase 2 prevents a material recipe change after the variant has appeared on an
order line. Staff must create a new sellable variant for a new recipe. This
keeps old orders associated with the exact operational recipe that fulfilled
them. Reapplying an identical recipe is idempotent and remains allowed.

## Stock location behavior

- Inventory levels remain native Medusa records.
- The initial PepStack warehouse is created later as configurable Medusa data,
  not as a source-code constant.
- Inventory items without a level at the active location have zero buildable
  availability there.
- The official `getVariantAvailability` or `getTotalVariantAvailability`
  utilities remain the canonical availability calculation.

## Verification gates

Database-free:

- Component normalization and validation.
- Order-independent recipe equality.
- Buildable-quantity oracle and limiting-component behavior.
- Lint, TypeScript, unit tests, and backend build.

Disposable PostgreSQL:

- A variant can link to multiple inventory items.
- Required quantities are persisted on native links.
- Managed inventory is enabled and backorders are disabled.
- Native Medusa availability uses the limiting component.
- Replacing a pre-order recipe updates the native links.
- Invalid inventory IDs leave the current recipe unchanged.
- Test databases and templates are removed after the suite.

This phase does not authorize a Neon migration, production inventory creation,
Admin user creation, seed, deployment, or provider connection.

## Verification evidence

Verified on 2026-08-25 with Medusa 2.19.0:

- 17 database-free BOM contract tests passed.
- 4 native Medusa integration scenarios passed.
- The integration runner created and removed
  `medusa-bom-native-integration-1` and its template locally.
- Repository lint and TypeScript checks passed.
- The Medusa backend and Admin production build passed.
- No custom migration was generated because Phase 2 adds no custom model.
- Neon and all external providers remained untouched.
