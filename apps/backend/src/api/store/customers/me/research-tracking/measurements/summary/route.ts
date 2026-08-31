import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { summarizeOwnedResearchMeasurements } from "../../../../../../../modules/research-tracking/queries/measurements"
import type { StoreListResearchMeasurementsType } from "../../validators"
import { setResearchPrivateNoStore } from "../../utils"

export async function GET(req: AuthenticatedMedusaRequest<StoreListResearchMeasurementsType>, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const query = req.validatedQuery as StoreListResearchMeasurementsType
  const result = await summarizeOwnedResearchMeasurements({
    container: req.scope,
    customerId: req.auth_context.actor_id,
    metricType: query.metric_type ?? "weight",
  })
  res.json(result)
}
