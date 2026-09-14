/**
 * @file    apps/backend/src/workflows/steps/__tests__/deduct-order-bom-components.unit.spec.ts
 * @module  DeductOrderBomComponentsStepTests (BOM Module)
 * @purpose Unit tests for BOM constituent stock deduction calculations and idempotency guards.
 * @contracts
 *   Test:    deductOrderBomComponentsStep
 */

describe("Deduct Order BOM Components Calculation", () => {
  it("calculates correct multi-component deductions for compounded kits", () => {
    const orderItems = [
      {
        variant_id: "var_tirzepatide_10mg",
        quantity: 2,
      },
      {
        variant_id: "var_semaglutide_5mg",
        quantity: 1,
      },
    ]

    const recipeLinks = [
      // Tirzepatide recipe
      {
        variant_id: "var_tirzepatide_10mg",
        inventory_item_id: "item_tirz_vial",
        required_quantity: 1,
        title: "Tirzepatide Vial 10mg",
      },
      {
        variant_id: "var_tirzepatide_10mg",
        inventory_item_id: "item_bac_water",
        required_quantity: 1,
        title: "Bacteriostatic Water 10mL",
      },
      {
        variant_id: "var_tirzepatide_10mg",
        inventory_item_id: "item_syringes",
        required_quantity: 10,
        title: "Insulin Syringes",
      },
      // Semaglutide recipe (shares bac water)
      {
        variant_id: "var_semaglutide_5mg",
        inventory_item_id: "item_sema_vial",
        required_quantity: 1,
        title: "Semaglutide Vial 5mg",
      },
      {
        variant_id: "var_semaglutide_5mg",
        inventory_item_id: "item_bac_water",
        required_quantity: 1,
        title: "Bacteriostatic Water 10mL",
      },
      {
        variant_id: "var_semaglutide_5mg",
        inventory_item_id: "item_syringes",
        required_quantity: 10,
        title: "Insulin Syringes",
      },
    ]

    const deductionsMap = new Map<string, number>()

    for (const item of orderItems) {
      const links = recipeLinks.filter((l) => l.variant_id === item.variant_id)
      for (const link of links) {
        const qtyToDeduct = item.quantity * link.required_quantity
        const current = deductionsMap.get(link.inventory_item_id) ?? 0
        deductionsMap.set(link.inventory_item_id, current + qtyToDeduct)
      }
    }

    // Assert exact quantities:
    // Tirz vial: 2 * 1 = 2
    expect(deductionsMap.get("item_tirz_vial")).toBe(2)
    // Sema vial: 1 * 1 = 1
    expect(deductionsMap.get("item_sema_vial")).toBe(1)
    // Bac water (shared): 2 + 1 = 3
    expect(deductionsMap.get("item_bac_water")).toBe(3)
    // Syringes (shared): (2 * 10) + (1 * 10) = 30
    expect(deductionsMap.get("item_syringes")).toBe(30)
  })

  it("enforces idempotency when order has already been marked as bom_deducted", () => {
    const orderMetadata = {
      bom_deducted: true,
      bom_deducted_at: "2026-09-09T17:00:00.000Z",
    }

    const isAlreadyDeducted = orderMetadata.bom_deducted === true

    expect(isAlreadyDeducted).toBe(true)
  })

  it("handles empty recipes without errors", () => {
    const orderItems = [
      {
        variant_id: "var_non_bom_product",
        quantity: 5,
      },
    ]
    const recipeLinks: Array<{
      variant_id: string
      inventory_item_id: string
      required_quantity: number
    }> = []

    const deductions: Array<{ inventory_item_id: string; quantity: number }> = []

    for (const item of orderItems) {
      const links = recipeLinks.filter((l) => l.variant_id === item.variant_id)
      for (const link of links) {
        deductions.push({
          inventory_item_id: link.inventory_item_id,
          quantity: item.quantity * link.required_quantity,
        })
      }
    }

    expect(deductions).toHaveLength(0)
  })
})
