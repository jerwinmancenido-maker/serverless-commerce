/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx
 * @module  CategoryPageRoute (Storefront Category Dynamic Routing)
 * @purpose Renders product category listings with canonical handle resolution and legacy alias redirects.
 * @contracts
 *   Fetches: getCategoryByHandle() · listCategories()
 *   API:     GET /store/product-categories
 */

import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import {
  getCategoryByHandle,
  listCategories,
  CATEGORY_HANDLE_ALIASES,
} from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()

    if (!product_categories) {
      return []
    }

    const countryCodes = await listRegions()
      .then((regions: StoreRegion[]) =>
        regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
      )
      .catch(() => [])

    const categoryHandles = product_categories.map(
      (category: HttpTypes.StoreProductCategory) => category.handle
    )
    const allHandles = Array.from(
      new Set([...categoryHandles, ...Object.keys(CATEGORY_HANDLE_ALIASES)])
    )

    const staticParams = countryCodes
      ?.map((countryCode: string | undefined) =>
        allHandles.map((handle: string) => ({
          countryCode,
          category: [handle],
        }))
      )
      .flat()

    return staticParams || []
  } catch (error) {
    console.warn(
      `Failed to generate static paths for categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const rawHandle = `${params.category.join("/")}`

  if (CATEGORY_HANDLE_ALIASES[rawHandle]) {
    const canonical = CATEGORY_HANDLE_ALIASES[rawHandle]
    redirect(`/${params.countryCode}/categories/${canonical}`)
  }

  const canonicalHandle = CATEGORY_HANDLE_ALIASES[rawHandle] || rawHandle

  try {
    const productCategory = await getCategoryByHandle([canonicalHandle])

    const title = productCategory.name

    const description = productCategory.description ?? `${title} category.`

    return {
      title,
      description,
      alternates: {
        canonical: canonicalHandle,
      },
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const rawHandle = `${params.category.join("/")}`

  if (CATEGORY_HANDLE_ALIASES[rawHandle]) {
    const canonical = CATEGORY_HANDLE_ALIASES[rawHandle]
    redirect(`/${params.countryCode}/categories/${canonical}`)
  }

  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
    />
  )
}
