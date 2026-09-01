import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { StoreMutateCalculationSnapshotType } from "../../../../../../../../modules/research-tracking/contracts/calculations"
import { mutateResearchCalculationSnapshotWorkflow } from "../../../../../../../../workflows/manage-research-calculation-snapshots"
import { setResearchPrivateNoStore } from "../../../utils"

export async function POST(
  req: AuthenticatedMedusaRequest<StoreMutateCalculationSnapshotType>,
  res: MedusaResponse,
) {
  setResearchPrivateNoStore(res)
  const { result } = await mutateResearchCalculationSnapshotWorkflow(req.scope).run({
    input: {
      customerId: req.auth_context.actor_id,
      snapshotId: req.params.id,
      mutation: req.validatedBody,
    },
  })
  res.json({ calculation: result })
}
