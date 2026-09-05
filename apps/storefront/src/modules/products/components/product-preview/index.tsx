import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const canonicalSlug = getCanonicalProductSlug(product.handle)

  return (
    <LocalizedClientLink href={`/products/${canonicalSlug}`} className="group block h-full">
      <div
        data-testid="product-wrapper"
        className="h-full flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 overflow-hidden cursor-pointer"
      >
        {/* Product Thumbnail */}
        <div className="relative bg-slate-50/40 p-3">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>

        {/* Product Info & Price */}
        <div className="flex flex-col flex-1 p-5 pt-3 justify-between">
          <div>
            {product.subtitle && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 line-clamp-1 mb-1">
                {product.subtitle}
              </p>
            )}
            <h3
              className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug"
              data-testid="product-title"
            >
              {product.title}
            </h3>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Starting from
            </span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
