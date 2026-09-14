/**
 * @file    apps/backend/src/workflows/steps/create-compounded-product-governance-audit-events.ts
 * @module  CompoundedProductModule (Workflows)
 * @purpose Persist immutable governance audit events for compounded product catalog changes.
 * @contracts
 *   Step: createCompoundedProductGovernanceAuditEventsStep
 */

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { COMPOUNDED_PRODUCT_MODULE } from "../../modules/compounded-product"
import {
  CompoundedProductGovernanceAuditEventInput,
  type CompoundedProductGovernanceAuditEventInput as GovernanceAuditEventInput,
} from "../../modules/compounded-product/contracts/audit"
import type CompoundedProductModuleService from "../../modules/compounded-product/service"

export const createCompoundedProductGovernanceAuditEventsStep = createStep(
  "create-compounded-product-governance-audit-events",
  async (rawInput: GovernanceAuditEventInput[], { container }) => {
    const input = rawInput.map((event) =>
      CompoundedProductGovernanceAuditEventInput.parse(event),
    )

    if (!input.length) {
      return new StepResponse([])
    }
    const service = container.resolve<CompoundedProductModuleService>(
      COMPOUNDED_PRODUCT_MODULE,
    )
    const events = await service.createGovernanceAuditEvents(input)

    return new StepResponse(events, events)
  },
  async (compensationEvents) => {
    // Governance audit events are immutable audit records under compounding compliance and cannot be deleted.
    if (!compensationEvents?.length) return
  },
)
