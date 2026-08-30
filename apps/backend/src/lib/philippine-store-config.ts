import { MedusaError } from "@medusajs/framework/utils"

export const PHILIPPINE_STORE_CONFIG = {
  countryCode: "ph",
  currencyCode: "php",
  regionName: "Philippines",
  storeName: "Research Compounds",
  salesChannelName: "Online Store",
  stockLocationName: "Philippine Warehouse",
  fulfillmentSetName: "Philippine Warehouse delivery",
  serviceZoneName: "Philippines",
  shippingOptionName: "J&T Express",
  shippingOptionCode: "jnt-express",
  fulfillmentProviderId: "manual_manual",
  systemPaymentProviderId: "pp_system_default",
  manualQrPaymentProviderId: "pp_manual-qr_manual-qr",
  taxProviderId: "tp_system",
} as const

export type JntShippingConfiguration = {
  amount: number
  enabledInStore: boolean
}

export function resolveJntShippingConfiguration(
  configuredAmount: string | undefined
): JntShippingConfiguration {
  if (!configuredAmount?.trim()) {
    return {
      amount: 0,
      enabledInStore: false,
    }
  }

  const amount = Number(configuredAmount)

  if (!Number.isFinite(amount) || amount < 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "JNT_DEFAULT_SHIPPING_AMOUNT must be a non-negative number"
    )
  }

  return {
    amount,
    enabledInStore: true,
  }
}

export function mergeProviderIds(
  existingProviderIds: string[],
  requiredProviderIds: string[]
) {
  return [...new Set([...existingProviderIds, ...requiredProviderIds])]
}

export function selectPreferredRecord<T extends { name: string }>(
  records: T[],
  preferredName: string,
  legacyNames: string[] = []
) {
  return (
    records.find((record) => record.name === preferredName) ??
    records.find((record) => legacyNames.includes(record.name)) ??
    records[0]
  )
}
