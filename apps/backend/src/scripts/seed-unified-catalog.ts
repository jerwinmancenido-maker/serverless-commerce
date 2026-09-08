import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  batchLinkProductsToCategoryWorkflow,
  createProductsWorkflow,
  createProductVariantsWorkflow,
  updateProductOptionsWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows"

type UnifiedVariant = {
  title: string
  sku: string
  pepstack_code: string
  price_php: number
  lazada_benchmark_price: number
  options: Record<string, string>
  allow_backorder: boolean
  manage_inventory: boolean
  inventory_quantity: number
}

type UnifiedProduct = {
  title: string
  handle: string
  description: string
  category_handle: string
  type_id: string | null
  thumbnail: string | null
  images: string[]
  options: {
    title: string
    values: string[]
  }[]
  variants: UnifiedVariant[]
  metadata: Record<string, unknown>
}

type SalesChannelRecord = {
  id: string
  name: string
}

type ShippingProfileRecord = {
  id: string
  type: string
}

type ProductCategoryRecord = {
  id: string
  handle: string
}

type ExistingProductRecord = {
  id: string
  handle: string
  title: string
  variants?: {
    id: string
    sku: string | null
  }[]
  options?: {
    id: string
    title: string
    values?: {
      id: string
      value: string
    }[]
  }[]
}

