import { z } from "@medusajs/framework/zod"
import { MedusaError } from "@medusajs/framework/utils"

const Id = z.string().trim().min(1).max(255)
const Decimal = z.string().trim().regex(/^\d+(?:\.\d+)?$/).max(64)

export const CalculationInputSnapshot = z.strictObject({
  compound_mass: Decimal,
  compound_mass_unit: z.enum(["mcg", "mg", "g", "IU"]),
  final_volume_ml: Decimal,
  target_amount: Decimal,
  target_amount_unit: z.enum(["mcg", "mg", "IU"]),
  comparison_target_amount: Decimal.nullable().default(null),
  iu_per_mg: Decimal.nullable().default(null),
  device_volume_ml: Decimal.nullable().default(null),
  device_label: z.string().trim().min(1).max(120).nullable().default(null),
  rounding_precision: z.number().int().min(0).max(6),
})

export const StoreCreateCalculationSnapshot = z
  .strictObject({
    idempotency_key: z.string().uuid(),
    mode: z.enum(["quick", "protocol", "compare"]),
    title: z.string().trim().min(1).max(120),
    protocol_series_id: Id.nullable().default(null),
    protocol_revision_id: Id.nullable().default(null),
    profile_protocol_access_id: Id.nullable().default(null),
    routine_id: Id.nullable().default(null),
    journal_entry_id: Id.nullable().default(null),
    input: CalculationInputSnapshot,
  })
  .superRefine((value, context) => {
    if (value.mode !== "quick" && !value.profile_protocol_access_id) {
      context.addIssue({ code: "custom", message: "protocol access is required" })
    }
    if (value.mode === "compare" && !value.input.comparison_target_amount) {
      context.addIssue({ code: "custom", message: "comparison target is required" })
    }
  })

export type StoreCreateCalculationSnapshotType = z.infer<
  typeof StoreCreateCalculationSnapshot
>

export const StoreMutateCalculationSnapshot = z
  .strictObject({
    action: z.enum(["attach", "archive"]),
    routine_id: Id.nullable().default(null),
    journal_entry_id: Id.nullable().default(null),
  })
  .superRefine((value, context) => {
    if (value.action === "attach" && !value.routine_id && !value.journal_entry_id) {
      context.addIssue({ code: "custom", message: "routine or Journal entry is required" })
    }
  })

export type StoreMutateCalculationSnapshotType = z.infer<
  typeof StoreMutateCalculationSnapshot
>

type CalculationInput = z.infer<typeof CalculationInputSnapshot>

const toMg = (value: number, unit: CalculationInput["compound_mass_unit"] | CalculationInput["target_amount_unit"], iuPerMg: number | null) => {
  if (unit === "mcg") return value / 1_000
  if (unit === "g") return value * 1_000
  if (unit === "IU") return iuPerMg && iuPerMg > 0 ? value / iuPerMg : null
  return value
}

const decimal = (value: number, precision: number) =>
  String(Number(value.toFixed(precision)))

export function calculateResearchSnapshot(input: CalculationInput) {
  const mass = Number(input.compound_mass)
  const volume = Number(input.final_volume_ml)
  const target = Number(input.target_amount)
  const comparisonTarget = input.comparison_target_amount
    ? Number(input.comparison_target_amount)
    : null
  const iuPerMg = input.iu_per_mg ? Number(input.iu_per_mg) : null
  const deviceVolume = input.device_volume_ml
    ? Number(input.device_volume_ml)
    : null
  const massMg = toMg(mass, input.compound_mass_unit, iuPerMg)
  const targetMg = toMg(target, input.target_amount_unit, iuPerMg)
  const comparisonMg = comparisonTarget === null
    ? null
    : toMg(comparisonTarget, input.target_amount_unit, iuPerMg)

  if (!massMg || !targetMg || massMg <= 0 || targetMg <= 0 || volume <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "calculation_input_invalid",
    )
  }
  if (comparisonTarget !== null && (!comparisonMg || comparisonMg <= 0)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "comparison_input_invalid",
    )
  }

  const concentration = massMg / volume
  const deliveryVolume = targetMg / concentration
  const comparisonVolume = comparisonMg ? comparisonMg / concentration : null
  return {
    concentration_mg_per_ml: decimal(concentration, input.rounding_precision),
    volume_ml: decimal(deliveryVolume, input.rounding_precision),
    device_measurements:
      deviceVolume && deviceVolume > 0
        ? decimal(deliveryVolume / deviceVolume, input.rounding_precision)
        : null,
    uses_per_container: decimal(massMg / targetMg, input.rounding_precision),
    comparison_volume_ml:
      comparisonVolume === null
        ? null
        : decimal(comparisonVolume, input.rounding_precision),
    comparison_device_measurements:
      comparisonVolume !== null && deviceVolume && deviceVolume > 0
        ? decimal(comparisonVolume / deviceVolume, input.rounding_precision)
        : null,
  }
}
