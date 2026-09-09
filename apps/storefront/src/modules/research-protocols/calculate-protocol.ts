type Input = {
  compoundMass: number
  compoundMassUnit: "mcg" | "mg" | "g" | "IU"
  finalVolumeMl: number
  targetAmount: number
  targetAmountUnit: "mcg" | "mg" | "IU"
  iuPerMg?: number | null
  deviceVolumeMl?: number | null
}

const toMg = (value: number, unit: Input["compoundMassUnit"] | Input["targetAmountUnit"], iuPerMg?: number | null) => {
  if (unit === "mcg") return value / 1_000
  if (unit === "g") return value * 1_000
  if (unit === "IU") return iuPerMg && iuPerMg > 0 ? value / iuPerMg : null
  return value
}

export const calculateProtocol = (input: Input) => {
  if (input.compoundMassUnit === "IU" && input.targetAmountUnit === "IU") {
    if (input.finalVolumeMl <= 0 || input.compoundMass <= 0 || input.targetAmount <= 0) return null
    const concentrationIuPerMl = input.compoundMass / input.finalVolumeMl
    const volumeMl = input.targetAmount / concentrationIuPerMl
    const compoundMassMg = toMg(input.compoundMass, input.compoundMassUnit, input.iuPerMg)
    const concentrationMgPerMl = compoundMassMg ? compoundMassMg / input.finalVolumeMl : concentrationIuPerMl
    return {
      concentrationMgPerMl,
      concentrationIuPerMl,
      volumeMl,
      deviceMeasurements: input.deviceVolumeMl && input.deviceVolumeMl > 0 ? volumeMl / input.deviceVolumeMl : null,
      usesPerContainer: input.compoundMass / input.targetAmount,
    }
  }

  const compoundMassMg = toMg(input.compoundMass, input.compoundMassUnit, input.iuPerMg)
  const targetAmountMg = toMg(input.targetAmount, input.targetAmountUnit, input.iuPerMg)
  if (!compoundMassMg || !targetAmountMg || input.finalVolumeMl <= 0 || compoundMassMg <= 0 || targetAmountMg <= 0) return null
  const concentrationMgPerMl = compoundMassMg / input.finalVolumeMl
  const volumeMl = targetAmountMg / concentrationMgPerMl
  return {
    concentrationMgPerMl,
    concentrationIuPerMl: null,
    volumeMl,
    deviceMeasurements: input.deviceVolumeMl && input.deviceVolumeMl > 0 ? volumeMl / input.deviceVolumeMl : null,
    usesPerContainer: compoundMassMg / targetAmountMg,
  }
}
