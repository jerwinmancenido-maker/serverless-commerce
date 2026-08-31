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
        <div className="flex flex-col gap-y-2"><Label>Product format</Label><Input value={content.product_format || ""} disabled={disabled} placeholder="Nasal, Injectable, Oral, or Topical" onChange={(event) => update({ product_format: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Research category</Label><Input value={content.category || ""} disabled={disabled} onChange={(event) => update({ category: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Last reviewed</Label><Input type="date" value={content.last_reviewed_at || ""} disabled={disabled} onChange={(event) => update({ last_reviewed_at: event.target.value || null })} /></div>
        <div className="flex flex-col gap-y-2"><Label>Page label</Label><Input value={content.research_use_label} disabled={disabled} onChange={(event) => update({ research_use_label: event.target.value })} /></div>
      </div>
      <div className="flex flex-col gap-y-2"><Label>Customer introduction</Label><Textarea value={content.short_introduction || ""} disabled={disabled} onChange={(event) => update({ short_introduction: event.target.value || null })} /></div>

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
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

      <div className="flex flex-col gap-y-4 rounded-lg border border-ui-border-base p-4">
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

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4"><div><Text size="small" weight="plus">Protocol levels</Text><Text size="small" className="text-ui-fg-subtle">Micro, starter, standard, advanced, or custom schedules.</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ protocol_levels: [...content.protocol_levels, { key: `level-${content.protocol_levels.length + 1}`, title: "", summary: null, duration: null, interval: null, applicability: null, evidence_label: null, reference_keys: [], rows: [] }] })}>Add level</Button></div>
        {content.protocol_levels.map((level, levelIndex) => {
          const changeLevel = (patch: Partial<typeof level>) => { const next = [...content.protocol_levels]; next[levelIndex] = { ...level, ...patch }; update({ protocol_levels: next }) }
          return <div key={`${level.key}-${levelIndex}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="flex flex-col gap-y-2"><Label>Level title</Label><Input value={level.title} disabled={disabled} onChange={(event) => changeLevel({ title: event.target.value, key: keyFrom(event.target.value, level.key) })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Duration</Label><Input value={level.duration || ""} disabled={disabled} onChange={(event) => changeLevel({ duration: event.target.value || null })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Interval or washout</Label><Input value={level.interval || ""} disabled={disabled} onChange={(event) => changeLevel({ interval: event.target.value || null })} /></div>
              <Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ protocol_levels: content.protocol_levels.filter((_, index) => index !== levelIndex) })}>Remove</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2"><div className="flex flex-col gap-y-2"><Label>Summary</Label><Textarea value={level.summary || ""} disabled={disabled} onChange={(event) => changeLevel({ summary: event.target.value || null })} /></div><div className="flex flex-col gap-y-2"><Label>Applicability</Label><Textarea value={level.applicability || ""} disabled={disabled} onChange={(event) => changeLevel({ applicability: event.target.value || null })} /></div></div>
            <div className="flex items-center justify-between"><Text size="small" weight="plus">Schedule rows</Text><Button size="small" variant="secondary" disabled={disabled} onClick={() => changeLevel({ rows: [...level.rows, { period: "", amount: "", unit: "mcg", frequency: "", notes: null }] })}>Add row</Button></div>
            {level.rows.map((row, rowIndex) => {
              const changeRow = (patch: Partial<typeof row>) => { const rows = [...level.rows]; rows[rowIndex] = { ...row, ...patch }; changeLevel({ rows }) }
              return <div key={`row-${rowIndex}`} className="grid gap-3 rounded-lg border border-ui-border-base p-3 md:grid-cols-[1fr_1fr_100px_1fr_auto]">
                <div className="flex flex-col gap-y-2"><Label>Period</Label><Input value={row.period} disabled={disabled} onChange={(event) => changeRow({ period: event.target.value })} /></div>
                <div className="flex flex-col gap-y-2"><Label>Amount</Label><Input value={row.amount} disabled={disabled} onChange={(event) => changeRow({ amount: event.target.value })} /></div>
                <div className="flex flex-col gap-y-2"><Label>Unit</Label><Select value={row.unit} disabled={disabled} onValueChange={(unit) => changeRow({ unit: unit as ResearchProtocolUnit })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{units.map((unit) => <Select.Item key={unit} value={unit}>{unit}</Select.Item>)}</Select.Content></Select></div>
                <div className="flex flex-col gap-y-2"><Label>Frequency</Label><Input value={row.frequency} disabled={disabled} onChange={(event) => changeRow({ frequency: event.target.value })} /></div>
                <Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => changeLevel({ rows: level.rows.filter((_, index) => index !== rowIndex) })}>Remove</Button>
              </div>
            })}
          </div>
        })}
      </div>

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4"><div><Text size="small" weight="plus">Detailed sections</Text><Text size="small" className="text-ui-fg-subtle">About, benefits, uses, administration, preparation, stacking, side effects, contraindications, storage, or custom content.</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ sections: [...content.sections, { key: `section-${content.sections.length + 1}`, title: "", body: "", visible: true, position: content.sections.length, reference_keys: [] }] })}>Add section</Button></div>
        {content.sections.map((section, index) => {
          const change = (patch: Partial<typeof section>) => { const next = [...content.sections]; next[index] = { ...section, ...patch }; update({ sections: next }) }
          return <div key={`${section.key}-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3"><div className="grid gap-3 md:grid-cols-[1fr_120px_120px_auto]"><div className="flex flex-col gap-y-2"><Label>Section title</Label><Input value={section.title} disabled={disabled} onChange={(event) => change({ title: event.target.value, key: keyFrom(event.target.value, section.key) })} /></div><div className="flex flex-col gap-y-2"><Label>Position</Label><Input type="number" min={0} value={section.position} disabled={disabled} onChange={(event) => change({ position: Number(event.target.value) || 0 })} /></div><Button size="small" variant={section.visible ? "primary" : "secondary"} className="self-end" disabled={disabled} onClick={() => change({ visible: !section.visible })}>{section.visible ? "Visible" : "Hidden"}</Button><Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ sections: content.sections.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button></div><div className="flex flex-col gap-y-2"><Label>Content</Label><Textarea value={section.body} disabled={disabled} onChange={(event) => change({ body: event.target.value })} /></div></div>
        })}
      </div>

      <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
        <div className="flex items-start justify-between gap-x-4"><div><Text size="small" weight="plus">Frequently asked questions</Text></div><Button size="small" variant="secondary" disabled={disabled} onClick={() => update({ faqs: [...content.faqs, { key: `faq-${content.faqs.length + 1}`, question: "", answer: "", position: content.faqs.length }] })}>Add FAQ</Button></div>
        {content.faqs.map((faq, index) => {
          const change = (patch: Partial<typeof faq>) => { const next = [...content.faqs]; next[index] = { ...faq, ...patch }; update({ faqs: next }) }
          return <div key={`${faq.key}-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3"><div className="grid gap-3 md:grid-cols-[1fr_120px_auto]"><div className="flex flex-col gap-y-2"><Label>Question</Label><Input value={faq.question} disabled={disabled} onChange={(event) => change({ question: event.target.value, key: keyFrom(event.target.value, faq.key) })} /></div><div className="flex flex-col gap-y-2"><Label>Position</Label><Input type="number" min={0} value={faq.position} disabled={disabled} onChange={(event) => change({ position: Number(event.target.value) || 0 })} /></div><Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => update({ faqs: content.faqs.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button></div><div className="flex flex-col gap-y-2"><Label>Answer</Label><Textarea value={faq.answer} disabled={disabled} onChange={(event) => change({ answer: event.target.value })} /></div></div>
        })}
      </div>
    </div>
  )
}
