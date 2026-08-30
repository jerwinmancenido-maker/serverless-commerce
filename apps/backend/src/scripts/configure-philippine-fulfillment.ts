import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  createShippingOptionsWorkflow,
  updateServiceZonesWorkflow,
  updateShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows"

import {
  PHILIPPINE_STORE_CONFIG,
  resolveJntShippingConfiguration,
  selectPreferredRecord,
} from "../lib/philippine-store-config"

const {
  countryCode,
  currencyCode,
  fulfillmentProviderId,
  fulfillmentSetName,
  regionName,
  serviceZoneName,
  shippingOptionCode,
  shippingOptionName,
} = PHILIPPINE_STORE_CONFIG

type FulfillmentSetRecord = {
  id: string
  name: string
  service_zones?: {
    id: string
    name: string
  }[]
}

type ShippingOptionRecord = {
  id: string
  name: string
  service_zone_id: string
  shipping_profile_id: string
  type?: {
    id: string
    code: string
  }
}

function disabledRules() {
  return [
    {
      attribute: "enabled_in_store",
      value: "false",
      operator: "eq" as const,
    },
  ]
}

export default async function configurePhilippineFulfillment({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const shippingConfiguration = resolveJntShippingConfiguration(
    process.env.JNT_DEFAULT_SHIPPING_AMOUNT
  )

  const { data: fulfillmentSetData } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "service_zones.id", "service_zones.name"],
  })
  const fulfillmentSet = selectPreferredRecord(
    fulfillmentSetData as FulfillmentSetRecord[],
    fulfillmentSetName,
    ["European Warehouse delivery"]
  )

  if (!fulfillmentSet) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No fulfillment set is linked to the Philippine Warehouse. Configure the stock location first."
    )
  }

  if (fulfillmentSet.name !== fulfillmentSetName) {
    await fulfillmentModuleService.updateFulfillmentSets({
      id: fulfillmentSet.id,
      name: fulfillmentSetName,
    })
  }

  const serviceZone = selectPreferredRecord(
    fulfillmentSet.service_zones ?? [],
    serviceZoneName,
    ["Europe"]
  )

  if (!serviceZone) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No service zone is available for the Philippine Warehouse fulfillment set."
    )
  }

  await updateServiceZonesWorkflow(container).run({
    input: {
      selector: { id: serviceZone.id },
      update: {
        name: serviceZoneName,
        geo_zones: [
          {
            country_code: countryCode,
            type: "country",
          },
        ],
      },
    },
  })

  const { data: regionData } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })
  const region = (regionData as { id: string; name: string }[]).find(
    (candidate) => candidate.name === regionName
  )

  if (!region) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "The Philippines region is missing. Run store:philippines before shipping:jnt."
    )
  }

  const { data: shippingProfileData } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })
  const shippingProfile = shippingProfileData[0] as
    | { id: string; name: string }
    | undefined

  if (!shippingProfile) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No Medusa shipping profile is available"
    )
  }

  const { data: shippingOptionData } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "service_zone_id",
      "shipping_profile_id",
      "type.id",
      "type.code",
    ],
  })
  const shippingOptions = shippingOptionData as ShippingOptionRecord[]
  const jntOption = selectPreferredRecord(
    shippingOptions.filter(
      (option) => option.service_zone_id === serviceZone.id
    ),
    shippingOptionName,
    ["Standard Shipping"]
  )

  const rules = [
    {
      attribute: "enabled_in_store",
      value: String(shippingConfiguration.enabledInStore),
      operator: "eq" as const,
    },
    {
      attribute: "is_return",
      value: "false",
      operator: "eq" as const,
    },
  ]

  if (jntOption) {
    await updateShippingOptionsWorkflow(container).run({
      input: [
        {
          id: jntOption.id,
          name: shippingOptionName,
          price_type: "flat",
          provider_id: fulfillmentProviderId,
          shipping_profile_id: jntOption.shipping_profile_id,
          type: {
            label: shippingOptionName,
            description: "Merchant-configured J&T Express delivery",
            code: shippingOptionCode,
          },
          prices: [
            {
              currency_code: currencyCode,
              amount: shippingConfiguration.amount,
            },
            {
              region_id: region.id,
              amount: shippingConfiguration.amount,
            },
          ],
          rules,
        },
      ],
    })

    if (jntOption.type && jntOption.type.code !== shippingOptionCode) {
      await fulfillmentModuleService.updateShippingOptionTypes(
        jntOption.type.id,
        {
          label: shippingOptionName,
          description: "Merchant-configured J&T Express delivery",
          code: shippingOptionCode,
        }
      )
    }
  } else {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: shippingOptionName,
          price_type: "flat",
          provider_id: fulfillmentProviderId,
          service_zone_id: serviceZone.id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: shippingOptionName,
            description: "Merchant-configured J&T Express delivery",
            code: shippingOptionCode,
          },
          prices: [
            {
              currency_code: currencyCode,
              amount: shippingConfiguration.amount,
            },
            {
              region_id: region.id,
              amount: shippingConfiguration.amount,
            },
          ],
          rules,
        },
      ],
    })
  }

  const obsoleteOptions = shippingOptions.filter(
    (option) =>
      option.service_zone_id === serviceZone.id && option.id !== jntOption?.id
  )

  if (obsoleteOptions.length) {
    await updateShippingOptionsWorkflow(container).run({
      input: obsoleteOptions.map((option) => ({
        id: option.id,
        rules: disabledRules(),
      })),
    })
  }

  logger.info(
    `${shippingOptionName} is configured for ${serviceZoneName} at ` +
      `${shippingConfiguration.amount} ${currencyCode.toUpperCase()} and is ` +
      `${shippingConfiguration.enabledInStore ? "enabled" : "disabled"}.`
  )

  if (!shippingConfiguration.enabledInStore) {
    logger.info(
      "Set JNT_DEFAULT_SHIPPING_AMOUNT and rerun shipping:jnt to enable checkout availability."
    )
  }
}
