import { MedusaError } from "@medusajs/framework/utils"

export function resolveCompoundedProductVariantServerMaximum(
  environment: NodeJS.ProcessEnv = process.env,
): number {
  const raw =
    environment.COMPOUNDED_PRODUCT_VARIANT_SERVER_MAXIMUM?.trim() || "250"
  const maximum = Number(raw)

  if (!Number.isSafeInteger(maximum) || maximum <= 0 || maximum > 1_000) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "COMPOUNDED_PRODUCT_VARIANT_SERVER_MAXIMUM must be an integer from 1 through 1000",
    )
  }

  return maximum
}
