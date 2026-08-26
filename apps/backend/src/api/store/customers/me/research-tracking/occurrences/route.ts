import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { listOwnedResearchOccurrences } from "../../../../../../modules/research-tracking/queries/personal-routines"
import type { StoreListResearchOccurrencesType } from "../validators"
import { setResearchPrivateNoStore } from "../utils"

export async function GET(
  req: AuthenticatedMedusaRequest<StoreListResearchOccurrencesType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const query = req.validatedQuery as StoreListResearchOccurrencesType
  const occurrences = await listOwnedResearchOccurrences({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    from: query.from,
    to: query.to,
  })

  res.json({ occurrences })
}
