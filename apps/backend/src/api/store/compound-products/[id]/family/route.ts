import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { retrieveStoreCompoundFamilyByProductId } from "../../../../../lib/store-compound-family"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const family = await retrieveStoreCompoundFamilyByProductId(
    req.scope,
    req.params.id,
  )

  res.json({ family })
}
