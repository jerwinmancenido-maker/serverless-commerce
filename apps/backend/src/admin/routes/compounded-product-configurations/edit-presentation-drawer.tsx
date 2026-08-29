import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

import { sdk } from "../../lib/sdk"
import type {
  PresentationListItem,
  PresentationMutationResponse,
  PresentationSnapshot,
  ReadinessPolicy,
} from "./types"

type EditPresentationDrawerProps = {
  item: PresentationListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type TransitionStatus = "active" | "inactive" | "blocked" | "archived"

const formatJson = (value: unknown) => JSON.stringify(value, null, 2)

const defaultReadinessPolicy: ReadinessPolicy = {
  schema_version: "1",
  require_price: true,
  require_sales_channel: true,
  require_bom_for_managed_inventory: true,
  require_valid_structured_measurements: true,
  require_governance_audit: true,
}

export const EditPresentationDrawer = ({
  item,
  open,
  onOpenChange,
}: EditPresentationDrawerProps) => {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [warningThreshold, setWarningThreshold] = useState("100")
  const [fields, setFields] = useState("[]")
  const [variationAxes, setVariationAxes] = useState("[]")
  const [skuSuggestionPolicy, setSkuSuggestionPolicy] = useState("null")
  const [readinessPolicy, setReadinessPolicy] = useState<ReadinessPolicy>(
    defaultReadinessPolicy,
  )
  const [reason, setReason] = useState("")
  const [targetStatus, setTargetStatus] =
    useState<TransitionStatus>("active")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const snapshot = item?.current_revision?.snapshot

    if (!snapshot) {
      return
    }

    setLabel(snapshot.label)
    setDescription(snapshot.description || "")
    setWarningThreshold(String(snapshot.variant_warning_threshold))
    setFields(formatJson(snapshot.fields))
    setVariationAxes(formatJson(snapshot.variation_axes))
    setSkuSuggestionPolicy(formatJson(snapshot.sku_suggestion_policy))
    setReadinessPolicy(snapshot.readiness_policy || defaultReadinessPolicy)
    setReason("")
    setError(null)
  }, [item])

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ["compounded-product-presentations"],
    })

  const revisionMutation = useMutation({
    mutationFn: (input: {
      expected_current_revision_id: string
      snapshot: PresentationSnapshot
      reason: string
    }) =>
      sdk.client.fetch<PresentationMutationResponse>(
        `/admin/compounded-product/presentations/${item?.presentation.id}/revisions`,
        { method: "POST", body: input },
      ),
    onSuccess: () => {
      refresh()
      toast.success("Draft revision created")
      onOpenChange(false)
    },
    onError: (mutationError) =>
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Draft revision could not be created",
      ),
  })
  const transitionMutation = useMutation({
    mutationFn: (input: {
      expected_current_revision_id: string
      target_status: TransitionStatus
      reason: string
    }) =>
      sdk.client.fetch<PresentationMutationResponse>(
        `/admin/compounded-product/presentations/${item?.presentation.id}/transitions`,
        { method: "POST", body: input },
      ),
    onSuccess: () => {
      refresh()
      toast.success("Configuration status updated")
      onOpenChange(false)
    },
    onError: (mutationError) =>
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Configuration status could not be updated",
      ),
  })

  const saveRevision = () => {
    const currentRevisionId = item?.current_revision?.id

    if (!currentRevisionId) {
      setError("The current revision could not be resolved")
      return
    }

    try {
      const parsedFields = JSON.parse(fields)
      const parsedAxes = JSON.parse(variationAxes)
      const parsedSkuPolicy = JSON.parse(skuSuggestionPolicy)
      const threshold = Number(warningThreshold)

      if (!Array.isArray(parsedFields) || !Array.isArray(parsedAxes)) {
        throw new Error("Fields and variation axes must be JSON arrays")
      }

      if (!Number.isInteger(threshold) || threshold <= 0) {
        throw new Error("Variant warning threshold must be a positive integer")
      }

      revisionMutation.mutate({
        expected_current_revision_id: currentRevisionId,
        reason,
        snapshot: {
          schema_version: "1",
          label,
          description: description.trim() || null,
          fields: parsedFields,
          variation_axes: parsedAxes,
          sku_suggestion_policy: parsedSkuPolicy,
          readiness_policy: readinessPolicy,
          variant_warning_threshold: threshold,
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

  const transition = () => {
    const currentRevisionId = item?.current_revision?.id

    if (!currentRevisionId) {
      setError("The current revision could not be resolved")
      return
    }

    transitionMutation.mutate({
      expected_current_revision_id: currentRevisionId,
      target_status: targetStatus,
      reason,
    })
  }

  const pending = revisionMutation.isPending || transitionMutation.isPending

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            {item?.current_revision?.snapshot.label || "Edit configuration"}
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-5 overflow-auto p-4">
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Saving creates an immutable draft revision. Activating, disabling,
            blocking, or archiving is a separate explicit action.
          </Text>

          <div className="flex flex-col gap-y-2">
            <Label>Display label</Label>
            <Input value={label} onChange={(event) => setLabel(event.target.value)} />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Variant warning threshold</Label>
            <Input
              type="number"
              min={1}
              value={warningThreshold}
              onChange={(event) => setWarningThreshold(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Configured fields</Label>
            <Textarea
              rows={8}
              value={fields}
              onChange={(event) => setFields(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>Variation axes</Label>
            <Textarea
              rows={8}
              value={variationAxes}
              onChange={(event) => setVariationAxes(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>SKU suggestion policy</Label>
            <Textarea
              rows={5}
              value={skuSuggestionPolicy}
              onChange={(event) => setSkuSuggestionPolicy(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base p-4">
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">
                Publication readiness policy
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                Saving changes creates a new immutable policy revision with the
                presentation configuration.
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
                <Label htmlFor={`edit-readiness-${key}`}>{label}</Label>
                <Switch
                  id={`edit-readiness-${key}`}
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
            <Label>Reason for change</Label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain the operational reason for this revision or status change"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>Lifecycle action</Label>
            <Select
              value={targetStatus}
              onValueChange={(value) => setTargetStatus(value as TransitionStatus)}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="active">Activate</Select.Item>
                <Select.Item value="inactive">Make inactive</Select.Item>
                <Select.Item value="blocked">Block</Select.Item>
                <Select.Item value="archived">Archive</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {error ? (
            <Text size="small" className="text-ui-fg-error">
              {error}
            </Text>
          ) : null}
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex w-full items-center justify-end gap-x-2">
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              variant="secondary"
              onClick={transition}
              isLoading={transitionMutation.isPending}
              disabled={!reason.trim() || revisionMutation.isPending}
            >
              Apply status
            </Button>
            <Button
              size="small"
              onClick={saveRevision}
              isLoading={revisionMutation.isPending}
              disabled={!reason.trim() || transitionMutation.isPending}
            >
              Save new draft
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
