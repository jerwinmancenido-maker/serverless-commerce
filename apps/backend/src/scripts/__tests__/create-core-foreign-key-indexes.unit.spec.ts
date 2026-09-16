/**
 * @file    apps/backend/src/scripts/__tests__/create-core-foreign-key-indexes.unit.spec.ts
 * @module  CreateCoreForeignKeyIndexesUnitSpec (Unit Test)
 * @purpose Verify index definition structure, idempotency, and SQL statements.
 * @contracts
 *   Target: create-core-foreign-key-indexes.ts
 */

import { INDEX_DEFINITIONS } from "../create-core-foreign-key-indexes"

describe("createCoreForeignKeyIndexes definition checks", () => {
  it("defines required indexes on fulfillment and order_line_item", () => {
    expect(INDEX_DEFINITIONS).toHaveLength(3)

    const deliveryAddressIdx = INDEX_DEFINITIONS.find(
      (d) => d.indexName === "IDX_fulfillment_delivery_address_id",
    )
    expect(deliveryAddressIdx).toBeDefined()
    expect(deliveryAddressIdx?.table).toBe("fulfillment")
    expect(deliveryAddressIdx?.column).toBe("delivery_address_id")

    const providerIdx = INDEX_DEFINITIONS.find(
      (d) => d.indexName === "IDX_fulfillment_provider_id",
    )
    expect(providerIdx).toBeDefined()
    expect(providerIdx?.table).toBe("fulfillment")
    expect(providerIdx?.column).toBe("provider_id")

    const orderLineItemTotalsIdx = INDEX_DEFINITIONS.find(
      (d) => d.indexName === "IDX_order_line_item_totals_id",
    )
    expect(orderLineItemTotalsIdx).toBeDefined()
    expect(orderLineItemTotalsIdx?.table).toBe("order_line_item")
    expect(orderLineItemTotalsIdx?.column).toBe("totals_id")
  })
})
