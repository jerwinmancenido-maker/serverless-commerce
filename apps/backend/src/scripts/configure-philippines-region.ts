import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
  updateSalesChannelsWorkflow,
  updateStockLocationsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

import {
  mergeProviderIds,
  PHILIPPINE_STORE_CONFIG,
  selectPreferredRecord,
} from "../lib/philippine-store-config"

const {
  countryCode,
  currencyCode,
  manualQrPaymentProviderId,
  regionName,
  salesChannelName,
  stockLocationName,
  storeName,
  systemPaymentProviderId,
  taxProviderId,
} = PHILIPPINE_STORE_CONFIG

type RegionRecord = {
  id: string
  name: string
  currency_code: string
  countries?: { iso_2: string }[]
  payment_providers?: { id: string }[]
}

type StoreCurrencyRecord = {
  currency_code: string
  is_default: boolean
  is_tax_inclusive?: boolean
}

type StoreRecord = {
  id: string
  name: string
  supported_currencies?: StoreCurrencyRecord[]
}

type NamedRecord = {
  id: string
  name: string
}

type StockLocationRecord = NamedRecord & {
  address?: {
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    phone?: string
  }
}

export default async function configurePhilippinesRegion({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regionData } = await query.graph({
    entity: "region",
    fields: [
      "id",
      "name",
      "currency_code",
      "countries.iso_2",
      "payment_providers.id",
    ],
  })

  const existingRegion = (regionData as RegionRecord[]).find(
    (region) =>
      region.name === regionName ||
      region.countries?.some((country) => country.iso_2 === countryCode)
  )

  let regionId: string

  if (existingRegion) {
    const paymentProviders = mergeProviderIds(
      existingRegion.payment_providers?.map((provider) => provider.id) ?? [],
      [systemPaymentProviderId, manualQrPaymentProviderId]
    )

    const { result } = await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: existingRegion.id },
        update: {
          name: regionName,
          currency_code: currencyCode,
          countries: [countryCode],
          payment_providers: paymentProviders,
        },
      },
    })

    regionId = result[0].id
    logger.info("Updated the existing Philippines/PHP region")
  } else {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: regionName,
            currency_code: currencyCode,
            countries: [countryCode],
            payment_providers: [
              systemPaymentProviderId,
              manualQrPaymentProviderId,
            ],
          },
        ],
      },
    })

    regionId = result[0].id
    logger.info("Created the Philippines/PHP region")
  }

  const { data: taxRegionData } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
    filters: {
      country_code: countryCode,
    },
  })

  if (!taxRegionData.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: countryCode,
          provider_id: taxProviderId,
        },
      ],
    })
    logger.info("Created the Philippines tax region")
  }

  const { data: storeData } = await query.graph({
    entity: "store",
    fields: [
      "id",
      "name",
      "supported_currencies.currency_code",
      "supported_currencies.is_default",
      "supported_currencies.is_tax_inclusive",
    ],
  })

  const stores = storeData as StoreRecord[]

  const { data: salesChannelData } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const salesChannel = selectPreferredRecord(
    salesChannelData as NamedRecord[],
    salesChannelName,
    ["Default Sales Channel"]
  )

  if (salesChannel && salesChannel.name !== salesChannelName) {
    await updateSalesChannelsWorkflow(container).run({
      input: {
        selector: { id: salesChannel.id },
        update: {
          name: salesChannelName,
          description: "Primary customer storefront sales channel",
        },
      },
    })
  }

  for (const store of stores) {
    const currencies = new Map(
      (store.supported_currencies ?? []).map((currency) => [
        currency.currency_code,
        currency,
      ])
    )

    currencies.set(currencyCode, {
      ...currencies.get(currencyCode),
      currency_code: currencyCode,
      is_default: true,
    })

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          name: storeName,
          default_region_id: regionId,
          default_sales_channel_id: salesChannel?.id,
          supported_currencies: [...currencies.values()].map((currency) => ({
            currency_code: currency.currency_code,
            is_default: currency.currency_code === currencyCode,
            is_tax_inclusive: currency.is_tax_inclusive,
          })),
        },
      },
    })
  }

  const { data: stockLocationData } = await query.graph({
    entity: "stock_location",
    fields: [
      "id",
      "name",
      "address.address_1",
      "address.address_2",
      "address.city",
      "address.province",
      "address.postal_code",
      "address.phone",
    ],
  })
  const stockLocation = selectPreferredRecord(
    stockLocationData as StockLocationRecord[],
    stockLocationName,
    ["European Warehouse"]
  )

  if (stockLocation) {
    await updateStockLocationsWorkflow(container).run({
      input: {
        selector: { id: stockLocation.id },
        update: {
          name: stockLocationName,
          address: {
            address_1: stockLocation.address?.address_1 ?? "",
            address_2: stockLocation.address?.address_2,
            city: stockLocation.address?.city,
            province: stockLocation.address?.province,
            postal_code: stockLocation.address?.postal_code,
            phone: stockLocation.address?.phone,
            country_code: countryCode,
          },
        },
      },
    })
  }

  logger.info(
    `Configured ${storeName}, PHP, the Philippines region, ${salesChannelName}, ` +
      `${stockLocationName}, and manual QR availability`
  )
}
