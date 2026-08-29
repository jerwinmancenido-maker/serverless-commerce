import type { MedusaContainer, ProductTypes } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  createProductsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

type ProductMutationKind = "create" | "update"

function pendingRequestId(additionalData: Record<string, unknown> | undefined) {
  const value = additionalData?.compounded_product_creation_request_id
  return typeof value === "string" && value.trim() ? value : null
}

async function assertCompoundedProductGovernance(
  products: ProductTypes.ProductDTO[],
  additionalData: Record<string, unknown> | undefined,
  container: MedusaContainer,
  mutationKind: ProductMutationKind,
) {
  if (!products.length) return

  const service = container.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE,
  )
  const productIds = products.map((product) => product.id)
  const productTypeIds = Array.from(
    new Set(
      products
        .map((product) => product.type_id)
        .filter((id): id is string => Boolean(id)),
    ),
  )
  const [registrations, mappings] = await Promise.all([
    service.listGovernedProductRegistrations({ product_id: productIds }),
    productTypeIds.length
      ? service.listGovernedProductTypeMappings({
          product_type_id: productTypeIds,
          status: "active",
        })
      : Promise.resolve([]),
  ])
  const registrationByProduct = new Map(
    registrations.map((registration) => [registration.product_id, registration]),
  )
  const governedProductTypeIds = new Set(
    mappings.map((mapping) => mapping.product_type_id),
  )
  const requestId = pendingRequestId(additionalData)
  const [pendingRequest] =
    mutationKind === "create" && requestId
      ? await service.listProductCreationRequests(
          { id: requestId, status: "in_progress" },
          { take: 1 },
        )
      : []

  for (const product of products) {
    const registration = registrationByProduct.get(product.id)
    const productTypeIsGoverned = Boolean(
      product.type_id && governedProductTypeIds.has(product.type_id),
    )

    if (!registration) {
      if (!productTypeIsGoverned) continue

      if (mutationKind === "create" && pendingRequest) continue

      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Products in a governed product type must be created through the Compounded Products workflow",
      )
    }

    if (registration.governed_product_type_id !== (product.type_id || null)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Governed product reclassification must use a dedicated impact-reviewed workflow",
      )
    }

    const productIsPublished = product.status === "published"
    const registrationIsPublished = registration.state === "published"

    if (productIsPublished !== registrationIsPublished) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Governed compounded-product publication changes must use the Compounded Products readiness screen",
      )
    }
  }
}

createProductsWorkflow.hooks.productsCreated(
  async ({ products, additional_data }, { container }) => {
    await assertCompoundedProductGovernance(
      products,
      additional_data,
      container,
      "create",
    )
    return new StepResponse([])
  },
)

updateProductsWorkflow.hooks.productsUpdated(
  async ({ products, additional_data }, { container }) => {
    await assertCompoundedProductGovernance(
      products,
      additional_data,
      container,
      "update",
    )
    return new StepResponse([])
  },
)
