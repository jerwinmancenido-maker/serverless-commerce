const COMPOUNDED_PRODUCT_METADATA_NAMESPACE = "compounded_product"

export const shouldUseMerchantProductView = (
  metadata: Record<string, unknown> | null | undefined,
  search = "",
) => {
  if (new URLSearchParams(search).get("view") === "advanced") {
    return false
  }

  const governedMetadata = metadata?.[COMPOUNDED_PRODUCT_METADATA_NAMESPACE]

  return Boolean(
    governedMetadata &&
      typeof governedMetadata === "object" &&
      !Array.isArray(governedMetadata),
  )
}
