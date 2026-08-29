import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"

import {
  AdminCreateCompoundedProductPresentationRevision,
  AdminCreateCompoundedProductPresentation,
  AdminListCompoundedProductPresentations,
  AdminTransitionCompoundedProductPresentation,
} from "../../../../modules/compounded-product/contracts/configuration"

export const adminCompoundedProductPresentationMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/compounded-product/presentations",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(AdminListCompoundedProductPresentations, {}),
    ],
  },
  {
    matcher: "/admin/compounded-product/presentations",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminCreateCompoundedProductPresentation),
    ],
  },
  {
    matcher: "/admin/compounded-product/presentations/:id/revisions",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminCreateCompoundedProductPresentationRevision),
    ],
  },
  {
    matcher: "/admin/compounded-product/presentations/:id/transitions",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminTransitionCompoundedProductPresentation),
    ],
  },
]
