import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  startProtocolDerivedRoutineStep,
  type StartProtocolDerivedRoutineInput,
} from "./steps/start-protocol-derived-routine"

export const startProtocolDerivedRoutineWorkflow = createWorkflow(
  "start-protocol-derived-routine",
  (input: StartProtocolDerivedRoutineInput) => {
    return new WorkflowResponse(startProtocolDerivedRoutineStep(input))
  },
)
