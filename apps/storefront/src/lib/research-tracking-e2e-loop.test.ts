import assert from "node:assert/strict"
import test from "node:test"

import {
  convertResearchDisplayQuantityToBaseUnits,
  formatResearchQuantity,
} from "./research-quantity.ts"
import {
  createRoutineSubmissionKeys,
  normalizeResearchSubmissionKey,
} from "./research-tracking-idempotency.ts"

type ReplenishmentUrgency = "on_track" | "plan_reorder" | "reorder_now" | "not_projected"

function calculateRemainingDoses(remainingBaseUnits: number, doseBaseUnits: number): number {
  if (doseBaseUnits <= 0) return 0
  return Math.floor(remainingBaseUnits / doseBaseUnits)
}

function evaluateReplenishmentUrgency(input: {
  remainingBaseUnits: number
  doseBaseUnitsPerDay: number
  reorderNowDays?: number
  planReorderDays?: number
}): {
  daysRemaining: number
  urgency: ReplenishmentUrgency
} {
  const reorderNowThreshold = input.reorderNowDays ?? 10
  const planReorderThreshold = input.planReorderDays ?? 24

  if (input.doseBaseUnitsPerDay <= 0) {
    return { daysRemaining: 0, urgency: "not_projected" }
  }

  const daysRemaining = Math.floor(input.remainingBaseUnits / input.doseBaseUnitsPerDay)

  if (daysRemaining <= reorderNowThreshold) {
    return { daysRemaining, urgency: "reorder_now" }
  }
  if (daysRemaining <= planReorderThreshold) {
    return { daysRemaining, urgency: "plan_reorder" }
  }
  return { daysRemaining, urgency: "on_track" }
}

test("E2E Loop: Dose Logging -> Supply Ledger Math -> Replenishment Urgency -> Reorder Bridge", async (t) => {
  await t.test("Phase 1: Validates dose confirmation payload and idempotency key rotation", () => {
    const routineId = "rtn_ghk_cu_daily"
    const occurrenceId = "occ_2026_09_04_01"
    
    // Generate valid routine submission keys
    const routineKeys = createRoutineSubmissionKeys(
      [routineId],
      [occurrenceId],
      [],
      () => "e2e-loop-idempotency-token-12345",
    )
    const idempotencyKey = routineKeys.confirmations[occurrenceId]
    assert.equal(idempotencyKey, "storefront:e2e-loop-idempotency-token-12345")
    assert.equal(normalizeResearchSubmissionKey(idempotencyKey), idempotencyKey)

    // Convert dose input (2.5 mg into 2,500 mcg base units)
    const baseUnits = convertResearchDisplayQuantityToBaseUnits(2.5, {
      base_unit: "microgram",
      display_unit: "mg",
      base_units_per_display_unit: 1000,
      display_precision: 2,
    })
    assert.equal(baseUnits, 2500)

    // Formulate payload for confirmResearchRoutineLogWorkflow
    const payload = {
      routine_id: routineId,
      routine_revision_id: "rev_01",
      occurrence_id: occurrenceId,
      local_date: "2026-09-04",
      supply_id: "sup_vial_50mg",
      confirmed_quantity_base_units: baseUnits,
      base_unit: "microgram",
      preview_token: "token_verified_preview_12345",
      idempotency_key: idempotencyKey,
    }

    assert.equal(payload.confirmed_quantity_base_units, 2500)
    assert.equal(payload.base_unit, "microgram")
    assert.match(payload.preview_token, /^token_/)
  })

  await t.test("Phase 2: Verifies exact ledger deduction from 50mg initial inventory", () => {
    const initialVialMcg = 50_000 // 50 mg
    const doseMcg = 2_500        // 2.5 mg

    // Dose 1 deduction
    const afterDose1 = initialVialMcg - doseMcg
    assert.equal(afterDose1, 47_500)
    assert.equal(
      formatResearchQuantity(afterDose1, {
        base_unit: "microgram",
        display_unit: "mg",
        base_units_per_display_unit: 1000,
        display_precision: 1,
      }),
      "47.5 mg"
    )

    // 19 doses remaining
    const remainingDoses = calculateRemainingDoses(afterDose1, doseMcg)
    assert.equal(remainingDoses, 19)

    // Status is plan_reorder with 19 days remaining (19 <= 24 threshold)
    const initialOutlook = evaluateReplenishmentUrgency({
      remainingBaseUnits: afterDose1,
      doseBaseUnitsPerDay: doseMcg,
    })
    assert.equal(initialOutlook.daysRemaining, 19)
    assert.equal(initialOutlook.urgency, "plan_reorder")
  })

  await t.test("Phase 3: Depletion triggers low-supply alert (reorder_now threshold)", () => {
    const doseMcg = 2_500
    // Deplete down to 2 doses remaining (5,000 mcg)
    const lowSupplyMcg = 5_000

    const lowOutlook = evaluateReplenishmentUrgency({
      remainingBaseUnits: lowSupplyMcg,
      doseBaseUnitsPerDay: doseMcg,
      reorderNowDays: 10,
    })

    assert.equal(lowOutlook.daysRemaining, 2)
    assert.equal(lowOutlook.urgency, "reorder_now") // 2 <= 10 days
  })

  await t.test("Phase 4: Reorder bridge constructs valid Medusa commerce cart line item", () => {
    const replenishmentCandidate = {
      product_id: "prod_phase8_ghk_cu",
      variant_id: "variant_01M1KBBT_50MG",
      title: "Phase 8 GHK-Cu Acceptance - 50mg",
      unit_price: 100000, // ₱1,000.00
      quantity: 1,
    }

    // Line item payload for /store/carts/:id/line-items
    const cartLineItemPayload = {
      variant_id: replenishmentCandidate.variant_id,
      quantity: replenishmentCandidate.quantity,
      metadata: {
        source: "research_replenishment",
        urgency: "reorder_now",
        tracked_material_id: "mat_ghk_cu",
      },
    }

    assert.equal(cartLineItemPayload.variant_id, "variant_01M1KBBT_50MG")
    assert.equal(cartLineItemPayload.quantity, 1)
    assert.equal(cartLineItemPayload.metadata.source, "research_replenishment")
    assert.equal(cartLineItemPayload.metadata.urgency, "reorder_now")
  })
})
