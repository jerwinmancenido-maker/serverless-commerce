import { Button, Input, Label, Select, Text, Textarea } from "@medusajs/ui"

import type {
  ResearchProtocolMutationBody,
  ResearchProtocolUnit,
} from "./research-protocol-types"

type Props = {
  value: ResearchProtocolMutationBody
  onChange: (value: ResearchProtocolMutationBody) => void
  disabled?: boolean
}

const units: ResearchProtocolUnit[] = ["mcg", "mg", "g", "µL", "mL", "L", "IU", "piece"]
const keyFrom = (value: string, fallback: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback

export const ProtocolCustomerContentFields = ({ value, onChange, disabled = false }: Props) => {
  const content = value.content
  const update = (patch: Partial<typeof content>) =>
    onChange({ ...value, content: { ...content, ...patch } })

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <Text size="large" weight="plus">Customer-facing protocol</Text>
        <Text size="small" className="text-ui-fg-subtle">
          Structured content used by the protocol directory, detail page, calculator, and future order QR access.
        </Text>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-y-2"><Label>Compound name</Label><Input value={content.compound_name || ""} disabled={disabled} onChange={(event) => update({ compound_name: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2">
          <Label>Classification</Label>
          <Select
            value={content.protocol_category_type || "single_peptide"}
            disabled={disabled}
            onValueChange={(val) => update({ protocol_category_type: val as "single_peptide" | "blend" })}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="single_peptide">Single Peptide</Select.Item>
              <Select.Item value="blend">Multi-Peptide Blend</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2"><Label>Product format</Label><Input value={content.product_format || ""} disabled={disabled} placeholder="Nasal, Injectable, Oral, or Topical" onChange={(event) => update({ product_format: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Research category</Label><Input value={content.category || ""} disabled={disabled} onChange={(event) => update({ category: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Purity standard</Label><Input value={content.purity_standard || ""} disabled={disabled} placeholder="≥99.0% (HPLC Certified Lot Standard)" onChange={(event) => update({ purity_standard: event.target.value })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Last reviewed</Label><Input type="date" value={content.last_reviewed_at || ""} disabled={disabled} onChange={(event) => update({ last_reviewed_at: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Page label</Label><Input value={content.research_use_label} disabled={disabled} onChange={(event) => update({ research_use_label: event.target.value })} /></div>
      </div>
      <div className="flex flex-col gap-y-2"><Label>Customer introduction</Label><Textarea value={content.short_introduction || ""} disabled={disabled} onChange={(event) => update({ short_introduction: event.target.value || null })} /></div>

      <div className="flex flex-col gap-y-2">
        <Label>Full Monograph & Mechanism of Action</Label>
        <Textarea
          rows={5}
          value={content.full_description || ""}
          disabled={disabled}
          placeholder="Comprehensive pharmacological profile, biological mechanism of action, receptor binding, and cellular pathway..."
          onChange={(event) => update({ full_description: event.target.value || null })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label>Researched Benefits (One item per line)</Label>
          <Textarea
            rows={4}
            value={(content.investigated_benefits || []).join("\n")}
            disabled={disabled}
            placeholder="Enter validated analytical and preclinical benefits, one per line..."
            onChange={(event) => update({
              investigated_benefits: event.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
            })}
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Adverse Observations & Precautions (One item per line)</Label>
          <Textarea
            rows={4}
            value={(content.adverse_observations || []).join("\n")}
            disabled={disabled}
            placeholder="Enter analytical handling cautions and laboratory observations, one per line..."
            onChange={(event) => update({
              adverse_observations: event.target.value.split("\n").map((s) => s.trim()).filter(Boolean)
            })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div>
          <Text size="small" weight="plus">Molecular Identity</Text>
          <Text size="small" className="text-ui-fg-subtle">Chemical CAS registry, PubChem CID, peptide sequence/formula, and molecular weight.</Text>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <Label>CAS Number</Label>
            <Input
              value={content.molecular_details?.cas_number || ""}
              disabled={disabled}
              placeholder="e.g. 137525-51-0"
              onChange={(e) => update({
                molecular_details: {
                  cas_number: e.target.value || null,
                  pubchem_cid: content.molecular_details?.pubchem_cid ?? null,
                  sequence_or_formula: content.molecular_details?.sequence_or_formula ?? null,
                  molecular_weight_g_per_mol: content.molecular_details?.molecular_weight_g_per_mol ?? null,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>PubChem CID</Label>
            <Input
              type="number"
              value={content.molecular_details?.pubchem_cid ?? ""}
              disabled={disabled}
              placeholder="e.g. 9941957"
              onChange={(e) => update({
                molecular_details: {
                  cas_number: content.molecular_details?.cas_number ?? null,
                  pubchem_cid: e.target.value === "" ? null : Number(e.target.value),
                  sequence_or_formula: content.molecular_details?.sequence_or_formula ?? null,
                  molecular_weight_g_per_mol: content.molecular_details?.molecular_weight_g_per_mol ?? null,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Peptide Sequence / Chemical Formula</Label>
            <Input
              value={content.molecular_details?.sequence_or_formula || ""}
              disabled={disabled}
              placeholder="e.g. Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val"
              onChange={(e) => update({
                molecular_details: {
                  cas_number: content.molecular_details?.cas_number ?? null,
                  pubchem_cid: content.molecular_details?.pubchem_cid ?? null,
                  sequence_or_formula: e.target.value || null,
                  molecular_weight_g_per_mol: content.molecular_details?.molecular_weight_g_per_mol ?? null,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Molecular Weight (g/mol)</Label>
            <Input
              type="number"
              step="0.01"
              value={content.molecular_details?.molecular_weight_g_per_mol ?? ""}
              disabled={disabled}
              placeholder="e.g. 1419.5"
              onChange={(e) => update({
                molecular_details: {
                  cas_number: content.molecular_details?.cas_number ?? null,
                  pubchem_cid: content.molecular_details?.pubchem_cid ?? null,
                  sequence_or_formula: content.molecular_details?.sequence_or_formula ?? null,
                  molecular_weight_g_per_mol: e.target.value === "" ? null : Number(e.target.value),
                }
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div>
          <Text size="small" weight="plus">Reconstitution & Laboratory Stoichiometry</Text>
          <Text size="small" className="text-ui-fg-subtle">Vial net mass, reconstitution diluent volume, resulting concentration, solvent, and dissolution technique.</Text>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-y-2">
            <Label>Default Vial Net Mass (mg)</Label>
            <Input
              type="number"
              value={content.reconstitution_details?.default_vial_net_mg ?? ""}
              disabled={disabled}
              onChange={(e) => update({
                reconstitution_details: {
                  default_vial_net_mg: e.target.value === "" ? null : Number(e.target.value),
                  default_diluent_ml: content.reconstitution_details?.default_diluent_ml ?? null,
                  resulting_concentration_mg_per_ml: content.reconstitution_details?.resulting_concentration_mg_per_ml ?? null,
                  solvent: content.reconstitution_details?.solvent ?? null,
                  dissolution_method: content.reconstitution_details?.dissolution_method ?? null,
                  handling_rule: content.reconstitution_details?.handling_rule ?? null,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Default Diluent Volume (mL)</Label>
            <Input
              type="number"
              step="0.1"
              value={content.reconstitution_details?.default_diluent_ml ?? ""}
              disabled={disabled}
              onChange={(e) => update({
                reconstitution_details: {
                  default_vial_net_mg: content.reconstitution_details?.default_vial_net_mg ?? null,
                  default_diluent_ml: e.target.value === "" ? null : Number(e.target.value),
                  resulting_concentration_mg_per_ml: content.reconstitution_details?.resulting_concentration_mg_per_ml ?? null,
                  solvent: content.reconstitution_details?.solvent ?? null,
                  dissolution_method: content.reconstitution_details?.dissolution_method ?? null,
                  handling_rule: content.reconstitution_details?.handling_rule ?? null,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Resulting Concentration (mg/mL)</Label>
            <Input
              type="number"
              step="0.01"
              value={content.reconstitution_details?.resulting_concentration_mg_per_ml ?? ""}
              disabled={disabled}
              onChange={(e) => update({
                reconstitution_details: {
                  default_vial_net_mg: content.reconstitution_details?.default_vial_net_mg ?? null,
                  default_diluent_ml: content.reconstitution_details?.default_diluent_ml ?? null,
                  resulting_concentration_mg_per_ml: e.target.value === "" ? null : Number(e.target.value),
                  solvent: content.reconstitution_details?.solvent ?? null,
                  dissolution_method: content.reconstitution_details?.dissolution_method ?? null,
                  handling_rule: content.reconstitution_details?.handling_rule ?? null,
                }
              })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Reconstitution Solvent</Label>
          <Input
            value={content.reconstitution_details?.solvent || ""}
            disabled={disabled}
            placeholder="e.g. Bacteriostatic Water USP (0.9% Benzyl Alcohol)"
            onChange={(e) => update({
              reconstitution_details: {
                default_vial_net_mg: content.reconstitution_details?.default_vial_net_mg ?? null,
                default_diluent_ml: content.reconstitution_details?.default_diluent_ml ?? null,
                resulting_concentration_mg_per_ml: content.reconstitution_details?.resulting_concentration_mg_per_ml ?? null,
                solvent: e.target.value || null,
                dissolution_method: content.reconstitution_details?.dissolution_method ?? null,
                handling_rule: content.reconstitution_details?.handling_rule ?? null,
              }
            })}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <Label>Dissolution Technique</Label>
            <Textarea
              value={content.reconstitution_details?.dissolution_method || ""}
              disabled={disabled}
              placeholder="e.g. Swirl gently horizontally in circular motion. Do not agitate or vortex."
              onChange={(e) => update({
                reconstitution_details: {
                  default_vial_net_mg: content.reconstitution_details?.default_vial_net_mg ?? null,
                  default_diluent_ml: content.reconstitution_details?.default_diluent_ml ?? null,
                  resulting_concentration_mg_per_ml: content.reconstitution_details?.resulting_concentration_mg_per_ml ?? null,
                  solvent: content.reconstitution_details?.solvent ?? null,
                  dissolution_method: e.target.value || null,
                  handling_rule: content.reconstitution_details?.handling_rule ?? null,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Handling Rule & Solution Clarity</Label>
            <Textarea
              value={content.reconstitution_details?.handling_rule || ""}
              disabled={disabled}
              placeholder="e.g. Clear, colorless solution. Inspect visually for particulates prior to assay."
              onChange={(e) => update({
                reconstitution_details: {
                  default_vial_net_mg: content.reconstitution_details?.default_vial_net_mg ?? null,
                  default_diluent_ml: content.reconstitution_details?.default_diluent_ml ?? null,
                  resulting_concentration_mg_per_ml: content.reconstitution_details?.resulting_concentration_mg_per_ml ?? null,
                  solvent: content.reconstitution_details?.solvent ?? null,
                  dissolution_method: content.reconstitution_details?.dissolution_method ?? null,
                  handling_rule: e.target.value || null,
                }
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div>
          <Text size="small" weight="plus">Storage & Temperature Stability</Text>
          <Text size="small" className="text-ui-fg-subtle">Lyophilized solid and reconstituted liquid thermal stability constraints.</Text>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-y-2">
            <Label>Lyophilized Powder Storage</Label>
            <Input
              value={content.storage_details?.lyophilized || ""}
              disabled={disabled}
              placeholder="e.g. -20°C (desiccated, stable 24 months)"
              onChange={(e) => update({
                storage_details: {
                  lyophilized: e.target.value || null,
                  reconstituted: content.storage_details?.reconstituted ?? null,
                  light_protection: content.storage_details?.light_protection ?? true,
                }
              })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Reconstituted Liquid Stability</Label>
            <Input
              value={content.storage_details?.reconstituted || ""}
              disabled={disabled}
              placeholder="e.g. 2°C–8°C refrigerated (stable 30 days)"
              onChange={(e) => update({
                storage_details: {
                  lyophilized: content.storage_details?.lyophilized ?? null,
                  reconstituted: e.target.value || null,
                  light_protection: content.storage_details?.light_protection ?? true,
                }
              })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="light_protection_checkbox"
            checked={content.storage_details?.light_protection ?? true}
            disabled={disabled}
            onChange={(e) => update({
              storage_details: {
                lyophilized: content.storage_details?.lyophilized ?? null,
                reconstituted: content.storage_details?.reconstituted ?? null,
                light_protection: e.target.checked,
              }
            })}
            className="h-4 w-4 rounded border-ui-border-base text-ui-fg-interactive focus:ring-ui-bg-interactive"
          />
          <Label htmlFor="light_protection_checkbox" className="cursor-pointer">
            Light Protection Required (Shield from direct sunlight and UV exposure)
          </Label>
        </div>
      </div>

      <div id="quick-reference" className="scroll-mt-24 flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4">
          <div><Text size="small" weight="plus">Quick-reference cards</Text><Text size="small" className="text-ui-fg-subtle">Typical amount, frequency, duration, half-life, preparation, storage, or any custom fact.</Text></div>
          <Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ quick_reference: [...content.quick_reference, { key: `fact-${content.quick_reference.length + 1}`, label: "", value: "", description: null, evidence_label: null, reference_keys: [] }] })}>Add card</Button>
        </div>
        {content.quick_reference.map((item, index) => {
          const change = (patch: Partial<typeof item>) => {
            const next = [...content.quick_reference]
            next[index] = { ...item, ...patch }
            update({ quick_reference: next })
          }
          return <div key={`${item.key}-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="flex flex-col gap-y-2"><Label>Label</Label><Input value={item.label} disabled={disabled} onChange={(event) => change({ label: event.target.value, key: keyFrom(event.target.value, item.key) })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Value</Label><Input value={item.value} disabled={disabled} onChange={(event) => change({ value: event.target.value })} /></div>
              <Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ quick_reference: content.quick_reference.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-y-2"><Label>Explanation</Label><Textarea value={item.description || ""} disabled={disabled} onChange={(event) => change({ description: event.target.value || null })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Evidence label</Label><Input value={item.evidence_label || ""} disabled={disabled} onChange={(event) => change({ evidence_label: event.target.value || null })} /></div>
            </div>
          </div>
        })}
      </div>

      <div id="calculator" className="scroll-mt-24 flex flex-col gap-y-4 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-center justify-between gap-x-4">
          <div><Text size="small" weight="plus">Calculator</Text><Text size="small" className="text-ui-fg-subtle">Configure the defaults used by the customer-side concentration and delivery calculator.</Text></div>
          <Button size="small" variant={content.calculator.enabled ? "primary" : "secondary"} disabled={disabled} onClick={() => update({ calculator: { ...content.calculator, enabled: !content.calculator.enabled } })}>{content.calculator.enabled ? "Enabled" : "Enable calculator"}</Button>
        </div>
        {content.calculator.enabled ? <>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-y-2"><Label>Calculator title</Label><Input value={content.calculator.title} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, title: event.target.value } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Rounding precision</Label><Input type="number" min={0} max={6} value={content.calculator.rounding_precision} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, rounding_precision: Number(event.target.value) || 0 } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Default compound mass</Label><Input value={content.calculator.default_compound_mass || ""} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, default_compound_mass: event.target.value || null } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Compound mass unit</Label><Select value={content.calculator.compound_mass_unit} disabled={disabled} onValueChange={(unit) => update({ calculator: { ...content.calculator, compound_mass_unit: unit as "mcg" | "mg" | "g" | "IU" } })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{["mcg", "mg", "g", "IU"].map((unit) => <Select.Item key={unit} value={unit}>{unit}</Select.Item>)}</Select.Content></Select></div>
            <div className="flex flex-col gap-y-2"><Label>Default final volume (mL)</Label><Input value={content.calculator.default_final_volume_ml || ""} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, default_final_volume_ml: event.target.value || null } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Default target amount</Label><Input value={content.calculator.default_target_amount || ""} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, default_target_amount: event.target.value || null } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Target amount unit</Label><Select value={content.calculator.target_amount_unit} disabled={disabled} onValueChange={(unit) => update({ calculator: { ...content.calculator, target_amount_unit: unit as "mcg" | "mg" | "IU" } })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{["mcg", "mg", "IU"].map((unit) => <Select.Item key={unit} value={unit}>{unit}</Select.Item>)}</Select.Content></Select></div>
            <div className="flex flex-col gap-y-2"><Label>IU per mg conversion</Label><Input value={content.calculator.iu_per_mg || ""} disabled={disabled} placeholder="Required only for IU calculations" onChange={(event) => update({ calculator: { ...content.calculator, iu_per_mg: event.target.value || null } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Device volume (mL)</Label><Input value={content.calculator.device_volume_ml || ""} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, device_volume_ml: event.target.value || null } })} /></div>
            <div className="flex flex-col gap-y-2"><Label>Device label</Label><Input value={content.calculator.device_label || ""} disabled={disabled} placeholder="Pump, dropper, or syringe" onChange={(event) => update({ calculator: { ...content.calculator, device_label: event.target.value || null } })} /></div>
          </div>
          <div className="flex flex-col gap-y-2"><Label>Calculator instructions</Label><Textarea value={content.calculator.instructions || ""} disabled={disabled} onChange={(event) => update({ calculator: { ...content.calculator, instructions: event.target.value || null } })} /></div>
        </> : null}
      </div>

      <div id="dosage-schedule" className="scroll-mt-24 flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4"><div><Text size="small" weight="plus">Dosage schedule</Text><Text size="small" className="text-ui-fg-subtle">Structured levels and phases shown to customers and available for Personal Routines.</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ protocol_levels: [...content.protocol_levels, { key: `level-${content.protocol_levels.length + 1}`, title: "", summary: null, duration: null, interval: null, applicability: null, evidence_label: null, reference_keys: [], routine_enabled: false, rows: [] }] })}>Add level</Button></div>
        {content.protocol_levels.map((level, levelIndex) => {
          const changeLevel = (patch: Partial<typeof level>) => { const next = [...content.protocol_levels]; next[levelIndex] = { ...level, ...patch }; update({ protocol_levels: next }) }
          return <div key={`${level.key}-${levelIndex}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <div className="flex flex-col gap-y-2"><Label>Level title</Label><Input value={level.title} disabled={disabled} onChange={(event) => changeLevel({ title: event.target.value, key: keyFrom(event.target.value, level.key) })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Duration</Label><Input value={level.duration || ""} disabled={disabled} onChange={(event) => changeLevel({ duration: event.target.value || null })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Interval or washout</Label><Input value={level.interval || ""} disabled={disabled} onChange={(event) => changeLevel({ interval: event.target.value || null })} /></div>
              <Button size="small" variant={level.routine_enabled ? "primary" : "secondary"} className="self-end" disabled={disabled} onClick={() => changeLevel({ routine_enabled: !level.routine_enabled })}>{level.routine_enabled ? "Routine enabled" : "Enable routine"}</Button>
              <Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ protocol_levels: content.protocol_levels.filter((_, index) => index !== levelIndex) })}>Remove</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2"><div className="flex flex-col gap-y-2"><Label>Summary</Label><Textarea value={level.summary || ""} disabled={disabled} onChange={(event) => changeLevel({ summary: event.target.value || null })} /></div><div className="flex flex-col gap-y-2"><Label>Applicability</Label><Textarea value={level.applicability || ""} disabled={disabled} onChange={(event) => changeLevel({ applicability: event.target.value || null })} /></div></div>
            <div className="flex items-center justify-between"><div><Text size="small" weight="plus">Schedule rows</Text><Text size="xsmall" className="text-ui-fg-subtle">Offsets start at day 0. Times use the customer&apos;s local timezone.</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => changeLevel({ rows: [...level.rows, { row_key: `phase-${level.rows.length + 1}`, period: "", start_offset_days: null, end_offset_days: null, amount: "", unit: "mcg", recurrence_type: "custom", times_per_day: null, weekdays: [], suggested_local_times: [], frequency: "", notes: null, reference_keys: [] }] })}>Add row</Button></div>
            {level.rows.map((row, rowIndex) => {
              const changeRow = (patch: Partial<typeof row>) => { const rows = [...level.rows]; rows[rowIndex] = { ...row, ...patch }; changeLevel({ rows }) }
              return <div key={`row-${rowIndex}`} className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-3">
                <div className="grid gap-3 md:grid-cols-[1.3fr_90px_90px_1fr_100px_auto]">
                  <div className="flex flex-col gap-y-2"><Label>Display period</Label><Input value={row.period} disabled={disabled} placeholder="Weeks 1-2" onChange={(event) => changeRow({ period: event.target.value, row_key: keyFrom(event.target.value, row.row_key || `phase-${rowIndex + 1}`) })} /></div>
                  <div className="flex flex-col gap-y-2"><Label>Start day</Label><Input type="number" min={0} value={row.start_offset_days ?? ""} disabled={disabled} onChange={(event) => changeRow({ start_offset_days: event.target.value === "" ? null : Number(event.target.value) })} /></div>
                  <div className="flex flex-col gap-y-2"><Label>End day</Label><Input type="number" min={0} value={row.end_offset_days ?? ""} disabled={disabled} onChange={(event) => changeRow({ end_offset_days: event.target.value === "" ? null : Number(event.target.value) })} /></div>
                  <div className="flex flex-col gap-y-2"><Label>Amount</Label><Input value={row.amount} disabled={disabled} onChange={(event) => changeRow({ amount: event.target.value })} /></div>
                  <div className="flex flex-col gap-y-2"><Label>Unit</Label><Select value={row.unit} disabled={disabled} onValueChange={(unit) => changeRow({ unit: unit as ResearchProtocolUnit })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{units.map((unit) => <Select.Item key={unit} value={unit}>{unit}</Select.Item>)}</Select.Content></Select></div>
                  <Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => changeLevel({ rows: level.rows.filter((_, index) => index !== rowIndex) })}>Remove</Button>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="flex flex-col gap-y-2"><Label>Recurrence</Label><Select value={row.recurrence_type || "custom"} disabled={disabled} onValueChange={(recurrenceType) => changeRow({ recurrence_type: recurrenceType as typeof row.recurrence_type })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{["once", "daily", "weekly", "custom"].map((item) => <Select.Item key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</Select.Item>)}</Select.Content></Select></div>
                  <div className="flex flex-col gap-y-2"><Label>Times per day</Label><Input type="number" min={1} max={24} value={row.times_per_day ?? ""} disabled={disabled} onChange={(event) => changeRow({ times_per_day: event.target.value === "" ? null : Number(event.target.value) })} /></div>
                  <div className="flex flex-col gap-y-2"><Label>Suggested times</Label><Input value={(row.suggested_local_times || []).join(", ")} disabled={disabled} placeholder="08:00, 20:00" onChange={(event) => changeRow({ suggested_local_times: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></div>
                  <div className="flex flex-col gap-y-2"><Label>Customer frequency</Label><Input value={row.frequency} disabled={disabled} placeholder="Once daily" onChange={(event) => changeRow({ frequency: event.target.value })} /></div>
                </div>
                <div className="flex flex-col gap-y-2"><Label>Notes</Label><Textarea value={row.notes || ""} disabled={disabled} onChange={(event) => changeRow({ notes: event.target.value || null })} /></div>
              </div>
            })}
          </div>
        })}
      </div>

      <div id="detailed-sections" className="scroll-mt-24 flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4"><div><Text size="small" weight="plus">Detailed sections</Text><Text size="small" className="text-ui-fg-subtle">About, benefits, uses, administration, preparation, stacking, side effects, contraindications, storage, or custom content.</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ sections: [...content.sections, { key: `section-${content.sections.length + 1}`, title: "", body: "", visible: true, position: content.sections.length, reference_keys: [] }] })}>Add section</Button></div>
        {content.sections.map((section, index) => {
          const change = (patch: Partial<typeof section>) => { const next = [...content.sections]; next[index] = { ...section, ...patch }; update({ sections: next }) }
          return <div key={`${section.key}-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3"><div className="grid gap-3 md:grid-cols-[1fr_120px_120px_auto]"><div className="flex flex-col gap-y-2"><Label>Section title</Label><Input value={section.title} disabled={disabled} onChange={(event) => change({ title: event.target.value, key: keyFrom(event.target.value, section.key) })} /></div><div className="flex flex-col gap-y-2"><Label>Position</Label><Input type="number" min={0} value={section.position} disabled={disabled} onChange={(event) => change({ position: Number(event.target.value) || 0 })} /></div><Button size="small" variant={section.visible ? "primary" : "secondary"} className="self-end" disabled={disabled} onClick={() => change({ visible: !section.visible })}>{section.visible ? "Visible" : "Hidden"}</Button><Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ sections: content.sections.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button></div><div className="flex flex-col gap-y-2"><Label>Content</Label><Textarea value={section.body} disabled={disabled} onChange={(event) => change({ body: event.target.value })} /></div></div>
        })}
      </div>

      <div id="faqs" className="scroll-mt-24 flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4"><div><Text size="small" weight="plus">Frequently asked questions</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ faqs: [...content.faqs, { key: `faq-${content.faqs.length + 1}`, question: "", answer: "", position: content.faqs.length }] })}>Add FAQ</Button></div>
        {content.faqs.map((faq, index) => {
          const change = (patch: Partial<typeof faq>) => { const next = [...content.faqs]; next[index] = { ...faq, ...patch }; update({ faqs: next }) }
          return <div key={`${faq.key}-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3"><div className="grid gap-3 md:grid-cols-[1fr_120px_auto]"><div className="flex flex-col gap-y-2"><Label>Question</Label><Input value={faq.question} disabled={disabled} onChange={(event) => change({ question: event.target.value, key: keyFrom(event.target.value, faq.key) })} /></div><div className="flex flex-col gap-y-2"><Label>Position</Label><Input type="number" min={0} value={faq.position} disabled={disabled} onChange={(event) => change({ position: Number(event.target.value) || 0 })} /></div><Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ faqs: content.faqs.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button></div><div className="flex flex-col gap-y-2"><Label>Answer</Label><Textarea value={faq.answer} disabled={disabled} onChange={(event) => change({ answer: event.target.value })} /></div></div>
        })}
      </div>
    </div>
  )
}
