import { createHash } from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CUSTOMER_SUPPORT_MODULE } from "../../modules/customer-support"
import { resolveSupportConfiguration } from "../../modules/customer-support/configuration"
import type CustomerSupportModuleService from "../../modules/customer-support/service"

export const SUPPORT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024
export const SUPPORT_ATTACHMENT_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const
export type UploadSupportAttachmentInput = {
  actorType: "customer" | "staff"
  actorId: string
  conversationId: string
  messageId: string
  file: { fileName: string; mimeType: string; contentBase64: string }
}

const extensionForMime: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
}

export const hasExpectedSupportAttachmentSignature = (bytes: Buffer, mimeType: string) => {
  if (mimeType === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  if (mimeType === "application/pdf") {
    return bytes.subarray(0, 5).toString("ascii") === "%PDF-"
  }
  return false
}

export const prepareSupportAttachmentStep = createStep(
  "prepare-support-attachment",
  async (input: UploadSupportAttachmentInput, { container }) => {
    const service = container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
    const [conversation] = await service.listSupportConversations(
      input.actorType === "customer"
        ? { id: input.conversationId, customer_id: input.actorId }
        : { id: input.conversationId },
      { take: 1 },
    )
    const [message] = conversation
      ? await service.listSupportMessages(
          {
            id: input.messageId,
            conversation_id: conversation.id,
            sender_type: input.actorType,
            sender_id: input.actorId,
          },
          { take: 1 },
        )
      : []
    if (!conversation || !message) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Support message was not found")
    }

    const { settings } = await resolveSupportConfiguration(container)
    if (!settings.attachment_uploads_enabled) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Support attachments are disabled")
    }
    const bytes = Buffer.from(input.file.contentBase64, "base64")
    const fileName = input.file.fileName.trim().replaceAll("\\", "/").split("/").pop() || ""
    const lowerName = fileName.toLowerCase()
    const allowedMimeTypes = settings.allowed_mime_types as string[]
    if (!fileName || fileName.length > 255 || /[\u0000-\u001f\u007f]/.test(fileName)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Attachment file name is invalid")
    }
    if (!allowedMimeTypes.includes(input.file.mimeType)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only PNG, JPEG, and PDF attachments are supported")
    }
    if (!extensionForMime[input.file.mimeType]?.some((extension) => lowerName.endsWith(extension))) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Attachment extension does not match its file type")
    }
    if (!bytes.length || bytes.length > settings.maximum_attachment_size_bytes) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Attachment exceeds the configured size limit")
    }
    if (!hasExpectedSupportAttachmentSignature(bytes, input.file.mimeType)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Attachment content does not match its declared file type")
    }

    return new StepResponse({
      conversationId: conversation.id,
      messageId: message.id,
      fileName,
      mimeType: input.file.mimeType,
      sizeBytes: bytes.length,
      checksumSha256: createHash("sha256").update(bytes).digest("hex"),
      upload: {
        filename: fileName,
        mimeType: input.file.mimeType,
        content: input.file.contentBase64,
        access: "private" as const,
      },
    })
  },
)
export const createSupportAttachmentStep = createStep("create-support-attachment", async (input: { prepared: { conversationId: string; messageId: string; fileName: string; mimeType: string; sizeBytes: number; checksumSha256: string }; fileId: string }, { container }) => { const attachment = await container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE).createSupportAttachments({ conversation_id: input.prepared.conversationId, message_id: input.prepared.messageId, file_id: input.fileId, file_name: input.prepared.fileName, mime_type: input.prepared.mimeType, size_bytes: input.prepared.sizeBytes, checksum_sha256: input.prepared.checksumSha256, scan_status: "unavailable", status: "active", uploaded_at: new Date(), removed_at: null }); return new StepResponse(attachment, attachment.id) }, async (id, { container }) => { if (id) await container.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE).deleteSupportAttachments(id) })

export function supportAttachmentDownloadAllowed(scanStatus: string) {
  if (scanStatus === "clean") return true
  if (scanStatus !== "unavailable") return false
  return process.env.NODE_ENV !== "production" || process.env.SUPPORT_ALLOW_UNSCANNED_ATTACHMENTS === "true"
}
