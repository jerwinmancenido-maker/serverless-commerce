import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation } from "react-router-dom"

import { shouldRedirectProductCreate } from "../lib/product-create-route"

const ProductCreateRedirect = () => {
  const location = useLocation()

  if (!shouldRedirectProductCreate(location.pathname)) {
    return null
  }

  return <Navigate to="/compounded-products" replace />
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductCreateRedirect
