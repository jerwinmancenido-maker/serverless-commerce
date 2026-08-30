import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"

import {
  AdminAssignCompoundFamilyBody,
  AdminCreateCompoundFamily,
  AdminListCompoundFamilies,
  AdminUpdateCompoundFamilyBody,
} from "../../../../modules/compounded-product/contracts/compound-family"
import {
  AdminAssignCompoundProductFormatBody,
  AdminCreateCompoundProductFormat,
  AdminListCompoundProductFormats,
  AdminUpdateCompoundProductFormatBody,
} from "../../../../modules/compounded-product/contracts/compound-product-format"

const governancePolicy = (
  operation: (typeof PolicyOperation)[keyof typeof PolicyOperation],
) => [
  { resource: "compounded_product_governance", operation },
]

export const adminCompoundCatalogMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/compounded-product/families",
    methods: ["GET"],
    middlewares: [validateAndTransformQuery(AdminListCompoundFamilies, {})],
    policies: governancePolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/compounded-product/families",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminCreateCompoundFamily)],
    policies: governancePolicy(PolicyOperation.create),
  },
  {
    matcher: "/admin/compounded-product/families/:id",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminUpdateCompoundFamilyBody)],
    policies: governancePolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/compounded-product/families/:id/archive",
    methods: ["POST"],
    middlewares: [],
    policies: governancePolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/compounded-product/formats",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(AdminListCompoundProductFormats, {}),
    ],
    policies: governancePolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/compounded-product/formats",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminCreateCompoundProductFormat)],
    policies: governancePolicy(PolicyOperation.create),
  },
  {
    matcher: "/admin/compounded-product/formats/:id",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminUpdateCompoundProductFormatBody),
    ],
    policies: governancePolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/compounded-product/formats/:id/archive",
    methods: ["POST"],
    middlewares: [],
    policies: governancePolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/compounded-product/products/:id/family",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminAssignCompoundFamilyBody)],
    policies: governancePolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/compounded-product/products/:id/format",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminAssignCompoundProductFormatBody),
    ],
    policies: governancePolicy(PolicyOperation.update),
  },
]
