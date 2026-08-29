import { model } from "@medusajs/framework/utils"

import {
  COMPOUNDED_PRODUCT_IDEMPOTENCY_OPERATIONS,
  COMPOUNDED_PRODUCT_IDEMPOTENCY_STATUSES,
} from "../contracts/idempotency"

const ProductCreationRequest = model
  .define("compounded_product_creation_request", {
    id: model.id().primaryKey(),
    operation: model.enum([...COMPOUNDED_PRODUCT_IDEMPOTENCY_OPERATIONS]),
    idempotency_key: model.text(),
    request_fingerprint_sha256: model.text(),
    status: model
      .enum([...COMPOUNDED_PRODUCT_IDEMPOTENCY_STATUSES])
      .default("in_progress"),
    actor_id: model.text(),
    native_product_id: model.text().nullable(),
    response_payload: model.json<Record<string, unknown>>().nullable(),
    error_code: model.text().nullable(),
    completed_at: model.dateTime().nullable(),
    failed_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["operation", "idempotency_key"], unique: true },
    { on: ["status"] },
    { on: ["request_fingerprint_sha256"] },
  ])

export default ProductCreationRequest
