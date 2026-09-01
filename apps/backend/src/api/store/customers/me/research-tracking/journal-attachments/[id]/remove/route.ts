import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { removeResearchJournalAttachmentWorkflow } from "../../../../../../../../workflows/manage-research-journal-attachment"
import { setResearchPrivateNoStore } from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const { result } = await removeResearchJournalAttachmentWorkflow(
    req.scope,
  ).run({
    input: {
      customerId: req.auth_context.actor_id,
      attachmentId: req.params.id,
    },
  })
  res.json({ attachment: result })
}
