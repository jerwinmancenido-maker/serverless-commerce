import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type AcquireSettlementLockInput = {
  paymentSessionId: string
}

export const acquireSettlementLockStep = createStep(
  "acquire-settlement-lock",
  async (input: AcquireSettlementLockInput, { container }) => {
    const lockingModule = container.resolve(Modules.LOCKING)
    const lockKey = `manual-payment-settlement:${input.paymentSessionId}`

    await lockingModule.acquire(lockKey, { timeout: 10_000 })

    return new StepResponse({ lockKey }, { lockKey })
  },
  async ({ lockKey }, { container }) => {
    const lockingModule = container.resolve(Modules.LOCKING)
    await lockingModule.release(lockKey).catch(() => {
      // Best-effort release — lock will expire naturally
    })
  },
)
