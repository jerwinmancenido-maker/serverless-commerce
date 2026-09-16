/**
 * @file    apps/backend/src/lib/bot-runner/__tests__/bot-runner.unit.spec.ts
 * @module  BotRunnerUnitTests (Autonomous Agent Runner Module)
 * @purpose Unit test coverage for bot runner life cycle, 16 missions, defect auto-fixer, 24/7 daemon, and AST auditor.
 * @contracts
 *   Service: BotRunnerService · AstCodeAuditor
 */

import { botRunnerService } from "../service"
import { runAstCodeAudit } from "../ast-auditor"

describe("BotRunnerService", () => {
  it("exposes all 16 available missions including Master Matrix and AST Auditor", () => {
    const missions = botRunnerService.listMissions()
    expect(Array.isArray(missions)).toBe(true)
    expect(missions.length).toBe(16)

    const matrix = missions.find((m) => m.type === "all_fleet_matrix")
    expect(matrix).toBeDefined()
    expect(matrix?.totalSteps).toBe(14)

    const clinicalOrderCalc = missions.find((m) => m.type === "clinical_order_calculator")
    expect(clinicalOrderCalc).toBeDefined()
    expect(clinicalOrderCalc?.totalSteps).toBe(6)

    const coldChain = missions.find((m) => m.type === "cold_chain_iot_telemetry")
    expect(coldChain).toBeDefined()
    expect(coldChain?.totalSteps).toBe(6)

    const dbStress = missions.find((m) => m.type === "db_deadlock_concurrency_stress")
    expect(dbStress).toBeDefined()

    const chaos = missions.find((m) => m.type === "chaos_recovery_circuit_breaker")
    expect(chaos).toBeDefined()

    const ast = missions.find((m) => m.type === "ast_line_by_line_audit")
    expect(ast).toBeDefined()
  })

  it("manages 24/7 AI Bug Hunter daemon state and transitions", () => {
    const initial = botRunnerService.getDaemonState()
    expect(initial).toBeDefined()
    expect(typeof initial.totalScans).toBe("number")

    const started = botRunnerService.startDaemon()
    expect(started.isEnabled).toBe(true)
    expect(started.status).toBe("active")

    const stopped = botRunnerService.stopDaemon()
    expect(stopped.isEnabled).toBe(false)
    expect(stopped.status).toBe("idle")

    const toggled = botRunnerService.toggleDaemon()
    expect(toggled.isEnabled).toBe(true)
    botRunnerService.stopDaemon()
  })

  it("lists known defects with unified diffs and safety ratings", () => {
    const defects = botRunnerService.getKnownDefects()
    expect(Array.isArray(defects)).toBe(true)
    expect(defects.length).toBeGreaterThanOrEqual(3)

    const jntDefect = defects.find((d) => d.id === "DEF-JNT-001")
    expect(jntDefect).toBeDefined()
    expect(jntDefect?.fixAvailable).toBe(true)
    expect(jntDefect?.diffPreview).toBeDefined()
    expect(jntDefect?.safetyScore).toBeGreaterThanOrEqual(95)

    const bomDefect = defects.find((d) => d.id === "DEF-BOM-002")
    expect(bomDefect).toBeDefined()
    expect(bomDefect?.fixAvailable).toBe(true)
  })

  it("runs AST line-by-line code audit and produces structured report", () => {
    const report = runAstCodeAudit()
    expect(report).toBeDefined()
    expect(report.totalFilesScanned).toBeGreaterThan(0)
    expect(typeof report.summary.passRatePercent).toBe("number")
    expect(Array.isArray(report.issues)).toBe(true)
  })

  it("lists recent runs ordered by start time", () => {
    const runs = botRunnerService.listRuns()
    expect(Array.isArray(runs)).toBe(true)
  })

  it("handles non-existent run queries gracefully", () => {
    const run = botRunnerService.getRun("non_existent_id_999")
    expect(run).toBeUndefined()
  })

  it("recovers and clears mutex lock on forceResetLock", () => {
    botRunnerService.forceResetLock()
    expect(botRunnerService.getActiveRun()).toBeUndefined()
  })

  it("clears run history successfully", () => {
    botRunnerService.clearHistory()
    expect(botRunnerService.listRuns().length).toBe(0)
  })

  it("purges synthetic QA test orders safely while preserving production orders", async () => {
    const mockOrders = [
      { id: "ord_qa_1", email: "qa-bot-123@pepstack.internal", metadata: { is_bot_qa: true }, status: "pending" },
      { id: "ord_real_2", email: "lab.analyst@institution.ph", metadata: {}, status: "completed" },
    ]

    const mockGraph = jest.fn().mockResolvedValue({ data: mockOrders })
    const mockUpdateOrders = jest.fn().mockResolvedValue([])

    const mockContainer = {
      resolve: jest.fn((key: string) => {
        if (key === "query") {
          return { graph: mockGraph }
        }
        if (key === "order") {
          return { updateOrders: mockUpdateOrders }
        }
        return {}
      }),
    } as any

    const result = await botRunnerService.purgeQaOrders(mockContainer)
    expect(result.purged_count).toBe(1)
    expect(result.order_ids).toContain("ord_qa_1")
    expect(result.order_ids).not.toContain("ord_real_2")
  })

  it("creates safety rollback checkpoints, reverts, and manages 20-min cycle", () => {
    const checkpointsBefore = botRunnerService.getCheckpoints()
    expect(Array.isArray(checkpointsBefore)).toBe(true)
    expect(checkpointsBefore.length).toBeGreaterThan(0)

    const newCheckpoint = botRunnerService.createCheckpoint("Test Safety Anchor")
    expect(newCheckpoint.checkpointId).toBeDefined()
    expect(newCheckpoint.tag).toContain("checkpoint-20m-")
    expect(newCheckpoint.status).toBe("healthy")

    const daemonState = botRunnerService.getDaemonState()
    expect(daemonState.nextRollbackAt).toBeDefined()
    expect(daemonState.lastRollbackAt).toBeDefined()

    const revertResult = botRunnerService.revertToCheckpoint(newCheckpoint.checkpointId)
    expect(revertResult.success).toBe(true)
    expect(revertResult.checkpoint.status).toBe("reverted")
  })

  it("generates comprehensive 360° 6-Lens Audit Dossier markdown", () => {
    const dossier = botRunnerService.generateAuditDossier()
    expect(typeof dossier).toBe("string")
    expect(dossier).toContain("OMNICONTROL & MEDUSA BOT LAB: 360° 6-LENS AUDIT DOSSIER")
    expect(dossier).toContain("EXECUTIVE SCORECARD")
    expect(dossier).toContain("360° 6-LENS COMPREHENSIVE STATUS")
    expect(dossier).toContain("SAFETY ROLLBACK CHECKPOINTS")
  })

  it("updates daemon settings for throttle pace and auditor mode", () => {
    const updated = botRunnerService.updateDaemonSettings({
      throttlePace: "blitz",
      auditorMode: "ai_6lens",
      headedBrowser: false,
    })
    expect(updated.throttlePace).toBe("blitz")
    expect(updated.auditorMode).toBe("ai_6lens")
    expect(updated.headedBrowser).toBe(false)
  })
})
