import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  createResearchProtocolCommentStep,
  moderateResearchProtocolCommentStep,
  type CreateResearchProtocolCommentInput,
  type ModerateResearchProtocolCommentInput,
} from "./steps/manage-research-protocol-comment"

export const createResearchProtocolCommentWorkflow = createWorkflow(
  "create-research-protocol-comment",
  function (input: CreateResearchProtocolCommentInput) {
    const comment = createResearchProtocolCommentStep(input)
    return new WorkflowResponse(comment)
  },
)

export const moderateResearchProtocolCommentWorkflow = createWorkflow(
  "moderate-research-protocol-comment",
  function (input: ModerateResearchProtocolCommentInput) {
    const comment = moderateResearchProtocolCommentStep(input)
    return new WorkflowResponse(comment)
  },
)
