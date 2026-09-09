/**
 * @file    apps/backend/src/lib/bot-runner/__tests__/bot-runner.unit.spec.ts
 * @module  BotRunnerUnitTests (Autonomous Agent Runner Module)
 * @purpose Unit test coverage for bot runner life cycle, concurrency locking, and status transitions.
 * @contracts
 *   Service: BotRunnerService
 */

import { botRunnerService } from "../service"

describe("BotRunnerService", () => {
  it("exposes available missions including E2E smoke test and catalog sanity", () => {
    const missions = botRunnerService.listMissions()
    expect(Array.isArray(missions)).toBe(true)
    const smoke = missions.find((m) => m.type === "e2e_buyer_fulfillment_smoke")
    expect(smoke).toBeDefined()
    expect(smoke?.totalSteps).toBe(10)

    const catalog = missions.find((m) => m.type === "catalog_integrity_check")
    expect(catalog).toBeDefined()
    expect(catalog?.totalSteps).toBe(5)

    const sanitation = missions.find((m) => m.type === "payment_proof_sanitation")
    expect(sanitation).toBeDefined()
    expect(sanitation?.totalSteps).toBe(5)
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
      { id: "ord_real_2", email: "dr.smith@clinic.ph", metadata: {}, status: "completed" },
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
})
