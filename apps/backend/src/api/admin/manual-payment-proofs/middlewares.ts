import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"

import {
  AdminListManualPaymentProofs,
  AdminReviewManualPaymentProof,
} from "./validators"

export const adminManualPaymentProofMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/manual-payment-proofs",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(AdminListManualPaymentProofs, {
        isList: true,
        defaultLimit: 20,
      }),
    ],
    policies: [
      {
        resource: "manual_payment_proof",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher: "/admin/manual-payment-proofs/:id/review",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminReviewManualPaymentProof)],
    policies: [
      {
        resource: "manual_payment_proof",
        operation: PolicyOperation.update,
      },
    ],
  },
  {
    matcher: "/admin/manual-payment-proofs/:id",
    methods: ["GET"],
    policies: [
      {
        resource: "manual_payment_proof",
        operation: PolicyOperation.read,
      },
    ],
  },
  {
    matcher: "/admin/manual-payment-proofs/:id/file",
    methods: ["GET"],
    policies: [
      {
        resource: "manual_payment_proof",
        operation: PolicyOperation.read,
      },
    ],
  },
]
