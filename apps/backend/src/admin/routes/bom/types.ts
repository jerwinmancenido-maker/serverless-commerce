export type BomBaseUnit = "microgram" | "microliter" | "piece"
export type BomComponentClassification =
  | "finished_product"
  | "included_supply"
  | "packaging"
export type BomSupplierUnit = "box" | "pack" | "roll" | "piece"

export type ComponentProfile = {
  id: string
  inventory_item_id: string
  base_unit: BomBaseUnit
  display_unit: string
  base_units_per_display_unit: number
  display_precision: number
  reorder_threshold_base_units: number
  classification: BomComponentClassification
  supplier_unit: BomSupplierUnit
  inventory_units_per_supplier_unit: number
  category: string
  lot_tracking_required: boolean
  expiry_tracking_required: boolean
}

export type ComponentProfilesResponse = {
  component_profiles: ComponentProfile[]
  count: number
}

export type ComponentProfileResponse = {
  component_profile: ComponentProfile
}

export type ComponentProfileRequest = Omit<ComponentProfile, "id">

export type RecipeSnapshotComponent = {
  inventoryItemId: string
  requiredQuantity: number
  baseUnit: BomBaseUnit
  displayUnit: string
  baseUnitsPerDisplayUnit: number
  displayPrecision: number
}

export type RecipeAuditSnapshot = {
  id: string
  variant_id: string
  version: number
  recipe_hash: string
  components: RecipeSnapshotComponent[]
  actor_id: string | null
  note: string | null
}

export type RecipeHistoryResponse = {
  variant: {
    id: string
    title: string
    sku: string | null
  }
  recipe_history: RecipeAuditSnapshot[]
  count: number
}

export type VariantComponentAvailability = {
  inventory_item_id: string
  inventory_item_title: string
  stocked_quantity: number
  reserved_quantity: number
  available_quantity: number
  required_quantity: number
  capacity: number
  limiting: boolean
}

export type VariantLocationAvailability = {
  variant_id: string
  status: "calculated" | "missing_recipe"
  calculated_stock: number | null
  limiting_components: Array<{
    inventory_item_id: string
    inventory_item_title: string
  }>
  components: VariantComponentAvailability[]
}

export type BomAvailabilityResponse = {
  location: {
    id: string
    name: string
  }
  variants: VariantLocationAvailability[]
}
