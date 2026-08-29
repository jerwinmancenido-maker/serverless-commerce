import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { PEPSTACK_BOM_MODULE } from "../bom"
import type PepstackBomModuleService from "../bom/service"
import { COMPOUNDED_PRODUCT_MODULE } from "."
import type CompoundedProductModuleService from "./service"
import {
  buildCompoundedProductReadinessReport,
  compoundedProductRecipeIsReady,
  type CompoundedProductReadinessVariant,
} from "./product-readiness"

type ProductGraphRecord = {
  id: string
  sales_channels?: Array<{ id: string }>
  metadata?: Record<string, unknown> | null
  variants?: Array<{
    id: string
    sku?: string | null
    title?: string | null
    manage_inventory?: boolean
    prices?: Array<{ id: string }>
    metadata?: Record<string, unknown> | null
  }>
}

type InventoryLinkRecord = {
  variant_id: string
  inventory_item_id: string
  required_quantity: number
}

function hasGovernedMetadata(
  metadata: Record<string, unknown> | null | undefined,
) {
  const governed = metadata?.compounded_product

  return Boolean(
    governed &&
      typeof governed === "object" &&
      "schema_version" in governed &&
      governed.schema_version === "1",
  )
}

export async function resolveCompoundedProductReadiness(
  container: MedusaContainer,
  productId: string,
) {
  const service = container.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const bomService = container.resolve<PepstackBomModuleService>(
    PEPSTACK_BOM_MODULE,
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const [registration] = await service.listGovernedProductRegistrations({
    product_id: productId,
  })

  if (!registration) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Governed compounded product ${productId} was not found`,
    )
  }

  const [{ data: products }, { data: links }] = await Promise.all([
    query.graph({
      entity: "product",
      fields: [
        "id",
        "metadata",
        "sales_channels.id",
        "variants.id",
        "variants.sku",
        "variants.title",
        "variants.manage_inventory",
        "variants.metadata",
        "variants.prices.id",
      ],
      filters: { id: productId },
    }),
    query.graph({
      entity: "product_variant_inventory_item",
      fields: ["variant_id", "inventory_item_id", "required_quantity"],
      filters: {},
    }),
  ])
  const product = products[0] as ProductGraphRecord | undefined

  if (!product) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product ${productId} was not found`,
    )
  }

  const revision = await service.retrievePresentationConfigurationRevision(
    registration.presentation_revision_id,
  )
  const productVariantIds = new Set(
    (product.variants || []).map((variant) => variant.id),
  )
  const relevantLinks = (links as InventoryLinkRecord[]).filter((link) =>
    productVariantIds.has(link.variant_id),
  )
  const profiles = relevantLinks.length
    ? await bomService.listComponentProfiles({
        inventory_item_id: Array.from(
          new Set(relevantLinks.map((link) => link.inventory_item_id)),
        ),
      })
    : []
  const profiledInventoryItemIds = new Set(
    profiles.map((profile) => profile.inventory_item_id),
  )
  const variants: CompoundedProductReadinessVariant[] = (
    product.variants || []
  ).map((variant) => {
    const recipeComponents = relevantLinks
      .filter((link) => link.variant_id === variant.id)
      .map((link) => ({
        inventory_item_id: link.inventory_item_id,
        required_quantity: link.required_quantity,
      }))

    return {
      id: variant.id,
      sku: variant.sku || null,
      title: variant.title || variant.sku || variant.id,
      manage_inventory: variant.manage_inventory !== false,
      has_price: Boolean(variant.prices?.length),
      recipe_components: recipeComponents,
      recipe_ready: compoundedProductRecipeIsReady({
        manageInventory: variant.manage_inventory !== false,
        recipeComponents,
        profiledInventoryItemIds,
      }),
    }
  })
  const structuredMeasurementsValid =
    hasGovernedMetadata(product.metadata) &&
    variants.every((variant) => {
      const source = product.variants?.find((item) => item.id === variant.id)
      return hasGovernedMetadata(source?.metadata)
    })

  return {
    product_id: productId,
    registration: {
      id: registration.id,
      state: registration.state,
      presentation_revision_id: registration.presentation_revision_id,
      readiness_policy_revision: registration.readiness_policy_revision,
    },
    ...buildCompoundedProductReadinessReport({
      registration_exists: true,
      configuration_revision_active:
        revision.status === "active" &&
        revision.fingerprint === registration.configuration_fingerprint,
      sales_channels_ready: Boolean(product.sales_channels?.length),
      structured_measurements_valid: structuredMeasurementsValid,
      audit_available: true,
      policy: registration.readiness_policy_snapshot,
      variants,
    }),
  }
}
