import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"

import { AdminSetComponentProfile } from "./validators"

export const adminBomMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/bom/component-profiles",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminSetComponentProfile)],
  },
]
