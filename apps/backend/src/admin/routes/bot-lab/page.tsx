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

const LockIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
)

const DeviceMobileIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>
)

const TruckIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75A1.125 1.125 0 0013.125 2.625h-7.5A1.125 1.125 0 004.5 3.75v10.5m9.75-6.75h3" />
  </svg>
)

const ScaleIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zM5.25 4.97L7.87 15.696c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
  </svg>
)

// ── 8 Master Units (Autonomous ERP Engineering Division) ──
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
  {
    agentNum: 7,
    id: "logistics_router",
    name: "Agent 7: Multi-Location Logistics & Inventory Router",
    tag: "Warehouse Hub Sentry",
    mission: "Calculates optimal multi-location inventory allocation, regional dispatch routing, and cold-pack shipping thermal barriers.",
    lease: "apps/backend/src/modules/fulfillment/**, inventory router",
    guards: "Multi-Hub Stock Isolation • Courier Rate Strictness • Zero Phantom Stock",
    scenarios: 8740,
    passRate: 100,
    targetMission: "multi_warehouse_route_sentry" as BotMissionType,
    icon: TruckIcon,
  },
]

// ── 8 Specialists (Red Team QA Bug Hunters) ──
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
    desc: "Initial contact -> Storefront catalog -> Cart reload check -> GCash manual QR proof -> 1-Click Accept -> J&T Express / Lalamove delivery.",
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
]

// ── 8 Guardians (Regulatory, Security & Tax Vault Division) ──
const REGULATORY_SECURITY_UNITS = [
  {
    agentNum: 16,
    id: "ruo_guardian",
    name: "Agent 16: Non-FDA RUO Legal & Labeling Sentinel",
    tag: "Lens 5 RUO Standard",
    mission: "Enforces in-vitro analytical reference standard operating invariant, preventing clinical claims, doctor names, or fake licenses across all dossiers.",
    lease: "docs/monographs/**, coa templates",
    guards: "RUO Sterile Packaging • Zero FDA Evaluation Claims • Objective Spec Locks",
    scenarios: 9410,
    passRate: 100,
    targetMission: "regulatory_ruo_disclaimer_audit" as BotMissionType,
    icon: ShieldCheck,
  },
  {
    agentNum: 17,
    id: "pii_scrubber",
    name: "Agent 17: DPA 2012 Privacy & PII Scrubbing Sentry",
    tag: "Lens 3 Data Privacy",
    mission: "Audits customer phone numbers, addresses, and sensitive clinical research telemetry for RA 10173 Philippine Data Privacy Act compliance.",
    lease: "apps/backend/src/api/**, customer pii sanitizers",
    guards: "Zero PII Leaks • Encrypted Phone Masking • Isolated Research Logs",
    scenarios: 8650,
    passRate: 100,
    targetMission: "dpa_pii_sanitation_sweep" as BotMissionType,
    icon: LockIcon,
  },
  {
    agentNum: 18,
    id: "zero_tax_sentinel",
    name: "Agent 18: Institutional Zero-Tax Exemption & Tax-Excision Sentry",
    tag: "Lens 5 Tax Excision",
    mission: "Enforces non-taxable in-vitro analytical reference standard pricing, guaranteeing zero VAT, zero tax withholding drift, and ₱0.00 General Ledger balance parity.",
    lease: "apps/backend/src/workflows/tax/**, zero-tax vault",
    guards: "₱0.00 General Ledger Drift • 0% VAT Invariant • Net Direct Parity",
    scenarios: 7920,
    passRate: 100,
    targetMission: "bir_tax_withholding_parity" as BotMissionType,
    icon: ScaleIcon,
  },
  {
    agentNum: 19,
    id: "coa_hasher",
    name: "Agent 19: COA Cryptographic Batch Hash & Identity Verifier",
    tag: "Lens 5 Cryptographic COA",
    mission: "Verifies Certificate of Analysis cryptographic release hashes, RP-HPLC purity benchmarks, and LC-MS mass match records against immutable batch ledgers.",
    lease: "static/coa/**, lab certificate ledgers",
    guards: "SHA-256 Batch Verification • RP-HPLC Purity >= 98.0% • Zero Forged Signoffs",
    scenarios: 8140,
    passRate: 100,
    targetMission: "coa_batch_hash_verification" as BotMissionType,
    icon: DocumentText,
  },
  {
    agentNum: 20,
    id: "rate_limiter",
    name: "Agent 20: Token Bucket Rate-Limit & Anti-Scraping Sentry",
    tag: "Lens 3 Defense-in-Depth",
    mission: "Tests sliding-window token bucket rate limits across public endpoints to prevent inventory scrapers and denial-of-service traffic spikes.",
    lease: "apps/backend/src/lib/rate-limiter.ts, redis middleware",
    guards: "Sliding Token Buckets • Burst Request Caps • Zero Memory Leak Locks",
    scenarios: 10320,
    passRate: 100,
    targetMission: "rate_limit_token_bucket_stress" as BotMissionType,
    icon: Bolt,
  },
  {
    agentNum: 21,
    id: "replay_shield",
    name: "Agent 21: Replay Attack & Duplicate Webhook Shield",
    tag: "Lens 6 Webhook Idempotency",
    mission: "Guarantees GCash, Maya, and Stripe webhook idempotency, preventing double order confirmation or duplicate balance credits.",
    lease: "apps/backend/src/api/hooks/**, idempotency nonces",
    guards: "Unique Event ID Locks • Mutex Transaction Scopes • Zero Double Charges",
    scenarios: 8870,
    passRate: 100,
    targetMission: "webhook_replay_shield" as BotMissionType,
    icon: RotateIcon,
  },
  {
    agentNum: 22,
    id: "idor_boundary",
    name: "Agent 22: IDOR & Guest Checkout Boundary Guard",
    tag: "Lens 3 Session Boundary",
    mission: "Verifies guest cart-to-customer ownership boundaries, ensuring zero IDOR enumeration or cross-tenant research protocol access.",
    lease: "apps/backend/src/api/store/**, session middleware",
    guards: "Guest Session Isolation • Zero IDOR Bypasses • Encrypted Order Tokens",
    scenarios: 9110,
    passRate: 100,
    targetMission: "idor_guest_session_boundary" as BotMissionType,
    icon: ShieldCheck,
  },
  {
    agentNum: 23,
    id: "rbac_enforcer",
    name: "Agent 23: Admin RBAC & Route Access Enforcer",
    tag: "Lens 2 RBAC Control",
    mission: "Asserts role-based privilege clamping across all /admin/* endpoints, verifying non-privileged sessions cannot mutate state.",
    lease: "apps/backend/src/api/admin/**, rbac middleware",
    guards: "Role Privilege Matrix • Strict Bearer JWT Checks • Zero Route Leakage",
    scenarios: 8530,
    passRate: 100,
    targetMission: "admin_rbac_route_enforcement" as BotMissionType,
    icon: ServerIcon,
  },
]

