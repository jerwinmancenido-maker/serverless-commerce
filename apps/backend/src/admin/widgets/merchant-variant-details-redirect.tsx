/**
 * @file    apps/backend/src/admin/widgets/merchant-variant-details-redirect.tsx
 * @module  MerchantVariantDetailsRedirect (Admin Extension)
 * @purpose Redirects product variant views directly into the specialized Compounded Products Cockpit BOM matrix.
 * @contracts
 *   Route: /compounded-products/:id
 *   Widget: product_variant.details.before
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { ArrowUpRightOnBox } from "@medusajs/icons"
import { Badge, Button, Heading, Text } from "@medusajs/ui"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"

import { resolveMerchantVariantRedirectUrl } from "../lib/merchant-variant-route"

const MerchantVariantDetailsRedirect = ({
  data: variant,
}: DetailWidgetProps<HttpTypes.AdminProductVariant>) => {
  const location = useLocation()
  const { id: routeProductId, variant_id: routeVariantId } = useParams()

  const productId = variant?.product_id || routeProductId
  const variantId = variant?.id || routeVariantId
  const searchParams = new URLSearchParams(location.search)
  const isAdvancedView = searchParams.get("view") === "advanced"

  // Allow explicit advanced debugging view if '?view=advanced' is in the query
  if (isAdvancedView) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200/80 border-l-4 border-l-blue-500 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-2">
            <Heading level="h3" className="text-sm font-semibold">
              Advanced Medusa Core Variant Inspection
            </Heading>
            <Badge size="2xsmall" color="blue">
              Raw Mode
            </Badge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            You are viewing the low-level Medusa core fallback view. For batch recipes, stock adjustments, and clinical photos, open the Compounded Cockpit.
          </Text>
        </div>
        {productId && (
          <Button size="small" variant="secondary" asChild>
            <Link to={`/compounded-products/${productId}?variant=${variantId}`}>
              Open Compounded Cockpit
              <ArrowUpRightOnBox className="ml-1 size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    )
  }

  const redirectUrl = resolveMerchantVariantRedirectUrl(
    productId,
    variantId,
    location.search,
  )

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />
  }

  return null
}

export const config = defineWidgetConfig({
  zone: "product_variant.details.before",
})

export default MerchantVariantDetailsRedirect
