import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = (_req: MedusaRequest, res: MedusaResponse) => {
  res.redirect(302, "/app")
}
