import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { retrieveOwnedResearchJournalProjection } from "../../../../../../../modules/research-tracking/queries/journal"
import { setResearchPrivateNoStore } from "../../utils"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const journalEntry = await retrieveOwnedResearchJournalProjection({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    journalEntryId: req.params.id,
  })

  res.json({ journal_entry: journalEntry })
}
