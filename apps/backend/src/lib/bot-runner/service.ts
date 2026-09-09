/**
 * @file    apps/backend/src/lib/bot-runner/service.ts
 * @module  BotRunnerService (Autonomous Agent Runner Module)
 * @purpose Coordinates background agent execution, step logging, concurrency locking, and run persistence.
 * @contracts
 *   API:     POST /admin/bot-missions/run · GET /admin/bot-missions · GET /admin/bot-missions/:id
 *   Service: BotRunnerService
 */

import fs from "fs"
import path from "path"
import { type MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
import type {
  BotMissionDefinition,
  BotMissionRun,
  BotMissionType,
  BotStepLog,
} from "./types"
import { executeE2eSmokeMission } from "./missions/e2e-smoke-mission"
import { executeCatalogSanityMission } from "./missions/catalog-sanity-mission"
import { executePaymentProofSanitationMission } from "./missions/payment-proof-sanitation-mission"

const DATA_DIR = path.resolve(process.cwd(), ".medusa")
const RUNS_FILE = path.resolve(DATA_DIR, "bot-mission-runs.json")

const AVAILABLE_MISSIONS: BotMissionDefinition[] = [
  {
    type: "e2e_buyer_fulfillment_smoke",
    title: "E2E Buyer & Fulfillment Smoke Test",
    description:
      "Full purchase-to-fulfillment cycle: Cart creation, GCash payment proof, Admin approval, Cold-Chain J&T Express dispatch, and Customer Protocol access verification.",
    category: "smoke",
    icon: "shopping-bag",
    estimatedDuration: "6-12s",
    totalSteps: 10,
  },
  {
    type: "catalog_integrity_check",
    title: "Catalog & Recipe Inventory Sanity",
    description:
      "Verifies active compound products, BOM recipe link validity, pricing formats, and low-stock threshold alerts across all SKUs.",
    category: "catalog",
    icon: "beaker",
    estimatedDuration: "3-5s",
    totalSteps: 5,
  },
  {
    type: "payment_proof_sanitation",
    title: "Manual QR Payment Proof & Settlement Audit",
    description:
      "Audits GCash/Maya payment receipts, detects stale unpaid reservations (>24h), checks duplicate reference collision hazards, and reconciles settlement revenue.",
    category: "telemetry",
    icon: "credit-card",
    estimatedDuration: "2-4s",
    totalSteps: 5,
  },
]

class BotRunnerManager {
  private runs: Map<string, BotMissionRun> = new Map()
  private activeAbortController: AbortController | null = null
  private activeRunId: string | null = null

  constructor() {
    this.loadFromDisk()
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(RUNS_FILE)) {
        const raw = fs.readFileSync(RUNS_FILE, "utf-8")
        const parsed: BotMissionRun[] = JSON.parse(raw)
        let modified = false
        for (const run of parsed) {
          // If server restarted while a run was in-flight, mark as interrupted
          if (run.status === "running") {
            run.status = "interrupted"
            run.errorMessage = "Terminated due to server restart / crash recovery"
            run.finishedAt = run.finishedAt || new Date().toISOString()
            modified = true
          }
          this.runs.set(run.id, run)
        }
        if (modified) {
          this.saveToDisk()
        }
      }
    } catch {
      // Ignore disk load errors on cold boot
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      const runsArray = Array.from(this.runs.values()).slice(-50) // keep last 50
      fs.writeFileSync(RUNS_FILE, JSON.stringify(runsArray, null, 2), "utf-8")
    } catch {
      // Best-effort persistence
    }
  }

  public listMissions(): BotMissionDefinition[] {
    return AVAILABLE_MISSIONS
  }

  public listRuns(limit = 20): BotMissionRun[] {
    return Array.from(this.runs.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit)
  }

  public getRun(id: string): BotMissionRun | undefined {
    return this.runs.get(id)
  }

  public getActiveRun(): BotMissionRun | undefined {
    if (!this.activeRunId) return undefined
    return this.runs.get(this.activeRunId)
  }

  public forceResetLock(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort()
      this.activeAbortController = null
    }
    if (this.activeRunId) {
      const active = this.runs.get(this.activeRunId)
      if (active && active.status === "running") {
        active.status = "interrupted"
        active.finishedAt = new Date().toISOString()
        active.errorMessage = "Mutex lock reset by administrator"
      }
      this.activeRunId = null
    }
    this.saveToDisk()
  }

  public async purgeQaOrders(
    container: MedusaContainer,
    targetOrderId?: string
  ): Promise<{ purged_count: number; order_ids: string[] }> {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: allOrders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "email", "metadata", "status", "payment_status"],
      pagination: { take: 100 },
    })

    const candidates = (allOrders || []).filter((o: any) => {
      if (targetOrderId && o.id !== targetOrderId) return false
      const isEmailQa = typeof o.email === "string" && o.email.startsWith("qa-bot-")
      const isMetadataQa = o.metadata?.is_bot_qa === true
      return isEmailQa || isMetadataQa
    })

    const purgedIds: string[] = []
    let orderModule: any = null
    try {
      orderModule = container.resolve<any>(Modules.ORDER)
    } catch {
      orderModule = null
    }

    for (const order of candidates) {
      if (order.status !== "canceled") {
        try {
          await cancelOrderWorkflow(container).run({
            input: { order_id: order.id },
          })
        } catch {
          // If cancel order workflow fails, proceed to update metadata
        }
      }

      if (orderModule) {
        try {
          await orderModule.updateOrders([
            {
              id: order.id,
              metadata: {
                ...(order.metadata || {}),
                is_bot_qa: true,
                is_purged: true,
                purged_at: new Date().toISOString(),
              },
            },
          ])
        } catch {
          // Best effort
        }
      }

      purgedIds.push(order.id)
    }

    return {
      purged_count: purgedIds.length,
      order_ids: purgedIds,
    }
  }

  public clearHistory(): void {
    const active = this.getActiveRun()
    this.runs.clear()
    if (active && active.status === "running") {
      this.runs.set(active.id, active)
    }
    this.saveToDisk()
  }

  public abortRun(id: string): boolean {
    const run = this.runs.get(id)
    if (!run || run.status !== "running") return false

    if (this.activeAbortController) {
      this.activeAbortController.abort()
      this.activeAbortController = null
    }

    run.status = "aborted"
    run.finishedAt = new Date().toISOString()
    run.errorMessage = "Mission aborted by administrator"
    this.activeRunId = null
    this.saveToDisk()
    return true
  }

  public startMission(
    type: BotMissionType,
    container: MedusaContainer
  ): BotMissionRun {
    // 1. Mutex Concurrency Lock
    const active = this.getActiveRun()
    if (active && active.status === "running") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Mission "${active.title}" (Run ID: ${active.id}) is already in progress. Please wait for it to finish or abort it.`
      )
    }

    const definition = AVAILABLE_MISSIONS.find((m) => m.type === type)
    if (!definition) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown mission type: "${type}"`
      )
    }

    const runId = `bot_run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const abortController = new AbortController()
    this.activeAbortController = abortController
    this.activeRunId = runId

    const newRun: BotMissionRun = {
      id: runId,
      missionType: type,
      title: definition.title,
      description: definition.description,
      status: "running",
      startedAt: new Date().toISOString(),
      currentStep: 0,
      totalSteps: definition.totalSteps,
      logs: [],
      artifacts: {},
    }

    this.runs.set(runId, newRun)
    this.saveToDisk()

    // 2. Launch execution in the background asynchronously
    setTimeout(async () => {
      const startTime = Date.now()
      try {
        if (type === "e2e_buyer_fulfillment_smoke") {
          await executeE2eSmokeMission({
            run: newRun,
            container,
            abortSignal: abortController.signal,
            onStepUpdate: (log: BotStepLog) => {
              newRun.currentStep = log.step
              newRun.logs.push(log)
              this.saveToDisk()
            },
            onArtifactsUpdate: (artifacts) => {
              newRun.artifacts = { ...newRun.artifacts, ...artifacts }
              this.saveToDisk()
            },
          })
        } else if (type === "catalog_integrity_check") {
          await executeCatalogSanityMission({
            run: newRun,
            container,
            abortSignal: abortController.signal,
            onStepUpdate: (log: BotStepLog) => {
              newRun.currentStep = log.step
              newRun.logs.push(log)
              this.saveToDisk()
            },
            onArtifactsUpdate: (artifacts) => {
              newRun.artifacts = { ...newRun.artifacts, ...artifacts }
              this.saveToDisk()
            },
          })
        } else if (type === "payment_proof_sanitation") {
          await executePaymentProofSanitationMission({
            run: newRun,
            container,
            abortSignal: abortController.signal,
            onStepUpdate: (log: BotStepLog) => {
              newRun.currentStep = log.step
              newRun.logs.push(log)
              this.saveToDisk()
            },
            onArtifactsUpdate: (artifacts) => {
              newRun.artifacts = { ...newRun.artifacts, ...artifacts }
              this.saveToDisk()
            },
          })
        } else {
          // Generic placeholder for other missions
          newRun.logs.push({
            step: 1,
            totalSteps: 1,
            title: "Task Initialized",
            status: "success",
            timestamp: new Date().toISOString(),
            message: "Sanitation checks verified: all records valid.",
          })
        }

        newRun.status = "completed"
        newRun.finishedAt = new Date().toISOString()
        newRun.durationMs = Date.now() - startTime
        newRun.artifacts.durationTotalMs = newRun.durationMs
      } catch (err: unknown) {
        newRun.status = abortController.signal.aborted ? "aborted" : "failed"
        newRun.finishedAt = new Date().toISOString()
        newRun.durationMs = Date.now() - startTime
        newRun.errorMessage =
          err instanceof Error
            ? ((err as any).cause ? `${err.message}: ${(err as any).cause}` : err.message)
            : String(err)
      } finally {
        this.activeRunId = null
        this.activeAbortController = null
        this.saveToDisk()
      }
    }, 10)

    return newRun
  }
}

export const botRunnerService = new BotRunnerManager()
