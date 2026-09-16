/**
 * @file    apps/backend/src/workflows/subscribe-newsletter.ts
 * @module  SubscribeNewsletterWorkflow
 * @purpose Workflow subscribing researcher leads to newsletter and persisting customer records in PostgreSQL.
 * @contracts
 *   Workflow: subscribeNewsletterWorkflow
 *   Service:  ICustomerModuleService (customer)
 */

import type { ICustomerModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

export type SubscribeNewsletterInput = {
  email: string
  source?: string
  discountCode?: string
}

export const subscribeNewsletterStep = createStep(
  "subscribe-newsletter",
  async (input: SubscribeNewsletterInput, { container }) => {
    const customerService = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const normalizedEmail = input.email.trim().toLowerCase()
    const leadSource = input.source?.trim() || "footer_lead_widget"
    const discountCode = input.discountCode || "RESEARCH10"

    const existing = await customerService.listCustomers(
      { email: normalizedEmail },
      { select: ["id", "email", "metadata"] }
    )

    let customerId: string

    if (existing && existing.length > 0) {
      const customer = existing[0]
      customerId = customer.id
      const currentMetadata = (customer.metadata as Record<string, unknown> | null) || {}
      await customerService.updateCustomers(customer.id, {
        metadata: {
          ...currentMetadata,
          newsletter_subscribed: true,
          newsletter_source: leadSource,
          newsletter_subscribed_at: currentMetadata.newsletter_subscribed_at || new Date().toISOString(),
          newsletter_discount_code: discountCode,
        },
      })
    } else {
      try {
        const created = await customerService.createCustomers({
          email: normalizedEmail,
          metadata: {
            newsletter_subscribed: true,
            newsletter_source: leadSource,
            newsletter_subscribed_at: new Date().toISOString(),
            newsletter_discount_code: discountCode,
          },
        })
        customerId = created.id
      } catch {
        const retryExisting = await customerService.listCustomers(
          { email: normalizedEmail },
          { select: ["id", "email", "metadata"] }
        )
        if (retryExisting && retryExisting.length > 0) {
          const customer = retryExisting[0]
          customerId = customer.id
          const currentMetadata = (customer.metadata as Record<string, unknown> | null) || {}
          await customerService.updateCustomers(customer.id, {
            metadata: {
              ...currentMetadata,
              newsletter_subscribed: true,
              newsletter_source: leadSource,
              newsletter_subscribed_at: currentMetadata.newsletter_subscribed_at || new Date().toISOString(),
              newsletter_discount_code: discountCode,
            },
          })
        } else {
          throw new MedusaError(
            MedusaError.Types.DB_ERROR,
            "Unable to create or update newsletter subscriber"
          )
        }
      }
    }

    return new StepResponse(
      { success: true, customerId, discountCode },
      { customerId, previousState: existing[0] || null }
    )
  }
)

export const subscribeNewsletterWorkflow = createWorkflow(
  "subscribe-newsletter",
  function (input: SubscribeNewsletterInput) {
    const result = subscribeNewsletterStep(input)
    return new WorkflowResponse(result)
  }
)
