"use client"

import {
  recordResearchProtocolRecommendationEvent,
  type ResearchProtocolRecommendation,
} from "@lib/data/research-protocols"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import type { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"

export type ResearchRecommendationItem = {
  recommendation: ResearchProtocolRecommendation
  product: HttpTypes.StoreProduct
}

const typeLabels: Record<string, string> = {
  required: "Required item",
  optional: "Optional add-on",
  frequently_added: "Frequently added",
  bundle: "Bundle",
  refill: "Refill",
  replacement: "Replacement",
  alternative: "Alternative",
  upgrade: "Upgrade",
  cross_sell: "You may also like",
  reorder: "Reorder",
}

export default function ProductRecommendations({
  handle,
  items,
  eyebrow = "Product recommendations",
}: {
  handle: string
  items: ResearchRecommendationItem[]
  eyebrow?: string
}) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const visibleItems = useMemo(
    () => items.filter(({ recommendation }) => !dismissed.includes(recommendation.id)),
    [dismissed, items]
  )

  useEffect(() => {
    items.forEach(({ recommendation }) => {
      void recordResearchProtocolRecommendationEvent({
        handle,
        recommendation,
        eventType: "impression",
      }).catch(() => undefined)
    })
  }, [handle, items])

  if (!visibleItems.length) return null

  return (
    <section className="mt-12 border-t border-ui-border-base pt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-small-semi uppercase tracking-wide text-ui-fg-interactive">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl-semi text-ui-fg-base">
            {visibleItems[0]?.recommendation.heading || "Products that may support this protocol"}
          </h2>
        </div>
        <p className="hidden text-small-regular text-ui-fg-subtle small:block">
          Scroll to explore
        </p>
      </div>
      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {visibleItems.map(({ recommendation, product }) => {
          const { cheapestPrice } = getProductPrice({ product })
          return (
            <article
              key={recommendation.id}
              className="min-w-[78%] snap-start overflow-hidden rounded-rounded border border-ui-border-base bg-ui-bg-base small:min-w-[310px] small:max-w-[310px]"
            >
              <div className="aspect-square bg-ui-bg-subtle">
                <Thumbnail
                  thumbnail={product.thumbnail}
                  images={product.images}
                  size="full"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xsmall-semi uppercase tracking-wide text-ui-fg-interactive">
                      {typeLabels[recommendation.relationship_type] || "Recommended"}
                    </p>
                    <h3 className="mt-1 text-base-semi text-ui-fg-base">
                      {product.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    aria-label={`Hide ${product.title}`}
                    className="text-ui-fg-muted hover:text-ui-fg-base"
                    onClick={() => {
                      setDismissed((current) => [...current, recommendation.id])
                      void recordResearchProtocolRecommendationEvent({
                        handle,
                        recommendation,
                        eventType: "dismiss",
                      }).catch(() => undefined)
                    }}
                  >
                    ×
                  </button>
                </div>
                <p className="mt-3 min-h-12 text-small-regular text-ui-fg-subtle">
                  {recommendation.reason}
                </p>
                {cheapestPrice ? (
                  <p className="mt-3 text-base-semi text-ui-fg-base">
                    {cheapestPrice.calculated_price}
                  </p>
                ) : null}
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-rounded bg-ui-button-inverted px-4 py-2 text-small-semi text-ui-fg-on-inverted hover:bg-ui-button-inverted-hover"
                  onClick={() => {
                    void recordResearchProtocolRecommendationEvent({
                      handle,
                      recommendation,
                      eventType: "click",
                    }).catch(() => undefined)
                  }}
                >
                  {recommendation.product_variant_ids.length === 1 &&
                  recommendation.quick_add_enabled
                    ? "View and add"
                    : "Choose options"}
                </LocalizedClientLink>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
