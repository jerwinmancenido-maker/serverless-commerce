import {
  cancelResearchProfileDeletionWorkflow,
  closeResearchProfileWorkflow,
  createResearchProfileWorkflow,
  recordResearchConsentWorkflow,
  requestResearchProfileDeletionWorkflow,
  updateResearchProfilePreferencesWorkflow,
} from "../../../workflows/research-tracking-ownership"
import { acceptResearchAgreementWorkflow } from "../../../workflows/manage-research-agreement"
import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("research tracking ownership workflows", () => {
  it.each([
    createResearchProfileWorkflow,
    updateResearchProfilePreferencesWorkflow,
    recordResearchConsentWorkflow,
    closeResearchProfileWorkflow,
    requestResearchProfileDeletionWorkflow,
    cancelResearchProfileDeletionWorkflow,
    acceptResearchAgreementWorkflow,
  ])("composes a runnable Medusa workflow", (workflow) => {
    expect(workflow.run).toEqual(expect.any(Function))
    expect(workflow.runAsStep).toEqual(expect.any(Function))
  })

  it("grants preserved order protocols when signup activates the Research Hub", () => {
    const source = readFileSync(
      join(__dirname, "../../../workflows/manage-research-agreement.ts"),
      "utf8",
    )

    expect(source).toContain("grantResearchProtocolProfileAccessesStep")
    expect(source).toContain("profileId: prepared.profile_id")
    expect(source).toContain("acceptance.research_hub_version_snapshot")
    expect(source).toContain("listResearchJournalConsentEvents")
    expect(source).toContain("listResearchMeasurementConsentEvents")
    expect(source).toContain("acceptance,")
  })
})
