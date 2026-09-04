import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"
import multer from "multer"

import { MANUAL_PAYMENT_PROOF_MAX_BYTES } from "../../../modules/manual-payment/contracts/payment-proof"
import {
  AdminListManualPaymentProofs,
  AdminReviewManualPaymentProof,
} from "./validators"

const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MANUAL_PAYMENT_PROOF_MAX_BYTES,
  },
})

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
    matcher: "/admin/manual-payment-proofs/:id/settle",
    methods: ["POST"],
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
  {
    matcher: "/admin/orders/:id/manual-payment-proof/upload",
    methods: ["POST"],
    middlewares: [proofUpload.single("proof")],
    policies: [
      {
        resource: "manual_payment_proof",
        operation: PolicyOperation.create,
      },
    ],
  },
]
