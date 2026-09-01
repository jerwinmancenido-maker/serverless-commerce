import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../../../modules/research-tracking/service"
import { uploadResearchJournalAttachmentWorkflow } from "../../../../../../../../workflows/manage-research-journal-attachment"
import { setResearchPrivateNoStore } from "../../../utils"

type UploadedRequest = AuthenticatedMedusaRequest & {
  file?: {
    originalname: string
    mimetype: string
    buffer: Buffer
  }
}

function serializeAttachment(attachment: Record<string, unknown>) {
  return {
    id: attachment.id,
    journal_entry_id: attachment.journal_entry_id,
    journal_revision_id: attachment.journal_revision_id,
    file_name: attachment.file_name,
    mime_type: attachment.mime_type,
    size_bytes: attachment.size_bytes,
    scan_status: attachment.scan_status,
    uploaded_at: attachment.uploaded_at,
  }
}

async function getOwnedProfile(
  req: AuthenticatedMedusaRequest,
  service: ResearchTrackingModuleService,
) {
  const [profile] = await service.listResearchProfiles(
    { customer_id: req.auth_context.actor_id, status: "active" },
    { take: 1 },
  )
  if (!profile) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "research_profile_action_required",
    )
  }
  return profile
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const profile = await getOwnedProfile(req, service)
  const [entry] = await service.listResearchJournalEntries(
    { id: req.params.id, profile_id: profile.id },
    { take: 1 },
  )
  if (!entry) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "journal_entry_not_found")
  }
  const attachments = await service.listResearchJournalAttachments(
    {
      profile_id: profile.id,
      journal_entry_id: entry.id,
      status: "active",
    },
    { order: { uploaded_at: "DESC" } },
  )
  res.json({ attachments: attachments.map((item) => serializeAttachment(item)) })
}

export async function POST(req: UploadedRequest, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  if (!req.file) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "attachment_file_required",
    )
  }
  const { result } = await uploadResearchJournalAttachmentWorkflow(
    req.scope,
  ).run({
    input: {
      customerId: req.auth_context.actor_id,
      journalEntryId: req.params.id,
      file: {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        contentBase64: req.file.buffer.toString("base64"),
      },
    },
  })
  res.status(201).json({ attachment: serializeAttachment(result) })
}
