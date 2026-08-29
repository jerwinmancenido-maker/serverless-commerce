import {
  validateAndTransformBody,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"

import {
  AdminCreateCompoundedProductDraft,
  AdminCompareCompoundedProductConfigurationRevisions,
  AdminPreviewCompoundedProductVariantMatrix,
} from "../../../../modules/compounded-product/contracts/product-creation"
import { AdminSetCompoundedProductVariantRecipe } from "../../../../modules/compounded-product/contracts/bom-readiness"
import { AdminChangeCompoundedProductPublication } from "../../../../modules/compounded-product/contracts/audit"
import {
  AdminChangeCompoundedProductClassification,
  AdminPreviewCompoundedProductClassificationChange,
} from "../../../../modules/compounded-product/contracts/classification"

export const adminCompoundedProductProductMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/compounded-product/products",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminCreateCompoundedProductDraft),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.create,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/products/revision-impact",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(
        AdminCompareCompoundedProductConfigurationRevisions,
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
    matcher: "/admin/compounded-product/products/preview",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminPreviewCompoundedProductVariantMatrix),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher:
      "/admin/compounded-product/products/:id/variants/:variantId/recipe",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminSetCompoundedProductVariantRecipe),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/products/:id/readiness",
    methods: ["GET"],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/products/:id/audit-events",
    methods: ["GET"],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher:
      "/admin/compounded-product/products/:id/classification-impact",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(
        AdminPreviewCompoundedProductClassificationChange,
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
    matcher: "/admin/compounded-product/products/:id/classification",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminChangeCompoundedProductClassification),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    matcher: "/admin/compounded-product/products/:id/publication",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminChangeCompoundedProductPublication),
    ],
    policies: [
      {
        resource: "compounded_product_governance",
        operation: PolicyOperation.update,
      },
    ],
  },
]
