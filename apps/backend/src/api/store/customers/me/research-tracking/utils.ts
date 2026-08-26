import { createHash } from "node:crypto"

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { normalizeResearchIdempotencyKey } from "../../../../../modules/research-tracking/contracts/ownership"

export function setResearchPrivateNoStore(res: MedusaResponse): void {
  res.setHeader("Cache-Control", "private, no-store")
}

export function getResearchIdempotencyKey(
  req: AuthenticatedMedusaRequest,
): string {
  const value = req.headers["idempotency-key"]

  return normalizeResearchIdempotencyKey(
    Array.isArray(value) ? (value[0] ?? "") : (value ?? ""),
  )
}

export function createResearchWorkflowContext(
  customerId: string,
  operation: string,
  idempotencyKey: string,
  requestFingerprintSha256?: string,
): { transactionId: string } {
  const transactionParts = [customerId, operation, idempotencyKey]

  if (requestFingerprintSha256) {
    transactionParts.push(requestFingerprintSha256)
  }

  const digest = createHash("sha256")
    .update(transactionParts.join("\u0000"))
    .digest("hex")

  return {
    transactionId: `research-${operation}-${digest}`,
  }
}
