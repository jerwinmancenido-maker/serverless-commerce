import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"

import {
  AdminCreateCompoundedProductClassificationMapping,
  AdminListCompoundedProductClassificationMappings,
  AdminTransitionCompoundedProductClassificationMapping,
} from "../../../../modules/compounded-product/contracts/classification"

export const adminCompoundedProductClassificationMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/compounded-product/governed-product-types",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(
        AdminListCompoundedProductClassificationMappings,
        {},
      ),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/governed-product-types",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(
        AdminCreateCompoundedProductClassificationMapping,
      ),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.create,
      },
    ],
  },
  {
    matcher:
      "/admin/compounded-product/governed-product-types/:id/transitions",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(
        AdminTransitionCompoundedProductClassificationMapping,
      ),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.update,
      },
    ],
  },
]
