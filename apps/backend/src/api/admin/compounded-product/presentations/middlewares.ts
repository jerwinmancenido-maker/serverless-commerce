import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"

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
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/presentations",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminCreateCompoundedProductPresentation),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.create,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/presentations/:id/revisions",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminCreateCompoundedProductPresentationRevision),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/presentations/:id/transitions",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminTransitionCompoundedProductPresentation),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.update,
      },
    ],
  },
]
