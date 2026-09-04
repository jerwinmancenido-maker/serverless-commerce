import { HttpTypes } from "@medusajs/types"
import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { sanitizeProductDescription } from "@lib/product-description"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  mode?: "header" | "description" | "all"
}

const ProductInfo = ({ product, mode = "all" }: ProductInfoProps) => {
  const descriptionHtml = sanitizeProductDescription(product.description)

  const showHeader = mode === "header" || mode === "all"
  const showDescription = mode === "description" || mode === "all"

  return (
    <div id="product-info" className="w-full">
      <div className="flex flex-col gap-y-3">
        {showHeader && (
          <>
            {!!product.categories?.length && (
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                {product.categories.map((category) => (
                  <LocalizedClientLink
                    key={category.id}
                    href={`/categories/${category.handle}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {category.name}
                  </LocalizedClientLink>
                ))}
              </div>
            )}
            <Heading
              level="h1"
              className="text-2xl small:text-3xl font-bold tracking-tight text-zinc-900"
              data-testid="product-title"
            >
              {product.title}
            </Heading>
            {product.subtitle && (
              <p
                className="text-sm text-zinc-500 leading-snug tracking-wide"
                data-testid="product-subtitle"
              >
                {product.subtitle}
              </p>
            )}
          </>
        )}

        {showDescription && descriptionHtml && (
          <div
            className="text-medium text-ui-fg-subtle leading-relaxed [&_a]:text-ui-fg-interactive [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-ui-border-strong [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_img]:my-4 [&_img]:max-h-[480px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-contain [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
            data-testid="product-description"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}
      </div>
    </div>
  )
}

export default ProductInfo
