import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { retrieveStoreCompoundFamilyByKey } from "../../../../lib/store-compound-family"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const family = await retrieveStoreCompoundFamilyByKey(
    req.scope,
    req.params.key,
  )

  res.json({ family })
}