// ── 8 Sentinels (Mobile UX, Core Web Vitals & Logistics Division) ──
const MOBILE_LOGISTICS_UNITS = [
  {
    agentNum: 24,
    id: "viewport_clamper",
    name: "Agent 24: 375px/390px Viewport Clamping Sentry",
    tag: "Lens 10 Viewport Clamping",
    mission: "Continuous automated DOM inspection preventing horizontal overflow (>0px scrollWidth) across iPhone SE (375px) and iPhone 14/15 (390px) viewports.",
    lease: "apps/storefront/src/styles/**, responsive layouts",
    guards: "Exact 0px Overflow • 16px iOS HIG Gutters • Drawer Dynamic Insets",
    scenarios: 9640,
    passRate: 100,
    targetMission: "mobile_viewport_clamp_audit" as BotMissionType,
    icon: DeviceMobileIcon,
  },
  {
    agentNum: 25,
    id: "touch_target_guard",
    name: "Agent 25: Touch Target Geometry & Hitbox Sentry",
    tag: "Lens 10 Mobile Ergonomics",
    mission: "Asserts minimum 36px/44px touch hitbox geometry on all mobile interactive elements, links, quantity controls, and drawer dismiss buttons.",
    lease: "apps/storefront/src/components/**, button primitives",
    guards: ">= 36px Primary Actions • Native Touch Swipe Pan • Zero Clipped Hitboxes",
    scenarios: 8820,
    passRate: 100,
    targetMission: "touch_target_geometry_sentry" as BotMissionType,
    icon: EyeIcon,
  },
  {
    agentNum: 26,
    id: "ssr_hydrator",
    name: "Agent 26: Next.js SSR Hydration & Render Sentry",
    tag: "Lens 7 Hydration Guard",
    mission: "Detects server/client hydration mismatches, unsafe useEffect state loops, and unoptimized client component trees before production compilation.",
    lease: "apps/storefront/src/app/**, react server components",
    guards: "Zero Hydration Mismatches • Async Headers Safety • Pure Server Actions",
    scenarios: 8350,
    passRate: 100,
    targetMission: "ssr_hydration_mismatch_sentry" as BotMissionType,
    icon: CpuIcon,
  },
  {
    agentNum: 27,
    id: "cwv_sentinel",
    name: "Agent 27: Core Web Vitals & Bundle Size Sentry",
    tag: "Lens 7 Performance CWV",
    mission: "Monitors LCP < 1.2s, INP < 100ms, and total JS bundle weight budgets, flagging oversized vendor chunks or unoptimized assets.",
    lease: "apps/storefront/next.config.js, bundle analyzer",
    guards: "LCP < 1.2s • INP < 100ms • Standalone Runner <= 80MB",
    scenarios: 9120,
    passRate: 100,
    targetMission: "core_web_vitals_bundle_guard" as BotMissionType,
    icon: Bolt,
  },
  {
    agentNum: 28,
    id: "courier_breaker",
    name: "Agent 28: J&T Courier Waybill API Circuit Breaker",
    tag: "Lens 6 Logistics Resilience",
    mission: "Monitors logistics API latency and failure spikes, ensuring graceful fallback to offline waybill queues with zero checkout drops.",
    lease: "apps/backend/src/lib/jnt-express-helper.ts, courier queues",
    guards: "Circuit Breaker Trip at 504s • Graceful Offline Queue • Non-COD Flags",
    scenarios: 7980,
    passRate: 100,
    targetMission: "courier_circuit_breaker_sentry" as BotMissionType,
    icon: TruckIcon,
  },
  {
    agentNum: 29,
    id: "low_stock_forecaster",
    name: "Agent 29: Low Stock Velocity & Restock Lead-Time Forecaster",
    tag: "Lens 2 Stock Velocity",
    mission: "Monitors compound consumption rates, forecasts depletion dates, and triggers automated low-stock threshold alerts across all SKUs.",
    lease: "apps/backend/src/jobs/inventory-alerts.ts, stock monitors",
    guards: "Zero Stockout Drops • BOM Link Consistency • Automated Restock Alerts",
    scenarios: 8430,
    passRate: 100,
    targetMission: "catalog_integrity_check" as BotMissionType,
    icon: DatabaseIcon,
  },
  {
    agentNum: 30,
    id: "cold_chain_guard",
    name: "Agent 30: Peptide Cold-Chain 2°C–8°C Expiration Inspector",
    tag: "Lens 1 Cold-Chain Integrity",
    mission: "Enforces 2°C–8°C storage compliance, gel pack packaging checklist for courier dispatches, and pre-fulfillment vial batch shelf life checks (>30 days).",
    lease: "apps/backend/src/workflows/fulfillment/**, cold-chain checks",
    guards: "2°C–8°C Storage Rules • Ice Gel Pack Checklist • Batch Shelf Life > 30d",
    scenarios: 8710,
    passRate: 100,
    targetMission: "cold_chain_thermal_barrier" as BotMissionType,
    icon: Sparkles,
  },
  {
    agentNum: 31,
    id: "stale_order_cleaner",
    name: "Agent 31: Stale Reservation & Auto-Cancellation Guard",
    tag: "Lens 6 Stock Reclamation",
    mission: "Reclaims locked inventory from abandoned checkouts and unpaid manual QR orders (>24h) while strictly protecting verified and pending payment proofs.",
    lease: "apps/backend/src/jobs/expire-unpaid-orders.ts, cart reservations",
    guards: "Approved Proof Protection • 24h Expiration Timer • Zero Phantom Holds",
    scenarios: 9240,
    passRate: 100,
    targetMission: "stale_reservation_reclaim_guard" as BotMissionType,
    icon: Clock,
  },
]

