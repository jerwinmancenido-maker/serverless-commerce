import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { adminManageSupportStep, createCustomerSupportReplyStep, createSupportConversationStep, mutateCustomerSupportStep, type AdminManageSupportInput, type CreateSupportConversationInput, type CustomerSupportReplyInput, type MutateCustomerSupportInput } from "./steps/manage-customer-support"

export const createSupportConversationWorkflow = createWorkflow("create-support-conversation", (input: CreateSupportConversationInput) => new WorkflowResponse(createSupportConversationStep(input)))
export const createCustomerSupportReplyWorkflow = createWorkflow("create-customer-support-reply", (input: CustomerSupportReplyInput) => new WorkflowResponse(createCustomerSupportReplyStep(input)))
export const mutateCustomerSupportWorkflow = createWorkflow("mutate-customer-support", (input: MutateCustomerSupportInput) => new WorkflowResponse(mutateCustomerSupportStep(input)))
export const adminManageSupportWorkflow = createWorkflow("admin-manage-support", (input: AdminManageSupportInput) => new WorkflowResponse(adminManageSupportStep(input)))
