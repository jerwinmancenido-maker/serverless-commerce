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
  BomComponentClassification,
  BomSupplierUnit,
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
  classification: BomComponentClassification
  supplierUnit: BomSupplierUnit
  inventoryUnitsPerSupplierUnit: string
  category: string
  lotTrackingRequired: boolean
  expiryTrackingRequired: boolean
}

type DisplayUnitOption = {
  value: string
  label: string
  baseUnitsPerDisplayUnit: number | null
  displayPrecision: number
}

const displayUnitOptions: Record<BomBaseUnit, DisplayUnitOption[]> = {
  microgram: [
    {
      value: "mcg",
      label: "mcg — microgram",
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
    },
    {
      value: "mg",
      label: "mg — milligram",
      baseUnitsPerDisplayUnit: 1_000,
      displayPrecision: 3,
    },
    {
      value: "g",
      label: "g — gram",
      baseUnitsPerDisplayUnit: 1_000_000,
      displayPrecision: 6,
    },
    {
      value: "IU",
      label: "IU — product-specific activity",
      baseUnitsPerDisplayUnit: null,
      displayPrecision: 0,
    },
  ],
  microliter: [
    {
      value: "µL",
      label: "µL — microliter",
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
    },
    {
      value: "mL",
      label: "mL — milliliter",
      baseUnitsPerDisplayUnit: 1_000,
      displayPrecision: 3,
    },
    {
      value: "IU",
      label: "IU — product-specific activity",
      baseUnitsPerDisplayUnit: null,
      displayPrecision: 0,
    },
  ],
  piece: [
    {
      value: "piece",
      label: "piece — vial, cap, label, box, or kit",
      baseUnitsPerDisplayUnit: 1,
      displayPrecision: 0,
    },
  ],
}

const inventoryUnitLabels: Record<BomBaseUnit, string> = {
  microgram: "mcg",
  microliter: "µL",
  piece: "pieces",
}

function defaultUnitState(baseUnit: BomBaseUnit) {
  const option = displayUnitOptions[baseUnit][0]

  return {
    displayUnit: option.value,
    baseUnitsPerDisplayUnit: String(option.baseUnitsPerDisplayUnit ?? 1),
    displayPrecision: String(option.displayPrecision),
  }
}

