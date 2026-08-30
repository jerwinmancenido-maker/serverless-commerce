import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { Navigate, useLocation } from "react-router-dom"

import { shouldUseMerchantProductView } from "../lib/merchant-product-route"

const MerchantProductDetailsRedirect = ({
  data: product,
}: DetailWidgetProps<HttpTypes.AdminProduct>) => {
  const location = useLocation()

  if (!shouldUseMerchantProductView(product.metadata, location.search)) {
    return null
  }

  return <Navigate to={`/compounded-products/${product.id}`} replace />
}

export const config = defineWidgetConfig({
  zone: "product.details",
})

export default MerchantProductDetailsRedirect
