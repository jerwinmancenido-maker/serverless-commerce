import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export const listCategories = async (query?: Record<string, unknown>) => {
  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const CATEGORY_HANDLE_ALIASES: Record<string, string> = {
  "cognitive-nootropic-peptides": "cognitive-neuroprotective-peptides",
  "neurobiology-cognitive-peptides": "cognitive-neuroprotective-peptides",
  "immune-defense-peptides": "immune-inflammation-research-peptides",
  "immune-defense-antimicrobial-peptides": "immune-inflammation-research-peptides",
  "multi-peptide-blends": "multi-compound-research-bundles",
  "multi-peptide-blends-formulations": "multi-compound-research-bundles",
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const rawHandle = `${categoryHandle.join("/")}`
  const handle = CATEGORY_HANDLE_ALIASES[rawHandle] || rawHandle

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
