import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IFileModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../../../modules/research-tracking/service"
import { setResearchPrivateNoStore } from "../../../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const service = req.scope.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [profile] = await service.listResearchProfiles(
    { customer_id: req.auth_context.actor_id, status: "active" },
    { take: 1 },
  )
  const [attachment] = profile
    ? await service.listResearchJournalAttachments(
        { id: req.params.id, profile_id: profile.id, status: "active" },
        { take: 1 },
      )
    : []
  if (!attachment || attachment.scan_status === "quarantined") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "attachment_not_found")
  }
  const fileService = req.scope.resolve<IFileModuleService>(Modules.FILE)
  const file = await fileService.retrieveFile(attachment.file_id)
  res.json({ url: file.url })
}
