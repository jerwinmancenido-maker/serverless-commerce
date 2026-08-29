import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { COMPOUNDED_PRODUCT_MODULE } from "."
import type { AdminPreviewCompoundedProductClassificationChange } from "./contracts/classification"
import { fingerprintCompoundedProductValue } from "./configuration-fingerprint"
import type CompoundedProductModuleService from "./service"

export const COMPOUNDED_PRODUCT_CLASSIFICATION_CHANGE_BLOCKERS = [
  "already_published",
  "ordered_variant_exists",
  "target_type_unchanged",
  "target_type_must_be_governed",
  "target_type_must_be_standard",
] as const

export type CompoundedProductClassificationChangeBlocker =
  (typeof COMPOUNDED_PRODUCT_CLASSIFICATION_CHANGE_BLOCKERS)[number]

export type CompoundedProductClassificationImpact = {
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
  blockers: CompoundedProductClassificationChangeBlocker[]
  allowed: boolean
  impact_fingerprint: string
}

export function createCompoundedProductClassificationImpact(input: {
  productId: string
  registrationId: string
  action: "reclassify" | "remove_governance"
  currentProductTypeId: string | null
  targetProductTypeId: string
  targetTypeIsGoverned: boolean
  productStatus: string
  registrationState: string
  wasPublished: boolean
  variantCount: number
  orderLineItemCount: number
}): CompoundedProductClassificationImpact {
  const blockers: CompoundedProductClassificationChangeBlocker[] = []

  if (input.wasPublished || input.productStatus === "published") {
    blockers.push("already_published")
  }
  if (input.orderLineItemCount > 0) blockers.push("ordered_variant_exists")
  if (input.currentProductTypeId === input.targetProductTypeId) {
    blockers.push("target_type_unchanged")
  }
  if (input.action === "reclassify" && !input.targetTypeIsGoverned) {
    blockers.push("target_type_must_be_governed")
  }
  if (input.action === "remove_governance" && input.targetTypeIsGoverned) {
    blockers.push("target_type_must_be_standard")
  }

  const comparison = {
    product_id: input.productId,
    registration_id: input.registrationId,
    action: input.action,
    current_product_type_id: input.currentProductTypeId,
    target_product_type_id: input.targetProductTypeId,
    target_type_is_governed: input.targetTypeIsGoverned,
    product_status: input.productStatus,
    registration_state: input.registrationState,
    variant_count: input.variantCount,
    order_line_item_count: input.orderLineItemCount,
    blockers,
    allowed: blockers.length === 0,
  }

  return {
    ...comparison,
    impact_fingerprint: fingerprintCompoundedProductValue(comparison),
  }
}

export async function resolveCompoundedProductClassificationImpact(
  container: MedusaContainer,
  input: AdminPreviewCompoundedProductClassificationChange & {
    productId: string
  },
): Promise<CompoundedProductClassificationImpact> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const service = container.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const [{ data: products }, registrations, targetMappings, { data: targetTypes }] =
    await Promise.all([
      query.graph({
        entity: "product",
        fields: ["id", "type_id", "status", "variants.id"],
        filters: { id: input.productId },
      }),
      service.listGovernedProductRegistrations({ product_id: input.productId }),
      service.listGovernedProductTypeMappings({
        product_type_id: input.target_product_type_id,
        status: "active",
      }),
      query.graph({
        entity: "product_type",
        fields: ["id"],
        filters: { id: input.target_product_type_id },
      }),
    ])

  const product = products[0]
  const registration = registrations[0]

  if (!product || !registration) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Governed compounded product ${input.productId} was not found`,
    )
  }
  if (!targetTypes[0]) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Product type ${input.target_product_type_id} was not found`,
    )
  }

  const variantIds = (product.variants || []).map(
    (variant: { id: string }) => variant.id,
  )
  const { data: orderItems } = variantIds.length
    ? await query.graph({
        entity: "order_line_item",
        fields: ["id"],
        filters: { variant_id: variantIds },
        pagination: { take: 1 },
      })
    : { data: [] }
  return createCompoundedProductClassificationImpact({
    productId: product.id,
    registrationId: registration.id,
    action: input.action,
    currentProductTypeId: product.type_id || null,
    targetProductTypeId: input.target_product_type_id,
    targetTypeIsGoverned: targetMappings.length > 0,
    productStatus: product.status,
    registrationState: registration.state,
    wasPublished: Boolean(registration.published_at),
    variantCount: variantIds.length,
    orderLineItemCount: orderItems.length,
  })
}

export function assertCompoundedProductClassificationDecision(input: {
  expectedFingerprint: string
  impact: CompoundedProductClassificationImpact
}) {
  if (input.expectedFingerprint !== input.impact.impact_fingerprint) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "classification_impact_changed",
    )
  }
  if (!input.impact.allowed) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Classification change is blocked: ${input.impact.blockers.join(", ")}`,
    )
  }
}
