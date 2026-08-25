export type ManualPaymentProofStatus =
  "pending" | "approved" | "rejected" | "expired"

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

export type ManualPaymentProofDetailsResponse = {
  manual_payment_proof: ManualPaymentProof
  events: ManualPaymentProofEvent[]
}

export type ManualPaymentProofReviewResponse = {
  manual_payment_proof: ManualPaymentProof
}
