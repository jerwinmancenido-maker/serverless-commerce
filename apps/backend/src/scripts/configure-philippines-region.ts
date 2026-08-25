import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

const countryCode = "ph"
const currencyCode = "php"
const regionName = "Philippines"
const systemPaymentProviderId = "pp_system_default"
const systemTaxProviderId = "tp_system"

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
  supported_currencies?: StoreCurrencyRecord[]
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
    const paymentProviders = new Set(
      existingRegion.payment_providers?.map((provider) => provider.id) ?? []
    )
    paymentProviders.add(systemPaymentProviderId)

    const { result } = await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: existingRegion.id },
        update: {
          name: regionName,
          currency_code: currencyCode,
          countries: [countryCode],
          payment_providers: [...paymentProviders],
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
            payment_providers: [systemPaymentProviderId],
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
          provider_id: systemTaxProviderId,
        },
      ],
    })
    logger.info("Created the Philippines tax region")
  }

  const { data: storeData } = await query.graph({
    entity: "store",
    fields: [
      "id",
      "supported_currencies.currency_code",
      "supported_currencies.is_default",
      "supported_currencies.is_tax_inclusive",
    ],
  })

  const stores = storeData as StoreRecord[]

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
          default_region_id: regionId,
          supported_currencies: [...currencies.values()].map((currency) => ({
            currency_code: currency.currency_code,
            is_default: currency.currency_code === currencyCode,
            is_tax_inclusive: currency.is_tax_inclusive,
          })),
        },
      },
    })
  }

  logger.info("Set PHP and the Philippines region as the store defaults")
}
