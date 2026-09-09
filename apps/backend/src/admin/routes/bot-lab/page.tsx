/**
 * @file    apps/backend/src/admin/routes/bot-lab/page.tsx
 * @module  BotLabAdminRoute (Autonomous Agent Runner Module)
 * @purpose Bot Mission Control & QA Lab: background agent execution deck, live terminal log streaming, and artifact inspector.
 * @contracts
 *   API:     GET · POST /admin/bot-missions · GET · POST /admin/bot-missions/:id · POST /admin/bot-missions/purge · POST /admin/bot-missions/clear-history
 *   Service: BotRunnerService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowPath,
  Beaker,
  Bolt,
  CheckCircleSolid,
  CircleWarningSolid,
  CircleXmarkSolid,
  CreditCard,
  DocumentText,
  Trash,
} from "@medusajs/icons"
import { Badge, Button, Container, Heading, StatusBadge, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import type { BotMissionDefinition, BotMissionRun, BotMissionType } from "../../../lib/bot-runner/types"

interface BotMissionsResponse {
  missions: BotMissionDefinition[]
  runs: BotMissionRun[]
  active_run: BotMissionRun | null
}

const BotLabPage = () => {
  const queryClient = useQueryClient()
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const logTerminalRef = useRef<HTMLDivElement>(null)

  // 1. Fetch missions and runs with adaptive polling
  const { data } = useQuery<BotMissionsResponse>({
    queryKey: ["bot-missions"],
    queryFn: async () => {
      const res = await fetch("/admin/bot-missions", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load bot missions")
      return res.json()
    },
    refetchInterval: (query) => {
      const resp = query.state.data
      return resp?.active_run ? 1000 : 4000
    },
  })

  const activeRun = data?.active_run
  const runs = data?.runs || []
  const missions = data?.missions || []

  // Default selection: selectedRunId if set, otherwise active run, otherwise runs[0]
  const displayRun =
    (selectedRunId ? runs.find((r) => r.id === selectedRunId) : null) ||
    activeRun ||
    runs[0] ||
    null

  // Auto-scroll terminal to bottom when logs update
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight
    }
  }, [displayRun?.logs?.length])

  // 2. Launch Mission Mutation
  const launchMutation = useMutation({
    mutationFn: async (missionType: BotMissionType) => {
      const res = await fetch("/admin/bot-missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mission_type: missionType }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to launch bot mission")
      }
      return res.json()
    },
    onSuccess: (data) => {
      if (data?.run?.id) {
        setSelectedRunId(data.run.id)
      }
      toast.success("Mission Launched", {
        description: "Autonomous agent is executing in the background.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => {
      toast.error("Launch Error", {
        description: err.message,
      })
    },
  })

  // 3. Abort Mission Mutation
  const abortMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch(`/admin/bot-missions/${runId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "abort" }),
      })
      if (!res.ok) throw new Error("Failed to abort mission")
      return res.json()
    },
    onSuccess: () => {
      toast.info("Mission Aborted", {
        description: "Background worker execution terminated.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
  })

  // 4. Purge QA Orders Mutation
  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to purge QA test orders")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success("QA Orders Purged", {
        description: `Successfully cleaned up ${data.purged_count} synthetic test order(s).`,
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (err: Error) => {
      toast.error("Purge Failed", {
        description: err.message,
      })
    },
  })

  // 5. Force Reset Mutex Lock Mutation
  const resetLockMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/reset-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to reset lock")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Mutex Lock Cleared", {
        description: "Runner state recovered to idle.",
      })
      setSelectedRunId(null)
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
  })

  // 6. Clear Run History Mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/clear-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to clear history")
      return res.json()
    },
    onSuccess: () => {
      toast.success("History Cleared", {
        description: "Past mission run records cleared.",
      })
      setSelectedRunId(null)
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
  })

  const copyLogs = () => {
    if (!displayRun?.logs) return
    const text = displayRun.logs
      .map(
        (l) =>
          `[${l.timestamp}] [STEP ${l.step}/${l.totalSteps}] ${l.status.toUpperCase()} ${l.title}: ${l.message || ""}`
      )
      .join("\n")
    navigator.clipboard.writeText(text)
    toast.success("Logs Copied", {
      description: "Run history copied to clipboard.",
    })
  }

  const isAnyRunning = Boolean(activeRun && activeRun.status === "running")
  const isViewingHistorical = Boolean(
    selectedRunId && (!activeRun || selectedRunId !== activeRun.id)
  )

  return (
    <div className="flex flex-col gap-y-6 pb-12">
      {/* ── Executive Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
              <span className={`size-2 rounded-full ${isAnyRunning ? "bg-emerald-500 animate-pulse" : "bg-blue-600"}`} />
              Autonomous Agent QA Lab
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Non-Blocking Background Worker
            </span>
          </div>
          <Heading level="h1" className="text-2xl font-bold tracking-tight text-slate-900">
            Bot Mission Control
          </Heading>
          <Text className="text-xs text-slate-500 mt-0.5">
            Launch background agents for full-stack purchase testing, cold-chain verification, catalog health, and payment reconciliation without blocking founder tasks.
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAnyRunning && (
            <Button
              size="small"
              variant="danger"
              onClick={() => resetLockMutation.mutate()}
              isLoading={resetLockMutation.isPending}
              className="h-8 rounded-xl px-3 text-xs font-semibold"
            >
              Reset Mutex
            </Button>
          )}

          <Button
            size="small"
            variant="secondary"
            onClick={() => purgeMutation.mutate()}
            isLoading={purgeMutation.isPending}
            className="h-8 rounded-xl px-3 text-xs font-semibold bg-white border-amber-300 text-amber-900 hover:bg-amber-50"
          >
            <Trash className="size-3.5 mr-1 text-amber-600" />
            Purge QA Orders
          </Button>

          <Button
            size="small"
            variant="secondary"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["bot-missions"] })}
            className="h-8 rounded-xl px-3 text-xs font-semibold bg-white border-slate-200 hover:bg-slate-50"
          >
            <ArrowPath className="size-3.5 mr-1" />
            Refresh Runs
          </Button>
        </div>
      </div>

      {/* ── Mission Launch Deck (3 Columns) ── */}
      <div>
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Available Autonomous Bot Missions
        </Text>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {missions.map((mission) => {
            const isThisRunning = activeRun?.missionType === mission.type && activeRun?.status === "running"
            return (
              <div
                key={mission.type}
                className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        {mission.type === "e2e_buyer_fulfillment_smoke" ? (
                          <Bolt className="size-5" />
                        ) : mission.type === "catalog_integrity_check" ? (
                          <Beaker className="size-5" />
                        ) : (
                          <CreditCard className="size-5" />
                        )}
                      </div>
                      <div>
                        <Heading level="h3" className="text-sm font-bold text-slate-900 leading-snug">
                          {mission.title}
                        </Heading>
                        <Text className="text-[11px] text-slate-500">
                          Est. {mission.estimatedDuration} · {mission.totalSteps} Steps
                        </Text>
                      </div>
                    </div>
                    {isThisRunning && (
                      <Badge color="green" size="small" className="animate-pulse shrink-0">
                        RUNNING
                      </Badge>
                    )}
                  </div>
                  <Text className="text-xs text-slate-600 line-clamp-3 mt-1 mb-4">
                    {mission.description}
                  </Text>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[120px]">
                    {mission.type}
                  </span>
                  <Button
                    size="small"
                    variant="primary"
                    disabled={isAnyRunning || launchMutation.isPending}
                    onClick={() => launchMutation.mutate(mission.type)}
                    className="h-8 rounded-xl px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    {isThisRunning ? "Running..." : "Launch in Background"}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Active / Selected Mission Console ── */}
      {displayRun && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          {/* Historical Run Banner */}
          {isViewingHistorical && (
            <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900">
              <span className="font-medium">
                Inspecting Historical Run: <strong className="font-mono">{displayRun.id}</strong> ({displayRun.title})
              </span>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setSelectedRunId(null)}
                className="h-6 text-[11px] px-2.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
              >
                {activeRun ? "Switch to Live Active Run" : "Switch to Latest Run"}
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Bolt className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Text className="text-sm font-bold text-slate-900">{displayRun.title}</Text>
                  <StatusBadge
                    color={
                      displayRun.status === "running"
                        ? "green"
                        : displayRun.status === "completed"
                        ? "blue"
                        : displayRun.status === "aborted"
                        ? "orange"
                        : displayRun.status === "interrupted"
                        ? "purple"
                        : "red"
                    }
                  >
                    {displayRun.status.toUpperCase()}
                  </StatusBadge>
                </div>
                <Text className="text-[11px] text-slate-500 font-mono">
                  Run ID: {displayRun.id} · Started: {new Date(displayRun.startedAt).toLocaleTimeString()}
                  {displayRun.durationMs ? ` · Duration: ${(displayRun.durationMs / 1000).toFixed(1)}s` : ""}
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                variant="secondary"
                onClick={copyLogs}
                className="h-8 rounded-xl px-2.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
              >
                <DocumentText className="size-3.5 mr-1" />
                Copy Logs
              </Button>

              {displayRun.status === "running" && (
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => abortMutation.mutate(displayRun.id)}
                  disabled={abortMutation.isPending}
                  className="h-8 rounded-xl px-3 text-xs font-bold"
                >
                  Abort Mission
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
              <span>
                Step {displayRun.currentStep} of {displayRun.totalSteps}
              </span>
              <span>
                {Math.round((displayRun.currentStep / displayRun.totalSteps) * 100)}% Completed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  displayRun.status === "failed"
                    ? "bg-rose-500"
                    : displayRun.status === "aborted"
                    ? "bg-amber-500"
                    : displayRun.status === "interrupted"
                    ? "bg-purple-500"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min(100, Math.round((displayRun.currentStep / displayRun.totalSteps) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Generated Artifacts Box */}
          {Object.keys(displayRun.artifacts || {}).length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap gap-2.5 items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verifiable Artifacts:
              </span>
              {displayRun.artifacts.orderId && (
                <a
                  href={`/app/orders/${displayRun.artifacts.orderId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-2xs transition-all"
                >
                  Order #{displayRun.artifacts.displayId || displayRun.artifacts.orderId.slice(-6)} ↗
                </a>
              )}
              {displayRun.artifacts.trackingNumber && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-mono font-medium text-emerald-700 border border-emerald-200 shadow-2xs">
                  J&T: {displayRun.artifacts.trackingNumber}
                </span>
              )}
              {displayRun.artifacts.protocolToken && (
                <a
                  href={`http://localhost:8000/ph/research-protocol-access/${displayRun.artifacts.protocolToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 shadow-2xs transition-all"
                >
                  Protocol Monograph Token ↗
                </a>
              )}
              {displayRun.artifacts.paymentReference && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-mono text-slate-600 border border-slate-200 shadow-2xs">
                  Ref: {displayRun.artifacts.paymentReference}
                </span>
              )}
              {displayRun.artifacts.scannedProductsCount !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs">
                  Products: {displayRun.artifacts.scannedProductsCount} ({displayRun.artifacts.scannedVariantsCount} Variants)
                </span>
              )}
              {displayRun.artifacts.bomProfilesCount !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200 shadow-2xs">
                  BOM Profiles: {displayRun.artifacts.bomProfilesCount}
                </span>
              )}
              {displayRun.artifacts.pendingProofsCount !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200 shadow-2xs">
                  Pending Proofs: {displayRun.artifacts.pendingProofsCount}
                </span>
              )}
              {displayRun.artifacts.totalSettledVolume !== undefined && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs">
                  Settled Volume: ₱{displayRun.artifacts.totalSettledVolume.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Live Monospace Terminal Log Streamer */}
          <div
            ref={logTerminalRef}
            className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 max-h-[320px] overflow-y-auto border border-slate-800 shadow-inner flex flex-col gap-1.5"
          >
            {displayRun.logs.length === 0 ? (
              <span className="text-slate-500 italic">No logs recorded yet. Waiting for worker step...</span>
            ) : (
              displayRun.logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 select-none text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      log.status === "success"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : log.status === "running"
                        ? "bg-blue-950 text-blue-400 border border-blue-800 animate-pulse"
                        : log.status === "error"
                        ? "bg-rose-950 text-rose-400 border border-rose-800"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    STEP {log.step}
                  </span>
                  <span className="font-semibold text-slate-100">{log.title}:</span>
                  <span className="text-slate-300">{log.message}</span>
                  {log.durationMs ? (
                    <span className="text-slate-500 text-[10px] ml-auto font-mono">
                      {log.durationMs}ms
                    </span>
                  ) : null}
                </div>
              ))
            )}

            {displayRun.errorMessage && (
              <div className="mt-2 p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold">
                [ERROR] {displayRun.errorMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mission Run History Table ── */}
      <Container className="p-0 overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-sm font-bold text-slate-900">
              Recent Autonomous Agent Runs
            </Heading>
            <Text className="text-xs text-slate-500">
              Audit log of background smoke tests, cold-chain dispatches, and verification benchmarks.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge size="small" color="grey" className="font-mono text-xs">
              {runs.length} Runs Logged
            </Badge>
            {runs.length > 0 && (
              <Button
                size="small"
                variant="secondary"
                onClick={() => clearHistoryMutation.mutate()}
                isLoading={clearHistoryMutation.isPending}
                className="h-6 text-[11px] px-2 text-slate-500 hover:text-rose-600 bg-white border-slate-200"
              >
                Clear History
              </Button>
            )}
          </div>
        </div>

        {runs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No previous bot runs found. Launch a mission above to start.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {runs.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRunId(r.id)}
                className={`flex items-center justify-between p-3.5 px-4 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                  displayRun?.id === r.id ? "bg-blue-50/60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {r.status === "completed" ? (
                    <CheckCircleSolid className="size-4 text-emerald-600" />
                  ) : r.status === "running" ? (
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse ml-1 mr-1" />
                  ) : r.status === "aborted" ? (
                    <CircleWarningSolid className="size-4 text-amber-500" />
                  ) : r.status === "interrupted" ? (
                    <CircleWarningSolid className="size-4 text-purple-500" />
                  ) : (
                    <CircleXmarkSolid className="size-4 text-rose-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{r.title}</span>
                      <span className="font-mono text-[11px] text-slate-400">({r.id})</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(r.startedAt).toLocaleString()} · {r.currentStep}/{r.totalSteps} steps
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {r.artifacts.displayId && (
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Order #{r.artifacts.displayId}
                    </span>
                  )}
                  {r.durationMs ? (
                    <span className="text-slate-500 font-mono text-[11px]">
                      {(r.durationMs / 1000).toFixed(1)}s
                    </span>
                  ) : null}
                  <StatusBadge
                    color={
                      r.status === "completed"
                        ? "green"
                        : r.status === "running"
                        ? "blue"
                        : r.status === "aborted"
                        ? "orange"
                        : r.status === "interrupted"
                        ? "purple"
                        : "red"
                    }
                  >
                    {r.status.toUpperCase()}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bot Mission Control",
  icon: Bolt,
})

export default BotLabPage
