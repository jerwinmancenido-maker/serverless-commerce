import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

const backendRoot = path.resolve(__dirname, "../../../..")

function source(relativePath: string): string {
  return readFileSync(path.join(backendRoot, relativePath), "utf8")
}

describe("RT-5 source-only architecture", () => {
  it("registers private routine models without generating a migration", () => {
    const service = source("src/modules/research-tracking/service.ts")
    const migrations = readdirSync(
      path.join(backendRoot, "src/modules/research-tracking/migrations"),
    ).filter((name) => name.startsWith("Migration"))

    expect(service).toContain("ResearchRoutine")
    expect(service).toContain("ResearchSupplyAdjustment")
    expect(migrations).toEqual([
      "Migration20260825121847.ts",
      "Migration20260825143052.ts",
      "Migration20260826033548.ts",
      "Migration20260826142203.ts",
    ])
  })

  it("keeps mutations behind workflows and PostgreSQL locks", () => {
    const routineWorkflow = source("src/workflows/manage-research-routine.ts")
    const logWorkflow = source("src/workflows/confirm-research-routine-log.ts")

    expect(routineWorkflow).toContain("acquireLockStep")
    expect(routineWorkflow).toContain("manageResearchRoutineStep")
    expect(logWorkflow).toContain("research-supply-ledger")
    expect(logWorkflow).toContain("research-log-occurrence")
  })

  it("uses authenticated customer routes with private cache handling", () => {
    const routineRoute = source(
      "src/api/store/customers/me/research-tracking/routines/route.ts",
    )
    const logRoute = source(
      "src/api/store/customers/me/research-tracking/logs/route.ts",
    )

    expect(routineRoute).toContain("AuthenticatedMedusaRequest")
    expect(routineRoute).toContain("setResearchPrivateNoStore")
    expect(logRoute).toContain("confirmResearchRoutineLogWorkflow")
    expect(logRoute).not.toContain("createResearchRoutineLogs")
  })

  it("uses conditional supply writes and preview-first log lifecycle routes", () => {
    const service = source("src/modules/research-tracking/service.ts")
    const mutationStep = source(
      "src/workflows/steps/mutate-research-routine-log.ts",
    )
    const middleware = source(
      "src/api/store/customers/me/research-tracking/middlewares.ts",
    )

    expect(service).toContain("expected_remaining_quantity_base_units")
    expect(service).toContain("updateSupplyIfUnchanged")
    expect(service).toContain("selector:")
    expect(service).toContain("data:")
    expect(service).toContain("expectedLogRevisionId")
    expect(service).toContain("research_routine_log_changed")
    expect(service).toContain("beginRoutineMutation")
    expect(service).toContain("failRoutineMutation")
    expect(mutationStep).toContain(
      "assertResearchRoutineLogMutationPreviewToken",
    )
    expect(middleware).toContain("logs/:id/preview")
  })

  it("preserves the existing routine timezone during ordinary edits", () => {
    const routineStep = source(
      "src/workflows/steps/manage-research-routine.ts",
    )

    expect(routineStep).toContain(
      "timezone: existingRevision?.timezone ?? profile.timezone",
    )
    expect(routineStep).toContain(
      "timezone: previous.timezone",
    )
  })
})
