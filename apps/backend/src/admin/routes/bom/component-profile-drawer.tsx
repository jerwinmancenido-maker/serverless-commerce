import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type FormEvent, useEffect, useState } from "react"

import { sdk } from "../../lib/sdk"
import type {
  BomBaseUnit,
  ComponentProfile,
  ComponentProfileRequest,
  ComponentProfileResponse,
} from "./types"

type ComponentProfileDrawerProps = {
  inventoryItem: HttpTypes.AdminInventoryItem | null
  profile?: ComponentProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormState = {
  baseUnit: BomBaseUnit
  displayUnit: string
  baseUnitsPerDisplayUnit: string
  displayPrecision: string
  reorderThresholdBaseUnits: string
  category: string
  lotTrackingRequired: boolean
  expiryTrackingRequired: boolean
}

const emptyForm: FormState = {
  baseUnit: "piece",
  displayUnit: "piece",
  baseUnitsPerDisplayUnit: "1",
  displayPrecision: "0",
  reorderThresholdBaseUnits: "0",
  category: "other",
  lotTrackingRequired: false,
  expiryTrackingRequired: false,
}

function toFormState(profile?: ComponentProfile): FormState {
  if (!profile) {
    return emptyForm
  }

  return {
    baseUnit: profile.base_unit,
    displayUnit: profile.display_unit,
    baseUnitsPerDisplayUnit: String(profile.base_units_per_display_unit),
    displayPrecision: String(profile.display_precision),
    reorderThresholdBaseUnits: String(
      profile.reorder_threshold_base_units,
    ),
    category: profile.category,
    lotTrackingRequired: profile.lot_tracking_required,
    expiryTrackingRequired: profile.expiry_tracking_required,
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to save the profile"
}

export function ComponentProfileDrawer({
  inventoryItem,
  profile,
  open,
  onOpenChange,
}: ComponentProfileDrawerProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(profile))

  useEffect(() => {
    if (open) {
      setForm(toFormState(profile))
    }
  }, [open, profile])

  const mutation = useMutation({
    mutationFn: (body: ComponentProfileRequest) =>
      sdk.client.fetch<ComponentProfileResponse>(
        "/admin/bom/component-profiles",
        {
          method: "POST",
          body,
        },
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bom-component-profiles"],
      })
      toast.success("Component profile saved")
      onOpenChange(false)
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!inventoryItem) {
      return
    }

    mutation.mutate({
      inventory_item_id: inventoryItem.id,
      base_unit: form.baseUnit,
      display_unit: form.displayUnit,
      base_units_per_display_unit: Number(form.baseUnitsPerDisplayUnit),
      display_precision: Number(form.displayPrecision),
      reorder_threshold_base_units: Number(form.reorderThresholdBaseUnits),
      category: form.category,
      lot_tracking_required: form.lotTrackingRequired,
      expiry_tracking_required: form.expiryTrackingRequired,
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <form className="flex h-full flex-col" onSubmit={submit}>
          <Drawer.Header>
            <Drawer.Title asChild>
              <Heading>{profile ? "Edit" : "Create"} component profile</Heading>
            </Drawer.Title>
            <Drawer.Description>
              {inventoryItem?.title || inventoryItem?.sku || "Inventory item"}
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-1 flex-col gap-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="base-unit">Base unit</Label>
                <Select
                  value={form.baseUnit}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      baseUnit: value as BomBaseUnit,
                    }))
                  }
                >
                  <Select.Trigger id="base-unit">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="microgram">Microgram</Select.Item>
                    <Select.Item value="microliter">Microliter</Select.Item>
                    <Select.Item value="piece">Piece</Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="display-unit">Display unit</Label>
                <Input
                  id="display-unit"
                  required
                  value={form.displayUnit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      displayUnit: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="conversion">Base units per display unit</Label>
                <Input
                  id="conversion"
                  min="1"
                  required
                  step="1"
                  type="number"
                  value={form.baseUnitsPerDisplayUnit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      baseUnitsPerDisplayUnit: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="precision">Display precision</Label>
                <Input
                  id="precision"
                  min="0"
                  required
                  step="1"
                  type="number"
                  value={form.displayPrecision}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      displayPrecision: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                required
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reorder-threshold">
                Reorder threshold in base units
              </Label>
              <Input
                id="reorder-threshold"
                min="0"
                required
                step="1"
                type="number"
                value={form.reorderThresholdBaseUnits}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reorderThresholdBaseUnits: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="lot-tracking">Lot tracking required</Label>
                <Text className="text-ui-fg-subtle" size="small">
                  Marks this component for lot-aware operational workflows.
                </Text>
              </div>
              <Switch
                id="lot-tracking"
                checked={form.lotTrackingRequired}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    lotTrackingRequired: checked,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="expiry-tracking">
                  Expiry tracking required
                </Label>
                <Text className="text-ui-fg-subtle" size="small">
                  Marks this component for expiry-aware operational workflows.
                </Text>
              </div>
              <Switch
                id="expiry-tracking"
                checked={form.expiryTrackingRequired}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    expiryTrackingRequired: checked,
                  }))
                }
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Cancel
              </Button>
            </Drawer.Close>
            <Button size="small" type="submit" isLoading={mutation.isPending}>
              Save
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
