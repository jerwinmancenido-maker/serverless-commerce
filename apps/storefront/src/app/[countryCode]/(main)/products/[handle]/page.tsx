/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx
 * @module  StorefrontProductPage (Storefront Product Route)
 * @purpose Renders single product research detail page with dynamic variant image galleries and canonical redirect handling.
 * @contracts
 *   Fetches: listProducts() · getRegion()
 *   API:     GET /store/products · GET /store/regions
 */

import { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import {
  resolveProductHandle,
  getCanonicalProductSlug,
} from "@lib/util/product-handles"
import { resolveVariantImageIndex } from "@lib/util/resolve-variant-image-index"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return response.products.map((product) => ({
        countryCode: country,
        handle: product.handle,
      }))
    })

    const country = await Promise.all(promises)

    return country.flat()
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}


function getImagesForVariant(
  product: HttpTypes.StoreProduct
): HttpTypes.StoreProductImage[] {
  const baseImages: HttpTypes.StoreProductImage[] = product.images ? [...product.images] : []
  const variants = product.variants || []

  // Ensure base images have variant metadata if matching
  for (const img of baseImages) {
    if (!img.metadata) img.metadata = {}
    for (const v of variants) {
      const urls: string[] = []
      if (v.thumbnail) urls.push(v.thumbnail)
      const rawUrls = v.metadata?.image_urls as string[] | undefined
      if (rawUrls) urls.push(...rawUrls)
      const compounded = (v.metadata?.compounded_product as { image_urls?: string[] } | undefined)?.image_urls
      if (compounded) urls.push(...compounded)

      const matches = urls.some((u) => {
        if (!u || !img.url) return false
        if (u === img.url) return true
        const uFile = u.split("?")[0].split("/").pop()?.toLowerCase()
        const imgFile = img.url.split("?")[0].split("/").pop()?.toLowerCase()
        return uFile && imgFile && uFile === imgFile
      })

      if (matches) {
        img.metadata.variant_id = v.id
        img.metadata.variant_title = v.title
      }
    }
  }

  // Collect custom images from variants (thumbnails and metadata image_urls)
  const variantCustomImages: HttpTypes.StoreProductImage[] = []
  const seenUrls = new Set(baseImages.map((img) => img.url))

  for (const v of variants) {
    const urls: string[] = []
    if (v.thumbnail && !seenUrls.has(v.thumbnail)) {
      urls.push(v.thumbnail)
    }
    const compounded = v.metadata?.compounded_product as
      | { image_urls?: string[] }
      | undefined
    if (compounded?.image_urls?.length) {
      for (const u of compounded.image_urls) {
        if (u && !seenUrls.has(u)) urls.push(u)
      }
    }
    const rawUrls = v.metadata?.image_urls as string[] | undefined
    if (rawUrls?.length) {
      for (const u of rawUrls) {
        if (u && !seenUrls.has(u)) urls.push(u)
      }
    }

    for (const u of urls) {
      seenUrls.add(u)
      variantCustomImages.push({
        id: `var-${v.id}-${variantCustomImages.length}`,
        url: u,
        rank: baseImages.length + variantCustomImages.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        metadata: { variant_id: v.id, variant_title: v.title },
      })
    }
  }

  // Keep canonical gallery sequence without scrambling order
  return [...baseImages, ...variantCustomImages]
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const resolvedHandle = resolveProductHandle(handle)

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: resolvedHandle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const canonicalSlug = getCanonicalProductSlug(product.handle)

  return {
    title: product.title,
    description: `${product.title}`,
    openGraph: {
      title: product.title,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    alternates: {
      canonical: `/${params.countryCode}/products/${canonicalSlug}`,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const resolvedHandle = resolveProductHandle(params.handle)

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: resolvedHandle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Canonical redirect: If accessed via internal DB handle or outdated alias, redirect to canonical slug
  const canonicalSlug = getCanonicalProductSlug(pricedProduct.handle)
  if (params.handle.toLowerCase().trim() !== canonicalSlug) {
    const query = selectedVariantId
      ? `?v_id=${encodeURIComponent(selectedVariantId)}`
      : ""
    permanentRedirect(`/${params.countryCode}/products/${canonicalSlug}${query}`)
  }

  const images = getImagesForVariant(pricedProduct)
  const selectedVariant = selectedVariantId
    ? pricedProduct.variants?.find((v) => v.id === selectedVariantId)
    : undefined
  const initialImageIndex = selectedVariant
    ? resolveVariantImageIndex(selectedVariant, images)
    : 0

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images ?? []}
      initialImageIndex={initialImageIndex}
      selectedVariantId={selectedVariantId}
    />
  )
}
