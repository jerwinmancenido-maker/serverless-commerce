import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Intentionally empty compatibility endpoint. Community content is delivered
 * only by authenticated customer routes after server-side eligibility checks.
 */
export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    comments: [],
    count: 0,
    access: "restricted",
  })
}
