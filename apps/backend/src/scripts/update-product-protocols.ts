import type { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import seedAllCompoundProtocols from "./seed-all-compound-protocols"

export default async function updateProductProtocols({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info("Starting Product Protocols rebranding and dossier backfill...")
  await seedAllCompoundProtocols({ container })
  logger.info("Product Protocols rebranding and dossier backfill completed successfully.")
}
