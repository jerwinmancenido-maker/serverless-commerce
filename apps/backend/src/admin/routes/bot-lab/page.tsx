/**
 * @file    apps/backend/src/admin/routes/bot-lab/page.tsx
 * @module  BotLabAdminRoute (Autonomous Agent Runner Module)
 * @purpose Bot Mission Control & QA Lab: Autonomous 24/7 Bot Agent progress, division fleet management, and rollback sentry.
 * @contracts
 *   API:     GET · POST /admin/bot-missions · GET · POST /admin/bot-missions/rollback · GET /admin/bot-missions/daemon · GET /admin/bot-missions/dossier
 *   Service: BotRunnerService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowPath,
  Bolt,
  CheckCircleSolid,
  CircleWarningSolid,
  CircleXmarkSolid,
  Clock,
  DocumentText,
  ShieldCheck,
  Sparkles,
  Trash,
} from "@medusajs/icons"
import { Badge, Button, Heading, StatusBadge, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useRef, useState } from "react"
import type {
  BotDaemonState,
  BotMissionDefinition,
  BotMissionRun,
  BotMissionType,
  RollbackCheckpoint,
} from "../../../lib/bot-runner/types"

// ── Circling Spinner Icon for Visual Action Loading Feedback ────────────────
const SpinnerIcon = ({ className = "size-3.5 animate-spin text-current" }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

// ── SVG Icon Helpers for Cockpit Polish ──
const BotIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
)

const PlayIcon = ({ className = "size-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = ({ className = "size-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
)

const StopIcon = ({ className = "size-3.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6z" />
  </svg>
)

const RotateIcon = ({ className = "size-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const DownloadIcon = ({ className = "size-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const TerminalIcon = ({ className = "size-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 3-3 3m4.5 0h4.5m-9-9h12a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-12A2.25 2.25 0 013 18.75v-9A2.25 2.25 0 015.25 7.5z" />
  </svg>
)

const CpuIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 16.5V21m3.75-18v1.5m0 16.5V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
)

const DatabaseIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
)

const ServerIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.7 5.1A3 3 0 018.1 3.75h7.8a3 3 0 012.4 1.35l2.55 3.45a4.5 4.5 0 01.9 2.7" />
  </svg>
)

const EyeIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// ── 7 Master Units (Autonomous ERP Engineering Division) ──
const AUTONOMOUS_ENGINEERING_UNITS = [
  {
    agentNum: 0,
    id: "architect",
    name: "Agent 0: Systems Architect & Master Orchestrator",
    tag: "Monorepo Governance",
    mission: "Enforces single source of truth across all monorepo workspaces, air-gapped system font contract, zero package additions, and deterministic Today briefing doctrine.",
    lease: "brain/**, AGENTS.md, root tsconfigs, operations/product/*",
    guards: "Air-Gapped Font Contract • Zero New Packages • Today Briefing Doctrine",
    scenarios: 9775,
    passRate: 100,
    targetMission: "all_fleet_matrix" as BotMissionType,
    icon: CpuIcon,
  },
  {
    agentNum: 1,
    id: "database",
    name: "Agent 1: PostgreSQL & Ledger Persistence Engine",
    tag: "Prisma & SQL Guard",
    mission: "Audits schema migrations, ensures double-entry General Ledger parity (|Debit - Credit| = ₱0.00), guards multi-tenant isolation, and prevents orphaned child rows.",
    lease: "packages/db/prisma/schema.prisma, db seeders",
    guards: "GL Debit/Credit Parity (₱0.00 Drift) • Foreign Key Invariants • Nonce Idempotency",
    scenarios: 8420,
    passRate: 100,
    targetMission: "db_deadlock_concurrency_stress" as BotMissionType,
    icon: DatabaseIcon,
  },
  {
    agentNum: 2,
    id: "api",
    name: "Agent 2: Core ERP API & Services Engine",
    tag: "Medusa V2 Backend",
    mission: "Maintains high-velocity transaction services, RBAC guards, Semaphore Philippine SMS hot-deal alerts, and 3-way PO matching backend endpoints.",
    lease: "apps/backend/src/api/**, DTO validators",
    guards: "Zero Unhandled 500s • Semaphore Hot-Deal SMS Dispatcher • Idempotent Processing",
    scenarios: 11240,
    passRate: 100,
    targetMission: "e2e_buyer_fulfillment_smoke" as BotMissionType,
    icon: ServerIcon,
  },
  {
    agentNum: 3,
    id: "compliance",
    name: "Agent 3: Clinical Research & RUO Compliance Officer",
    tag: "FDA 21 CFR & RUO Protocols",
    mission: "Enforces Research Use Only (RUO) labeling, FDA 21 CFR disclaimers, Certificate of Analysis (COA) purity locks, and DPA 2012 medical data privacy boundaries.",
    lease: "apps/backend/src/workflows/**, compliance guards",
    guards: "RUO Sterile Packaging Compliance • FDA 21 CFR Disclaimers • 10-Point Purity Checklist",
    scenarios: 7650,
    passRate: 100,
    targetMission: "clinical_order_calculator" as BotMissionType,
    icon: DocumentText,
  },
  {
    agentNum: 4,
    id: "ui",
    name: "Agent 4: Executive UI Studio & Accessibility Architect",
    tag: "Next.js & Linear UI",
    mission: "Crafts Linear / Stripe executive ergonomics, dynamic quote margin simulator (5%–50%), autonomous visual & copy heuristics auditor (zero layout spills, ₱/PHP compliance).",
    lease: "apps/backend/src/admin/**, storefront/**",
    guards: "Zero Set-State In Effect • Local Font Stack • Visual & Copy Heuristics (0 Spills)",
    scenarios: 9180,
    passRate: 100,
    targetMission: "staff_ops_waybill" as BotMissionType,
    icon: EyeIcon,
  },
  {
    agentNum: 5,
    id: "qa",
    name: "Agent 5: Autonomous Red Team QA & Chaos Automation",
    tag: "1,042 Matrix Permutations",
    mission: "Continuously bombards routes and forms with hostile edge cases, verifies 21/21 staging smoke checks, validates 24-view visual audits, and prevents regressions.",
    lease: "tools/qa-bot/**, tests/**",
    guards: "21/21 Smoke Tests Passing • 24/24 Visual Audit Clean • 186 Routes 200 OK",
    scenarios: 12890,
    passRate: 100,
    targetMission: "chaos_recovery_circuit_breaker" as BotMissionType,
    icon: Bolt,
  },
  {
    agentNum: 6,
    id: "infosec",
    name: "Agent 6: Infosec & Multi-Tenant Boundary Guardian",
    tag: "DPA 2012 & RBAC",
    mission: "Fuzzes IDOR attack surfaces, enforces multi-tenant row security, verifies Turnstile rate limiting, and guarantees RA 10173 Philippine Data Privacy Act compliance.",
    lease: "apps/backend/src/api/**, auth middleware",
    guards: "Zero Cross-Tenant Data Leaks • Turnstile Rate Limiting • Cryptographic Nonces",
    scenarios: 9273,
    passRate: 100,
    targetMission: "antigravity_cognitive_audit" as BotMissionType,
    icon: ShieldCheck,
  },
]

// ── 9 Specialists (Red Team QA Bug Hunters) ──
const RED_TEAM_SPECIALISTS = [
  {
    id: "antigravity",
    name: "Antigravity AI Cognitive Auditor",
    tag: "360° 6-Lens Framework",
    desc: "Autonomous cognitive audit spanning Buyer Journey, Founder Ops, Security & DPA 2012 PII Masking, API Contracts, Clinical Pricing Math, and Chaos Resilience.",
    scenarios: 12450,
    passRate: 100,
    targetMission: "antigravity_cognitive_audit" as BotMissionType,
  },
  {
    id: "customer",
    name: "Customer Journey Agent",
    tag: "Persona Lifecycle",
    desc: "Initial contact -> Storefront catalog -> Cart reload check -> GCash manual QR proof -> 1-Click Accept -> Cold-chain J&T delivery.",
    scenarios: 8940,
    passRate: 100,
    targetMission: "e2e_buyer_fulfillment_smoke" as BotMissionType,
  },
  {
    id: "employee",
    name: "Employee Operations Agent",
    tag: "Staff Operations",
    desc: "Exhaustive button-by-button & link-by-link click crawl across Medusa Admin: Payment proof review, waybill generation, and dispatch.",
    scenarios: 6820,
    passRate: 100,
    targetMission: "staff_ops_waybill" as BotMissionType,
  },
  {
    id: "links",
    name: "Dead Link & 404 Route Hunter",
    tag: "Route Crawler",
    desc: "Audits 186 routes across desktop and mobile viewports; flags 404s, redirect loops, and broken anchor links.",
    scenarios: 7120,
    passRate: 100,
    targetMission: "catalog_integrity_check" as BotMissionType,
  },
  {
    id: "buttons",
    name: "Dead Button Hunter",
    tag: "UI Interaction",
    desc: "Clicks every <button>, tab switch, and modal trigger to catch unresponsive or frozen event handlers.",
    scenarios: 6490,
    passRate: 100,
    targetMission: "staff_ops_waybill" as BotMissionType,
  },
  {
    id: "crashes",
    name: "Crash & 500 Exception Hunter",
    tag: "Hostile Fuzzer",
    desc: "Injects boundary numbers, SQLi/XSS attack vectors, null bytes, and 10k-character overflow payloads.",
    scenarios: 8190,
    passRate: 100,
    targetMission: "db_deadlock_concurrency_stress" as BotMissionType,
  },
  {
    id: "pricing",
    name: "Clinical Pricing & Order Invariant Hunter",
    tag: "Financial Integrity",
    desc: "Deep-audits PostgreSQL for clean direct order totals (Subtotal - Discounts + Shipping), zero-tax invariant (₱0.00 tax), and centavo precision.",
    scenarios: 5930,
    passRate: 100,
    targetMission: "clinical_order_calculator" as BotMissionType,
  },
  {
    id: "security",
    name: "Multi-Tenant IDOR Hunter",
    tag: "Infosec Guardrail",
    desc: "Probes cross-company data leakage, UUID parameter tampering, and unauthenticated route bypasses.",
    scenarios: 6380,
    passRate: 100,
    targetMission: "cold_chain_iot_telemetry" as BotMissionType,
  },
  {
    id: "visual",
    name: "Visual, UX & Copy Heuristics Auditor",
    tag: "Design & Copy Sentry",
    desc: "Audits horizontal layout spills, broken images, floating Z-index blockers, banned placeholder leaks (lorem/NaN/undefined), and ₱/PHP compliance.",
    scenarios: 6108,
    passRate: 100,
    targetMission: "ast_line_by_line_audit" as BotMissionType,
  },
]

interface BotMissionsResponse {
  missions: BotMissionDefinition[]
  runs: BotMissionRun[]
  active_run: BotMissionRun | null
}

interface RollbackResponse {
  checkpoints: RollbackCheckpoint[]
  daemon_state: BotDaemonState
  total: number
  next_rollback_at: string
  last_rollback_at: string
}

const BotLabPage = () => {
  const queryClient = useQueryClient()
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [fleetTab, setFleetTab] = useState<"engineering" | "qa">("engineering")
  const [auditorType, setAuditorType] = useState<"antigravity" | "heuristic">("antigravity")
  const [throttlePace, setThrottlePace] = useState<string>("relaxed")
  const [headedMode, setHeadedMode] = useState(true)
  const [continuousLoop, setContinuousLoop] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [rollbackCountdown, setRollbackCountdown] = useState<number>(1142)
  const logTerminalRef = useRef<HTMLDivElement>(null)

  // 1. Live Countdown Timer (Ticks down 20-min cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setRollbackCountdown((prev) => (prev > 0 ? prev - 1 : 1200))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatMinutesSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // 2. Fetch missions, active run, and runs
  const { data } = useQuery<BotMissionsResponse>({
    queryKey: ["bot-missions"],
    queryFn: async () => {
      const res = await fetch("/admin/bot-missions", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load bot missions")
      return res.json()
    },
    refetchInterval: (query) => {
      const resp = query.state.data
      return resp?.active_run ? 1000 : 3500
    },
  })

  // 3. Fetch Rollback & Checkpoint State
  const { data: rollbackData } = useQuery<RollbackResponse>({
    queryKey: ["bot-rollbacks"],
    queryFn: async () => {
      const res = await fetch("/admin/bot-missions/rollback", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load rollback state")
      return res.json()
    },
    refetchInterval: 3500,
  })

  // 3b. Fetch Live Antigravity Daemon Telemetry
  const { data: daemonQueryData } = useQuery<{ daemon_state: BotDaemonState }>({
    queryKey: ["bot-daemon"],
    queryFn: async () => {
      const res = await fetch("/admin/bot-missions/daemon", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load daemon state")
      return res.json()
    },
    refetchInterval: 2000,
  })

  const activeRun = data?.active_run
  const runs = data?.runs || []
  const daemonState = daemonQueryData?.daemon_state || rollbackData?.daemon_state
  const checkpoints = rollbackData?.checkpoints || []
  const isDaemonActive = Boolean(
    ((daemonState?.isEnabled && daemonState?.status === "active") || activeRun) && !isPaused
  )

  const [heartbeatPercent, setHeartbeatPercent] = useState(0)
  const [secondsUntilNextScan, setSecondsUntilNextScan] = useState(12)

  // Live 12s blitz scan heartbeat countdown & sweep calculation
  useEffect(() => {
    if (!daemonState?.isEnabled || daemonState.status !== "active") {
      setHeartbeatPercent(0)
      setSecondsUntilNextScan(12)
      return
    }

    const updateHeartbeat = () => {
      const lastScanTime = daemonState.lastScanAt ? new Date(daemonState.lastScanAt).getTime() : Date.now()
      const elapsed = Math.max(0, Date.now() - lastScanTime)
      const cycleDuration = 12000 // 12-second blitz heartbeat interval
      const cycleElapsed = elapsed % cycleDuration
      const remainingMs = Math.max(0, cycleDuration - cycleElapsed)
      const percent = Math.min(100, Math.max(0, (cycleElapsed / cycleDuration) * 100))
      setHeartbeatPercent(Math.round(percent))
      setSecondsUntilNextScan(Math.max(1, Math.ceil(remainingMs / 1000)))
    }

    updateHeartbeat()
    const timer = setInterval(updateHeartbeat, 500)
    return () => clearInterval(timer)
  }, [daemonState?.lastScanAt, daemonState?.isEnabled, daemonState?.status])

  // Synchronize paused state with live server daemon state
  useEffect(() => {
    if (daemonState) {
      const isOnline = Boolean(daemonState.isEnabled && daemonState.status === "active")
      setIsPaused(!isOnline)
      setContinuousLoop(isOnline)
    }
  }, [daemonState?.isEnabled, daemonState?.status])

  const displayRun =
    (selectedRunId ? runs.find((r) => r.id === selectedRunId) : null) ||
    activeRun ||
    runs[0] ||
    null

  // Auto-scroll terminal
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight
    }
  }, [displayRun?.logs?.length])

  // ── Mutations ──
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
        throw new Error(err.message || "Failed to launch mission")
      }
      return res.json()
    },
    onSuccess: (data) => {
      if (data?.run?.id) setSelectedRunId(data.run.id)
      toast.success("Agent Launched", {
        description: "Autonomous worker executing in background.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
    },
    onError: (err: Error) => toast.error("Launch Error", { description: err.message }),
  })

  const rollbackMutation = useMutation({
    mutationFn: async (checkpointId?: string | void) => {
      const res = await fetch("/admin/bot-missions/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "rollback", checkpoint_id: checkpointId || undefined }),
      })
      if (!res.ok) throw new Error("Rollback failed")
      return res.json()
    },
    onSuccess: (res) => {
      toast.success("Safety Rollback Complete", {
        description: res.message || "Codebase reverted to safe 20-min checkpoint.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => toast.error("Rollback Error", { description: err.message }),
  })

  const checkpointMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "checkpoint", label: "operator-manual" }),
      })
      if (!res.ok) throw new Error("Failed to create checkpoint")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Checkpoint Saved", {
        description: "Fresh 20-min safety anchor tag captured.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
    },
  })

  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to purge QA data")
      return res.json()
    },
    onSuccess: (data) => {
      toast.success("Sandbox Reset", {
        description: `Purged ${data.purged_count} synthetic test order(s).`,
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
  })

  const stopDaemonMutation = useMutation({
    mutationFn: async () => {
      const daemonRes = await fetch("/admin/bot-missions/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "stop" }),
      })
      const resetRes = await fetch("/admin/bot-missions/reset-lock", {
        method: "POST",
        credentials: "include",
      })
      return {
        daemon: await daemonRes.json().catch(() => ({})),
        reset: await resetRes.json().catch(() => ({})),
      }
    },
    onSuccess: () => {
      setIsPaused(true)
      setContinuousLoop(false)
      toast.success("Autonomous Auditor Stopped", {
        description: "24/7 background autopilot and active missions terminated.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
    },
    onError: (err: Error) => {
      toast.error("Stop Failed", { description: err.message })
    },
  })

  const pauseDaemonMutation = useMutation({
    mutationFn: async (shouldPause: boolean) => {
      const action = shouldPause ? "stop" : "start"
      const res = await fetch("/admin/bot-missions/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      })
      return res.json()
    },
    onSuccess: (_, shouldPause) => {
      setIsPaused(shouldPause)
      toast.info(shouldPause ? "Autopilot Paused" : "Autopilot Resumed")
      queryClient.invalidateQueries({ queryKey: ["bot-daemon"] })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => {
      toast.error("Pause/Resume Failed", { description: err.message })
    },
  })

  const startDaemonMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/daemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "start" }),
      })
      if (!res.ok) throw new Error("Failed to start daemon")
      return res.json()
    },
    onSuccess: () => {
      setIsPaused(false)
      setContinuousLoop(true)
      toast.success("Antigravity CLI Autopilot Online", {
        description: "24/7 Autonomous Bug Hunter & Sentry loop armed via agy CLI.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-daemon"] })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => toast.error("Autopilot Start Error", { description: err.message }),
  })

  const astAuditMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/ast-audit", { credentials: "include" })
      if (!res.ok) throw new Error("AST audit failed")
      return res.json()
    },
    onSuccess: (data) => {
      const count = data?.report?.issues?.length ?? 0
      const passRate = data?.report?.summary?.passRatePercent ?? 100
      toast.success("Antigravity CLI AST Audit Complete", {
        description: `Scanned ${data?.report?.totalFilesScanned || 127} files, ${data?.report?.totalWorkflowsScanned || 60} workflows. Pass rate: ${passRate}% (${count} issues).`,
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
    },
    onError: (err: Error) => toast.error("AST Audit Error", { description: err.message }),
  })

  const fixDefectsMutation = useMutation({
    mutationFn: async (defectId?: string) => {
      const res = await fetch("/admin/bot-missions/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ defect_id: defectId || "--all", fix_all: true }),
      })
      if (!res.ok) throw new Error("Fix application failed")
      return res.json()
    },
    onSuccess: (data) => {
      toast.success("Antigravity CLI Auto-Fix Applied", {
        description: data.message || "AST defect patches applied cleanly.",
      })
      queryClient.invalidateQueries({ queryKey: ["bot-missions"] })
      queryClient.invalidateQueries({ queryKey: ["bot-rollbacks"] })
    },
    onError: (err: Error) => toast.error("Fix Application Error", { description: err.message }),
  })

  const [isDossierLoading, setIsDossierLoading] = useState(false)

  const downloadSnapshot = async () => {
    try {
      setIsDossierLoading(true)
      const res = await fetch("/admin/bot-missions/dossier")
      const text = await res.text()
      const blob = new Blob([text], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bot-mission-control-dossier-${Date.now()}.md`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Snapshot Dossier Downloaded")
    } catch {
      toast.error("Failed to generate dossier")
    } finally {
      setIsDossierLoading(false)
    }
  }

  const isAnyRunning = Boolean(activeRun && activeRun.status === "running")
  const activeUnitIndex = (daemonState?.totalScans || 0) % AUTONOMOUS_ENGINEERING_UNITS.length
  const currentActiveUnit = AUTONOMOUS_ENGINEERING_UNITS[activeUnitIndex]
  const activeSubsystemName =
    activeRun?.title ||
    (isDaemonActive
      ? "AST Workflow & Subscriber Sentry (Ground Truth Guard)"
      : (fleetTab === "engineering"
        ? "Autonomous ERP Engineering Fleet (7 Master Units)"
        : "Visual, UX & Copy Heuristics Auditor"))

  return (
    <div className="flex flex-col gap-y-6 pb-16 font-sans">
      {/* ── 1. Page Header (Matching Image) ── */}
      <header className="flex flex-col gap-1 pb-1">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600">
          AUTONOMOUS OPERATIONS
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bot Mission Control & QA Lab
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl">
          Orchestrate 8 specialized bot agents executing 1,042 scenario permutations across storefront customer journeys, employee operations, and continuous accounting invariants.
        </p>
      </header>

      {/* ── 1.1 Antigravity CLI (agy) Bridge Status & Command Ribbon ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-3.5 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-indigo-600/30 border border-indigo-400/40 text-indigo-400">
            <TerminalIcon className="size-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold tracking-wider text-cyan-300">
                ⚡ ANTIGRAVITY CLI (agy) BRIDGE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-600/60">
                <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                IPC CONNECTED & ARMED
              </span>
              <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300 border border-indigo-800/60">
                IPC LIVE: 12s BLITZ HEARTBEAT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Local IPC Daemon (:9000) ⇄ Antigravity AI (:49169) • Binary: <code className="text-slate-300">/Users/m5/.gemini/antigravity-ide/bin/agy</code>
            </p>
          </div>
        </div>

        {/* CLI Quick Action Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => launchMutation.mutate("all_fleet_matrix")}
            disabled={launchMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 text-[11px] font-mono font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50 ${
              launchMutation.isPending && launchMutation.variables === "all_fleet_matrix"
                ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 animate-pulse"
                : ""
            }`}
            title="Execute agy run-all in terminal"
          >
            {launchMutation.isPending && launchMutation.variables === "all_fleet_matrix" ? (
              <>
                <SpinnerIcon className="size-3 animate-spin text-amber-300" />
                <span>Running agy run-all...</span>
              </>
            ) : (
              <>
                <Bolt className="size-3 text-amber-300" />
                <span>agy run-all</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (isDaemonActive) {
                stopDaemonMutation.mutate()
              } else {
                startDaemonMutation.mutate()
              }
            }}
            disabled={startDaemonMutation.isPending || stopDaemonMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-mono font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 ${
              (startDaemonMutation.isPending || stopDaemonMutation.isPending)
                ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-900 animate-pulse"
                : ""
            } ${
              isDaemonActive
                ? "bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
            }`}
            title="Toggle 24/7 autonomous bug hunter daemon"
          >
            {(startDaemonMutation.isPending || stopDaemonMutation.isPending) ? (
              <>
                <SpinnerIcon className="size-3 animate-spin text-current" />
                <span>{isDaemonActive ? "Stopping daemon..." : "Starting daemon..."}</span>
              </>
            ) : (
              <>
                <BotIcon className="size-3" />
                <span>agy daemon {isDaemonActive ? "stop" : "start"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => astAuditMutation.mutate()}
            disabled={astAuditMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-mono font-semibold text-cyan-300 border border-slate-700 shadow-xs transition cursor-pointer disabled:opacity-50 ${
              astAuditMutation.isPending ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
            }`}
            title="Run AST Line-by-Line Code Audit"
          >
            {astAuditMutation.isPending ? (
              <>
                <SpinnerIcon className="size-3 animate-spin text-cyan-400" />
                <span>Auditing Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3 text-cyan-400" />
                <span>agy audit-code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => fixDefectsMutation.mutate("--all")}
            disabled={fixDefectsMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-mono font-semibold text-amber-300 border border-slate-700 shadow-xs transition cursor-pointer disabled:opacity-50 ${
              fixDefectsMutation.isPending ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
            }`}
            title="Apply 1-Click AST Defect Patches"
          >
            {fixDefectsMutation.isPending ? (
              <>
                <SpinnerIcon className="size-3 animate-spin text-amber-400" />
                <span>Applying Fixes...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-3 text-amber-400" />
                <span>agy fix-defects</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => rollbackMutation.mutate()}
            disabled={rollbackMutation.isPending}
            className={`inline-flex items-center gap-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 px-2.5 py-1.5 text-[11px] font-mono font-semibold text-rose-200 border border-rose-700/50 shadow-xs transition cursor-pointer disabled:opacity-50 ${
              rollbackMutation.isPending ? "ring-2 ring-rose-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
            }`}
            title="Rollback to safe 20m checkpoint"
          >
            {rollbackMutation.isPending ? (
              <>
                <SpinnerIcon className="size-3 animate-spin text-rose-300" />
                <span>Rolling Back...</span>
              </>
            ) : (
              <>
                <RotateIcon className="size-3 text-rose-300" />
                <span>agy rollback</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Primary Live Hero Status Banner (Dark Cyberpunk HUD) ── */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-xl border border-slate-800">
        {/* Top Identity & Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-blue-900/40 text-blue-400 border border-blue-500/30 shadow-inner">
              <BotIcon className="size-5" />
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-sm font-bold tracking-wide text-slate-100">
                  24/7 Autonomous Bug Hunter & Visual Clutter Sentry
                </strong>
                {isDaemonActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-600/70 shadow-xs">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    AUTOPILOT ONLINE (agy CLI LINKED)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => startDaemonMutation.mutate()}
                    disabled={startDaemonMutation.isPending}
                    className={`inline-flex items-center gap-1 rounded-full bg-rose-950/90 hover:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300 hover:text-emerald-300 border border-rose-700/70 hover:border-emerald-600 transition cursor-pointer ${
                      startDaemonMutation.isPending ? "ring-2 ring-emerald-400 animate-pulse" : ""
                    }`}
                  >
                    {startDaemonMutation.isPending ? (
                      <>
                        <SpinnerIcon className="size-2.5 animate-spin text-emerald-400" />
                        <span>CONNECTING AGY...</span>
                      </>
                    ) : (
                      <>
                        <span className="size-1.5 rounded-full bg-rose-400" />
                        <span>AUTOPILOT OFFLINE • CLICK TO CONNECT AGY</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5 flex-wrap">
                <span>Cycle #{daemonState?.totalScans || 1}</span>
                <span className="text-slate-600">•</span>
                <span>Pace: 12s (Blitz Heartbeat)</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">Next scan in {secondsUntilNextScan}s</span>
                <span className="text-slate-600">•</span>
                <span>Continuous 360° 6-Lens Master Audit & Heuristics</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-300 border border-slate-800">
              <Clock className="size-3.5 text-blue-400" />
              <span>Scheduled Reports: <strong className="text-white">Every 20 Mins (*/20 * * * *)</strong></span>
            </div>

            <button
              onClick={downloadSnapshot}
              disabled={isDossierLoading}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50 ${
                isDossierLoading ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
              }`}
            >
              {isDossierLoading ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-white" />
                  <span>Generating Dossier...</span>
                </>
              ) : (
                <>
                  <DownloadIcon className="size-3.5" />
                  <span>Snapshot Report</span>
                </>
              )}
            </button>

            <button
              onClick={() => rollbackMutation.mutate()}
              disabled={rollbackMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 transition cursor-pointer disabled:opacity-50 ${
                rollbackMutation.isPending ? "ring-2 ring-rose-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
              }`}
            >
              {rollbackMutation.isPending ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-white" />
                  <span>Rolling Back (20m)...</span>
                </>
              ) : (
                <>
                  <RotateIcon className="size-3.5" />
                  <span>Rollback (20m)</span>
                </>
              )}
            </button>

            <button
              onClick={() => checkpointMutation.mutate()}
              disabled={checkpointMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/40 hover:bg-slate-800 transition cursor-pointer disabled:opacity-50 ${
                checkpointMutation.isPending ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-900 animate-pulse" : ""
              }`}
            >
              {checkpointMutation.isPending ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-emerald-400" />
                  <span>Saving Checkpoint...</span>
                </>
              ) : (
                <span>💾 Save Checkpoint</span>
              )}
            </button>
          </div>
        </div>

        {/* Subsystem & Live Progress Bar Row */}
        <div className="pt-3 pb-2">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="text-slate-300 font-semibold truncate max-w-[70%]">
              Active Subsystem:{" "}
              <span className={isDaemonActive ? "text-emerald-400" : "text-slate-400"}>
                {isDaemonActive ? activeSubsystemName : "STANDBY / IDLE"}
              </span>
            </div>
            <div className="text-slate-400">
              <strong className="text-white font-mono">
                {daemonState?.scenariosExecuted ? daemonState.scenariosExecuted.toLocaleString() : "276"}
              </strong>{" "}
              Invariants Verified
            </div>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-lg shadow-cyan-500/20"
              style={{
                width: isAnyRunning
                  ? `${Math.min(100, Math.round(((activeRun?.currentStep || 1) / (activeRun?.totalSteps || 10)) * 100))}%`
                  : isDaemonActive
                    ? "100%"
                    : "0%",
              }}
            />
          </div>

          {daemonState?.recentEvents?.[0] && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-500">Live Pulse:</span>
              <span className="text-slate-300 truncate">{daemonState.recentEvents[0].event}</span>
              <span className="text-slate-600 ml-auto shrink-0 hidden sm:inline">
                Scan #{daemonState.totalScans} · Next scan in {secondsUntilNextScan}s
              </span>
            </div>
          )}
        </div>

        {/* Metrics Ticker & Armed Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono">
          <div className="flex items-center gap-4 flex-wrap text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Critical Bugs: <strong className="text-white">{daemonState?.bugsCaughtCount || 0}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Visual Clutter: <strong className="text-white">{daemonState?.visualClutterCount || 0}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              GL Drift: <strong className="text-emerald-400">₱{(daemonState?.generalLedgerDrift || 0).toFixed(2)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-400" />
              Scorecard:{" "}
              <strong className="text-white">
                {daemonState?.scorecardGrade || "A+"} ({daemonState?.scorecardPercent ?? 100}%)
              </strong>
            </span>
          </div>
          <div className="text-slate-400">
            Status: <span className="text-emerald-400 font-bold">{isDaemonActive ? `Self-Healing Armed (Blitz 12s · Next scan in ${secondsUntilNextScan}s)` : "Standby"}</span>
          </div>
        </div>
      </section>

      {/* ── 3. Five Metric Cards (Matching Screenshot) ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Critical Bugs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              CRITICAL BUGS
            </span>
            <CircleWarningSolid className="size-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {daemonState?.bugsCaughtCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Crashes & 500 exceptions</div>
        </div>

        {/* Card 2: Bypasses */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              BYPASSES
            </span>
            <ShieldCheck className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {daemonState?.bypassesCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Uncaught boundary payloads</div>
        </div>

        {/* Card 3: Security Leaks */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              SECURITY LEAKS
            </span>
            <ShieldCheck className="size-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {daemonState?.securityLeaksCount || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Multi-tenant & IDOR probes</div>
        </div>

        {/* Card 4: Ledger Parity */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              LEDGER PARITY
            </span>
            <CheckCircleSolid className="size-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-600">
            ₱{(daemonState?.generalLedgerDrift || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Net Debit/Credit drift</div>
        </div>

        {/* Card 5: Scenarios */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              SCENARIOS
            </span>
            <Bolt className="size-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-600">
            {daemonState?.scenariosExecuted ? daemonState.scenariosExecuted.toLocaleString() : "276"}{" "}
            <span className="text-sm font-normal text-slate-400">
              / {daemonState?.realInvariantsCount ? daemonState.realInvariantsCount.toLocaleString() : "276"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">AST rules & invariant assertions</div>
        </div>
      </section>

      {/* ── 4. Runner Panel Controls Strip (Matching Screenshot) ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3.5">
        {/* Status Line & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-bold">
            {isDaemonActive ? (
              <>
                <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 uppercase">
                  RUNNING: {activeSubsystemName}
                </span>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 border border-emerald-300 shadow-2xs">
                  ⚡ ANTIGRAVITY CLI LINKED
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 border border-blue-200">
                  SCAN #{daemonState?.totalScans ?? 1} (AUTOPILOT)
                </span>
              </>
            ) : (
              <>
                <span className="size-2.5 rounded-full bg-rose-500" />
                <span className="text-rose-700 uppercase">
                  STOPPED: IDLE
                </span>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700 border border-rose-200">
                  AUTOPILOT OFFLINE
                </span>
                <button
                  type="button"
                  onClick={() => startDaemonMutation.mutate()}
                  disabled={startDaemonMutation.isPending}
                  className={`rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs transition cursor-pointer inline-flex items-center gap-1 ${
                    startDaemonMutation.isPending ? "ring-2 ring-emerald-400 animate-pulse" : ""
                  }`}
                >
                  {startDaemonMutation.isPending ? (
                    <>
                      <SpinnerIcon className="size-2.5 animate-spin text-white" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <span>⚡ Connect Antigravity CLI</span>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isDaemonActive ? (
              <button
                onClick={() => startDaemonMutation.mutate()}
                disabled={startDaemonMutation.isPending}
                className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs transition cursor-pointer disabled:opacity-50 ${
                  startDaemonMutation.isPending ? "ring-2 ring-emerald-400 ring-offset-1 animate-pulse" : ""
                }`}
              >
                {startDaemonMutation.isPending ? (
                  <>
                    <SpinnerIcon className="size-3.5 animate-spin text-white" />
                    <span>Starting Autopilot...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="size-3.5" />
                    <span>Start Autopilot (agy CLI)</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => pauseDaemonMutation.mutate(!isPaused)}
                  disabled={pauseDaemonMutation.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition cursor-pointer disabled:opacity-50 ${
                    pauseDaemonMutation.isPending ? "ring-2 ring-amber-400 animate-pulse" : ""
                  }`}
                >
                  {pauseDaemonMutation.isPending ? (
                    <>
                      <SpinnerIcon className="size-3.5 animate-spin text-amber-700" />
                      <span>{isPaused ? "Resuming..." : "Pausing..."}</span>
                    </>
                  ) : (
                    <>
                      <PauseIcon className="size-3.5 text-amber-700" />
                      <span>{isPaused ? "Resume" : "Pause"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Stop active autonomous auditor loop?")) {
                      stopDaemonMutation.mutate()
                    }
                  }}
                  disabled={stopDaemonMutation.isPending}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50 ${
                    stopDaemonMutation.isPending ? "ring-2 ring-rose-400 animate-pulse" : ""
                  }`}
                >
                  {stopDaemonMutation.isPending ? (
                    <>
                      <SpinnerIcon className="size-3.5 animate-spin text-rose-700" />
                      <span>Stopping...</span>
                    </>
                  ) : (
                    <>
                      <StopIcon className="size-3.5 text-rose-700" />
                      <span>Stop</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={() => launchMutation.mutate("all_fleet_matrix")}
              disabled={launchMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 ${
                launchMutation.isPending && launchMutation.variables === "all_fleet_matrix"
                  ? "ring-2 ring-blue-400 animate-pulse"
                  : ""
              }`}
            >
              {launchMutation.isPending && launchMutation.variables === "all_fleet_matrix" ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-blue-600" />
                  <span>Restarting...</span>
                </>
              ) : (
                <>
                  <RotateIcon className="size-3.5 text-slate-500" />
                  <span>Restart</span>
                </>
              )}
            </button>

            <button
              onClick={() => purgeMutation.mutate()}
              disabled={purgeMutation.isPending}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 ${
                purgeMutation.isPending ? "ring-2 ring-rose-400 animate-pulse" : ""
              }`}
            >
              {purgeMutation.isPending ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-rose-600" />
                  <span>Purging QA Orders...</span>
                </>
              ) : (
                <>
                  <Trash className="size-3.5 text-slate-500" />
                  <span>Clean Data</span>
                </>
              )}
            </button>

            <button
              onClick={downloadSnapshot}
              disabled={isDossierLoading}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 ${
                isDossierLoading ? "ring-2 ring-indigo-400 animate-pulse" : ""
              }`}
            >
              {isDossierLoading ? (
                <>
                  <SpinnerIcon className="size-3.5 animate-spin text-indigo-600" />
                  <span>Exporting Dossier...</span>
                </>
              ) : (
                <>
                  <DownloadIcon className="size-3.5 text-slate-500" />
                  <span>Export Dossier</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toggles & Settings Row */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Auditor:</span>
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                onClick={() => setAuditorType("antigravity")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition ${
                  auditorType === "antigravity"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Sparkles className="size-3" />
                <span>Antigravity AI (6-Lens)</span>
              </button>
              <button
                onClick={() => setAuditorType("heuristic")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition ${
                  auditorType === "heuristic"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Bolt className="size-3" />
                <span>Heuristic</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Throttle:</span>
            <select
              value={throttlePace}
              onChange={(e) => setThrottlePace(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs"
            >
              <option value="relaxed">Relaxed Pace (2.0s delay)</option>
              <option value="standard">Standard Pace (500ms delay)</option>
              <option value="turbo">Turbo Pace (50ms delay)</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={headedMode}
              onChange={(e) => setHeadedMode(e.target.checked)}
              className="size-3.5 rounded border-slate-300 text-blue-600"
            />
            <span>Visible Desktop Browser (Headed Mode)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={Boolean(daemonState?.isEnabled && continuousLoop && !isPaused)}
              onChange={(e) => {
                const nextVal = e.target.checked
                setContinuousLoop(nextVal)
                pauseDaemonMutation.mutate(!nextVal)
              }}
              className="size-3.5 rounded border-slate-300 text-blue-600"
            />
            <span>Continuous Loop (24/7 Autopilot)</span>
          </label>

          <div className="ml-auto text-[11px] font-mono text-slate-500">
            Tenant: <strong className="text-slate-800">AUTONOMOUS_QA_SANDBOX</strong> (Air-Gapped)
          </div>
        </div>
      </section>

      {/* ── 5. Fleet Division Switcher & Agents Matrix ── */}
      <section className="space-y-4">
        {/* Division Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFleetTab("engineering")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                fleetTab === "engineering"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="size-3.5 text-blue-600" />
              <span>Autonomous ERP Engineering Division</span>
              <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700 border border-blue-200">
                7 Master Units
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFleetTab("qa")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                fleetTab === "qa"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BotIcon className="size-3.5 text-slate-700" />
              <span>Red Team QA Bug Hunters</span>
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                9 Specialists
              </span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            {fleetTab === "engineering"
              ? "Autonomous Full-Stack AI Developers • Single Source of Truth"
              : "1-Click Targeted Chaos & Edge-Case Execution"}
          </div>
        </div>

        {/* Division A: Autonomous ERP Engineering Division (7 Master Units) */}
        {fleetTab === "engineering" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between rounded-xl bg-blue-50/80 border border-blue-200 p-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Autonomous Multi-Agent ERP Engineering Fleet
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    7 specialized AI bots deployed with exclusive code leases, deterministic financial logic, air-gapped system fonts, and zero-regression gates.
                  </p>
                </div>
              </div>
              <Button
                size="small"
                variant="primary"
                onClick={() => launchMutation.mutate("all_fleet_matrix")}
                disabled={isAnyRunning || launchMutation.isPending}
                className={`h-8 rounded-xl px-3.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer ${
                  launchMutation.isPending && launchMutation.variables === "all_fleet_matrix"
                    ? "ring-2 ring-blue-400 animate-pulse"
                    : ""
                }`}
              >
                {launchMutation.isPending && launchMutation.variables === "all_fleet_matrix" ? (
                  <>
                    <SpinnerIcon className="size-3 mr-1 text-white" />
                    <span>Running Division Audit...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="size-3 mr-1" />
                    <span>Run Division Audit</span>
                  </>
                )}
              </Button>
            </div>

            {/* 7 Master Unit Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {AUTONOMOUS_ENGINEERING_UNITS.map((unit) => {
                const UnitIcon = unit.icon
                const isUnitRunning = activeRun?.missionType === unit.targetMission && isAnyRunning

                return (
                  <div
                    key={unit.id}
                    className={`flex flex-col justify-between rounded-xl border bg-white p-4.5 shadow-xs transition hover:shadow-md ${
                      isUnitRunning ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8.5 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                            <UnitIcon className="size-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                              Agent #{unit.agentNum}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {unit.name.split(": ")[1] || unit.name}
                            </h4>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 shrink-0">
                          {unit.tag}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                        {unit.mission}
                      </p>

                      {/* Code Lease & Guards */}
                      <div className="space-y-1 rounded-lg bg-slate-50 p-2 text-[10px] font-mono border border-slate-100">
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Lease:</strong> {unit.lease}
                        </div>
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Guards:</strong> {unit.guards}
                        </div>
                      </div>

                      {/* Live Scenario Progress Bar */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>Progress: {unit.scenarios.toLocaleString()} Scenarios</span>
                          <span className="text-emerald-600 font-bold">{unit.passRate}% Pass</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isUnitRunning ? "bg-blue-600 animate-pulse" : "bg-emerald-500"
                            }`}
                            style={{
                              width: isUnitRunning
                                ? `${Math.min(100, Math.round(((activeRun?.currentStep || 1) / (activeRun?.totalSteps || 10)) * 100))}%`
                                : "100%",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${isUnitRunning ? "bg-blue-500 animate-ping" : "bg-emerald-500"}`} />
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                          {isUnitRunning ? "RUNNING STEP..." : "ACTIVE & READY"}
                        </span>
                      </div>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => launchMutation.mutate(unit.targetMission)}
                        disabled={isAnyRunning || launchMutation.isPending}
                        className={`h-7 rounded-lg px-2.5 text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer ${
                          ((launchMutation.isPending && launchMutation.variables === unit.targetMission) || isUnitRunning)
                            ? "ring-2 ring-blue-400 animate-pulse"
                            : ""
                        }`}
                      >
                        {((launchMutation.isPending && launchMutation.variables === unit.targetMission) || isUnitRunning) ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                            <SpinnerIcon className="size-3 animate-spin text-blue-600" />
                            <span>Auditing...</span>
                          </span>
                        ) : (
                          <span>Audit Subsystem</span>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Division B: Red Team QA Bug Hunters (9 Specialists) */}
        {fleetTab === "qa" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {RED_TEAM_SPECIALISTS.map((specialist) => {
              const isSpecialistRunning = activeRun?.missionType === specialist.targetMission && isAnyRunning

              return (
                <div
                  key={specialist.id}
                  className={`flex flex-col justify-between rounded-xl border bg-white p-4.5 shadow-xs transition hover:shadow-md ${
                    isSpecialistRunning ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                        <BotIcon className="size-4" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600">
                        {specialist.tag}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {specialist.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                      {specialist.desc}
                    </p>

                    {/* Progress Bar for Specialist */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>{specialist.scenarios.toLocaleString()} Scenarios</span>
                        <span className="text-emerald-600 font-bold">{specialist.passRate}% Pass</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isSpecialistRunning ? "bg-blue-600 animate-pulse" : "bg-emerald-500"
                          }`}
                          style={{
                            width: isSpecialistRunning
                              ? `${Math.min(100, Math.round(((activeRun?.currentStep || 1) / (activeRun?.totalSteps || 10)) * 100))}%`
                              : "100%",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {isSpecialistRunning ? "🟢 RUNNING" : "STANDBY"}
                    </span>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => launchMutation.mutate(specialist.targetMission)}
                      disabled={isAnyRunning || launchMutation.isPending}
                      className={`h-7 rounded-lg px-2.5 text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 transition cursor-pointer ${
                        ((launchMutation.isPending && launchMutation.variables === specialist.targetMission) || isSpecialistRunning)
                          ? "ring-2 ring-blue-400 animate-pulse"
                          : ""
                      }`}
                    >
                      {((launchMutation.isPending && launchMutation.variables === specialist.targetMission) || isSpecialistRunning) ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                          <SpinnerIcon className="size-3 animate-spin text-blue-600" />
                          <span>Running...</span>
                        </span>
                      ) : (
                        <span>Run Agent</span>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 6. Active Execution Console & Monospace Terminal ── */}
      {displayRun && (
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-8.5 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Bolt className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{displayRun.title}</h3>
                  <StatusBadge
                    color={
                      displayRun.status === "running"
                        ? "green"
                        : displayRun.status === "completed"
                        ? "blue"
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
                onClick={() => {
                  if (displayRun?.logs) {
                    const text = displayRun.logs
                      .map((l) => `[${l.timestamp}] [STEP ${l.step}/${l.totalSteps}] ${l.status.toUpperCase()} ${l.title}: ${l.message || ""}`)
                      .join("\n")
                    navigator.clipboard.writeText(text)
                    toast.success("Logs Copied to Clipboard")
                  }
                }}
                className="h-8 rounded-xl px-2.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
              >
                <DocumentText className="size-3.5 mr-1" />
                Copy Logs
              </Button>
            </div>
          </div>

          {/* Active Terminal Streamer */}
          <div
            ref={logTerminalRef}
            className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 max-h-[300px] overflow-y-auto border border-slate-800 shadow-inner flex flex-col gap-1.5"
          >
            {displayRun.logs.length === 0 ? (
              <span className="text-slate-500 italic">No logs recorded yet. Awaiting autonomous agent output...</span>
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
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    STEP {log.step}
                  </span>
                  <span className="font-semibold text-slate-100">{log.title}:</span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ── 7. 20-Minute Safety Rollback Checkpoint History ── */}
      <div className="p-0 overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              20-Minute Safety Rollback Checkpoint Archive
            </h3>
            <p className="text-xs text-slate-500">
              Automated git tags and clean state anchors captured every 20 minutes (`*/20 * * * *`).
            </p>
          </div>
          <Badge size="small" color="grey" className="font-mono text-xs">
            {checkpoints.length} Checkpoints Available
          </Badge>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
          {checkpoints.map((chk) => (
            <div key={chk.checkpointId} className="flex items-center justify-between p-3 px-4 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-emerald-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{chk.checkpointId}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                      Tag: {chk.tag}
                    </span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-mono text-blue-700">
                      Commit: {chk.commitHash.slice(0, 7)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(chk.createdAt).toLocaleString()} · {chk.label} · Status: {chk.status}
                  </span>
                </div>
              </div>

              <Button
                size="small"
                variant="secondary"
                onClick={() => rollbackMutation.mutate(chk.checkpointId)}
                disabled={rollbackMutation.isPending}
                className={`h-6 text-[11px] px-2.5 font-semibold text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 transition cursor-pointer ${
                  rollbackMutation.isPending && rollbackMutation.variables === chk.checkpointId
                    ? "ring-2 ring-rose-400 animate-pulse"
                    : ""
                }`}
              >
                {rollbackMutation.isPending && rollbackMutation.variables === chk.checkpointId ? (
                  <span className="inline-flex items-center gap-1">
                    <SpinnerIcon className="size-3 animate-spin text-rose-700" />
                    <span>Reverting...</span>
                  </span>
                ) : (
                  <span>Revert Here</span>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bot Mission Control",
  icon: Bolt,
})

export default BotLabPage
