"use server"

import { sdk } from "@lib/config"
import { listProducts } from "@lib/data/products"
import type { HttpTypes } from "@medusajs/types"

export type CompoundFamilyMember = {
  product_id: string
  presentation: {
    id: string
    key: string
    name: string
    description: string | null
  }
}

export type CompoundFamily = {
  id: string
  key: string
  name: string
  description: string | null
  members: CompoundFamilyMember[]
}

export type HydratedCompoundFamily = Omit<CompoundFamily, "members"> & {
  members: Array<
    CompoundFamilyMember & {
      product: HttpTypes.StoreProduct
    }
  >
}

const isNotFound = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  error.status === 404

async function retrieveFamily(path: string): Promise<CompoundFamily | null> {
  try {
    const response = await sdk.client.fetch<{ family: CompoundFamily }>(path, {
      method: "GET",
      cache: "no-store",
    })
    return response.family
  } catch (error) {
    if (isNotFound(error)) {
      return null
    }
    throw error
  }
}

export const retrieveCompoundFamilyByKey = async (key: string) =>
  retrieveFamily(`/store/compound-families/${encodeURIComponent(key)}`)

export const retrieveCompoundFamilyByProductId = async (productId: string) =>
  retrieveFamily(`/store/compound-products/${encodeURIComponent(productId)}/family`)

export async function hydrateCompoundFamily(
  family: CompoundFamily,
  countryCode: string,
): Promise<HydratedCompoundFamily> {
  const productIds = family.members.map((member) => member.product_id)
  const productIdPages = Array.from(
    { length: Math.ceil(productIds.length / 100) },
    (_, index) => productIds.slice(index * 100, (index + 1) * 100),
  )
  const responses = await Promise.all(
    productIdPages.map((ids) =>
      listProducts({
        countryCode,
        queryParams: { id: ids, limit: ids.length },
      }),
    ),
  )
  const products = responses.flatMap(({ response }) => response.products)
  const productsById = new Map(
    products.map((product) => [product.id, product]),
  )

  return {
    ...family,
    members: family.members.flatMap((member) => {
      const product = productsById.get(member.product_id)
      return product ? [{ ...member, product }] : []
    }),
  }
}
