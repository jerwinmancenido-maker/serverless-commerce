/**
 * @file    apps/backend/src/lib/bot-runner/types.ts
 * @module  BotRunnerTypes (Autonomous Agent Runner Module)
 * @purpose Type definitions for bot mission definitions, run execution states, and telemetry.
 * @contracts
 *   Service: BotRunnerService
 */

export type BotMissionType =
  | "all_fleet_matrix"
  | "antigravity_cognitive_audit"
  | "e2e_buyer_fulfillment_smoke"
  | "staff_ops_waybill"
  | "catalog_integrity_check"
  | "payment_proof_sanitation"
  | "dead_link_route_crawl"
  | "dead_button_interaction"
  | "visual_overflow_mobile"
  | "security_idor_guard"
  | "p95_latency_benchmark"
  | "clinical_order_calculator"
  | "cold_chain_iot_telemetry"
  | "db_deadlock_concurrency_stress"
  | "chaos_recovery_circuit_breaker"
  | "ast_line_by_line_audit"
  | "regulatory_ruo_disclaimer_audit"
  | "dpa_pii_sanitation_sweep"
  | "bir_tax_withholding_parity"
  | "coa_batch_hash_verification"
  | "rate_limit_token_bucket_stress"
  | "webhook_replay_shield"
  | "idor_guest_session_boundary"
  | "admin_rbac_route_enforcement"
  | "mobile_viewport_clamp_audit"
  | "touch_target_geometry_sentry"
  | "ssr_hydration_mismatch_sentry"
  | "core_web_vitals_bundle_guard"
  | "courier_circuit_breaker_sentry"
  | "multi_warehouse_route_sentry"
  | "cold_chain_thermal_barrier"
  | "stale_reservation_reclaim_guard"

export type BotRunStatus = "idle" | "running" | "completed" | "failed" | "aborted" | "interrupted"

export type BotExecutionMode = "simultaneous_hybrid" | "local_only" | "ai_only"
export type BotEngineSource = "local" | "antigravity_ai" | "system"

export interface BotStepLog {
  step: number
  totalSteps: number
  title: string
  status: "pending" | "running" | "success" | "error" | "skipped"
  timestamp: string
  durationMs?: number
  message?: string
  engineSource?: BotEngineSource
  details?: Record<string, unknown>
}

export interface LensEvaluationItem {
  name: string
  score: number
  grade: "A+" | "A" | "B" | "C" | "F"
  status: "PASS" | "WARN" | "FAIL"
  issues: string[]
}

export interface SixLensScorecard {
  lens1Customer: LensEvaluationItem
  lens2Operations: LensEvaluationItem
  lens3Security: LensEvaluationItem
  lens4DataContract: LensEvaluationItem
  lens5Compliance: LensEvaluationItem
  lens6FailureMode: LensEvaluationItem
  overallGrade: "A+" | "A" | "B" | "C" | "F"
  overallScore: number
  evaluatedAt: string
}

export interface BotDiscoveredDefect {
  id: string
  severity: "critical" | "warning" | "info"
  title: string
  category: string
  url?: string
  filePath?: string
  line?: number
  detail: string
  suggestedRemediation?: string
  status?: "open" | "fixing" | "fixed"
  fixAvailable?: boolean
  fixedAt?: string
  patchDetails?: string
  diffPreview?: string
  safetyScore?: number
  riskLevel?: "low" | "medium" | "high"
}

export interface BotDaemonEvent {
  timestamp: string
  event: string
  type: "scan" | "bug" | "fix" | "rollback"
}

export interface RollbackCheckpoint {
  checkpointId: string
  tag: string
  commitHash: string
  createdAt: string
  cycle: number
  syntheticOrdersPurged: number
  status: "healthy" | "reverted"
  label?: string
}

export interface BotDaemonState {
  isEnabled: boolean
  status: "active" | "idle" | "paused"
  startedAt?: string
  lastScanAt?: string
  totalScans: number
  bugsCaughtCount: number
  autoFixedCount: number
  nextRollbackAt?: string
  lastRollbackAt?: string
  totalCheckpointsCount: number
  scenariosExecuted: number
  scorecardGrade?: string
  scorecardPercent?: number
  realInvariantsCount?: number
  lastScanDetails?: Record<string, unknown>
  generalLedgerDrift: number
  visualClutterCount: number
  bypassesCount: number
  securityLeaksCount: number
  throttlePace: "blitz" | "normal" | "relaxed"
  auditorMode: "ai_6lens" | "heuristic"
  headedBrowser: boolean
  continuousAutopilot: boolean
  recentEvents: BotDaemonEvent[]
}

export interface AstAuditIssue {
  file: string
  line: number
  category: "compensation" | "idempotency" | "security" | "types" | "pii"
  severity: "critical" | "warning" | "info"
  title: string
  detail: string
  codeSnippet: string
  remediation: string
  suggestedDiff?: string
}

export interface AstCodeAuditReport {
  scannedAt: string
  totalFilesScanned: number
  totalWorkflowsScanned: number
  totalStepsScanned: number
  totalSubscribersScanned: number
  totalRoutesScanned: number
  issues: AstAuditIssue[]
  summary: {
    criticalCount: number
    warningCount: number
    infoCount: number
    passRatePercent: number
  }
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
  astReport?: AstCodeAuditReport
  aiConversationId?: string
  typeCheckPassed?: boolean
  eslintPassed?: boolean
  unitTestsPassed?: boolean
  codeTestsPassed?: boolean
  crawledRoutesCount?: number
  inspectedButtonsCount?: number
  responsiveBreakpointsCount?: number
  averageResponseMs?: number
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
  scorecard?: SixLensScorecard
  defects?: BotDiscoveredDefect[]
  scenariosExecuted?: number
  executionMode?: BotExecutionMode
  aiConversationId?: string
}

export interface BotMissionDefinition {
  type: BotMissionType
  title: string
  description: string
  category: "audit" | "smoke" | "catalog" | "telemetry" | "security" | "ui" | "resilience"
  icon: string
  tag?: string
  estimatedDuration: string
  totalSteps: number
}
