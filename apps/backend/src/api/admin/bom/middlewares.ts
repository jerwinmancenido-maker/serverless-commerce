import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"

import {
  AdminGetBomAvailability,
  AdminSetComponentProfile,
} from "./validators"

export const adminBomMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/bom/component-profiles",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminSetComponentProfile)],
  },
  {
    matcher: "/admin/bom/availability",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(AdminGetBomAvailability, {}),
    ],
  },
]
