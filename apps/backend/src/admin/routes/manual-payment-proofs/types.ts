export type ManualPaymentProofStatus =
  "pending" | "approved" | "rejected" | "expired"

export type ManualPaymentSettlementStatus =
  | "not_started"
  | "authorizing"
  | "authorized"
  | "capturing"
  | "captured"
  | "failed"

export type ManualPaymentProof = {
  id: string
  payment_session_id: string
  order_id: string
  customer_id: string
  provider_id: string
  file_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  checksum_sha256: string
  status: ManualPaymentProofStatus
  revision: number
  submitted_at: string
  reviewed_at: string | null
  reviewed_by_actor_id: string | null
  rejection_reason: string | null
  settlement_status?: ManualPaymentSettlementStatus
}

export type ManualPaymentProofEvent = {
  id: string
  event_type: "submitted" | "resubmitted" | ManualPaymentProofStatus
  status: ManualPaymentProofStatus
  revision: number
  actor_id: string
  reason: string | null
  occurred_at: string
}

export type ManualPaymentProofListResponse = {
  manual_payment_proofs: ManualPaymentProof[]
  count: number
  limit: number
  offset: number
}

export type ManualPaymentProofLinkedOrder = {
  id: string
  display_id: number
  total: number
  status: string
  currency_code: string
  created_at: string
  customer?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
  } | null
  items?: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
  }>
} | null

export type ManualPaymentProofDetailsResponse = {
  manual_payment_proof: ManualPaymentProof
  order?: ManualPaymentProofLinkedOrder
  events: ManualPaymentProofEvent[]
  settlement?: {
    status: ManualPaymentSettlementStatus
    payment_id: string | null
    capture_id: string | null
    last_error_category: string | null
  } | null
}

export type ManualPaymentProofReviewResponse = {
  manual_payment_proof: ManualPaymentProof
}

export type ManualPaymentProofSettleResponse = {
  proof_id: string
  proof_review_status: ManualPaymentProofStatus
  settlement_status: ManualPaymentSettlementStatus
  payment_id: string | null
  capture_id: string | null
}
