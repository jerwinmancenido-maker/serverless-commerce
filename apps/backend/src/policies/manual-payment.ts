import { definePolicies, PolicyOperation } from "@medusajs/framework/utils"

export const manualPaymentPolicies = definePolicies([
  {
    name: "ReadManualPaymentProofs",
    resource: "manual_payment_proof",
    operation: PolicyOperation.read,
    description: "View submitted Manual QR payment proofs",
  },
  {
    name: "ReviewManualPaymentProofs",
    resource: "manual_payment_proof",
    operation: PolicyOperation.update,
    description: "Approve or reject Manual QR payment proofs",
  },
])
