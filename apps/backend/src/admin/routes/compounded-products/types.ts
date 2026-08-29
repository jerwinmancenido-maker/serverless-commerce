export type ResearchDisplayUnit =
  | "mcg"
  | "mg"
  | "g"
  | "µL"
  | "mL"
  | "IU"
  | "piece"
  | "unit"

export type ResearchQuantityDimension =
  | "mass"
  | "volume"
  | "potency"
  | "count"

export type ResearchBaseUnit = "microgram" | "microliter" | "piece"

export type MetadataTarget = {
  scope: "product" | "variant"
  key: string
}

type ConfiguredFieldBase = {
  key: string
  label: string
  help_text: string | null
  position: number
  requirement: "optional" | "draft" | "publication"
  metadata_target: MetadataTarget | null
}

export type ConfiguredField = ConfiguredFieldBase &
  (
    | { kind: "text"; multiline: boolean; max_length: number }
    | { kind: "boolean" }
    | {
        kind: "single_select"
        values: Array<{
          key: string
          label: string
          position: number
          active: boolean
        }>
      }
    | {
        kind: "measurement"
        dimension: ResearchQuantityDimension
        allowed_display_units: ResearchDisplayUnit[]
        allow_product_specific_iu: boolean
      }
    | {
        kind: "ratio"
        numerator_dimension: ResearchQuantityDimension
        numerator_allowed_display_units: ResearchDisplayUnit[]
        denominator_dimension: ResearchQuantityDimension
        denominator_allowed_display_units: ResearchDisplayUnit[]
        denominator_count_bases: Array<{
          key: string
          label: string
          position: number
          active: boolean
        }>
        allow_product_specific_iu: boolean
      }
    | { kind: "document_reference"; allowed_document_types: string[] }
  )

export type VariationValue = {
  key: string
  label: string
  position: number
  active: boolean
  measurement: {
    amount: string
    display_unit: ResearchDisplayUnit
    material_profile_id: string | null
  } | null
}

export type VariationAxis = {
  key: string
  semantic_name: string
  help_text: string | null
  position: number
  values: VariationValue[]
}

export type PresentationSnapshot = {
  schema_version: "1"
  label: string
  description: string | null
  fields: ConfiguredField[]
  variation_axes: VariationAxis[]
  sku_suggestion_policy: {
    template: string
    separator: string
    normalization: "uppercase" | "lowercase" | "preserve"
  } | null
  readiness_policy: {
    schema_version: "1"
    require_price: boolean
    require_sales_channel: boolean
    require_bom_for_managed_inventory: boolean
    require_valid_structured_measurements: boolean
    require_governance_audit: boolean
  }
  variant_warning_threshold: number
}

export type PresentationListItem = {
  presentation: {
    id: string
    key: string
    status: "draft" | "active" | "inactive" | "blocked" | "archived"
    current_revision_id: string | null
  }
  current_revision: {
    id: string
    revision: number
    status: "draft" | "active" | "superseded" | "blocked" | "archived"
    snapshot: PresentationSnapshot
    fingerprint: string
  } | null
}

export type PresentationListResponse = {
  presentations: PresentationListItem[]
  count: number
  limit: number
  offset: number
}

export type ConfigurationRevisionResolution = {
  action: "retain" | "migrate"
  from_revision_id: string
  to_revision_id: string
  impact_fingerprint: string
  reason: string
}

export type ConfigurationRevisionImpact = {
  presentation_id: string
  from_revision: {
    id: string
    revision: number
    status: PresentationListItem["current_revision"] extends infer R
      ? R extends { status: infer S }
        ? S
        : never
      : never
    fingerprint: string
    label: string
  }
  to_revision: {
    id: string
    revision: number
    status: "draft" | "active" | "superseded" | "blocked" | "archived"
    fingerprint: string
    label: string
  }
  retain_eligible: boolean
  label_changed: boolean
  description_changed: boolean
  changed_fields: Array<{
    key: string
    change: "added" | "removed" | "changed"
  }>
  changed_variation_axes: Array<{
    key: string
    change: "added" | "removed" | "changed"
  }>
  sku_policy_changed: boolean
  readiness_policy_changed: boolean
  variant_policy_changed: boolean
  impact_fingerprint: string
}

export type ConfigurationRevisionImpactResponse = {
  impact: ConfigurationRevisionImpact
}

export type StructuredMeasurementInput = {
  amount: string
  displayUnit: ResearchDisplayUnit
  dimension: ResearchQuantityDimension
  displayPrecision: number
  provenance: "declared" | "calculated" | "estimated"
  materialProfileId: string | null
  sourceDocumentId: string | null
  countBasis: string | null
  unitProfile?: {
    displayUnit: ResearchDisplayUnit
    baseUnit: "microgram" | "microliter" | "piece"
    baseUnitsPerDisplayUnit: number
    displayPrecision: number
  }
}