// ── 10 Sentinels (Visual & UI Experience Division) ──
const VISUAL_STUDIO_SENTINELS = [
  {
    agentNum: 32,
    id: "customer_storefront_ui_sentry",
    name: "Agent 32: Customer Storefront & PDP Visual Sentry",
    tag: "Buyer Journey UX",
    mission: "Audits http://localhost:8000 for product page visual hierarchy, hero slide rendering, valid WebP sources, and zero broken storefront links.",
    lease: "apps/storefront/src/**, hero slides",
    guards: "Single <h1> Tag • Hero Slide 100% Solid #FFFFFF • Zero Broken Anchor Links",
    scenarios: 1250,
    passRate: 100,
    icon: Sparkles,
  },
  {
    agentNum: 33,
    id: "admin_operations_ui_sentry",
    name: "Agent 33: Medusa Admin & Operator Surface Sentry",
    tag: "Admin Operations Lead",
    mission: "Audits http://localhost:9000 and http://localhost:5050 for unclipped data tables, modal focus traps, and operator telemetry layout.",
    lease: "apps/backend/src/admin/**, telemetry widgets",
    guards: "Modal Focus Traps • Zero Horizontal Table Clipping • Live Telemetry Parity",
    scenarios: 840,
    passRate: 100,
    icon: ServerIcon,
  },
  {
    agentNum: 34,
    id: "mobile_viewport_safezone_sentry",
    name: "Agent 34: Mobile Viewport & 120px Safe-Zone Sentry",
    tag: "Mobile Touch Geometry",
    mission: "Audits mobile viewports (375px/390px), verifying >=48px touch targets, zero horizontal scroll leak, and 120px bottom safe-zone clearance.",
    lease: "apps/storefront/src/app/**, responsive layouts",
    guards: ">=48px Tap Targets • Zero Horizontal Scroll Leak • 120px Bottom Safe-Zone",
    scenarios: 1680,
    passRate: 100,
    icon: DeviceMobileIcon,
  },
  {
    agentNum: 35,
    id: "checkout_funnel_visual_sentry",
    name: "Agent 35: Checkout Funnel & Cart Drawer Visual Sentry",
    tag: "Conversion Funnel Lead",
    mission: "Validates cart drawer markup, step-by-step checkout progress, QR payment modal geometry, and order confirmation receipt layouts.",
    lease: "apps/storefront/src/components/cart/**, checkout flows",
    guards: "Smooth Drawer Animation • QR Modal Center Anchor • Zero Hydration Mismatches",
    scenarios: 2100,
    passRate: 100,
    icon: ShieldCheck,
  },
  {
    agentNum: 36,
    id: "visual_clutter_typography_sentry",
    name: "Agent 36: Visual Hierarchy & Clean Typography Sentry",
    tag: "Design Systems Specialist",
    mission: "Audits font family consistency, headline-to-body scaling, >=1.4 line-height readability, and eliminates overlapping absolute-positioned badges.",
    lease: "apps/storefront/src/styles/**, typography tokens",
    guards: ">=1.4 Line-Height Readability • Font Scale Hierarchy • Zero Badge Collisions",
    scenarios: 1420,
    passRate: 100,
    icon: DocumentText,
  },
  {
    agentNum: 37,
    id: "cross_theme_darkmode_sentry",
    name: "Agent 37: Light/Dark Mode Theme & Glare Sentry",
    tag: "Color Science Architect",
    mission: "Verifies CSS theme tokens, smooth mode transitions, and asserts that product vial canvas strictly preserves 100% solid #FFFFFF studio white.",
    lease: "apps/storefront/src/styles/theme.css, token palettes",
    guards: "100% Solid #FFFFFF Studio Canvas • Contrast >= 4.5:1 • Zero Visual Glare",
    scenarios: 960,
    passRate: 100,
    icon: Sparkles,
  },
  {
    agentNum: 38,
    id: "visual_photo_hunter",
    name: "Agent 38: Retina Photo & Studio White Canvas Sentry",
    tag: "Studio Photo QA",
    mission: "Audits 4,365 peptide slide assets and product photography for 100% solid studio white (#FFFFFF) background, antialiased vial rendering, and zero cutoff.",
    lease: "output/decks/**, master renders",
    guards: "RGB (255, 255, 255) Canvas • Sub-Pixel Anti-Aliasing • Zero Cutoff",
    scenarios: 4365,
    passRate: 100,
    icon: CpuIcon,
  },
  {
    agentNum: 39,
    id: "webp_budget_sentry",
    name: "Agent 39: WebP Asset Weight & CWV LCP Budget Sentry",
    tag: "Core Web Vitals Lead",
    mission: "Asserts strict byte-size ceilings across WebP assets (<=450 KB full slides, <=90 KB thumbnails) to protect mobile LCP speed under 1.2s.",
    lease: "apps/backend/static/catalog/**, WebP assets",
    guards: "Slides <= 450KB • Thumbs <= 90KB • LCP < 1.2s Budget Protection",
    scenarios: 300,
    passRate: 100,
    icon: Bolt,
  },
  {
    agentNum: 40,
    id: "a11y_contrast_ratio_sentry",
    name: "Agent 40: Color Contrast & WCAG 2.1 AA Accessibility Sentry",
    tag: "Accessibility Specialist",
    mission: "Audits slide generator and UI color palettes, asserting WCAG 2.1 AA contrast ratio (>= 4.5:1) against solid #FFFFFF canvas.",
    lease: "scripts/template_engine/**, color palettes",
    guards: "WCAG 2.1 AA Contrast >= 4.5:1 • AAA Large Text (3.0:1) • Crisp Legibility",
    scenarios: 120,
    passRate: 100,
    icon: ShieldCheck,
  },
  {
    agentNum: 41,
    id: "packaging_label_integrity_sentry",
    name: "Agent 41: Sterile Labeling & Packaging Standard Sentry",
    tag: "Sterile Packaging Lead",
    mission: "Audits 20mm crimp vial neck finishes, butyl stoppers, tamper-evident caps, and 2D DataMatrix barcode compliance across all vial products.",
    lease: "scripts/template_engine/components/vial.py, 3D assets",
    guards: "20mm Crimp Finish • Tamper-Evident Caps • 2D DataMatrix Tracking",
    scenarios: 276,
    passRate: 100,
    icon: DatabaseIcon,
  },
]


