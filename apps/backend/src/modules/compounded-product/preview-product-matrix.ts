import { MedusaError } from "@medusajs/framework/utils"

import { fingerprintCompoundedProductConfiguration } from "./configuration-fingerprint"
import { CompoundedProductPresentationSnapshot } from "./contracts/configuration"
import type { AdminPreviewCompoundedProductVariantMatrix } from "./contracts/product-creation"
import { generateCompoundedProductVariantMatrix } from "./variant-matrix"

export function previewCompoundedProductVariantMatrix(input: {
  request: AdminPreviewCompoundedProductVariantMatrix
  revision: {
    id: string
    status: string
    snapshot: unknown
    fingerprint: string
  }
  serverMaximum: number
}) {
  if (input.revision.status !== "active") {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "configuration_revision_inactive",
    )
  }

  const snapshot = CompoundedProductPresentationSnapshot.parse(
    input.revision.snapshot,
  )
  const fingerprint = fingerprintCompoundedProductConfiguration(snapshot)

  if (
    fingerprint !== input.revision.fingerprint ||
    fingerprint !== input.request.expected_configuration_fingerprint
  ) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "configuration_revision_changed",
    )
  }

  return {
    presentation_revision_id: input.revision.id,
    configuration_fingerprint: fingerprint,
    matrix: generateCompoundedProductVariantMatrix({
      axes: snapshot.variation_axes,
      selectedValueKeysByAxis: input.request.selected_value_keys_by_axis,
      excludedCombinationKeys: input.request.excluded_combination_keys,
      warningThreshold: snapshot.variant_warning_threshold,
      serverMaximum: input.serverMaximum,
    }),
  }
}

export function previewDirectCompoundedProductVariantMatrix(input: {
  request: AdminPreviewCompoundedProductVariantMatrix
  snapshot: CompoundedProductPresentationSnapshot
  serverMaximum: number
}) {
  const fingerprint = fingerprintCompoundedProductConfiguration(input.snapshot)

  return {
    presentation_revision_id: null,
    configuration_fingerprint: fingerprint,
    matrix: generateCompoundedProductVariantMatrix({
      axes: input.snapshot.variation_axes,
      selectedValueKeysByAxis: input.request.selected_value_keys_by_axis,
      excludedCombinationKeys: input.request.excluded_combination_keys,
      warningThreshold: input.snapshot.variant_warning_threshold,
      serverMaximum: input.serverMaximum,
    }),
  }
}
