import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { setLayoutConfigurationWorkflow } from "@medusajs/medusa/core-flows"

import { INVENTORY_ITEM_DETAIL_LAYOUT_CONFIGURATION } from "../lib/admin-layouts/inventory-item-detail"

type AdminUser = {
  id: string
  email: string
}

export default async function configureInventoryItemDetailLayout({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const requestedEmail =
    process.env.INVENTORY_LAYOUT_ADMIN_EMAIL || process.env.MEDUSA_ADMIN_EMAIL

  const { data } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: requestedEmail ? { email: requestedEmail } : undefined,
  })
  const [adminUser] = data as AdminUser[]

  if (!adminUser) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      requestedEmail
        ? `No Medusa Admin user exists for ${requestedEmail}.`
        : "No Medusa Admin user exists. Create an Admin user before configuring the Inventory layout.",
    )
  }

  await setLayoutConfigurationWorkflow(container).run({
    input: {
      zone: "inventory_item.details",
      user_id: adminUser.id,
      is_default: true,
      configuration: INVENTORY_ITEM_DETAIL_LAYOUT_CONFIGURATION,
    },
  })

  logger.info(
    `Configured Inventory detail layout default and selected it for ${adminUser.email}.`,
  )
}
