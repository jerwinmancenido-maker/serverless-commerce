import { createHash } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../modules/research-tracking/service"

export const JOURNAL_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024
export const JOURNAL_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const

export type UploadJournalAttachmentInput = {
  customerId: string
  journalEntryId: string
  file: { fileName: string; mimeType: string; contentBase64: string }
}

export const prepareJournalAttachmentStep = createStep(
  "prepare-journal-attachment",
  async (input: UploadJournalAttachmentInput, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const [profile] = await service.listResearchProfiles({ customer_id: input.customerId, status: "active" }, { take: 1 })
    if (!profile) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "research_profile_action_required")
    const [entry] = await service.listResearchJournalEntries({ id: input.journalEntryId, profile_id: profile.id, status: "active" }, { take: 1 })
    if (!entry) throw new MedusaError(MedusaError.Types.NOT_FOUND, "journal_entry_not_found")
    const bytes = Buffer.from(input.file.contentBase64, "base64")
    if (!input.file.fileName.trim() || input.file.fileName.length > 255) throw new MedusaError(MedusaError.Types.INVALID_DATA, "attachment_file_name_invalid")
    if (!JOURNAL_ATTACHMENT_MIME_TYPES.includes(input.file.mimeType as typeof JOURNAL_ATTACHMENT_MIME_TYPES[number])) throw new MedusaError(MedusaError.Types.INVALID_DATA, "attachment_type_invalid")
    if (!bytes.length || bytes.length > JOURNAL_ATTACHMENT_MAX_BYTES) throw new MedusaError(MedusaError.Types.INVALID_DATA, "attachment_size_invalid")
    return new StepResponse({
      profileId: profile.id,
      journalEntryId: entry.id,
      journalRevisionId: entry.current_revision_id,
      fileName: input.file.fileName.trim(),
      mimeType: input.file.mimeType,
      sizeBytes: bytes.length,
      checksumSha256: createHash("sha256").update(bytes).digest("hex"),
      upload: { filename: input.file.fileName.trim(), mimeType: input.file.mimeType, content: input.file.contentBase64, access: "private" as const },
    })
  },
)

export const createJournalAttachmentStep = createStep(
  "create-journal-attachment",
  async (input: { prepared: { profileId: string; journalEntryId: string; journalRevisionId: string | null; fileName: string; mimeType: string; sizeBytes: number; checksumSha256: string }; fileId: string }, { container }) => {
    const attachment = await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).createResearchJournalAttachments({
      profile_id: input.prepared.profileId,
      journal_entry_id: input.prepared.journalEntryId,
      journal_revision_id: input.prepared.journalRevisionId,
      file_id: input.fileId,
      file_name: input.prepared.fileName,
      mime_type: input.prepared.mimeType,
      size_bytes: input.prepared.sizeBytes,
      checksum_sha256: input.prepared.checksumSha256,
      scan_status: "unavailable",
      status: "active",
      uploaded_at: new Date(),
      removed_at: null,
    })
    return new StepResponse(attachment, attachment.id)
  },
  async (id, { container }) => {
    if (id) await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).deleteResearchJournalAttachments(id)
  },
)

export const removeJournalAttachmentStep = createStep(
  "remove-journal-attachment",
  async (input: { customerId: string; attachmentId: string }, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const [profile] = await service.listResearchProfiles({ customer_id: input.customerId }, { take: 1 })
    const [attachment] = profile ? await service.listResearchJournalAttachments({ id: input.attachmentId, profile_id: profile.id, status: "active" }, { take: 1 }) : []
    if (!attachment) throw new MedusaError(MedusaError.Types.NOT_FOUND, "attachment_not_found")
    const prior = { id: attachment.id, status: attachment.status, removed_at: attachment.removed_at }
    const removed = await service.updateResearchJournalAttachments({ id: attachment.id, status: "removed", removed_at: new Date() })
    return new StepResponse(removed, prior)
  },
  async (prior, { container }) => {
    if (prior) await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).updateResearchJournalAttachments(prior)
  },
)
