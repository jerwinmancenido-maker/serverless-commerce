/**
 * @file    apps/backend/src/lib/bot-runner/types.ts
 * @module  BotRunnerTypes (Autonomous Agent Runner Module)
 * @purpose Type definitions for bot mission definitions, run execution states, and telemetry.
 * @contracts
 *   Service: BotRunnerService
 */

export type BotMissionType =
  | "e2e_buyer_fulfillment_smoke"
  | "catalog_integrity_check"
  | "payment_proof_sanitation"

export type BotRunStatus = "idle" | "running" | "completed" | "failed" | "aborted" | "interrupted"

export interface BotStepLog {
  step: number
  totalSteps: number
  title: string
  status: "pending" | "running" | "success" | "error" | "skipped"
  timestamp: string
  durationMs?: number
  message?: string
  details?: Record<string, unknown>
}

export interface BotMissionArtifacts {
  cartId?: string
  orderId?: string
  displayId?: number | string
  customerEmail?: string
  paymentProofId?: string
  paymentReference?: string
  trackingNumber?: string
  waybillId?: string
  protocolToken?: string
  protocolAccessUrl?: string
  storefrontOrderUrl?: string
  adminOrderUrl?: string
  durationTotalMs?: number
  scannedProductsCount?: number
  scannedVariantsCount?: number
  bomProfilesCount?: number
  missingPricesCount?: number
  lowStockItemsCount?: number
  monographsCount?: number
  pendingProofsCount?: number
  staleOrdersCount?: number
  duplicateRefsCount?: number
  totalSettledVolume?: number
}

export interface BotMissionRun {
  id: string
  missionType: BotMissionType
  title: string
  description: string
  status: BotRunStatus
  startedAt: string
  finishedAt?: string
  durationMs?: number
  currentStep: number
  totalSteps: number
  logs: BotStepLog[]
  artifacts: BotMissionArtifacts
  errorMessage?: string
}

export interface BotMissionDefinition {
  type: BotMissionType
  title: string
  description: string
  category: "smoke" | "catalog" | "telemetry"
  icon: string
  estimatedDuration: string
  totalSteps: number
}
