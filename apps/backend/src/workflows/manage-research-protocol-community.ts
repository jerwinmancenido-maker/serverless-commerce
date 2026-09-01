import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  createProtocolReplyStep,
  createProtocolThreadStep,
  editProtocolCommentStep,
  moderateProtocolCommunityStep,
  resolveProtocolReportStep,
  reactProtocolCommentStep,
  removeProtocolCommentStep,
  removeProtocolReactionStep,
  reportProtocolContentStep,
  updateCommunityIdentityStep,
  updateCommunityIdentityStatusStep,
  updateProtocolSubscriptionStep,
  type CreateProtocolReplyWorkflowInput,
  type CreateProtocolThreadWorkflowInput,
  type EditProtocolCommentWorkflowInput,
  type ModerateProtocolCommunityWorkflowInput,
  type ResolveProtocolReportWorkflowInput,
  type ReactProtocolCommentWorkflowInput,
  type RemoveProtocolCommentWorkflowInput,
  type RemoveProtocolReactionWorkflowInput,
  type ReportProtocolContentWorkflowInput,
  type UpdateCommunityIdentityWorkflowInput,
  type UpdateCommunityIdentityStatusWorkflowInput,
  type UpdateProtocolSubscriptionWorkflowInput,
} from "./steps/manage-research-protocol-community"

export const updateCommunityIdentityWorkflow = createWorkflow(
  "update-community-identity",
  (input: UpdateCommunityIdentityWorkflowInput) =>
    new WorkflowResponse(updateCommunityIdentityStep(input)),
)

export const createProtocolThreadWorkflow = createWorkflow(
  "create-protocol-thread",
  (input: CreateProtocolThreadWorkflowInput) =>
    new WorkflowResponse(createProtocolThreadStep(input)),
)

export const createProtocolReplyWorkflow = createWorkflow(
  "create-protocol-reply",
  (input: CreateProtocolReplyWorkflowInput) =>
    new WorkflowResponse(createProtocolReplyStep(input)),
)

export const editProtocolCommentWorkflow = createWorkflow(
  "edit-protocol-comment",
  (input: EditProtocolCommentWorkflowInput) =>
    new WorkflowResponse(editProtocolCommentStep(input)),
)

export const removeProtocolCommentWorkflow = createWorkflow(
  "remove-protocol-comment",
  (input: RemoveProtocolCommentWorkflowInput) =>
    new WorkflowResponse(removeProtocolCommentStep(input)),
)

export const reactProtocolCommentWorkflow = createWorkflow(
  "react-protocol-comment",
  (input: ReactProtocolCommentWorkflowInput) =>
    new WorkflowResponse(reactProtocolCommentStep(input)),
)

export const removeProtocolReactionWorkflow = createWorkflow(
  "remove-protocol-reaction",
  (input: RemoveProtocolReactionWorkflowInput) =>
    new WorkflowResponse(removeProtocolReactionStep(input)),
)

export const reportProtocolContentWorkflow = createWorkflow(
  "report-protocol-content",
  (input: ReportProtocolContentWorkflowInput) =>
    new WorkflowResponse(reportProtocolContentStep(input)),
)

export const updateProtocolSubscriptionWorkflow = createWorkflow(
  "update-protocol-subscription",
  (input: UpdateProtocolSubscriptionWorkflowInput) =>
    new WorkflowResponse(updateProtocolSubscriptionStep(input)),
)

export const moderateProtocolCommunityWorkflow = createWorkflow(
  "moderate-protocol-community",
  (input: ModerateProtocolCommunityWorkflowInput) =>
    new WorkflowResponse(moderateProtocolCommunityStep(input)),
)

export const resolveProtocolReportWorkflow = createWorkflow(
  "resolve-protocol-report",
  (input: ResolveProtocolReportWorkflowInput) =>
    new WorkflowResponse(resolveProtocolReportStep(input)),
)

export const updateCommunityIdentityStatusWorkflow = createWorkflow(
  "update-community-identity-status",
  (input: UpdateCommunityIdentityStatusWorkflowInput) =>
    new WorkflowResponse(updateCommunityIdentityStatusStep(input)),
)
