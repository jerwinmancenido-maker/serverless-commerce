import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

import { PEPTIDE_CATEGORY_TAXONOMY } from "../lib/peptide-category-taxonomy"

type ExistingCategory = {
  id: string
  handle: string
}

export default async function configurePeptideCategoryTaxonomy({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  })
  const categoriesByHandle = new Map(
    (data as ExistingCategory[]).map((category) => [category.handle, category]),
  )

  for (const category of PEPTIDE_CATEGORY_TAXONOMY) {
    const existing = categoriesByHandle.get(category.handle)
    const values = {
      name: category.name,
      handle: category.handle,
      description: category.description,
      rank: category.rank,
      is_active: true,
      is_internal: false,
    }

    if (existing) {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: existing.id },
          update: values,
        },
      })
      logger.info(`Updated product category ${category.handle}`)
      continue
    }

    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [values],
      },
    })
    logger.info(`Created product category ${category.handle}`)
  }
}
