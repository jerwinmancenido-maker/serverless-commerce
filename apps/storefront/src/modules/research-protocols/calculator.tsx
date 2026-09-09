"use client"

import { useMemo, useState } from "react"

import { calculateProtocol } from "./calculate-protocol"
import type { ResearchProtocolContent } from "./types"

export const ProtocolCalculator = ({ configuration }: { configuration: ResearchProtocolContent["calculator"] }) => {
  const [compoundMass, setCompoundMass] = useState(configuration.default_compound_mass || "")
  const [finalVolume, setFinalVolume] = useState(configuration.default_final_volume_ml || "")
  const [targetAmount, setTargetAmount] = useState(configuration.default_target_amount || "")
  const result = useMemo(() => calculateProtocol({ compoundMass: Number(compoundMass), compoundMassUnit: configuration.compound_mass_unit, finalVolumeMl: Number(finalVolume), targetAmount: Number(targetAmount), targetAmountUnit: configuration.target_amount_unit, iuPerMg: configuration.iu_per_mg ? Number(configuration.iu_per_mg) : null, deviceVolumeMl: configuration.device_volume_ml ? Number(configuration.device_volume_ml) : null }), [compoundMass, finalVolume, targetAmount, configuration])
  const display = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : value.toFixed(configuration.rounding_precision)
  return <section className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-6 small:p-8">
    <h2 className="text-xl-semi text-ui-fg-base">{configuration.title}</h2>
    {configuration.instructions ? <p className="mt-2 text-small-regular text-ui-fg-subtle">{configuration.instructions}</p> : null}
    <div className="mt-6 grid gap-4 small:grid-cols-3">
      <label className="text-small-semi text-ui-fg-base">Compound mass<input className="mt-2 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2" inputMode="decimal" value={compoundMass} onChange={(event) => setCompoundMass(event.target.value)} /><span className="mt-1 block text-small-regular text-ui-fg-subtle">{configuration.compound_mass_unit}</span></label>
      <label className="text-small-semi text-ui-fg-base">Final volume<input className="mt-2 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2" inputMode="decimal" value={finalVolume} onChange={(event) => setFinalVolume(event.target.value)} /><span className="mt-1 block text-small-regular text-ui-fg-subtle">mL</span></label>
      <label className="text-small-semi text-ui-fg-base">Target amount<input className="mt-2 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2" inputMode="decimal" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} /><span className="mt-1 block text-small-regular text-ui-fg-subtle">{configuration.target_amount_unit}</span></label>
    </div>
    <div className="mt-6 grid gap-3 small:grid-cols-2 medium:grid-cols-4">
      <Result
        label="Concentration"
        value={
          result?.concentrationIuPerMl != null
            ? `${display(result.concentrationIuPerMl)} IU/mL`
            : `${display(result?.concentrationMgPerMl)} mg/mL`
        }
      />
      <Result label="Volume" value={`${display(result?.volumeMl)} mL`} />
      <Result
        label={configuration.device_label || "Device measurements"}
        value={
          result?.volumeMl != null
            ? `${(result.volumeMl * 100).toFixed(configuration.rounding_precision > 0 ? 1 : 0)} Units (${display(result.volumeMl)} mL)`
            : "—"
        }
      />
      <Result label="Uses per container" value={display(result?.usesPerContainer)} />
    </div>
  </section>
}

const Result = ({ label, value }: { label: string; value: string }) => <div className="rounded-rounded bg-ui-bg-subtle p-4"><p className="text-small-regular text-ui-fg-subtle">{label}</p><p className="mt-1 text-large-semi text-ui-fg-base">{value}</p></div>
