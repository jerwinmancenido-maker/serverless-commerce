import { uploadFilesStep } from "@medusajs/medusa/core-flows"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createSupportAttachmentStep, prepareSupportAttachmentStep, type UploadSupportAttachmentInput } from "./steps/manage-support-attachment"
export const uploadSupportAttachmentWorkflow = createWorkflow("upload-support-attachment", function (input: UploadSupportAttachmentInput) { const prepared = prepareSupportAttachmentStep(input); const files = uploadFilesStep(transform({ prepared }, ({ prepared }) => ({ files: [prepared.upload] }))); const attachment = createSupportAttachmentStep(transform({ prepared, files }, ({ prepared, files }) => ({ prepared, fileId: files[0].id }))); return new WorkflowResponse(attachment) })
