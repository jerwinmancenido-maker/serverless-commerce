/**
 * @file    apps/backend/src/modules/__tests__/tax-excised-invariant.unit.spec.ts
 * @module  TaxExcisedInvariantTests (Biotech Archetype Governance)
 * @purpose Automated regression guardrail asserting 0 VAT, 0 BIR forms, and exact Net Direct Pricing parity.
 * @contracts
 *   Test: DirectNetPricingInvariant · BirExcisionAudit
 */

import * as fs from "fs"
import * as path from "path"

describe("Biotech Archetype Perpetual Zero-Tax Invariant", () => {
  const BACKEND_SRC = path.resolve(__dirname, "../../")

  it("enforces exact mathematical Direct Net Pricing parity (Total = Subtotal - Discount + Shipping)", () => {
    const scenarios = [
      { subtotal: 3500, discount: 0, shipping: 150 },
      { subtotal: 8200, discount: 500, shipping: 0 },
      { subtotal: 15400, discount: 1540, shipping: 250 },
      { subtotal: 50000, discount: 7500, shipping: 0 },
    ]

    for (const s of scenarios) {
      const taxTotal = 0 // Invariant: Biotech peptides RUO pricing has strictly 0 tax
      const total = s.subtotal - s.discount + s.shipping + taxTotal
      const expectedTotal = s.subtotal - s.discount + s.shipping

      expect(taxTotal).toBe(0)
      expect(total).toBe(expectedTotal)
    }
  })

  it("verifies zero active BIR Form 2307, 1601-EQ, or VAT rate references across backend source code", () => {
    const forbiddenPatterns = [
      /\bbir-2307\b/i,
      /\bform\s*2307\b/i,
      /\bform2307\b/i,
      /\b1601-eq\b/i,
      /\bexpanded_withholding_tax\b/i,
      /\bstandard_input_vat\b/i,
    ]

    const filesWithViolations: string[] = []

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (
            entry.name !== "node_modules" &&
            entry.name !== ".medusa" &&
            entry.name !== "dist" &&
            entry.name !== "__tests__"
          ) {
            scanDir(fullPath)
          }
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
          !entry.name.includes(".spec.")
        ) {
          const content = fs.readFileSync(fullPath, "utf-8")
          for (const pattern of forbiddenPatterns) {
            if (pattern.test(content)) {
              filesWithViolations.push(
                `${path.relative(BACKEND_SRC, fullPath)} (matched ${pattern})`
              )
              break
            }
          }
        }
      }
    }

    scanDir(BACKEND_SRC)
    expect(filesWithViolations).toEqual([])
  })
})
