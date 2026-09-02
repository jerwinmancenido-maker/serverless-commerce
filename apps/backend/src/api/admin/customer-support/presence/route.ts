import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getStaffPresence, getSystemStaffAvailability, setStaffPresence } from "../../../../modules/customer-support/presence"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const current = getStaffPresence(req.auth_context.actor_id)
  const system = getSystemStaffAvailability()

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    my_status: current,
    system,
  })
}

export async function POST(req: AuthenticatedMedusaRequest<{ status?: "online" | "busy" | "offline" }>, res: MedusaResponse) {
  const status = req.body?.status || "online"
  setStaffPresence(req.auth_context.actor_id, status)

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    my_status: status,
    system: getSystemStaffAvailability(),
  })
}