export default async function seedUnifiedCatalog({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Loading unified catalog data...")
  const catalogPath = path.resolve("data/unified-catalog.json")

  if (!fs.existsSync(catalogPath)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unified catalog file not found at ${catalogPath}`,
    )
  }

  const catalog: UnifiedProduct[] = JSON.parse(
    fs.readFileSync(catalogPath, "utf-8"),
  )
  logger.info(`Loaded ${catalog.length} canonical products from catalog file.`)

  // 1. Resolve default sales channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const salesChannelList = salesChannels as SalesChannelRecord[]
  const targetSalesChannel =
    salesChannelList.find((sc) => sc.name === "Online Store") ||
    salesChannelList[0]

  if (!targetSalesChannel) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No sales channel found in database.",
    )
  }
  logger.info(
    `Using sales channel: ${targetSalesChannel.name} (${targetSalesChannel.id})`,
  )

  // 2. Resolve default shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "type"],
  })
  const shippingProfileList = shippingProfiles as ShippingProfileRecord[]
  const defaultShippingProfile =
    shippingProfileList.find((sp) => sp.type === "default") ||
    shippingProfileList[0]

  if (!defaultShippingProfile) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No shipping profile found in database.",
    )
  }
  logger.info(
    `Using shipping profile: ${defaultShippingProfile.type} (${defaultShippingProfile.id})`,
  )

  // 3. Resolve product categories
  const { data: categoriesData } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  })
  const categoryMap = new Map(
    (categoriesData as ProductCategoryRecord[]).map((c) => [c.handle, c.id]),
  )

  // 4. Query existing products in database
  const { data: existingProductsData } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "variants.id",
      "variants.sku",
      "options.id",
      "options.title",
      "options.values.id",
      "options.values.value",
    ],
  })
  const existingProductsByHandle = new Map(
    (existingProductsData as ExistingProductRecord[]).map((p) => [
      p.handle,
      p,
    ]),
  )

  let createdCount = 0
  let updatedCount = 0

  for (const item of catalog) {
    const existing = existingProductsByHandle.get(item.handle)
    let productId: string | undefined

    if (existing) {
      logger.info(
        `Product with handle '${item.handle}' already exists (${existing.id}). Updating metadata and images...`,
      )

      await updateProductsWorkflow(container).run({
        input: {
          selector: { id: existing.id },
          update: {
            title: item.title,
            description: item.description,
            status: "published",
            thumbnail: item.thumbnail || undefined,
            images: item.images.map((url) => ({ url })),
            metadata: item.metadata,
          },
        },
      })
      productId = existing.id
      updatedCount++

      // Ensure all required option values exist before adding variants
      if (existing.options) {
        for (const opt of existing.options) {
          const itemOpt = item.options.find(
            (io) => io.title.toLowerCase() === opt.title.toLowerCase()
          )
          if (itemOpt) {
            const existingVals = new Set(opt.values?.map((v) => v.value) || [])
            const missingVals = itemOpt.values.filter((v) => !existingVals.has(v))
            if (missingVals.length > 0) {
              const allVals = Array.from(new Set([...existingVals, ...itemOpt.values]))
              try {
                await updateProductOptionsWorkflow(container).run({
                  input: {
                    selector: { id: opt.id },
                    update: { values: allVals },
                  },
                })
                logger.info(
                  `Updated option '${opt.title}' on '${item.handle}' with values: ${allVals.join(", ")}`,
                )
              } catch (optErr: any) {
                logger.warn(
                  `Could not update option '${opt.title}' on '${item.handle}': ${optErr?.message || optErr}`,
                )
              }
            }
          }
        }
      }

      // Check for missing variants to add (e.g. Tier 1: Vial + BAC Water, Complete SubQ Set)
      const existingSkus = new Set(existing.variants?.map((v) => v.sku) || [])
      const missingVariants = item.variants.filter((v) => !existingSkus.has(v.sku))
      if (missingVariants.length > 0) {
        logger.info(
          `Adding ${missingVariants.length} missing variants to existing product '${item.handle}'...`,
        )
        try {
          await createProductVariantsWorkflow(container).run({
            input: {
              product_variants: missingVariants.map((v) => ({
                product_id: existing.id,
                title: v.title,
                sku: v.sku,
                manage_inventory: false,
                allow_backorder: true,
                options: v.options,
                prices: [
                  {
                    currency_code: "php",
                    amount: v.price_php,
                  },
                ],
                metadata: {
                  pepstack_code: v.pepstack_code,
                  lazada_benchmark_price: v.lazada_benchmark_price,
                },
              })),
            },
          })
          logger.info(`Successfully added ${missingVariants.length} variants to '${item.handle}'.`)
        } catch (variantErr: any) {
          logger.warn(
            `Could not add missing variants to '${item.handle}': ${variantErr?.message || variantErr}`,
          )
        }
      }
    } else {
      logger.info(`Creating canonical product: ${item.title} (${item.handle})...`)

      const { result: createdProducts } = await createProductsWorkflow(
        container,
      ).run({
        input: {
          products: [
            {
              title: item.title,
              handle: item.handle,
              description: item.description,
              status: "published",
              thumbnail: item.thumbnail || undefined,
              images: item.images.map((url) => ({ url })),
              sales_channels: [{ id: targetSalesChannel.id }],
              shipping_profile_id: defaultShippingProfile.id,
              options: item.options,
              variants: item.variants.map((v) => ({
                title: v.title,
                sku: v.sku,
                manage_inventory: false,
                allow_backorder: true,
                options: v.options,
                prices: [
                  {
                    currency_code: "php",
                    amount: v.price_php,
                  },
                ],
                metadata: {
                  pepstack_code: v.pepstack_code,
                  lazada_benchmark_price: v.lazada_benchmark_price,
                },
              })),
              metadata: item.metadata,
            },
          ],
        },
      })

      const createdProduct = createdProducts[0]
      productId = createdProduct?.id
      createdCount++
    }

    // Link category if found
    const categoryId = categoryMap.get(item.category_handle)
    if (categoryId && productId) {
      try {
        await batchLinkProductsToCategoryWorkflow(container).run({
          input: {
            id: categoryId,
            add: [productId],
            remove: [],
          },
        })
        logger.info(
          `Linked product '${item.handle}' to category '${item.category_handle}'.`,
        )
      } catch (catErr: any) {
        // Product might already be linked to category
        logger.info(
          `Product '${item.handle}' already linked or updated for category '${item.category_handle}'.`,
        )
      }
    }
  }

  logger.info(
    `Catalog Seeding Finished: ${createdCount} created, ${updatedCount} updated across ${catalog.length} canonical products.`,
  )
}
