import { uploadFilesStep } from "@medusajs/medusa/core-flows"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import {
  createJournalAttachmentStep,
  prepareJournalAttachmentStep,
  removeJournalAttachmentStep,
  type UploadJournalAttachmentInput,
} from "./steps/manage-research-journal-attachment"

export const uploadResearchJournalAttachmentWorkflow = createWorkflow(
  "upload-research-journal-attachment",
  function (input: UploadJournalAttachmentInput) {
    const prepared = prepareJournalAttachmentStep(input)
    const files = uploadFilesStep(transform({ prepared }, ({ prepared }) => ({ files: [prepared.upload] })))
    const attachment = createJournalAttachmentStep(transform({ prepared, files }, ({ prepared, files }) => ({ prepared, fileId: files[0].id })))
    return new WorkflowResponse(attachment)
  },
)

export const removeResearchJournalAttachmentWorkflow = createWorkflow(
  "remove-research-journal-attachment",
  (input: { customerId: string; attachmentId: string }) => new WorkflowResponse(removeJournalAttachmentStep(input)),
)
