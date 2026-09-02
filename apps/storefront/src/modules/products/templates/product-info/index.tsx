import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sanitizeProductDescription } from "@lib/product-description"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const descriptionHtml = sanitizeProductDescription(product.description)

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {!!product.categories?.length && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {product.categories.map((category) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
              >
                {category.name}
              </LocalizedClientLink>
            ))}
          </div>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <div className="flex flex-wrap items-center gap-2 -mt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ≥98% HPLC & MS Verified
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100/90 border border-zinc-200/70 px-2.5 py-1 text-[11px] font-medium text-zinc-600">
            <span>❄️</span> Store at -20°C
          </span>
          <span className="text-[11px] text-zinc-400">Analytical Research Grade</span>
        </div>

        {descriptionHtml ? (
          <div
            className="text-medium text-ui-fg-subtle [&_a]:text-ui-fg-interactive [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-ui-border-strong [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-contain [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
            data-testid="product-description"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : null}
      </div>
    </div>
  )
}

export default ProductInfo