export type ConfiguredValue =
  | string
  | boolean
  | StructuredMeasurementInput
  | {
      documentId: string
      documentType: string
    }
  | {
      numerator: StructuredMeasurementInput
      denominator: StructuredMeasurementInput
    }

export type MatrixRow = {
  key: string
  title: string
  options: Array<{
    axisKey: string
    semanticName: string
    axisPosition: number
    valueKey: string
    valueLabel: string
    valuePosition: number
    measurement: VariationValue["measurement"]
  }>
}

export type MatrixPreviewResponse = {
  presentation_revision_id: string
  configuration_fingerprint: string
  matrix: {
    fingerprint: string
    totalCombinationCount: number
    excludedCombinationCount: number
    resultingVariantCount: number
    warningThreshold: number
    requiresConfirmation: boolean
    confirmationSatisfied: boolean
    rows: MatrixRow[]
  }
}

export type VariantDraft = {
  sku: string
  priceAmount: string
  currencyCode: string
  imageUrls: string[]
  manageInventory: boolean
  allowBackorder: boolean
  configuredValues: Record<string, ConfiguredValue>
}

export type CreateDraftResponse = {
  replayed: boolean
  result: {
    product_id: string
    registration_id: string
    product_status: "draft"
    variant_count: number
    matrix_fingerprint: string
  }
}

export type ComponentProfile = {
  id: string
  inventory_item_id: string
  base_unit: ResearchBaseUnit
  display_unit: ResearchDisplayUnit
  base_units_per_display_unit: number
  display_precision: number
  category: string
}

export type ComponentProfilesResponse = {
  component_profiles: ComponentProfile[]
  count: number
}

export type ProductReadinessResponse = {
  product_id: string
  registration: {
    id: string
    state: "draft" | "ready" | "blocked" | "published" | "withdrawn"
    presentation_revision_id: string
    readiness_policy_revision: string
  }
  ready: boolean
  blockers: Array<
    | "registration_missing"
    | "configuration_revision_inactive"
    | "variant_matrix_empty"
    | "price_missing"
    | "sales_channel_missing"
    | "bom_recipe_missing"
    | "structured_measurement_invalid"
    | "audit_unavailable"
  >
  variants: Array<{
    id: string
    sku: string | null
    title: string
    manage_inventory: boolean
    has_price: boolean
    recipe_ready: boolean
    recipe_components: Array<{
      inventory_item_id: string
      required_quantity: number
    }>
  }>
}

export type GovernanceAuditEvent = {
  id: string
  event_type:
    | "configuration_created"
    | "configuration_revised"
    | "configuration_status_transitioned"
    | "governed_registration_created"
    | "governed_registration_reclassified"
    | "governed_registration_removed"
    | "classification_mapping_created"
    | "classification_mapping_status_transitioned"
    | "configuration_revision_retained"
    | "configuration_revision_migrated"
    | "large_matrix_confirmed"
    | "product_draft_created"
    | "readiness_evaluated"
    | "recipe_changed"
    | "publication_succeeded"
    | "publication_rejected"
    | "publication_withdrawn"
  outcome: "succeeded" | "rejected"
  actor_id: string
  decision: Record<string, unknown>
  created_at: string
}

export type GovernanceAuditEventsResponse = {
  audit_events: GovernanceAuditEvent[]
}

export type PublicationChangeResponse = {
  accepted: boolean
  action: "publish" | "withdraw"
  readiness: ProductReadinessResponse
  audit_events: GovernanceAuditEvent[]
}

export type ClassificationChangeBlocker =
  | "already_published"
  | "ordered_variant_exists"
  | "target_type_unchanged"
  | "target_type_must_be_governed"
  | "target_type_must_be_standard"

export type ClassificationImpact = {
  product_id: string
  registration_id: string
  action: "reclassify" | "remove_governance"
  current_product_type_id: string | null
  target_product_type_id: string
  target_type_is_governed: boolean
  product_status: string
  registration_state: string
  variant_count: number
  order_line_item_count: number
  blockers: ClassificationChangeBlocker[]
  allowed: boolean
  impact_fingerprint: string
}

export type ClassificationImpactResponse = {
  impact: ClassificationImpact
}

export type ClassificationChangeResponse = {
  action: ClassificationImpact["action"]
  impact: ClassificationImpact
  audit_events: GovernanceAuditEvent[]
}
