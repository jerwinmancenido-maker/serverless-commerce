import {
  cancelResearchProfileDeletionWorkflow,
  closeResearchProfileWorkflow,
  createResearchProfileWorkflow,
  recordResearchConsentWorkflow,
  requestResearchProfileDeletionWorkflow,
  updateResearchProfilePreferencesWorkflow,
} from "../../../workflows/research-tracking-ownership"

describe("research tracking ownership workflows", () => {
  it.each([
    createResearchProfileWorkflow,
    updateResearchProfilePreferencesWorkflow,
    recordResearchConsentWorkflow,
    closeResearchProfileWorkflow,
    requestResearchProfileDeletionWorkflow,
    cancelResearchProfileDeletionWorkflow,
  ])("composes a runnable Medusa workflow", (workflow) => {
    expect(workflow.run).toEqual(expect.any(Function))
    expect(workflow.runAsStep).toEqual(expect.any(Function))
  })
})
