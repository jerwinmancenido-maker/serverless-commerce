/**
 * @file    apps/backend/src/admin/routes/compounded-products/protocol-customer-content-fields.tsx
 * @module  ProtocolCustomerContentFields
 * @purpose Customer-facing protocol documentation, notes, and guidance fields.
 * @contracts
 *   Service: ResearchTrackingModuleService
 */

import { Button, Input, Label, Select, Text, Textarea } from "@medusajs/ui"
import { SovereignMarkdownCanvas } from "../../components/editor/sovereign-markdown-canvas"
import { TagChipInput } from "../../components/ui/tag-chip-input"
import { ReconstitutionStoichiometryCard } from "../../components/editor/reconstitution-stoichiometry-card"
import { DosageScheduleMatrix } from "../../components/editor/dosage-schedule-matrix"

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
        <SovereignMarkdownCanvas
          id="protocol-full-description"
          label="Pharmacological Monograph & Mechanism of Action"
          sublabel="Comprehensive profile detailing receptor binding, biological pathway, and in vitro kinetics."
          value={content.full_description || ""}
          onChange={(val) => update({ full_description: val || null })}
          initialViewMode="write"
          minHeight="220px"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-y-2">
          <Label>Researched Benefits & Validated Actions</Label>
          <TagChipInput
            id="protocol-investigated-benefits"
            variant="emerald"
            placeholder="Type a researched benefit and press Enter or comma..."
            tags={content.investigated_benefits || []}
            onChange={(newTags) => update({ investigated_benefits: newTags })}
            disabled={disabled}
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            Press Enter or comma to create a validated analytical action pill.
          </Text>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Adverse Observations & Handling Precautions</Label>
          <TagChipInput
            id="protocol-adverse-observations"
            variant="amber"
            placeholder="Type a laboratory precaution and press Enter or comma..."
            tags={content.adverse_observations || []}
            onChange={(newTags) => update({ adverse_observations: newTags })}
            disabled={disabled}
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            Press Enter or comma to create a handling caution pill.
          </Text>
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

      <ReconstitutionStoichiometryCard
        value={content.reconstitution_details}
        onChange={(reconstitution_details) => update({ reconstitution_details })}
        disabled={disabled}
      />

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
              placeholder="e.g. 20°C–25°C (ambient desiccated, stable 24 months)"
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

      <div id="dosage-schedule" className="scroll-mt-24">
        {/* Dosage schedule matrix: Routine enabled, start_offset_days, suggested_local_times */}
        <DosageScheduleMatrix
          value={content.protocol_levels}
          onChange={(protocol_levels) => update({ protocol_levels })}
          disabled={disabled}
        />
      </div>

      <div id="detailed-sections" className="scroll-mt-24 flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4">
          <div>
            <Text size="small" weight="plus">Detailed sections</Text>
            <Text size="small" className="text-ui-fg-subtle">
              About, benefits, uses, administration, preparation, stacking, side effects, contraindications, storage, or custom content with full markdown formatting.
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            disabled={disabled}
            onClick={() => update({
              sections: [
                ...content.sections,
                {
                  key: `section-${content.sections.length + 1}`,
                  title: "",
                  body: "",
                  visible: true,
                  position: content.sections.length,
                  reference_keys: [],
                },
              ],
            })}
          >
            Add section
          </Button>
        </div>
        {content.sections.map((section, index) => {
          const change = (patch: Partial<typeof section>) => {
            const next = [...content.sections]
            next[index] = { ...section, ...patch }
            update({ sections: next })
          }
          return (
            <div key={`${section.key}-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3.5 border border-ui-border-base">
              <div className="grid gap-3 md:grid-cols-[1fr_120px_120px_auto]">
                <div className="flex flex-col gap-y-2">
                  <Label>Section title</Label>
                  <Input
                    value={section.title}
                    disabled={disabled}
                    onChange={(event) => change({ title: event.target.value, key: keyFrom(event.target.value, section.key) })}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Position</Label>
                  <Input
                    type="number"
                    min={0}
                    value={section.position}
                    disabled={disabled}
                    onChange={(event) => change({ position: Number(event.target.value) || 0 })}
                  />
                </div>
                <Button
                  size="small"
                  variant={section.visible ? "primary" : "secondary"}
                  className="self-end"
                  disabled={disabled}
                  onClick={() => change({ visible: !section.visible })}
                >
                  {section.visible ? "Visible" : "Hidden"}
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  className="self-end"
                  disabled={disabled}
                  onClick={() => update({ sections: content.sections.filter((_, itemIndex) => itemIndex !== index) })}
                >
                  Remove
                </Button>
              </div>
              <div className="flex flex-col gap-y-1.5">
                <Label>Section Body (Markdown &amp; Tables Supported)</Label>
                <SovereignMarkdownCanvas
                  id={`section-canvas-${section.key || index}`}
                  value={section.body}
                  onChange={(val) => change({ body: val })}
                  disabled={disabled}
                  initialViewMode="write"
                  minHeight="140px"
                  placeholder="Draft section clinical narrative, molecular interactions, and laboratory guidelines..."
                />
              </div>
            </div>
          )
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
