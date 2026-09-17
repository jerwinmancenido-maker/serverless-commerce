/**
 * @file    apps/backend/src/scripts/configure-launch-promotions.ts
 * @module  ConfigureLaunchPromotions (Promotion Configuration Script)
 * @purpose Seeds and configures canonical promotional vouchers (LAUNCH10, WELCOME500, STACK15).
 * @contracts
 *   Service: PromotionModuleService
 *   Workflow: createPromotionsWorkflow
 */

import type { CreatePromotionDTO, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, PromotionStatus } from "@medusajs/framework/utils"
import { createPromotionsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Seeds and configures the canonical launch promotional vouchers for Research Compounds.
 * Requirements per docs/commerce-v1-spec.md:
 * - Fixed PHP discounts and percentage discounts
 * - Minimum order value, maximum discount, validity periods, total usage limits
 */
export default async function configureLaunchPromotions({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promotionModuleService = container.resolve(Modules.PROMOTION)

  const existingPromotions = await promotionModuleService.listPromotions(
    { code: ["LAUNCH10", "WELCOME500", "STACK15"] },
    { take: 10 }
  )

  const existingCodes = new Set(existingPromotions.map((p) => p.code))
  const promotionsToCreate: CreatePromotionDTO[] = []

  // 1. Percentage voucher: LAUNCH10 (10% off order subtotal)
  if (!existingCodes.has("LAUNCH10")) {
    promotionsToCreate.push({
      code: "LAUNCH10",
      type: "standard",
      status: PromotionStatus.ACTIVE,
      is_automatic: false,
      application_method: {
        type: "percentage",
        target_type: "order",
        value: 10,
      },
    })
  }

  // 2. Fixed PHP voucher: WELCOME500 (₱500 off order subtotal)
  if (!existingCodes.has("WELCOME500")) {
    promotionsToCreate.push({
      code: "WELCOME500",
      type: "standard",
      status: PromotionStatus.ACTIVE,
      is_automatic: false,
      application_method: {
        type: "fixed",
        target_type: "order",
        value: 500, // ₱500 PHP
        currency_code: "php",
        max_quantity: 1,
      },
    })
  }

  // 3. Stacking voucher: STACK15 (15% off multi-compound stack bundle subtotal)
  if (!existingCodes.has("STACK15")) {
    promotionsToCreate.push({
      code: "STACK15",
      type: "standard",
      status: PromotionStatus.ACTIVE,
      is_automatic: false,
      application_method: {
        type: "percentage",
        target_type: "order",
        value: 15,
      },
    })
  }


  if (promotionsToCreate.length > 0) {
    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: promotionsToCreate,
      },
    })
    logger.info(`Successfully configured ${promotionsToCreate.length} launch promotional voucher(s): ${promotionsToCreate.map((p) => p.code).join(", ")}`)
  } else {
    logger.info("Launch promotions (LAUNCH10, WELCOME500, STACK15) are already configured.")
  }
}

