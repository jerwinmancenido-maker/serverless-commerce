import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { IProductModuleService } from "@medusajs/framework/types"
import { COMPOUNDED_PRODUCT_MODULE } from "../modules/compounded-product"
import type CompoundedProductModuleService from "../modules/compounded-product/service"
import changeCompoundedProductPublicationWorkflow from "../workflows/change-compounded-product-publication"

export default async function publishTesamorelin({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const compoundedService = container.resolve<CompoundedProductModuleService>(
    COMPOUNDED_PRODUCT_MODULE
  )
  const productService = container.resolve<IProductModuleService>(Modules.PRODUCT)

  logger.info("[publish-tesamorelin] Resolving Tesamorelin product...")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "variants.id", "variants.metadata"],
    filters: { handle: "tesamorelin" },
  })

  if (!products || products.length === 0) {
    logger.error("[publish-tesamorelin] Product with handle 'tesamorelin' not found!")
    return
  }

  const tesa = products[0]
  logger.info(
    `[publish-tesamorelin] Found product ${tesa.title} (${tesa.id}) in status: '${tesa.status}'`
  )

  // 1. Ensure compound format 'injectable' is assigned to registration
  const [registration] = await compoundedService.listGovernedProductRegistrations({
    product_id: tesa.id,
  })

  if (registration) {
    const formats = await compoundedService.listCompoundProductFormats({ key: "injectable" })
    const injectableFormat = formats[0]
    if (injectableFormat && registration.compound_format_id !== injectableFormat.id) {
      logger.info(
        `[publish-tesamorelin] Assigning compound format '${injectableFormat.name}' (${injectableFormat.id}) to registration...`
      )
      await compoundedService.updateGovernedProductRegistrations({
        id: registration.id,
        compound_format_id: injectableFormat.id,
      })
    }
  }

  // 2. Ensure all variants have valid governed metadata
  for (const variant of tesa.variants || []) {
    const meta = (variant.metadata as Record<string, any>) || {}
    if (!meta.compounded_product || meta.compounded_product.schema_version !== "1") {
      logger.info(`[publish-tesamorelin] Enriching variant ${variant.id} with governed metadata...`)
      await productService.updateProductVariants(variant.id, {
        metadata: {
          ...meta,
          compounded_product: {
            schema_version: "1",
            image_urls: [],
            matrix_row_key: `tesa-row-${variant.id}`,
            variation_measurements: [],
          },
        },
      })
    }
  }

  // 3. Execute changeCompoundedProductPublicationWorkflow
  logger.info("[publish-tesamorelin] Executing changeCompoundedProductPublicationWorkflow...")

  const { result } = await changeCompoundedProductPublicationWorkflow(container).run({
    input: {
      productId: tesa.id,
      actorId: "user_01M15PA686KDMXA6W20DD13Z5W",
      action: "publish",
      reason: "Publish Tesamorelin to live catalog",
    },
  })

  logger.info(
    `[publish-tesamorelin] Workflow result: accepted=${result.accepted}, action=${result.action}`
  )

  if (!result.accepted && result.readiness) {
    logger.warn(
      `[publish-tesamorelin] Readiness blockers: ${JSON.stringify(result.readiness.blockers || result.readiness)}`
    )
  }

  // 4. Verify product status after update
  const { data: updatedProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status"],
    filters: { id: tesa.id },
  })

  const updated = updatedProducts[0]
  logger.info(
    `[publish-tesamorelin] Final product status: '${updated.status}'`
  )
}
