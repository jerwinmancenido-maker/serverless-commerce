import {
  type MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"

import { AdminUpdateResearchHubSettings } from "./validators"

export const adminResearchHubMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/research-hub/settings",
    method: "POST",
    middlewares: [validateAndTransformBody(AdminUpdateResearchHubSettings)],
  },
]
