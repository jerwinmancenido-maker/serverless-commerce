import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"

import { listResearchProtocols } from "@lib/data/research-protocols"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate = async ({
  product,
  region,
  countryCode,
  images,
}: ProductTemplateProps) => {
  if (!product || !product.id) {
    return notFound()
  }

  const { protocols } = await listResearchProtocols().catch(() => ({
    protocols: [],
  }))
  const linkedProtocol = protocols.find(
    (p) =>
      p.products?.some(
        (prod) => prod.id === product.id || prod.handle === product.handle
      ) ||
      (product.handle &&
        p.handle.toLowerCase().includes(product.handle.split("-")[0]))
  )

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={images} productTitle={product.title} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>

          {linkedProtocol && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 p-4 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-lg shadow-sm">
                  🔬
                </div>
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-indigo-100/90 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-900 uppercase tracking-wide">
                    Verified Research Protocol
                  </span>
                  <h4 className="mt-1 text-xs font-bold text-zinc-900 leading-snug">
                    {linkedProtocol.title}
                  </h4>
                  <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {linkedProtocol.summary ||
                      "Verified reconstitution ratios, solvent compatibility, storage parameters, and laboratory guidelines."}
                  </p>
                  <div className="mt-2.5">
                    <LocalizedClientLink
                      href={`/research-protocols/${linkedProtocol.handle}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
                    >
                      Study Protocol & Guide ↗
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
