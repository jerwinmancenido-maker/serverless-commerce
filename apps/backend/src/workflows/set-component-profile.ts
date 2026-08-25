import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import type { SetComponentProfileInput } from "../modules/bom/contracts/component-profile"
import {
  setComponentProfileStep,
  validateComponentProfileInputStep,
} from "./steps/set-component-profile"

export const setComponentProfileWorkflow = createWorkflow(
  "set-component-profile",
  function (input: SetComponentProfileInput) {
    const validatedInput = validateComponentProfileInputStep(input)
    const profile = setComponentProfileStep(validatedInput)

    return new WorkflowResponse(profile)
  },
)

export default setComponentProfileWorkflow
