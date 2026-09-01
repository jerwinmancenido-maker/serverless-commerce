import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { resolvePublicSupportConfiguration } from "../../../../modules/customer-support/configuration"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const configuration = await resolvePublicSupportConfiguration(req.scope)
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
  res.json({ configuration })
}