const emptyForm: FormState = {
  baseUnit: "piece",
  displayUnit: "piece",
  baseUnitsPerDisplayUnit: "1",
  displayPrecision: "0",
  reorderThresholdBaseUnits: "0",
  classification: "included_supply",
  supplierUnit: "piece",
  inventoryUnitsPerSupplierUnit: "1",
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
    displayUnit:
      profile.base_unit === "piece" && profile.display_unit === "unit"
        ? "piece"
        : profile.display_unit,
    baseUnitsPerDisplayUnit: String(profile.base_units_per_display_unit),
    displayPrecision: String(profile.display_precision),
    reorderThresholdBaseUnits: String(
      profile.reorder_threshold_base_units,
    ),
    classification: profile.classification,
    supplierUnit: profile.supplier_unit,
    inventoryUnitsPerSupplierUnit: String(
      profile.inventory_units_per_supplier_unit,
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
      classification: form.classification,
      supplier_unit: form.supplierUnit,
      inventory_units_per_supplier_unit: Number(
        form.inventoryUnitsPerSupplierUnit,
      ),
      category: form.category,
      lot_tracking_required: form.lotTrackingRequired,
      expiry_tracking_required: form.expiryTrackingRequired,
    })
  }

  const selectBaseUnit = (baseUnit: BomBaseUnit) => {
    setForm((current) => ({
      ...current,
      baseUnit,
      ...defaultUnitState(baseUnit),
    }))
  }

  const selectDisplayUnit = (displayUnit: string) => {
    const option = displayUnitOptions[form.baseUnit].find(
      (candidate) => candidate.value === displayUnit,
    )

    if (!option) {
      return
    }

    setForm((current) => ({
      ...current,
      displayUnit,
      baseUnitsPerDisplayUnit: String(
        option.baseUnitsPerDisplayUnit ?? 1,
      ),
      displayPrecision: String(option.displayPrecision),
    }))
  }

  const conversionIsProductSpecific = form.displayUnit === "IU"
  const supplierConversionIsFixed = form.supplierUnit === "piece"

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
                <Label htmlFor="base-unit">Inventory ledger unit</Label>
                <Select
                  value={form.baseUnit}
                  onValueChange={(value) => selectBaseUnit(value as BomBaseUnit)}
                >
                  <Select.Trigger id="base-unit">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="microgram">
                      Mass — stored in mcg
                    </Select.Item>
                    <Select.Item value="microliter">
                      Volume — stored in µL
                    </Select.Item>
                    <Select.Item value="piece">
                      Count — stored as pieces
                    </Select.Item>
                  </Select.Content>
                </Select>
                <Text className="text-ui-fg-subtle" size="small">
                  Uses whole-number ledger units for exact inventory deduction.
                </Text>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="display-unit">Display unit</Label>
                <Select
                  value={form.displayUnit}
                  onValueChange={selectDisplayUnit}
                >
                  <Select.Trigger id="display-unit">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {displayUnitOptions[form.baseUnit].map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Text className="text-ui-fg-subtle" size="small">
                  Supported units: mcg, mg, g, µL, mL, IU, or piece.
                </Text>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="conversion">
                  Ledger units per display unit
                </Label>
                <Input
                  disabled={!conversionIsProductSpecific}
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
                <Text className="text-ui-fg-subtle" size="small">
                  {conversionIsProductSpecific
                    ? "Enter the verified product-specific conversion. IU is not universally convertible to mass or volume."
                    : "Automatically fixed by the selected SI display unit."}
                </Text>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="classification">Component classification</Label>
                <Select
                  value={form.classification}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      classification: value as BomComponentClassification,
                    }))
                  }
                >
                  <Select.Trigger id="classification">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="finished_product">
                      Finished product
                    </Select.Item>
                    <Select.Item value="included_supply">
                      Included supply
                    </Select.Item>
                    <Select.Item value="packaging">Packaging</Select.Item>
                  </Select.Content>
                </Select>
                <Text className="text-ui-fg-subtle" size="small">
                  Finished products can use any current or future presentation.
                </Text>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Operational category</Label>
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
                <Text className="text-ui-fg-subtle" size="small">
                  Merchant-defined taxonomy for filtering and operations.
                </Text>
              </div>
            </div>
            <div className="rounded-lg border border-ui-border-base p-4">
              <Text size="small" leading="compact" weight="plus">
                Receiving conversion
              </Text>
              <Text
                size="small"
                leading="compact"
                className="mt-1 text-ui-fg-subtle"
              >
                Convert supplier boxes, packs, or rolls into the individual
                inventory units tracked by Medusa Inventory.
              </Text>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="supplier-unit">Supplier unit</Label>
                  <Select
                    value={form.supplierUnit}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        supplierUnit: value as BomSupplierUnit,
                        inventoryUnitsPerSupplierUnit:
                          value === "piece"
                            ? "1"
                            : current.inventoryUnitsPerSupplierUnit,
                      }))
                    }
                  >
                    <Select.Trigger id="supplier-unit">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="box">Box</Select.Item>
                      <Select.Item value="pack">Pack</Select.Item>
                      <Select.Item value="roll">Roll</Select.Item>
                      <Select.Item value="piece">Piece</Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="supplier-conversion">
                    {inventoryUnitLabels[form.baseUnit]} per supplier unit
                  </Label>
                  <Input
                    disabled={supplierConversionIsFixed}
                    id="supplier-conversion"
                    min="1"
                    required
                    step="1"
                    type="number"
                    value={form.inventoryUnitsPerSupplierUnit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        inventoryUnitsPerSupplierUnit: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Text className="mt-3 text-ui-fg-subtle" size="small">
                Receiving 1 {form.supplierUnit} adds{" "}
                {form.inventoryUnitsPerSupplierUnit || "0"}{" "}
                {inventoryUnitLabels[form.baseUnit]} to the shared stock
                location.
              </Text>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reorder-threshold">
                Reorder threshold in ledger units
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
