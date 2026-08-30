import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Button,
  FocusModal,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useState } from "react"

import { sdk } from "../../lib/sdk"
import type {
  CreatePresentationInput,
  PresentationListItem,
  ReadinessPolicy,
} from "./types"

type CreatePresentationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const initialForm = {
  key: "",
  label: "",
  description: "",
  warningThreshold: "100",
  fields: "[]",
  variationAxes: "[]",
  skuSuggestionPolicy: "null",
}

const initialReadinessPolicy: ReadinessPolicy = {
  schema_version: "1",
  require_price: true,
  require_sales_channel: true,
  require_bom_for_managed_inventory: true,
  require_valid_structured_measurements: true,
  require_governance_audit: true,
}

function parseJsonField(value: string, label: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    throw new Error(`${label} must contain valid JSON`)
  }
}

export const CreatePresentationModal = ({
  open,
  onOpenChange,
}: CreatePresentationModalProps) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initialForm)
  const [readinessPolicy, setReadinessPolicy] = useState<ReadinessPolicy>(
    initialReadinessPolicy,
  )
  const [error, setError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (input: CreatePresentationInput) =>
      sdk.client.fetch<PresentationListItem>(
        "/admin/compounded-product/presentations",
        {
          method: "POST",
          body: input,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["compounded-product-presentations"],
      })
      toast.success("Presentation configuration created")
      setForm(initialForm)
      setReadinessPolicy(initialReadinessPolicy)
      setError(null)
      onOpenChange(false)
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Presentation configuration could not be created",
      )
    },
  })

  const handleSubmit = () => {
    setError(null)

    try {
      const fields = parseJsonField(form.fields, "Fields")
      const variationAxes = parseJsonField(
        form.variationAxes,
        "Variation axes",
      )
      const skuSuggestionPolicy = parseJsonField(
        form.skuSuggestionPolicy,
        "SKU suggestion policy",
      )
      const warningThreshold = Number(form.warningThreshold)

      if (!Array.isArray(fields) || !Array.isArray(variationAxes)) {
        throw new Error("Fields and variation axes must be JSON arrays")
      }

      if (!Number.isInteger(warningThreshold) || warningThreshold <= 0) {
        throw new Error("Variant warning threshold must be a positive integer")
      }

      mutation.mutate({
        key: form.key,
        snapshot: {
          schema_version: "1",
          label: form.label,
          description: form.description.trim() || null,
          fields,
          variation_axes: variationAxes,
          sku_suggestion_policy:
            skuSuggestionPolicy as Record<string, unknown> | null,
          readiness_policy: readinessPolicy,
          variant_warning_threshold: warningThreshold,
        },
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Configuration is invalid",
      )
    }
  }

  const setValue = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <div className="flex h-full flex-col overflow-hidden">
          <FocusModal.Header>
            <div className="flex items-center justify-end gap-x-2">
              <FocusModal.Close asChild>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </FocusModal.Close>
              <Button
                size="small"
                onClick={handleSubmit}
                isLoading={mutation.isPending}
              >
                Save draft
              </Button>
            </div>
          </FocusModal.Header>
          <FocusModal.Body className="flex-1 overflow-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-y-6 px-6 py-8">
              <div className="flex flex-col gap-y-1">
                <Text size="large" leading="compact" weight="plus">
                  Create presentation configuration
                </Text>
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-subtle"
                >
                  Create an empty or fully configured draft. Presentation names,
                  fields, units, and variation axes are stored as configuration.
                </Text>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="presentation-key">Stable key</Label>
                  <Input
                    id="presentation-key"
                    value={form.key}
                    onChange={(event) => setValue("key", event.target.value)}
                    placeholder="unique_template_key"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="presentation-label">Display label</Label>
                  <Input
                    id="presentation-label"
                    value={form.label}
                    onChange={(event) => setValue("label", event.target.value)}
                    placeholder="Customer-facing template name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="presentation-description">Description</Label>
                <Textarea
                  id="presentation-description"
                  value={form.description}
                  onChange={(event) =>
                    setValue("description", event.target.value)
                  }
                  placeholder="Reusable configuration guidance for this presentation"
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="variant-warning-threshold">
                  Variant warning threshold
                </Label>
                <Input
                  id="variant-warning-threshold"
                  type="number"
                  min={1}
                  value={form.warningThreshold}
                  onChange={(event) =>
                    setValue("warningThreshold", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
                <div className="flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    Publication readiness policy
                  </Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    These requirements are versioned with this presentation and
                    pinned to every product created from it.
                  </Text>
                </div>
                {(
                  [
                    ["require_price", "Require at least one price"],
                    ["require_sales_channel", "Require a sales channel"],
                    [
                      "require_bom_for_managed_inventory",
                      "Require BOM for managed inventory",
                    ],
                    [
                      "require_valid_structured_measurements",
                      "Require valid structured measurements",
                    ],
                    ["require_governance_audit", "Require governance audit"],
                  ] as const
                ).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-x-4"
                  >
                    <Label htmlFor={`readiness-${key}`}>{label}</Label>
                    <Switch
                      id={`readiness-${key}`}
                      checked={readinessPolicy[key]}
                      onCheckedChange={(checked) =>
                        setReadinessPolicy((current) => ({
                          ...current,
                          [key]: checked,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="configured-fields">Configured fields</Label>
                <Textarea
                  id="configured-fields"
                  rows={8}
                  value={form.fields}
                  onChange={(event) => setValue("fields", event.target.value)}
                />
                <Text
                  size="small"
                  leading="compact"
                  className="text-ui-fg-subtle"
                >
                  JSON array validated against the approved field-kind and unit
                  contract. A visual field builder will replace this advanced
                  editor in a later UI slice.
                </Text>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="variation-axes">Variation axes</Label>
                <Textarea
                  id="variation-axes"
                  rows={8}
                  value={form.variationAxes}
                  onChange={(event) =>
                    setValue("variationAxes", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="sku-suggestion-policy">
                  SKU suggestion policy
                </Label>
                <Text size="small" className="text-ui-fg-subtle">
                  Optional JSON. Tokens: {"{product}"}, {"{presentation}"},{" "}
                  {"{options}"}, {"{variant}"}, and {"{separator}"}. A stable
                  uniqueness suffix is always added to generated SKUs.
                </Text>
                <Textarea
                  id="sku-suggestion-policy"
                  rows={5}
                  value={form.skuSuggestionPolicy}
                  onChange={(event) =>
                    setValue("skuSuggestionPolicy", event.target.value)
                  }
                />
              </div>

              {error ? (
                <Text size="small" className="text-ui-fg-error">
                  {error}
                </Text>
              ) : null}
            </div>
          </FocusModal.Body>
        </div>
      </FocusModal.Content>
    </FocusModal>
  )
}
