import { MedusaError } from "@medusajs/framework/utils"

import { fingerprintCompoundedProductValue } from "./configuration-fingerprint"
import {
  CompoundedProductIdempotencyClaim,
  type CompoundedProductIdempotencyOperation,
  type CompoundedProductIdempotencyStatus,
} from "./contracts/idempotency"

export type CompoundedProductCreationRequestRecord = {
  id: string
  operation: CompoundedProductIdempotencyOperation
  idempotency_key: string
  request_fingerprint_sha256: string
  status: CompoundedProductIdempotencyStatus
  actor_id: string
  native_product_id: string | null
  response_payload: Record<string, unknown> | null
  error_code: string | null
  completed_at: Date | null
  failed_at: Date | null
}

export type CompoundedProductIdempotencyResolution =
  | { action: "in_progress"; request: CompoundedProductCreationRequestRecord }
  | { action: "replay"; request: CompoundedProductCreationRequestRecord }
  | { action: "failed"; request: CompoundedProductCreationRequestRecord }

function conflict(message: string): never {
  throw new MedusaError(MedusaError.Types.CONFLICT, message)
}

function invalidState(message: string): never {
  throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, message)
}

export function createCompoundedProductCreationPayloadFingerprint(
  payload: unknown,
): string {
  return fingerprintCompoundedProductValue(payload)
}

export function normalizeCompoundedProductIdempotencyClaim(
  input: CompoundedProductIdempotencyClaim,
): CompoundedProductIdempotencyClaim {
  return CompoundedProductIdempotencyClaim.parse(input)
}

export function resolveCompoundedProductCreationRequest(
  request: CompoundedProductCreationRequestRecord,
  fingerprint: string,
): CompoundedProductIdempotencyResolution {
  if (request.request_fingerprint_sha256 !== fingerprint) {
    conflict("idempotency_key_conflict")
  }

  if (request.status === "succeeded") {
    if (!request.native_product_id || !request.response_payload) {
      invalidState("Succeeded product creation request is missing its result")
    }

    return { action: "replay", request }
  }

  if (request.status === "in_progress") {
    return { action: "in_progress", request }
  }

  if (!request.error_code || !request.failed_at) {
    invalidState("Failed product creation request is missing failure details")
  }

  return { action: "failed", request }
}

export function completeCompoundedProductCreationRequest(input: {
  request: CompoundedProductCreationRequestRecord
  nativeProductId: string
  responsePayload: Record<string, unknown>
  completedAt: Date
}): CompoundedProductCreationRequestRecord {
  if (input.request.status !== "in_progress") {
    invalidState("Only an in-progress product creation request can succeed")
  }

  if (!input.nativeProductId.trim()) {
    invalidState("A successful product creation request requires a product ID")
  }

  return {
    ...input.request,
    status: "succeeded",
    native_product_id: input.nativeProductId,
    response_payload: input.responsePayload,
    error_code: null,
    completed_at: input.completedAt,
    failed_at: null,
  }
}

export function failCompoundedProductCreationRequest(input: {
  request: CompoundedProductCreationRequestRecord
  errorCode: string
  failedAt: Date
}): CompoundedProductCreationRequestRecord {
  if (input.request.status !== "in_progress") {
    invalidState("Only an in-progress product creation request can fail")
  }

  if (!input.errorCode.trim()) {
    invalidState("A failed product creation request requires an error code")
  }

  return {
    ...input.request,
    status: "failed",
    native_product_id: null,
    response_payload: null,
    error_code: input.errorCode,
    completed_at: null,
    failed_at: input.failedAt,
  }
}
