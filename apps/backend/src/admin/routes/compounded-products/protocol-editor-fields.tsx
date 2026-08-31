import {
  Button,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"

import type {
  ResearchProtocolEvidenceScope,
  ResearchProtocolMutationBody,
} from "./research-protocol-types"
import { ProtocolCustomerContentFields } from "./protocol-customer-content-fields"

type Props = {
  value: ResearchProtocolMutationBody
  onChange: (value: ResearchProtocolMutationBody) => void
  disabled?: boolean
}

const updateContent = (
  value: ResearchProtocolMutationBody,
  onChange: Props["onChange"],
  patch: Partial<ResearchProtocolMutationBody["content"]>,
) => onChange({ ...value, content: { ...value.content, ...patch } })

const researchUnits = ["mcg", "mg", "g", "µL", "mL", "L", "IU", "piece"] as const

export const ProtocolEditorFields = ({
  value,
  onChange,
  disabled = false,
}: Props) => (
  <div className="flex flex-col gap-y-6">
    <ProtocolCustomerContentFields value={value} onChange={onChange} disabled={disabled} />
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-y-2">
        <Label>Protocol title</Label>
        <Input
          value={value.title}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
        />
      </div>
      <div className="flex flex-col gap-y-2">
        <Label>Evidence scope</Label>
        <Select
          value={value.evidence_scope}
          disabled={disabled}
          onValueChange={(evidenceScope) =>
            onChange({
              ...value,
              evidence_scope: evidenceScope as ResearchProtocolEvidenceScope,
            })
          }
        >
          <Select.Trigger><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="sku">SKU</Select.Item>
            <Select.Item value="formulation">Formulation</Select.Item>
            <Select.Item value="batch">Batch</Select.Item>
          </Select.Content>
        </Select>
      </div>
    </div>

    <div className="flex flex-col gap-y-2">
      <Label>Short summary</Label>
      <Textarea
        value={value.summary || ""}
        disabled={disabled}
        onChange={(event) =>
          onChange({ ...value, summary: event.target.value || null })
        }
      />
    </div>

    <div className="flex flex-col gap-y-2">
      <Label>Internal purpose</Label>
      <Textarea
        value={value.purpose || ""}
        disabled={disabled}
        onChange={(event) => onChange({ ...value, purpose: event.target.value || null })}
      />
      <Text size="small" leading="compact" className="text-ui-fg-subtle">
        Visible to Admin users only. It is excluded from the customer preview.
      </Text>
    </div>

    <div className="flex flex-col gap-y-2">
      <Label>What this research guide covers</Label>
      <Textarea
        value={value.content.research_purpose}
        disabled={disabled}
        onChange={(event) =>
          updateContent(value, onChange, { research_purpose: event.target.value })
        }
      />
    </div>
    <div className="flex flex-col gap-y-2">
      <Label>Quick overview</Label>
      <Textarea
        value={value.content.intended_application || ""}
        disabled={disabled}
        onChange={(event) =>
          updateContent(value, onChange, {
            intended_application: event.target.value || null,
          })
        }
      />
    </div>
    <div className="flex flex-col gap-y-2">
      <Label>Important limitations</Label>
      <Textarea
        value={value.content.explicit_exclusions || ""}
        disabled={disabled}
        onChange={(event) =>
          updateContent(value, onChange, {
            explicit_exclusions: event.target.value || null,
          })
        }
      />
      <Text size="xsmall" className="text-ui-fg-subtle">
        Explain the boundaries, uncertainty, and applicability of this revision.
      </Text>
    </div>

    <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" leading="compact" weight="plus">Reference quantities</Text>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Record exact units, concentration, purpose, and conversion context.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={disabled}
          onClick={() => updateContent(value, onChange, {
            reference_quantities: [...value.content.reference_quantities, {
              label: "",
              value: "",
              unit: "mcg",
              concentration: null,
              conversion_basis: null,
              laboratory_purpose: "",
              notes: null,
              product_format: null,
            }],
          })}
        >
          Add quantity
        </Button>
      </div>
      {value.content.reference_quantities.length ? value.content.reference_quantities.map((quantity, index) => {
        const updateQuantity = (patch: Partial<typeof quantity>) => {
          const next = [...value.content.reference_quantities]
          next[index] = { ...quantity, ...patch }
          updateContent(value, onChange, { reference_quantities: next })
        }
        return (
          <div key={`quantity-${index}`} className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(100px,1fr)_minmax(100px,1fr)_auto]">
              <div className="flex flex-col gap-y-2"><Label>Label</Label><Input value={quantity.label} disabled={disabled} onChange={(event) => updateQuantity({ label: event.target.value })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Value</Label><Input value={quantity.value} disabled={disabled} onChange={(event) => updateQuantity({ value: event.target.value })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Unit</Label><Select value={quantity.unit} disabled={disabled} onValueChange={(unit) => updateQuantity({ unit: unit as (typeof researchUnits)[number] })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{researchUnits.map((unit) => <Select.Item key={unit} value={unit}>{unit}</Select.Item>)}</Select.Content></Select></div>
              <Button size="small" variant="secondary" className="self-end" disabled={disabled} onClick={() => updateContent(value, onChange, { reference_quantities: value.content.reference_quantities.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-y-2"><Label>Laboratory purpose</Label><Input value={quantity.laboratory_purpose} disabled={disabled} onChange={(event) => updateQuantity({ laboratory_purpose: event.target.value })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Product format</Label><Input value={quantity.product_format || ""} disabled={disabled} placeholder="Optional" onChange={(event) => updateQuantity({ product_format: event.target.value || null })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Concentration context</Label><Input value={quantity.concentration || ""} disabled={disabled} placeholder="For example, 1 mg/mL" onChange={(event) => updateQuantity({ concentration: event.target.value || null })} /></div>
              <div className="flex flex-col gap-y-2"><Label>Conversion basis</Label><Input value={quantity.conversion_basis || ""} disabled={disabled} placeholder="For example, 1,000 mcg = 1 mg" onChange={(event) => updateQuantity({ conversion_basis: event.target.value || null })} /></div>
            </div>
            <div className="flex flex-col gap-y-2"><Label>Notes</Label><Textarea value={quantity.notes || ""} disabled={disabled} onChange={(event) => updateQuantity({ notes: event.target.value || null })} /></div>
          </div>
        )
      }) : <Text size="small" leading="compact" className="text-ui-fg-subtle">No laboratory reference quantities recorded.</Text>}
    </div>

    <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">Materials and equipment</Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Keep mass, volume, concentration, and conversion context explicit.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            updateContent(value, onChange, {
              materials_and_equipment: [
                ...value.content.materials_and_equipment,
                {
                  name: "",
                  inventory_item_id: null,
                  quantity: null,
                  equipment_notes: null,
                },
              ],
            })
          }
        >
          Add material
        </Button>
      </div>
      {value.content.materials_and_equipment.length ? (
        value.content.materials_and_equipment.map((material, index) => {
          const updateMaterial = (
            patch: Partial<typeof material>,
          ) => {
            const next = [...value.content.materials_and_equipment]
            next[index] = { ...material, ...patch }
            updateContent(value, onChange, { materials_and_equipment: next })
          }

          return (
            <div
              key={`material-${index}`}
              className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(120px,1fr)_minmax(120px,1fr)_auto]">
                <div className="flex flex-col gap-y-2">
                  <Label>Name</Label>
                  <Input
                    value={material.name}
                    disabled={disabled}
                    onChange={(event) => updateMaterial({ name: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Quantity</Label>
                  <Input
                    value={material.quantity?.value || ""}
                    disabled={disabled}
                    placeholder="Optional"
                    onChange={(event) =>
                      updateMaterial({
                        quantity: event.target.value
                          ? {
                              value: event.target.value,
                              unit: material.quantity?.unit || "piece",
                              concentration: material.quantity?.concentration || null,
                              conversion_basis: material.quantity?.conversion_basis || null,
                            }
                          : null,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={material.quantity?.unit || "piece"}
                    disabled={disabled || !material.quantity}
                    onValueChange={(unit) =>
                      material.quantity
                        ? updateMaterial({
                            quantity: {
                              ...material.quantity,
                              unit: unit as (typeof researchUnits)[number],
                            },
                          })
                        : undefined
                    }
                  >
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {researchUnits.map((unit) => (
                        <Select.Item key={unit} value={unit}>{unit}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  className="self-end"
                  disabled={disabled}
                  onClick={() =>
                    updateContent(value, onChange, {
                      materials_and_equipment:
                        value.content.materials_and_equipment.filter(
                          (_, materialIndex) => materialIndex !== index,
                        ),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              {material.quantity ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-y-2">
                    <Label>Concentration context</Label>
                    <Input
                      value={material.quantity.concentration || ""}
                      disabled={disabled}
                      placeholder="For example, 5 mg/mL"
                      onChange={(event) =>
                        updateMaterial({
                          quantity: {
                            ...material.quantity!,
                            concentration: event.target.value || null,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <Label>Conversion basis</Label>
                    <Input
                      value={material.quantity.conversion_basis || ""}
                      disabled={disabled}
                      placeholder="Document the source or exact basis"
                      onChange={(event) =>
                        updateMaterial({
                          quantity: {
                            ...material.quantity!,
                            conversion_basis: event.target.value || null,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              ) : null}
              <div className="flex flex-col gap-y-2">
                <Label>Equipment notes</Label>
                <Textarea
                  value={material.equipment_notes || ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateMaterial({ equipment_notes: event.target.value || null })
                  }
                />
              </div>
            </div>
          )
        })
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          No materials or equipment recorded.
        </Text>
      )}
    </div>
    <div className="flex flex-col gap-y-2">
      <Label>Preparation and handling</Label>
      <Textarea
        value={value.content.preparation_and_handling}
        disabled={disabled}
        onChange={(event) =>
          updateContent(value, onChange, {
            preparation_and_handling: event.target.value,
          })
        }
      />
    </div>
    <div className="flex flex-col gap-y-2">
      <Label>Research steps</Label>
      <Textarea
        value={value.content.research_procedure}
        disabled={disabled}
        onChange={(event) =>
          updateContent(value, onChange, {
            research_procedure: event.target.value,
          })
        }
      />
    </div>
    <div className="flex flex-col gap-y-2">
      <Label>Storage and disposal</Label>
      <Textarea
        value={value.content.storage_and_disposal}
        disabled={disabled}
        onChange={(event) =>
          updateContent(value, onChange, {
            storage_and_disposal: event.target.value,
          })
        }
      />
    </div>

    <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">Evidence and references</Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Record the source and the exact laboratory claim it supports.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            updateContent(value, onChange, {
              references: [
                ...value.content.references,
                {
                  reference_key: null,
                  title: "",
                  authors: null,
                  published_at: null,
                  url: null,
                  doi: null,
                  evidence_type: null,
                  supported_claim: null,
                  customer_annotation: null,
                },
              ],
            })
          }
        >
          Add reference
        </Button>
      </div>
      {value.content.references.length ? (
        value.content.references.map((reference, index) => {
          const updateReference = (
            patch: Partial<typeof reference>,
          ) => {
            const next = [...value.content.references]
            next[index] = { ...reference, ...patch }
            updateContent(value, onChange, { references: next })
          }

          return (
            <div
              key={`reference-${index}`}
              className="flex flex-col gap-y-3 rounded-lg bg-ui-bg-subtle p-3"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
                <div className="flex flex-col gap-y-2">
                  <Label>Reference title</Label>
                  <Input
                    value={reference.title}
                    disabled={disabled}
                    onChange={(event) => updateReference({ title: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>Evidence type</Label>
                  <Input
                    value={reference.evidence_type || ""}
                    disabled={disabled}
                    placeholder="For example, analytical method"
                    onChange={(event) =>
                      updateReference({ evidence_type: event.target.value || null })
                    }
                  />
                </div>
                <Button
                  size="small"
                  variant="secondary"
                  className="self-end"
                  disabled={disabled}
                  onClick={() =>
                    updateContent(value, onChange, {
                      references: value.content.references.filter(
                        (_, referenceIndex) => referenceIndex !== index,
                      ),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-y-2">
                  <Label>URL</Label>
                  <Input
                    value={reference.url || ""}
                    disabled={disabled}
                    placeholder="https://"
                    onChange={(event) => updateReference({ url: event.target.value || null })}
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label>DOI</Label>
                  <Input
                    value={reference.doi || ""}
                    disabled={disabled}
                    onChange={(event) => updateReference({ doi: event.target.value || null })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Supported laboratory claim</Label>
                <Textarea
                  value={reference.supported_claim || ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateReference({ supported_claim: event.target.value || null })
                  }
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Customer-facing annotation</Label>
                <Textarea
                  value={reference.customer_annotation || ""}
                  disabled={disabled}
                  onChange={(event) =>
                    updateReference({ customer_annotation: event.target.value || null })
                  }
                />
              </div>
            </div>
          )
        })
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          No references recorded.
        </Text>
      )}
    </div>
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
      <Text size="small" weight="plus">Required research-use notice</Text>
      <Text size="small" className="mt-1 text-ui-fg-subtle">
        {value.content.disclaimer}
      </Text>
    </div>
  </div>
)