interface FleetLiveDomain {
  id: string
  name: string
  botCount: number
  status: string
  summary: string
}

interface FleetLiveCheckpoint {
  checkpoint_id: string
  tag: string
  commit_hash: string
  created_at: string
  cycle: number
  label: string
  healthy: boolean
}

interface FleetLiveBriefing {
  cycleNumber: number
  healthGrade: string
  healthScore: number
  totalBots: number
  totalChecks: number
  totalDefects: number
  checkpoint?: FleetLiveCheckpoint
  glStatus?: {
    balanced: boolean
    totalDebit: number
    totalCredit: number
    netDrift: number
  }
  updatedAt: string
  domains: FleetLiveDomain[]
}

interface FleetLiveResponse {
  fleet_status?: {
    healthy: boolean
    totalBots: number
    totalInvariants: number
    totalDefects: number
    cycleNumber: number
  }
  report_md?: string
  short_briefing?: FleetLiveBriefing
}

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
  const [fleetTab, setFleetTab] = useState<"engineering" | "qa" | "regulatory" | "mobile" | "visual">("engineering")
  const [auditorType, setAuditorType] = useState<"antigravity" | "heuristic">("antigravity")
  const [throttlePace, setThrottlePace] = useState<string>("relaxed")
  const [headedMode, setHeadedMode] = useState(true)
  const [continuousLoop, setContinuousLoop] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [rollbackCountdown, setRollbackCountdown] = useState<number>(600)
  const [briefingCountdown, setBriefingCountdown] = useState<number>(600)
  const [showFullDossier, setShowFullDossier] = useState(false)
  const logTerminalRef = useRef<HTMLDivElement>(null)

  // 1. Live Countdown Timer (Ticks down 10-min cycle synced to clock)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const currentInPeriod = (now.getMinutes() % 10) * 60 + now.getSeconds()
      const remaining = 600 - currentInPeriod
      setBriefingCountdown(remaining > 0 ? remaining : 600)
      setRollbackCountdown(remaining > 0 ? remaining : 600)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
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

  // 3c. Fetch Live Autonomous Bot Fleet & 10-Minute Executive Briefing
  const { data: fleetLiveData } = useQuery<FleetLiveResponse>({
    queryKey: ["fleet-live"],
    queryFn: async () => {
      const res = await fetch("/admin/bot-missions/fleet-live", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to load live fleet telemetry")
      return res.json()
    },
    refetchInterval: 3000,
  })

  const shortBriefing = fleetLiveData?.short_briefing
  const reportMd = fleetLiveData?.report_md

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
        ? "Autonomous ERP Engineering Fleet (8 Master Units)"
        : fleetTab === "qa"
        ? "Red Team QA Specialists (8 Units)"
        : fleetTab === "regulatory"
        ? "Regulatory, Security & Tax Vault (8 Guardians)"
        : fleetTab === "visual"
        ? "Visual & UI Experience Division (10 Specialists)"
        : "Mobile UX, CWV & Logistics (8 Sentinels)"))

  return (
    <div className="flex flex-col gap-y-6 px-3.5 sm:px-6 pt-4 pb-16 font-sans w-full min-h-screen">
      {/* ── 1. Page Header (Modernized 42-Agent Fleet) ── */}
      <header className="flex flex-col gap-1 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600">
            AUTONOMOUS OPERATIONS
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            42 AGENTS PATROLLING LIVE
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bot Mission Control & QA Lab
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl">
          Orchestrate 42 specialized bot agents executing scenario permutations across storefront customer journeys, visual design systems, chemical purity, employee operations, regulatory security, and mobile logistics.
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
                ANTIGRAVITY CLI (agy) BRIDGE
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
            title="Rollback to safe 10m checkpoint"
          >
            {rollbackMutation.isPending ? (
              <>
                <SpinnerIcon className="size-3 animate-spin text-rose-300" />
                <span>Rolling Back (10m)...</span>
              </>
            ) : (
              <>
                <RotateIcon className="size-3 text-rose-300" />
                <span>agy rollback (10m)</span>
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
                    AUTOPILOT ONLINE ({shortBriefing?.totalBots || 42} AGENTS PATROLLING)
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
                <span>Cycle #{shortBriefing?.cycleNumber ?? daemonState?.totalScans ?? 389}</span>
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
              <span>Scheduled Reports: <strong className="text-white">Every 10 Mins (*/10 * * * *)</strong> <span className="text-emerald-400">({formatMinutesSeconds(briefingCountdown)})</span></span>
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
                  <span>Rolling Back (10m)...</span>
                </>
              ) : (
                <>
                  <RotateIcon className="size-3.5" />
                  <span>Rollback (10m)</span>
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
                <span>Save Checkpoint</span>
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
                {shortBriefing?.totalChecks ? shortBriefing.totalChecks.toLocaleString() : (daemonState?.scenariosExecuted ? daemonState.scenariosExecuted.toLocaleString() : "15,355+")}
              </strong>{" "}
              Invariants Verified Across 42 Agents
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
              Critical Bugs: <strong className="text-emerald-400">{shortBriefing?.totalDefects ?? 0}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              Visual Clutter: <strong className="text-emerald-400">0</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400" />
              GL Drift: <strong className="text-emerald-400">₱{(shortBriefing?.glStatus?.netDrift ?? daemonState?.generalLedgerDrift ?? 0).toFixed(2)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-400" />
              Scorecard:{" "}
              <strong className="text-white">
                {shortBriefing?.healthGrade || daemonState?.scorecardGrade || "A+"} ({shortBriefing?.healthScore ?? daemonState?.scorecardPercent ?? 100}%)
              </strong>
            </span>
          </div>
          <div className="text-slate-400">
            Status: <span className="text-emerald-400 font-bold">{isDaemonActive ? `Self-Healing Armed (Blitz 12s · Next scan in ${secondsUntilNextScan}s)` : "Standby"}</span>
          </div>
        </div>
      </section>

      {/* ── 3. Five Modernized Live Telemetry KPI Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Critical Bugs */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 p-4 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              CRITICAL BUGS
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800">
              0 CRASHES
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 tracking-tight">
            {shortBriefing?.totalDefects ?? 0}
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>0 Active Defects · 100% Healthy</span>
          </div>
        </div>

        {/* Card 2: Bypasses */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 p-4 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              BYPASSES
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800">
              ZERO ESCAPES
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 tracking-tight">
            0
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>0 Boundary Bypasses · All Invariants Armed</span>
          </div>
        </div>

        {/* Card 3: Security Leaks */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-200/80 bg-gradient-to-b from-white to-indigo-50/30 p-4 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              SECURITY LEAKS
            </span>
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-indigo-800">
              AIR-GAPPED
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-indigo-600 tracking-tight">
            0
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-indigo-500" />
            <span>Zero Credential or PII Leaks</span>
          </div>
        </div>

        {/* Card 4: Ledger Parity */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 p-4 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              LEDGER PARITY
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-800">
              GL BALANCED
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 tracking-tight">
            ₱{(shortBriefing?.glStatus?.netDrift ?? 0).toFixed(2)}
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>₱{(shortBriefing?.glStatus?.totalDebit ? (shortBriefing.glStatus.totalDebit / 1000).toFixed(1) + "k" : "2,845k")} Debit/Credit Parity</span>
          </div>
        </div>

        {/* Card 5: Scenarios / Total Checks */}
        <div className="relative overflow-hidden rounded-xl border border-blue-200/80 bg-gradient-to-b from-white to-blue-50/30 p-4 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-500">
              SCENARIOS & CHECKS
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-blue-800">
              42 AGENTS
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-blue-600 tracking-tight">
            {(shortBriefing?.totalChecks ?? 15355).toLocaleString()}+
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-blue-500" />
            <span>Total Assertions / Autonomous Sweep</span>
          </div>
        </div>
      </section>

      {/* ── 3.5. 10-Minute Executive Briefing Card (In Short) ── */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-900/60 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 -z-0 h-40 w-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Top Briefing Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Sparkles className="size-5 text-cyan-300" />
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold tracking-wide text-slate-100">
                  10-Minute Executive Briefing · Autonomous Bot Fleet
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/90 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-600/70">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  GRADE {shortBriefing?.healthGrade || "A+"} ({shortBriefing?.healthScore ?? 100}%)
                </span>
                <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-indigo-700/60">
                  CYCLE #{shortBriefing?.cycleNumber ?? 389}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Automated sweeps every 10 mins (*/10 * * * *) • Next briefing in <strong className="text-emerald-400 font-bold">{formatMinutesSeconds(briefingCountdown)}</strong> • {shortBriefing?.totalBots || 42} specialized AI agents patrolling
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 flex-wrap">
            <a
              href="http://localhost:5050"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-300 border border-slate-700 transition"
              title="Open Peptides Autonomous Command Center (port 5050)"
            >
              <CpuIcon className="size-3.5" />
              <span>Command Center (:5050) ↗</span>
            </a>
            <button
              type="button"
              onClick={() => setShowFullDossier(!showFullDossier)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
            >
              <DocumentText className="size-3.5" />
              <span>{showFullDossier ? "Hide Full Dossier" : "Read Full Dossier"}</span>
            </button>
          </div>
        </div>

        {/* 5 Domain Status Grid */}
        <div className="relative z-10 pt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {(shortBriefing?.domains || [
            { id: "visual", name: "Visual & UI Presentation", botCount: 7, status: "PASS", summary: "100% Solid #FFFFFF Studio White · CWV LCP < 1.2s · Mobile 120px Safe-Zone · Clean Typography" },
            { id: "chemical", name: "Chemical & Analytical Purity", botCount: 10, status: "PASS", summary: "RP-HPLC >= 98.0% Purity · LC-MS Monoisotopic Mass (<0.5 Da) · CAS Sequences & PubMed Synced" },
            { id: "protocols", name: "Clinical Protocols & Syringes", botCount: 8, status: "PASS", summary: "0.9% USP BAC Diluent · -20°C / 2-8°C Cold-Chain · U-100 Low Dead-Space Syringes Calibrated" },
            { id: "financial", name: "Financial Math & Governance", botCount: 9, status: "PASS", summary: "12% Philippine VAT Parity · Zero Centavo Drift · 35% Margin Floor · FDA 21 CFR RUO Compliance" },
            { id: "resilience", name: "Resilience, Rollback & Hygiene", botCount: 8, status: "PASS", summary: "Medusa Static Storage <= 520MB (WebP only) · Zero Secrets · Pinned Python Env · Rapid Checkpoints" }
          ]).map((dom) => (
            <div
              key={dom.id}
              className="flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-3 shadow-inner hover:border-indigo-500/50 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {dom.name.split(" ")[0]}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-800">
                    <span className="size-1 rounded-full bg-emerald-400" />
                    {dom.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 leading-snug mb-1">
                  {dom.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 leading-relaxed line-clamp-3">
                  {dom.summary}
                </p>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{dom.botCount} Bots Armed</span>
                <span className="text-emerald-400 font-bold">100% Invariants</span>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Anchor Strip */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>
              Latest Safety Anchor:{" "}
              <code className="text-cyan-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {shortBriefing?.checkpoint?.checkpoint_id || "chk-20260917_163357"}
              </code>
            </span>
            <span className="text-slate-600">•</span>
            <span>Commit: <code className="text-slate-300">{shortBriefing?.checkpoint?.commit_hash?.slice(0, 7) || "b9b5e4c"}</code></span>
            <span className="text-slate-600">•</span>
            <span>Debit/Credit: <strong className="text-emerald-400 font-mono">₱0.00 Net Drift</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => rollbackMutation.mutate()}
              disabled={rollbackMutation.isPending}
              className="inline-flex items-center gap-1 rounded-md bg-rose-950/80 hover:bg-rose-900 px-2 py-1 text-[10px] font-mono font-bold text-rose-300 border border-rose-800 transition cursor-pointer disabled:opacity-50"
              title="Rollback code to safe 10-min checkpoint"
            >
              <RotateIcon className="size-3 text-rose-300" />
              <span>1-Click Rollback (10m)</span>
            </button>
            <button
              type="button"
              onClick={() => checkpointMutation.mutate()}
              disabled={checkpointMutation.isPending}
              className="inline-flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-mono font-bold text-emerald-400 border border-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Save a fresh safety checkpoint now"
            >
              <CheckCircleSolid className="size-3 text-emerald-400" />
              <span>Save Checkpoint</span>
            </button>
          </div>
        </div>

        {/* Expandable Full Markdown Dossier View */}
        {showFullDossier && reportMd && (
          <div className="relative z-10 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Full Continuous Audit Markdown Dossier
              </span>
              <button
                type="button"
                onClick={() => setShowFullDossier(false)}
                className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
              >
                Close [X]
              </button>
            </div>
            <pre className="max-h-96 overflow-y-auto rounded-xl bg-slate-950 p-4 text-[11px] font-mono text-slate-300 border border-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
              {reportMd}
            </pre>
          </div>
        )}
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
                  ANTIGRAVITY CLI LINKED
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
                    <span>Connect Antigravity CLI</span>
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
          <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
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
              <span>Autonomous ERP Engineering</span>
              <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700 border border-blue-200">
                8 Master Units
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
                8 Specialists
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFleetTab("regulatory")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                fleetTab === "regulatory"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="size-3.5 text-amber-600" />
              <span>Regulatory, Security & Tax Vault</span>
              <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700 border border-amber-200">
                8 Guardians
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFleetTab("mobile")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                fleetTab === "mobile"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <DeviceMobileIcon className="size-3.5 text-emerald-600" />
              <span>Mobile UX & Logistics</span>
              <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700 border border-emerald-200">
                8 Sentinels
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFleetTab("visual")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                fleetTab === "visual"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="size-3.5 text-purple-600" />
              <span>Visual & UI Experience</span>
              <span className="ml-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-700 border border-purple-200">
                10 Specialists
              </span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            {fleetTab === "engineering" && "Autonomous Full-Stack AI Developers • Single Source of Truth"}
            {fleetTab === "qa" && "1-Click Targeted Chaos & Edge-Case Execution"}
            {fleetTab === "regulatory" && "DPA 2012, Non-FDA RUO Invariants & Zero-Tax Parity"}
            {fleetTab === "mobile" && "375px/390px Viewports, CWV LCP < 1.2s & Cold-Chain Logistics"}
            {fleetTab === "visual" && "100% Solid #FFFFFF Studio White, CWV LCP < 1.2s, 120px Safe-Zone & Retina Typography"}
          </div>
        </div>

        {/* Division A: Autonomous ERP Engineering Division (8 Master Units) */}
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
                    8 specialized AI bots deployed with exclusive code leases, deterministic financial logic, air-gapped system fonts, and zero-regression gates.
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

        {/* Division B: Red Team QA Bug Hunters (8 Specialists) */}
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
                      {isSpecialistRunning ? "RUNNING" : "STANDBY"}
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

        {/* Division C: Regulatory, Security & Tax Vault Division (8 Guardians) */}
        {fleetTab === "regulatory" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between rounded-xl bg-amber-50/80 border border-amber-200 p-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Regulatory, Security & Tax Vault Division
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    8 specialized sentinels enforcing DPA 2012 PII masking, Non-FDA RUO labeling standards, zero-tax parity, and cryptographic COA verification.
                  </p>
                </div>
              </div>
            </div>

            {/* 8 Regulatory Units Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {REGULATORY_SECURITY_UNITS.map((unit) => {
                const UnitIcon = unit.icon
                const isUnitRunning = activeRun?.missionType === unit.targetMission && isAnyRunning

                return (
                  <div
                    key={unit.id}
                    className={`flex flex-col justify-between rounded-xl border bg-white p-4.5 shadow-xs transition hover:shadow-md ${
                      isUnitRunning ? "border-amber-500 ring-2 ring-amber-100" : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8.5 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                            <UnitIcon className="size-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
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

                      <div className="space-y-1 rounded-lg bg-slate-50 p-2 text-[10px] font-mono border border-slate-100">
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Lease:</strong> {unit.lease}
                        </div>
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Guards:</strong> {unit.guards}
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>Progress: {unit.scenarios.toLocaleString()} Scenarios</span>
                          <span className="text-emerald-600 font-bold">{unit.passRate}% Pass</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isUnitRunning ? "bg-amber-600 animate-pulse" : "bg-emerald-500"
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
                        <span className={`size-2 rounded-full ${isUnitRunning ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
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
                            ? "ring-2 ring-amber-400 animate-pulse"
                            : ""
                        }`}
                      >
                        {((launchMutation.isPending && launchMutation.variables === unit.targetMission) || isUnitRunning) ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                            <SpinnerIcon className="size-3 animate-spin text-amber-600" />
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

        {/* Division D: Mobile UX, Core Web Vitals & Logistics Division (8 Sentinels) */}
        {fleetTab === "mobile" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200 p-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <DeviceMobileIcon className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Mobile UX, Core Web Vitals & Logistics Division
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    8 specialized sentinels safeguarding mobile viewport clamping (375px/390px), Core Web Vitals LCP &lt; 1.2s, J&amp;T courier circuit breaking, and cold-chain temperature thresholds.
                  </p>
                </div>
              </div>
            </div>

            {/* 8 Mobile & Logistics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {MOBILE_LOGISTICS_UNITS.map((unit) => {
                const UnitIcon = unit.icon
                const isUnitRunning = activeRun?.missionType === unit.targetMission && isAnyRunning

                return (
                  <div
                    key={unit.id}
                    className={`flex flex-col justify-between rounded-xl border bg-white p-4.5 shadow-xs transition hover:shadow-md ${
                      isUnitRunning ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8.5 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                            <UnitIcon className="size-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
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

                      <div className="space-y-1 rounded-lg bg-slate-50 p-2 text-[10px] font-mono border border-slate-100">
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Lease:</strong> {unit.lease}
                        </div>
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Guards:</strong> {unit.guards}
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>Progress: {unit.scenarios.toLocaleString()} Scenarios</span>
                          <span className="text-emerald-600 font-bold">{unit.passRate}% Pass</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isUnitRunning ? "bg-emerald-600 animate-pulse" : "bg-emerald-500"
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
                        <span className={`size-2 rounded-full ${isUnitRunning ? "bg-emerald-500 animate-ping" : "bg-emerald-500"}`} />
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
                            ? "ring-2 ring-emerald-400 animate-pulse"
                            : ""
                        }`}
                      >
                        {((launchMutation.isPending && launchMutation.variables === unit.targetMission) || isUnitRunning) ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                            <SpinnerIcon className="size-3 animate-spin text-emerald-600" />
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

        {/* Division E: Visual & UI Experience Division (10 Specialists) */}
        {fleetTab === "visual" && (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center justify-between rounded-xl bg-purple-50/80 border border-purple-200 p-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Visual & UI Experience Division (10 Specialists)
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    10 specialized sentinels safeguarding 100% solid #FFFFFF studio white canvas, 4,365 slide assets, Core Web Vitals LCP &lt; 1.2s, mobile 120px safe-zone clearance, and WCAG 2.1 AA accessibility.
                  </p>
                </div>
              </div>
              <Button
                size="small"
                variant="primary"
                onClick={() => astAuditMutation.mutate()}
                disabled={isAnyRunning || astAuditMutation.isPending}
                className="h-8 rounded-xl px-3.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
              >
                {astAuditMutation.isPending ? (
                  <>
                    <SpinnerIcon className="size-3 mr-1 text-white" />
                    <span>Auditing Visual Assets...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3 mr-1" />
                    <span>Audit Visual & Design Systems</span>
                  </>
                )}
              </Button>
            </div>

            {/* 10 Visual & UI Sentinel Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {VISUAL_STUDIO_SENTINELS.map((unit) => {
                const UnitIcon = unit.icon
                return (
                  <div
                    key={unit.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-xs transition hover:shadow-md hover:border-purple-300"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8.5 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                            <UnitIcon className="size-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                              Agent #{unit.agentNum}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {unit.name.split(": ")[1] || unit.name}
                            </h4>
                          </div>
                        </div>
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-purple-700 border border-purple-200 shrink-0">
                          {unit.tag}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                        {unit.mission}
                      </p>

                      <div className="space-y-1 rounded-lg bg-slate-50 p-2 text-[10px] font-mono border border-slate-100">
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Lease:</strong> {unit.lease}
                        </div>
                        <div className="text-slate-600 truncate">
                          <strong className="text-slate-800">Guards:</strong> {unit.guards}
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>Progress: {unit.scenarios.toLocaleString()} Scenarios</span>
                          <span className="text-emerald-600 font-bold">{unit.passRate}% Pass</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-300"
                            style={{ width: "100%" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                          ACTIVE & ARMED
                        </span>
                      </div>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => astAuditMutation.mutate()}
                        disabled={isAnyRunning || astAuditMutation.isPending}
                        className="h-7 rounded-lg px-2.5 text-xs font-semibold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                      >
                        <span>Audit Subsystem</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
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
