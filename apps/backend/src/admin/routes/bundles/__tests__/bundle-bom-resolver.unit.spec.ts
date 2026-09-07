import {
  calculateConstituentCapacity,
  determineConstituentStockStatus,
  getBundleSavingsBreakdown,
  resolveBundleBuildableStatus,
  type BundleComponentSpec,
} from "../bundle-bom-resolver"

describe("bundle-bom-resolver", () => {
  describe("calculateConstituentCapacity", () => {
    it("returns floored quotient of available divided by required quantity", () => {
      expect(calculateConstituentCapacity(10, 1)).toBe(10)
      expect(calculateConstituentCapacity(11, 2)).toBe(5)
      expect(calculateConstituentCapacity(3, 5)).toBe(0)
    })

    it("returns 0 when available is non-positive or required is non-positive", () => {
      expect(calculateConstituentCapacity(0, 1)).toBe(0)
      expect(calculateConstituentCapacity(-5, 1)).toBe(0)
      expect(calculateConstituentCapacity(10, 0)).toBe(0)
      expect(calculateConstituentCapacity(10, -1)).toBe(0)
    })
  })

  describe("determineConstituentStockStatus", () => {
    it("returns untracked when not managed", () => {
      expect(determineConstituentStockStatus(0, false)).toBe("untracked")
      expect(determineConstituentStockStatus(100, false)).toBe("untracked")
    })

    it("returns out_of_stock when available is 0 or less", () => {
      expect(determineConstituentStockStatus(0, true)).toBe("out_of_stock")
      expect(determineConstituentStockStatus(-1, true)).toBe("out_of_stock")
    })

    it("returns low_stock when available is between 1 and 5", () => {
      expect(determineConstituentStockStatus(1, true)).toBe("low_stock")
      expect(determineConstituentStockStatus(5, true)).toBe("low_stock")
    })

    it("returns in_stock when available is greater than 5", () => {
      expect(determineConstituentStockStatus(6, true)).toBe("in_stock")
      expect(determineConstituentStockStatus(50, true)).toBe("in_stock")
    })
  })

  describe("resolveBundleBuildableStatus", () => {
    const sampleComponents: BundleComponentSpec[] = [
      {
        handle: "ghk-cu",
        title: "GHK-Cu",
        strength: "100MG",
        quantity: 1,
        individualPrice: 1170,
      },
      {
        handle: "glutathione-1500mg",
        title: "Glutathione",
        strength: "1500MG",
        quantity: 1,
        individualPrice: 1620,
      },
    ]

    it("calculates buildable quantity based on the limiting component", () => {
      const stockData = {
        "ghk-cu": { stocked: 10, reserved: 0, manageInventory: true },
        "glutathione-1500mg": { stocked: 3, reserved: 0, manageInventory: true },
      }

      const result = resolveBundleBuildableStatus(
        "BNDL-GG-STACK",
        "ghk-cu-glutathione-bundle",
        sampleComponents,
        stockData,
      )

      expect(result.buildableQuantity).toBe(3)
      expect(result.isAvailable).toBe(true)
      expect(result.limitingComponent?.handle).toBe("glutathione-1500mg")
      expect(result.limitingComponent?.isBottleneck).toBe(true)
      expect(result.constituents[0].capacity).toBe(10)
      expect(result.constituents[0].isBottleneck).toBe(false)
      expect(result.constituents[1].capacity).toBe(3)
      expect(result.constituents[1].isBottleneck).toBe(true)
    })

    it("marks bundle unavailable if any constituent is out of stock", () => {
      const stockData = {
        "ghk-cu": { stocked: 10, reserved: 0, manageInventory: true },
        "glutathione-1500mg": { stocked: 2, reserved: 2, manageInventory: true }, // available = 0
      }

      const result = resolveBundleBuildableStatus(
        "BNDL-GG-STACK",
        "ghk-cu-glutathione-bundle",
        sampleComponents,
        stockData,
      )

      expect(result.buildableQuantity).toBe(0)
      expect(result.isAvailable).toBe(false)
      expect(result.limitingComponent?.handle).toBe("glutathione-1500mg")
      expect(result.limitingComponent?.status).toBe("out_of_stock")
    })

    it("handles multi-item quantity requirements per stack", () => {
      const componentsWithMulti: BundleComponentSpec[] = [
        {
          handle: "ghk-cu",
          title: "GHK-Cu",
          strength: "100MG",
          quantity: 2, // 2 vials per bundle
          individualPrice: 1170,
        },
        {
          handle: "glutathione-1500mg",
          title: "Glutathione",
          strength: "1500MG",
          quantity: 1,
          individualPrice: 1620,
        },
      ]

      const stockData = {
        "ghk-cu": { stocked: 7, reserved: 0, manageInventory: true }, // capacity = floor(7/2) = 3
        "glutathione-1500mg": { stocked: 5, reserved: 0, manageInventory: true }, // capacity = floor(5/1) = 5
      }

      const result = resolveBundleBuildableStatus(
        "BNDL-GG-STACK",
        "ghk-cu-glutathione-bundle",
        componentsWithMulti,
        stockData,
      )

      expect(result.buildableQuantity).toBe(3)
      expect(result.limitingComponent?.handle).toBe("ghk-cu")
      expect(result.limitingComponent?.capacity).toBe(3)
    })

    it("handles empty components array gracefully", () => {
      const result = resolveBundleBuildableStatus(
        "BNDL-EMPTY",
        "empty-bundle",
        [],
        {},
      )

      expect(result.buildableQuantity).toBe(0)
      expect(result.isAvailable).toBe(false)
      expect(result.limitingComponent).toBeNull()
      expect(result.constituents).toHaveLength(0)
    })
  })

  describe("getBundleSavingsBreakdown", () => {
    it("computes savings amount and discount percentage accurately", () => {
      const breakdown = getBundleSavingsBreakdown(2790, 2500)
      expect(breakdown.savingsAmount).toBe(290)
      expect(breakdown.savingsPercent).toBe(10) // 290 / 2790 = 10.39% -> 10%
    })

    it("handles zero sum price without NaN or division by zero", () => {
      const breakdown = getBundleSavingsBreakdown(0, 0)
      expect(breakdown.savingsAmount).toBe(0)
      expect(breakdown.savingsPercent).toBe(0)
    })
  })
})
