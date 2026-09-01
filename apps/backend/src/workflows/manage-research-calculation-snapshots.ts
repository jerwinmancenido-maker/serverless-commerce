import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  createCalculationSnapshotStep,
  mutateCalculationSnapshotStep,
  type CreateCalculationSnapshotInput,
  type MutateCalculationSnapshotInput,
} from "./steps/manage-research-calculation-snapshots"

export const createResearchCalculationSnapshotWorkflow = createWorkflow(
  "create-research-calculation-snapshot",
  function (input: CreateCalculationSnapshotInput) {
    return new WorkflowResponse(createCalculationSnapshotStep(input))
  },
)

export const mutateResearchCalculationSnapshotWorkflow = createWorkflow(
  "mutate-research-calculation-snapshot",
  function (input: MutateCalculationSnapshotInput) {
    return new WorkflowResponse(mutateCalculationSnapshotStep(input))
  },
)
