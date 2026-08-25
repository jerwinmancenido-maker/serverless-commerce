export type BomBaseUnit = "microgram" | "microliter" | "piece"

export type ComponentProfile = {
  id: string
  inventory_item_id: string
  base_unit: BomBaseUnit
  display_unit: string
  base_units_per_display_unit: number
  display_precision: number
  reorder_threshold_base_units: number
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
