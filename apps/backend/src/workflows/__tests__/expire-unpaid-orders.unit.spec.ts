import {
  expireUnpaidOrderWorkflow,
  validateUnpaidOrderEligibilityStep,
  cancelOrderAndReleaseBOMStep,
  finalizeUnpaidOrderCancellationStep,
} from "../expire-unpaid-orders"

describe("expireUnpaidOrderWorkflow", () => {
  it("composes a runnable Medusa workflow with expected execution steps", () => {
    expect(expireUnpaidOrderWorkflow.run).toEqual(expect.any(Function))
    expect(expireUnpaidOrderWorkflow.runAsStep).toEqual(expect.any(Function))
    expect(expireUnpaidOrderWorkflow.getName()).toBe("expire-unpaid-order")
  })

  it("exports individual workflow steps with valid identifiers", () => {
    expect(validateUnpaidOrderEligibilityStep).toBeDefined()
    expect(cancelOrderAndReleaseBOMStep).toBeDefined()
    expect(finalizeUnpaidOrderCancellationStep).toBeDefined()
  })
})
