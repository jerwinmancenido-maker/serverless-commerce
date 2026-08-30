import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { batchLinkProductsToCategoryWorkflow } from "@medusajs/medusa/core-flows"

type ProductRecord = {
  id: string
  handle: string
  categories?: { id: string }[]
}

type CategoryRecord = {
  id: string
  handle: string
}

const requiredEnvironmentValue = (name: string) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${name} is required`,
    )
  }

  return value
}

export default async function assignProductCategories({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productHandle = requiredEnvironmentValue("CATALOG_PRODUCT_HANDLE")
  const categoryHandles = [
    ...new Set(
      requiredEnvironmentValue("CATALOG_CATEGORY_HANDLES")
        .split(",")
        .map((handle) => handle.trim())
        .filter(Boolean),
    ),
  ]

  const { data: productData } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "categories.id"],
    filters: { handle: productHandle },
  })
  const products = productData as ProductRecord[]

  if (products.length !== 1) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Expected exactly one product with handle ${productHandle}`,
    )
  }

  const { data: categoryData } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: categoryHandles },
  })
  const categories = categoryData as CategoryRecord[]
  const foundHandles = new Set(categories.map((category) => category.handle))
  const missingHandles = categoryHandles.filter(
    (handle) => !foundHandles.has(handle),
  )

  if (missingHandles.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Unknown product categories: ${missingHandles.join(", ")}`,
    )
  }

  const existingCategoryIds = new Set(
    products[0].categories?.map((category) => category.id) ?? [],
  )

  for (const category of categories) {
    if (existingCategoryIds.has(category.id)) {
      continue
    }

    await batchLinkProductsToCategoryWorkflow(container).run({
      input: {
        id: category.id,
        add: [products[0].id],
        remove: [],
      },
    })
  }

  logger.info(`Assigned ${productHandle} to ${categoryHandles.join(", ")}`)
}
