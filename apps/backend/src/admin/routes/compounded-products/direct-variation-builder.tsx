import { PencilSquare, Plus, Trash } from "@medusajs/icons"
import { Button, Drawer, Input, Label, Select, Text } from "@medusajs/ui"
import { useState } from "react"

import {
  RESEARCH_DISPLAY_UNITS,
  getResearchDisplayUnitDimension,
  type ResearchDisplayUnit,
} from "../../../lib/research-unit-definitions"
import {
  newDirectVariationAxis,
  newDirectVariationValue,
  type DirectVariationAxis,
  type DirectVariationValue,
} from "./direct-variation-snapshot"

export const DirectVariationBuilder = ({
  axes,
  onChange,
}: {
  axes: DirectVariationAxis[]
  onChange: (axes: DirectVariationAxis[]) => void
}) => {
  const [editingValue, setEditingValue] = useState<{
    axisId: string
    valueId: string
  } | null>(null)

  const patchAxis = (axisId: string, patch: Partial<DirectVariationAxis>) =>
    onChange(
      axes.map((axis) => (axis.id === axisId ? { ...axis, ...patch } : axis)),
    )

  const patchValue = (
    axisId: string,
    valueId: string,
    patch: Partial<DirectVariationValue>,
  ) =>
    onChange(
      axes.map((axis) =>
        axis.id === axisId
          ? {
              ...axis,
              values: axis.values.map((value) =>
                value.id === valueId ? { ...value, ...patch } : value,
              ),
            }
          : axis,
      ),
    )

  const selectedAxis = editingValue
    ? axes.find((axis) => axis.id === editingValue.axisId)
    : undefined
  const selectedValue = selectedAxis?.values.find(
    (value) => value.id === editingValue?.valueId,
  )

  return (
    <div className="flex flex-col gap-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {axes.map((axis, axisIndex) => (
          <div
            key={axis.id}
            className="min-w-0 overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-base"
          >
            <div className="flex items-center justify-between border-b border-ui-border-base bg-ui-bg-subtle px-3 py-2">
              <Text size="small" leading="compact" weight="plus">
                Variation {axisIndex + 1}
              </Text>
              <Button
                type="button"
                size="small"
                variant="transparent"
                onClick={() =>
                  onChange(axes.filter((item) => item.id !== axis.id))
                }
              >
                <Trash />
              </Button>
            </div>

            <div className="flex flex-col gap-y-3 p-3">
              <Label className="sr-only" htmlFor={`axis-name-${axis.id}`}>
                Variation {axisIndex + 1} name
              </Label>
              <Input
                id={`axis-name-${axis.id}`}
                value={axis.name}
                onChange={(event) =>
                  patchAxis(axis.id, { name: event.target.value })
                }
                placeholder="Variation name, for example Inclusion"
              />

              <div className="flex flex-col gap-y-2">
                <Text size="small" leading="compact" weight="plus">
                  Options <span className="text-ui-fg-error">*</span>
                </Text>

                {axis.values.map((value, valueIndex) => (
                    <div key={value.id} className="flex items-start gap-2">
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        title={`Edit option ${valueIndex + 1} measurement`}
                        onClick={() =>
                          setEditingValue({ axisId: axis.id, valueId: value.id })
                        }
                      >
                        <PencilSquare />
                      </Button>
                      <div className="min-w-0 flex-1">
                          <Label
                            className="sr-only"
                            htmlFor={`value-label-${value.id}`}
                          >
                            Option {valueIndex + 1}
                          </Label>
                          <Input
                            id={`value-label-${value.id}`}
                            value={value.label}
                            onChange={(event) =>
                              patchValue(axis.id, value.id, {
                                label: event.target.value,
                              })
                            }
                            placeholder={`Option ${valueIndex + 1}`}
                          />
                        {value.amount && value.displayUnit ? (
                          <Text
                            size="xsmall"
                            leading="compact"
                            className="mt-1 text-ui-fg-subtle"
                          >
                            {value.amount} {value.displayUnit}
                          </Text>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="small"
                        variant="secondary"
                        disabled={axis.values.length === 1}
                        onClick={() =>
                          patchAxis(axis.id, {
                            values: axis.values.filter(
                              (item) => item.id !== value.id,
                            ),
                          })
                        }
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}

                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  className="w-full border-dashed"
                  onClick={() =>
                    patchAxis(axis.id, {
                      values: [...axis.values, newDirectVariationValue()],
                    })
                  }
                >
                  <Plus />
                  Add option
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        size="small"
        variant="secondary"
        onClick={() => onChange([...axes, newDirectVariationAxis()])}
      >
        <Plus />
        Add another product option
      </Button>
      {!axes.length ? (
        <Text size="small" className="text-ui-fg-subtle">
          No variations means Medusa will create one default sellable variant.
        </Text>
      ) : null}

      <Drawer
        open={Boolean(selectedValue)}
        onOpenChange={(open) => {
          if (!open) setEditingValue(null)
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Option measurement</Drawer.Title>
            <Drawer.Description>
              Keep the customer-facing option concise while storing its exact
              compounded-product quantity.
            </Drawer.Description>
          </Drawer.Header>
          {selectedAxis && selectedValue ? (
            <Drawer.Body className="flex flex-col gap-y-5 overflow-y-auto p-6">
              <div className="rounded-lg border border-ui-border-base p-4">
                <Text size="small" leading="compact" weight="plus">
                  {selectedAxis.name || "Unnamed variation"}
                </Text>
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-subtle"
                >
                  {selectedValue.label || "Unnamed option"}
                </Text>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor={`value-amount-${selectedValue.id}`}>
                  Amount
                </Label>
                <Input
                  id={`value-amount-${selectedValue.id}`}
                  value={selectedValue.amount}
                  onChange={(event) =>
                    patchValue(selectedAxis.id, selectedValue.id, {
                      amount: event.target.value,
                    })
                  }
                  placeholder="For example 10"
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>Unit</Label>
                <Select
                  value={selectedValue.displayUnit || "none"}
                  onValueChange={(unit) =>
                    patchValue(selectedAxis.id, selectedValue.id, {
                      displayUnit:
                        unit === "none" ? "" : (unit as ResearchDisplayUnit),
                      materialProfileId:
                        unit === "IU" ? selectedValue.materialProfileId : "",
                    })
                  }
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="none">No structured unit</Select.Item>
                    {RESEARCH_DISPLAY_UNITS.map((unit) => (
                      <Select.Item key={unit} value={unit}>
                        {unit} · {getResearchDisplayUnitDimension(unit)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              {selectedValue.displayUnit === "IU" ? (
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor={`material-profile-${selectedValue.id}`}>
                    IU material profile ID
                  </Label>
                  <Input
                    id={`material-profile-${selectedValue.id}`}
                    value={selectedValue.materialProfileId}
                    onChange={(event) =>
                      patchValue(selectedAxis.id, selectedValue.id, {
                        materialProfileId: event.target.value,
                      })
                    }
                    placeholder="Required because IU conversion is product-specific"
                  />
                </div>
              ) : null}
            </Drawer.Body>
          ) : null}
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small">Done</Button>
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}
