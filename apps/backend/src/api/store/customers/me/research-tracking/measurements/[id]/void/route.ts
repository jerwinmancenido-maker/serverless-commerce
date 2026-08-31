import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { transitionResearchMeasurement } from "../../../measurement-transition"
import type { StoreTransitionResearchMeasurementType } from "../../../validators"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreTransitionResearchMeasurementType>,
  res: MedusaResponse,
) {
  return transitionResearchMeasurement("void", req, res)
}
