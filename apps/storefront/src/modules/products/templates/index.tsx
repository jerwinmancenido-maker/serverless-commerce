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
    <div className="relative w-full overflow-hidden">
      {/* Ambient Drifting Laboratory Aurora Mesh Motion Background */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft Indigo / Blue Drifting Orb */}
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-indigo-200/35 via-sky-200/25 to-transparent blur-3xl animate-aurora-drift" />

        {/* Translucent Cyan / Teal Counter-Drifting Orb */}
        <div className="absolute top-1/4 -right-28 w-[34rem] h-[34rem] rounded-full bg-gradient-to-bl from-teal-100/35 via-sky-100/25 to-transparent blur-3xl animate-aurora-reverse" />

        {/* Soft Lavender / Pearl Pulsing Center Orb */}
        <div className="absolute -bottom-16 left-1/3 w-[26rem] h-[26rem] rounded-full bg-gradient-to-tr from-purple-100/30 via-slate-100/20 to-transparent blur-3xl animate-aurora-pulse" />

        {/* Subtle Laboratory Coordinate Grid Matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_95%)]" />
      </div>

      {/* 1. Hero 2-Column Section */}
      <div
        className="content-container flex flex-col small:flex-row small:items-start gap-x-12 py-10 relative"
        data-testid="product-container"
      >
        {/* Left Column: Product Media Gallery */}
        <div className="w-full small:w-1/2 relative">
          <ImageGallery images={images} productTitle={product.title} />
        </div>

        {/* Right Column: Sticky Buy Box */}
        <div className="flex flex-col small:sticky small:top-24 w-full small:w-1/2 py-4 gap-y-4">
          <ProductInfo product={product} mode="header" />
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
        </div>
      </div>
    </div>

      {/* 2. Scientific & Compliance Workspace (Below the Fold, Full Width) */}
      <div id="scientific-workspace" className="content-container py-12 border-t border-zinc-200 mt-6">
        <ProductTabs product={product} linkedProtocol={linkedProtocol} />
      </div>

      {/* 3. Level 3 Upsell: Synergistic Research Compounds */}
      <div
        className="content-container my-16 small:my-24"
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
