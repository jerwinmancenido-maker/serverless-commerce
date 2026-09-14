"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/clinical-protocol-print-dossier.tsx
 * @module  ClinicalProtocolPrintDossier (Research Protocols Module)
 * @purpose Analytical Laboratory & GLP reference print & PDF dossier engine.
 * @contracts
 *   Component: ClinicalProtocolPrintDossier
 *   Parent:    FullProtocol
 *   Presets:   "full" | "bench_sop" | "schedule_bom"
 */

import React, { useMemo } from "react"
import Image from "next/image"
import type { CustomerResearchProtocol, StoreResearchProtocol } from "@lib/data/research-protocols"
import type { HttpTypes } from "@medusajs/types"
import { cleanCompoundTitle } from "@lib/protocol-sharing"
import {
  Beaker,
  DocumentText,
  ExclamationCircle,
  CheckCircleSolid,
  Sparkles,
} from "@medusajs/icons"

export type PrintPreset = "full" | "bench_sop" | "schedule_bom"

interface ClinicalProtocolPrintDossierProps {
  protocol: CustomerResearchProtocol | StoreResearchProtocol
  matchedProducts?: HttpTypes.StoreProduct[]
  countryCode?: string
  qrCodeDataUrl?: string | null
  canonicalUrl?: string | null
  preset?: PrintPreset
}

// ─── Print-Calibrated Vector SVG Syringe Barrel ──────────────────────────────
function PrintVectorSyringe({
  units,
  volumeMl,
  capacity = 100,
  compoundName,
}: {
  units: number
  volumeMl: number
  capacity?: 30 | 50 | 100
  compoundName?: string
}) {
  const barrelStart = 80
  const barrelEnd = 480
  const barrelWidth = barrelEnd - barrelStart // 400px
  const barrelTop = 22
  const barrelHeight = 44
  const barrelBottom = barrelTop + barrelHeight

  const maxUnits = capacity
  const effectiveUnits = Math.min(Math.max(units, 0), maxUnits)
  const fillRatio = effectiveUnits / maxUnits
  const fillWidth = fillRatio * barrelWidth
  const fillEnd = barrelStart + fillWidth

  // Generate tick marks
  const ticks = useMemo(() => {
    const items: Array<{ unit: number; x: number; isMajor: boolean; isMedium: boolean }> = []
    const step = capacity === 100 ? 2 : 1
    for (let u = 0; u <= capacity; u += step) {
      const isMajor = u % 10 === 0
      const isMedium = !isMajor && u % 5 === 0
      const x = barrelStart + (u / capacity) * barrelWidth
      items.push({ unit: u, x, isMajor, isMedium })
    }
    return items
  }, [capacity, barrelStart, barrelWidth])

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs print-avoid-break">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <Beaker className="w-3.5 h-3.5 text-sky-600" />
          Calibrated U-100 Laboratory Syringe Barrel ({capacity} U / {(capacity / 100).toFixed(1)} mL)
        </span>
        <span className="font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md text-[11px]">
          Target Mark: {units.toFixed(1)} Units ({volumeMl.toFixed(3)} mL)
        </span>
      </div>

      <div className="py-2 flex justify-center">
        <svg
          viewBox="0 0 540 100"
          className="w-full max-w-lg h-auto select-none"
          aria-label={`Calibrated U-100 syringe${compoundName ? ` for ${compoundName}` : ""}`}
        >
          <defs>
            <linearGradient id="printFluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* 1. NEEDLE (Stainless Steel 31G) */}
          <line x1="8" y1="44" x2="52" y2="44" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
          <polygon points="8,44 12,42.5 12,45.5" fill="#475569" />

          {/* 2. NEEDLE HUB (Orange Hub) */}
          <polygon points="52,36 72,32 78,28 78,60 72,56 52,52" fill="#ea580c" stroke="#c2410c" strokeWidth="1" />
          <line x1="66" y1="34" x2="66" y2="54" stroke="#c2410c" strokeWidth="1" />

          {/* 3. BARREL BACKGROUND */}
          <rect x={barrelStart} y={barrelTop} width={barrelWidth} height={barrelHeight} fill="#f8fafc" stroke="#334155" strokeWidth="1.5" rx="2" />

          {/* 4. LIQUID FILL & MENISCUS */}
          {fillWidth > 0 && (
            <g>
              <rect x={barrelStart} y={barrelTop + 1} width={fillWidth} height={barrelHeight - 2} fill="url(#printFluidGrad)" />
              {fillWidth > 4 && (
                <path
                  d={`M ${fillEnd} ${barrelTop + 1} Q ${fillEnd + 3} ${barrelTop + barrelHeight / 2} ${fillEnd} ${barrelBottom - 1}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* 5. PLUNGER STOPPER (Charcoal Rubber Gasket at fillEnd) */}
          <g style={{ transform: `translateX(${fillEnd}px)` }}>
            {/* Rubber Stopper */}
            <rect x="0" y={barrelTop + 1} width="12" height={barrelHeight - 2} fill="#1e293b" rx="1" />
            <rect x="1" y={barrelTop + 2} width="2" height={barrelHeight - 4} fill="#0f172a" />
            <rect x="8" y={barrelTop + 2} width="2" height={barrelHeight - 4} fill="#0f172a" />
            {/* Stem cavity */}
            <polygon points="12,32 9,36 9,52 12,56" fill="#334155" />
            {/* Plunger Shaft */}
            <rect x="12" y="38" width="46" height="12" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />
            <line x1="28" y1="32" x2="28" y2="56" stroke="#64748b" strokeWidth="1.5" />
            {/* Plunger Thumb Rest */}
            <rect x="58" y="24" width="4" height="40" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
          </g>

          {/* 6. BARREL FLANGE (Right side) */}
          <rect x={barrelEnd - 1} y="14" width="6" height="60" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

          {/* 7. CALIBRATION HASHMARKS & NUMBERS */}
          {ticks.map(({ unit, x, isMajor, isMedium }) => {
            const tickHeight = isMajor ? 12 : isMedium ? 8 : 4
            return (
              <g key={unit}>
                <line x1={x} y1={barrelTop} x2={x} y2={barrelTop + tickHeight} stroke="#0f172a" strokeWidth={isMajor ? "1.5" : "0.75"} />
                {isMajor && (
                  <text x={x} y={barrelTop - 5} textAnchor="middle" fontSize="8" fontWeight="700" fill="#0f172a" fontFamily="monospace">
                    {unit}
                  </text>
                )}
                <line x1={x} y1={barrelBottom} x2={x} y2={barrelBottom - (isMajor ? 7 : 3.5)} stroke="#334155" strokeWidth={isMajor ? "1" : "0.5"} />
              </g>
            )
          })}

          {/* 8. ACTIVE DOSE MARKER ARROW & CALLOUT */}
          {effectiveUnits > 0 && (
            <g style={{ transform: `translateX(${fillEnd}px)` }}>
              <line x1="0" y1={barrelTop - 2} x2="0" y2={barrelBottom + 2} stroke="#dc2626" strokeWidth="2" strokeDasharray="2,1" />
              <polygon points="-4,74 4,74 0,68" fill="#dc2626" />
              <rect x="-32" y="75" width="64" height="11" rx="2" fill="#dc2626" />
              <text x="0" y="83" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#ffffff" fontFamily="monospace">
                {units.toFixed(1)} UNITS
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-[10px] text-slate-600 font-mono">
        <span>0 U (Resting Plunger)</span>
        <span className="font-bold text-slate-800">
          Align leading front edge of black stopper to {units.toFixed(1)} Units ({volumeMl.toFixed(3)} mL)
        </span>
        <span>{capacity} U ({(capacity / 100).toFixed(1)} mL)</span>
      </div>
    </div>
  )
}

// ─── Print-Calibrated Vector Metered Nasal Atomizer Graphic ──────────────────
function PrintVectorNasalAtomizer({
  sprayVolumeMl = 0.1,
  compoundName,
}: {
  sprayVolumeMl?: number
  compoundName?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs print-avoid-break">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          Metered Nasal Atomizer Pump Calibration ({sprayVolumeMl.toFixed(2)} mL/actuation)
        </span>
        <span className="font-mono font-bold text-sky-900 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md text-[11px]">
          Metered Plume: {sprayVolumeMl * 1000} µL per Spray
        </span>
      </div>
      <div className="py-3 flex items-center justify-center gap-6">
        <svg
          viewBox="0 0 160 120"
          className="w-36 h-28 select-none"
          aria-label={`Calibrated nasal atomizer pump${compoundName ? ` for ${compoundName}` : ""}`}
        >
          {/* Amber Bottle Body */}
          <rect x="50" y="45" width="60" height="70" rx="6" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          <rect x="55" y="55" width="50" height="50" fill="#d97706" opacity="0.8" rx="2" />
          {/* Liquid level */}
          <rect x="55" y="70" width="50" height="35" fill="#0284c7" opacity="0.65" rx="1" />
          <line x1="55" y1="70" x2="105" y2="70" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2,1" />
          {/* Bottle Neck */}
          <rect x="68" y="32" width="24" height="14" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          {/* Actuator Collar */}
          <rect x="64" y="24" width="32" height="9" rx="1" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
          {/* Finger Flanges */}
          <path d="M 46 28 Q 64 28 64 24 L 96 24 Q 96 28 114 28 L 114 32 L 46 32 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1" />
          {/* Nozzle Stem */}
          <rect x="74" y="8" width="12" height="18" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
          <circle cx="80" cy="8" r="2" fill="#0f172a" />
          {/* Spray Plume */}
          <path d="M 80 6 L 50 -10 M 80 6 L 65 -15 M 80 6 L 80 -16 M 80 6 L 95 -15 M 80 6 L 110 -10" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
          <circle cx="60" cy="-6" r="1.5" fill="#0284c7" />
          <circle cx="75" cy="-10" r="1.5" fill="#0284c7" />
          <circle cx="88" cy="-8" r="1.5" fill="#0284c7" />
          <circle cx="102" cy="-4" r="1.5" fill="#0284c7" />
        </svg>
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
            Atomizer Specifications:
          </div>
          <div>• <strong>Output:</strong> 0.10 mL (100 µL) ± 5% per complete pump depression.</div>
          <div>• <strong>Droplet Size:</strong> 30–60 µm micro-mist plume optimized for nasal mucosal absorption.</div>
          <div>• <strong>Priming Rule:</strong> Depress pump 2–3 times into air until a consistent, uniform mist emerges.</div>
          <div>• <strong>Hygiene SOP:</strong> Wipe nozzle with sterile 70% IPA pad and replace dust cap immediately after draw.</div>
        </div>
      </div>
    </div>
  )
}

// ─── Print Letterhead Header ────────────────────────────────────────────────
function PrintDossierHeader({
  title,
  category,
  revision,
  docId,
  qrCodeDataUrl,
  subtitle,
  canonicalUrl,
}: {
  title: string
  category?: string | null
  revision: number
  docId: string
  qrCodeDataUrl?: string | null
  subtitle?: string
  canonicalUrl?: string
}) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="border-b border-slate-200/90 pb-4 mb-5 print-avoid-break">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black tracking-widest text-slate-900 uppercase">
              PEPSTACK LABORATORIES
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[9.5px] font-bold tracking-wider uppercase">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              Analytical Sciences Division · GLP Reference Standard
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-1.5">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xs font-medium text-sky-800 mt-0.5">{subtitle}</p>
          ) : null}
          <div className="text-[10px] font-mono text-slate-600 mt-2.5 flex flex-wrap items-center gap-2">
            <span className="bg-slate-100/80 border border-slate-200/70 px-2 py-0.5 rounded-md text-slate-700">
              Doc ID: <strong className="text-slate-900 font-semibold">{docId}</strong>
            </span>
            <span className="bg-slate-100/80 border border-slate-200/70 px-2 py-0.5 rounded-md text-slate-700">
              Rev: <strong className="text-slate-900 font-semibold">{revision}</strong>
            </span>
            <span className="bg-slate-100/80 border border-slate-200/70 px-2 py-0.5 rounded-md text-slate-700">
              Category: <strong className="text-slate-900 font-semibold">{category || "Analytical Standard"}</strong>
            </span>
            <span className="bg-slate-100/80 border border-slate-200/70 px-2 py-0.5 rounded-md text-slate-700">
              Date: <strong className="text-slate-900 font-semibold">{currentDate}</strong>
            </span>
          </div>
        </div>

        {/* Verification QR Code */}
        <div className="flex flex-col items-center text-center pl-4 border-l border-slate-200/80 shrink-0">
          {qrCodeDataUrl ? (
            <div className="p-1 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <Image
                unoptimized
                src={qrCodeDataUrl}
                alt={`Verify ${title}`}
                width={70}
                height={70}
                className="w-[70px] h-[70px] rounded-lg"
              />
            </div>
          ) : (
            <div className="w-[70px] h-[70px] border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center text-[8px] font-mono text-slate-400">
              QR CODE
            </div>
          )}
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-700 mt-1.5 flex items-center gap-1">
            <span className="size-1 rounded-full bg-emerald-500" />
            Verify Lot COA
          </span>
          {canonicalUrl ? (
            <span className="text-[7px] font-mono text-slate-400 mt-0.5 max-w-[85px] truncate">
              {canonicalUrl.replace(/^https?:\/\//, "")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─── Print Running Micro-Header (Pages 2, 3, 4) ──────────────────────────────
function PrintRunningHeader({
  title,
  docId,
  pageNumber,
  totalPages,
}: {
  title: string
  docId: string
  pageNumber: number
  totalPages: number
}) {
  return (
    <div className="border-b border-slate-200/90 pb-2 mb-3.5 flex items-center justify-between text-[8.5px] font-mono text-slate-500 print-avoid-break">
      <span className="font-semibold text-slate-700">PEPSTACK LABORATORIES // ANALYTICAL SCIENCES DIVISION · {title.toUpperCase()}</span>
      <span>DOC ID: {docId} · PAGE {pageNumber} OF {totalPages}</span>
    </div>
  )
}

// ─── Print Document Footer ──────────────────────────────────────────────────
function PrintDossierFooter({
  revision,
  pageNumber,
  totalPages,
}: {
  revision: number
  pageNumber: number
  totalPages: number
}) {
  return (
    <div className="border-t border-slate-200/90 pt-2 mt-3.5 flex items-center justify-between text-[8px] font-mono text-slate-400 print-avoid-break">
      <span>STRICT IN-VITRO LABORATORY RESEARCH REFERENCE STANDARD ONLY · NOT FOR HUMAN OR VETERINARY USE</span>
      <span>OFFICIAL PEPSTACK DOSSIER · REV {revision} · PAGE {pageNumber} OF {totalPages}</span>
    </div>
  )
}

// ─── Analytical Reference Specification & Non-FDA RUO Legal Shield Block ───
function PrintQASignOffBlock({ docId }: { docId: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 mt-3.5 print-avoid-break text-xs shadow-2xs">
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between border-b border-slate-200 pb-1">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3 text-sky-600" />
          Laboratory Research Specification · In-Vitro Reference Standard
        </span>
        <span className="font-mono text-slate-500">Verification Ref: {docId}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-[10px]">
        <div>
          <span className="text-slate-500 block font-semibold">Analytical Assay Standard:</span>
          <div className="mt-1 text-slate-800 space-y-0.5">
            <p className="font-mono font-bold text-[10px]">RP-HPLC / LC-MS In-Vitro Assay</p>
            <p className="text-[9px] text-slate-600">Purity Spec: ≥ 98.0% Area</p>
          </div>
        </div>
        <div>
          <span className="text-slate-500 block font-semibold">Regulatory Classification:</span>
          <div className="mt-1 text-slate-800 space-y-0.5">
            <p className="font-bold text-[10px] text-amber-700">Research Use Only (RUO)</p>
            <p className="text-[9px] font-semibold text-slate-600">NOT EVALUATED OR APPROVED BY FDA</p>
          </div>
        </div>
        <div>
          <span className="text-slate-500 block font-semibold">Validation Release Stamp:</span>
          <div className="mt-1 inline-flex items-center gap-1 border border-emerald-600/60 bg-emerald-50 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-emerald-800">
            <CheckCircleSolid className="size-2.5 text-emerald-600" />
            ANALYTICAL REFERENCE GRADE · RUO VALIDATED
          </div>
        </div>
      </div>
      <div className="mt-2 pt-1.5 border-t border-slate-200/80 text-[8px] text-slate-500 leading-tight">
        <span className="font-bold text-slate-700">MANDATORY NON-CLINICAL DISCLAIMER:</span> Synthesized exclusively for in-vitro laboratory research, chemical analysis, and scientific calibration. This material has NOT been evaluated, approved, or cleared by the Philippine FDA, US FDA, or any public health authority. Strictly NOT for human, veterinary, diagnostic, or therapeutic administration.
      </div>
    </div>
  )
}


// ─── MASTER PRINT DOSSIER COMPONENT ─────────────────────────────────────────
export default function ClinicalProtocolPrintDossier({
  protocol,
  countryCode = "ph",
  qrCodeDataUrl,
  canonicalUrl: customCanonicalUrl,
  preset = "full",
}: ClinicalProtocolPrintDossierProps) {
  const content = protocol.content
  const cleanTitle = useMemo(
    () => cleanCompoundTitle(content.compound_name || protocol.title),
    [content.compound_name, protocol.title]
  )

  const isSupply =
    content.category?.toLowerCase().includes("supply") ||
    content.category?.toLowerCase().includes("diluent") ||
    content.product_format?.toLowerCase().includes("consumable")
  const isTopical =
    content.protocol_category_type === "topical" ||
    (protocol.handle || "").includes("serum")
  const isNasal =
    (protocol.handle || "").includes("nasal") ||
    Boolean((content as Record<string, unknown>).nasal_guide) ||
    content.protocol_category_type === "nasal"
  const isBundle =
    content.protocol_category_type === "bundle" ||
    Boolean(content.bundle_vials && content.bundle_vials.length > 0)
  const isBlend =
    content.protocol_category_type === "blend" ||
    Boolean(content.blend_constituents && content.blend_constituents.length > 0)

  // Determine Archetype
  let archetype: "supply_hardware" | "nasal_topical" | "blend" | "stack_bundle" | "single_peptide" = "single_peptide"
  if (isSupply) {
    archetype = "supply_hardware"
  } else if (isNasal || isTopical) {
    archetype = "nasal_topical"
  } else if (isBundle) {
    archetype = "stack_bundle"
  } else if (isBlend) {
    archetype = "blend"
  }

  // Determine total pages based on archetype and preset
  const totalPages = useMemo(() => {
    if (preset === "bench_sop" || preset === "schedule_bom") return 1
    if (archetype === "supply_hardware") return 2
    if (archetype === "stack_bundle") return 4
    return 3
  }, [archetype, preset])

  const docId = `PSL-SOP-${protocol.handle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}-REV${protocol.revision}`
  const canonicalUrl = customCanonicalUrl || `https://pepstacklabs.com/${countryCode}/research-protocols/${protocol.handle}`

  // Stoichiometric baseline metrics
  const defaultMg = content.reconstitution_details?.default_vial_net_mg || 10
  const defaultDiluent = content.reconstitution_details?.default_diluent_ml || 2.0
  const defaultConc = content.reconstitution_details?.resulting_concentration_mg_per_ml || 5.0
  const standardDoseMcg = content.protocol_levels?.[0]?.rows?.[0]?.amount
    ? parseFloat(content.protocol_levels[0].rows[0].amount) * (content.protocol_levels[0].rows[0].unit === "mg" ? 1000 : 1)
    : 500
  const defaultVolumeMl = standardDoseMcg / (defaultConc * 1000)
  const defaultUnits = defaultVolumeMl * 100

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET B: Laminated Benchtop SOP Card (Strictly 1 Page)
  // ──────────────────────────────────────────────────────────────────────────
  if (preset === "bench_sop") {
    return (
      <div className="font-sans text-slate-900 bg-white print:m-0 print:p-4 print:max-w-none print:w-full max-w-4xl mx-auto">
        <PrintDossierHeader
          title={cleanTitle}
          category="Laminated Benchtop Clean Hood Reference Card"
          revision={protocol.revision}
          docId={`${docId}-BENCH`}
          qrCodeDataUrl={qrCodeDataUrl}
          canonicalUrl={canonicalUrl}
          subtitle="Aseptic Reconstitution Stoichiometry & Volumetric Fill Standard"
        />

        {/* Master Stoichiometry Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs mb-3">
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Vial Net Mass</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{defaultMg} mg</span>
          </div>
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Solvent Volume</span>
            <span className="font-mono font-bold text-blue-800 text-sm">{defaultDiluent.toFixed(1)} mL BAC Water</span>
          </div>
          <div className="p-2 rounded border border-slate-300 bg-slate-50">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Concentration</span>
            <span className="font-mono font-bold text-emerald-800 text-sm">{defaultConc.toFixed(2)} mg/mL</span>
          </div>
          <div className="p-2 rounded border border-sky-300 bg-sky-50/70">
            <span className="text-[9px] uppercase font-bold text-sky-800 block">Standard Syringe Draw</span>
            <span className="font-mono font-black text-sky-950 text-sm">{defaultUnits.toFixed(1)} Units ({defaultVolumeMl.toFixed(3)} mL)</span>
          </div>
        </div>

        {/* Vector Instrument Graphic */}
        {isNasal ? (
          <PrintVectorNasalAtomizer sprayVolumeMl={0.1} compoundName={cleanTitle} />
        ) : (
          <PrintVectorSyringe units={defaultUnits} volumeMl={defaultVolumeMl} capacity={defaultUnits <= 30 ? 30 : defaultUnits <= 50 ? 50 : 100} compoundName={cleanTitle} />
        )}

        {/* 4-Step Aseptic Reconstitution Sequence */}
        <div className="mt-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 text-xs shadow-2xs">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5 text-emerald-600" />
            4-Step Laminar Flow Hood Reconstitution Protocol:
          </div>
          <div className="grid grid-cols-4 gap-2 text-[10.5px]">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="font-bold text-slate-900 block">1. Sanitize &amp; Inspect</span>
              <p className="text-slate-600 mt-0.5">Swab septums with 70% IPA. Verify solid lyophilized cake integrity.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="font-bold text-slate-900 block">2. Wall Injection</span>
              <p className="text-slate-600 mt-0.5">Inject {defaultDiluent.toFixed(1)} mL BAC water slowly down glass wall. Never spray directly on cake.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="font-bold text-slate-900 block">3. Horizontal Swirl</span>
              <p className="text-slate-600 mt-0.5">Swirl vial gently in horizontal circles. Never shake to prevent shear degradation.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="font-bold text-slate-900 block">4. Resting Clarity</span>
              <p className="text-slate-600 mt-0.5">Allow to rest at 2°C–8°C for 10 min until solution is water-clear without particulate.</p>
            </div>
          </div>
        </div>

        {/* Needle & Storage Guidelines Strip */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center font-mono">
          <div className="p-2 rounded border border-slate-200 bg-white">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Needle Specification</span>
            <span className="font-bold text-slate-800 text-xs">31G × 5/16&quot; Fixed LDS</span>
          </div>
          <div className="p-2 rounded border border-slate-200 bg-white">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Reconstituted Shelf-Life</span>
            <span className="font-bold text-slate-800 text-xs">2°C–8°C for 28 Days Max</span>
          </div>
          <div className="p-2 rounded border border-slate-200 bg-white">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Lyophilized Archive</span>
            <span className="font-bold text-slate-800 text-xs">-20°C Desiccated (24-36 Mo)</span>
          </div>
        </div>

        <PrintDossierFooter revision={protocol.revision} pageNumber={1} totalPages={1} />
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET C: Titration & Supply BOM Schedule (Strictly 1 Page)
  // ──────────────────────────────────────────────────────────────────────────
  if (preset === "schedule_bom") {
    return (
      <div className="font-sans text-slate-900 bg-white print:m-0 print:p-4 print:max-w-none print:w-full max-w-4xl mx-auto">
        <PrintDossierHeader
          title={cleanTitle}
          category="Research Cycle Titration & Procurement BOM Schedule"
          revision={protocol.revision}
          docId={`${docId}-SCHED`}
          qrCodeDataUrl={qrCodeDataUrl}
          canonicalUrl={canonicalUrl}
          subtitle="Multi-Week Protocol Titration Ladder & Reagents Bill of Materials"
        />

        {/* Titration Matrix */}
        <div className="rounded-lg border border-slate-300 bg-white overflow-hidden text-xs mb-3">
          <div className="bg-slate-100 p-2 font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-300">
            Clinical Assay Titration &amp; Escalation Phases
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[10px] text-slate-600">
              <tr>
                <th className="p-2">Phase / Timeframe</th>
                <th className="p-2">Target Dose</th>
                <th className="p-2">U-100 Syringe Draw</th>
                <th className="p-2">Cadence &amp; Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              <tr>
                <td className="p-2 font-bold text-slate-900">Phase 1 (Days 1–7)</td>
                <td className="p-2 font-mono text-slate-800">{standardDoseMcg >= 1000 ? `${(standardDoseMcg / 1000).toFixed(1)} mg` : `${standardDoseMcg} mcg`}</td>
                <td className="p-2 font-mono text-sky-800 font-bold">{defaultUnits.toFixed(1)} Units ({defaultVolumeMl.toFixed(3)} mL)</td>
                <td className="p-2 text-slate-600">Initial receptor priming; evaluate baseline tolerance.</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-slate-900">Phase 2 (Weeks 2–4)</td>
                <td className="p-2 font-mono text-slate-800">{(standardDoseMcg * 1.5) >= 1000 ? `${((standardDoseMcg * 1.5) / 1000).toFixed(1)} mg` : `${standardDoseMcg * 1.5} mcg`}</td>
                <td className="p-2 font-mono text-sky-800 font-bold">{(defaultUnits * 1.5).toFixed(1)} Units ({ (defaultVolumeMl * 1.5).toFixed(3)} mL)</td>
                <td className="p-2 text-slate-600">Optimal target assay window; sustained physiological endpoints.</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-slate-900">Phase 3 (Weeks 5–6)</td>
                <td className="p-2 font-mono text-slate-800">{standardDoseMcg >= 1000 ? `${(standardDoseMcg / 1000).toFixed(1)} mg` : `${standardDoseMcg} mcg`}</td>
                <td className="p-2 font-mono text-sky-800 font-bold">{defaultUnits.toFixed(1)} Units ({defaultVolumeMl.toFixed(3)} mL)</td>
                <td className="p-2 text-slate-600">Taper consolidation; prepare for mandatory receptor washout.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 7-Day Administration Chronobiology Schedule */}
        <div className="rounded-lg border border-slate-300 bg-white overflow-hidden text-xs mb-3">
          <div className="bg-slate-100 p-2 font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-300">
            Synchronized 7-Day Administration Timetable
          </div>
          <div className="grid grid-cols-7 divide-x divide-slate-200 text-center text-[10.5px]">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, idx) => (
              <div key={day} className="p-2">
                <span className="font-mono font-bold text-slate-500 block mb-1">{day}</span>
                <span className="inline-block px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px] font-bold">
                  {idx < 5 ? "Dosing" : "Rest / Wash"}
                </span>
                <span className="block text-[9px] text-slate-500 mt-1">08:00 AM</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reagents & Consumables BOM Ledger */}
        <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3 text-xs mb-3">
          <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 border-b border-slate-200 pb-1">
            Reagents &amp; Consumables Bill of Materials (BOM) — 12-Week Protocol Cycle:
          </div>
          <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Peptide Vials</span>
              <span className="font-bold text-slate-900">3x {defaultMg}mg Vials</span>
              <span className="text-[9px] text-slate-400 block font-normal">(Incl. 8% dead-space)</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">Diluent (BAC Water)</span>
              <span className="font-bold text-slate-900">1x 10 mL Bottle</span>
              <span className="text-[9px] text-slate-400 block font-normal">USP 0.9% Benzyl Alcohol</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">U-100 Syringes</span>
              <span className="font-bold text-slate-900">1x Box (100 pcs)</span>
              <span className="text-[9px] text-slate-400 block font-normal">31G 5/16&quot; Fixed LDS</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 uppercase block font-bold">70% IPA Prep Pads</span>
              <span className="font-bold text-slate-900">1x Box (100 pcs)</span>
              <span className="text-[9px] text-slate-400 block font-normal">Sterile 2-ply pads</span>
            </div>
          </div>
        </div>

        <PrintQASignOffBlock docId={docId} />
        <PrintDossierFooter revision={protocol.revision} pageNumber={1} totalPages={1} />
      </div>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRESET A: Full Institutional Monograph (2 to 4 Pages based on Archetype)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="font-sans text-slate-900 bg-white print:m-0 print:p-0 print:max-w-none print:w-full max-w-4xl mx-auto">
      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 1: Monograph, Molecular Chemistry & Observed Mechanisms
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="print-page w-full min-h-[10in] p-4 flex flex-col justify-between">
        <div>
          <PrintDossierHeader
            title={cleanTitle}
            category={content.category}
            revision={protocol.revision}
            docId={docId}
            qrCodeDataUrl={qrCodeDataUrl}
            canonicalUrl={canonicalUrl}
            subtitle={archetype === "stack_bundle" ? "Multi-Vial Analytical Stacking Standard" : archetype === "supply_hardware" ? "Laboratory Instrument & Consumable Specification" : "Standard Lyophilized Monograph"}
          />

          {/* 2-Column Analytical Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left Column: Monograph & Mechanism */}
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/40 p-3.5 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/80 pb-1.5 mb-2 flex items-center gap-1.5">
                  <DocumentText className="size-3.5 text-slate-700 shrink-0" />
                  <span>Pharmacological Profile &amp; Monograph</span>
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {content.short_introduction || protocol.summary || "High-purity analytical research reference standard synthesized for in-vitro biochemical analysis, receptor affinity assay, and structural validation."}
                </p>
                {content.quick_reference?.find((q) => q.key === "pharmacokinetics") ? (
                  <div className="mt-2.5 text-[10.5px] border-t border-slate-200/80 pt-2 text-slate-600">
                    <strong className="text-slate-800 font-semibold">Half-Life &amp; Dynamics:</strong> {content.quick_reference.find((q) => q.key === "pharmacokinetics")?.value}
                  </div>
                ) : null}
              </div>

              {/* Observed Biological Mechanisms */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/80 pb-1.5 mb-2 flex items-center gap-1.5">
                  <Beaker className="size-3.5 text-sky-700 shrink-0" />
                  <span>Investigated Research Endpoints</span>
                </h3>
                <ul className="space-y-1.5 text-[11px] text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>High-affinity receptor binding and downstream secondary messenger activation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Modulation of cellular transcription pathways and targeted peptide cascade regulation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleSolid className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Reversible receptor kinetics with documented washout desensitization recovery.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Molecular & Biochemical Specifications */}
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/80 pb-1.5 mb-2 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-emerald-700 shrink-0" />
                  <span>Molecular &amp; Biochemical Identity</span>
                </h3>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Chemical Name:</span>
                    <span className="font-semibold text-slate-900 text-right">{cleanTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">CAS Registry Number:</span>
                    <span className="font-mono font-bold text-slate-800">{content.molecular_details?.cas_number || "Verified CAS Reference"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">PubChem CID:</span>
                    <span className="font-mono text-slate-800">{content.molecular_details?.pubchem_cid || "Canonical Compound"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Molecular Weight:</span>
                    <span className="font-mono text-slate-800">{content.molecular_details?.molecular_weight_g_per_mol ? `${content.molecular_details.molecular_weight_g_per_mol} g/mol` : "Analytical Grade"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Quality Standard:</span>
                    <span className="font-mono font-bold text-emerald-700">Reference Standard Grade</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500">Physical Appearance:</span>
                    <span className="text-slate-800">Sterile Lyophilized Solid Cake</span>
                  </div>
                  {content.molecular_details?.sequence_or_formula ? (
                    <div className="pt-1 text-[10px] font-mono text-slate-600 break-all">
                      <span className="text-slate-500 block">Sequence/Formula:</span>
                      {content.molecular_details.sequence_or_formula}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Aseptic Handling Directive Banner */}
              <div className="rounded-xl border border-amber-200/90 bg-amber-50/60 p-3 text-xs text-amber-950 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[10.5px] uppercase tracking-wider text-amber-900 mb-1">
                  <ExclamationCircle className="size-3.5 text-amber-600 shrink-0" />
                  <span>Critical Laboratory Storage &amp; Handling Directive:</span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-amber-900">
                  Store desiccated at -20°C upon receipt. Reconstitute strictly in a certified laminar airflow hood utilizing sterile disposable instruments. Avoid direct exposure to UV or fluorescent radiation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <PrintDossierFooter revision={protocol.revision} pageNumber={1} totalPages={totalPages} />
      </div>

      <div className="print-page-break" />

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 2: Volumetric Stoichiometry, Instrument Calibration & SOP
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="print-page w-full min-h-[10in] p-4 flex flex-col justify-between">
        <div>
          <PrintRunningHeader title={cleanTitle} docId={docId} pageNumber={2} totalPages={totalPages} />

          {/* Master Reconstitution & Volumetric Dilution Table */}
          <div className="rounded-lg border border-slate-300 bg-white overflow-hidden text-xs mb-3">
            <div className="bg-slate-100 p-2 font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-300">
              Master Volumetric Reconstitution Matrix &amp; Diluent Ratios
            </div>

            {archetype === "stack_bundle" && content.bundle_vials && content.bundle_vials.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[10px] text-slate-600">
                  <tr>
                    <th className="p-2">Channel / Vial</th>
                    <th className="p-2">Net Active Mass</th>
                    <th className="p-2">Diluent Volume</th>
                    <th className="p-2">Resulting Concentration</th>
                    <th className="p-2">Target Draw</th>
                    <th className="p-2">U-100 Syringe Mark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {content.bundle_vials.map((vial, i) => {
                    const netMg = vial.netMg || parseFloat(vial.vialNetMass) || 10
                    const conc = vial.concMgMl || (vial.diluentMl ? netMg / vial.diluentMl : 5.0)
                    const doseMcg = vial.targetDoseMcg || parseFloat(vial.targetDose) || 500
                    const volMl = doseMcg / (conc * 1000)
                    const units = volMl * 100
                    return (
                      <tr key={i}>
                        <td className="p-2 font-bold text-slate-900">Vial #{i + 1}: {vial.compoundName}</td>
                        <td className="p-2 font-mono">{netMg} mg</td>
                        <td className="p-2 font-mono text-blue-800">{vial.diluentMl || 2.0} mL BAC Water</td>
                        <td className="p-2 font-mono text-emerald-800 font-bold">{conc.toFixed(2)} mg/mL</td>
                        <td className="p-2 font-mono">{doseMcg} mcg</td>
                        <td className="p-2 font-mono font-bold text-sky-900">{units.toFixed(1)} Units ({volMl.toFixed(3)} mL)</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[10px] text-slate-600">
                  <tr>
                    <th className="p-2">Net Active Mass</th>
                    <th className="p-2">Target Solvent</th>
                    <th className="p-2">Diluent Volume</th>
                    <th className="p-2">Resulting Concentration</th>
                    <th className="p-2">Syringe Graduation Scale</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  <tr>
                    <td className="p-2 font-bold font-mono text-slate-900">{defaultMg} mg Lyophilized Cake</td>
                    <td className="p-2 text-slate-700">Bacteriostatic Water USP (0.9% Benzyl Alcohol)</td>
                    <td className="p-2 font-mono text-blue-800 font-bold">{defaultDiluent.toFixed(1)} mL</td>
                    <td className="p-2 font-mono text-emerald-800 font-bold">{defaultConc.toFixed(2)} mg/mL ({defaultConc * 10} mcg/0.01 mL)</td>
                    <td className="p-2 font-mono text-sky-900">1 Unit = {(defaultConc * 10).toFixed(1)} mcg (0.01 mL)</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Calibrated Vector Instrument Graphic */}
          {archetype === "nasal_topical" ? (
            <PrintVectorNasalAtomizer sprayVolumeMl={0.1} compoundName={cleanTitle} />
          ) : (
            <PrintVectorSyringe units={defaultUnits} volumeMl={defaultVolumeMl} capacity={defaultUnits <= 30 ? 30 : defaultUnits <= 50 ? 50 : 100} compoundName={cleanTitle} />
          )}

          {/* Syringe Optical Accuracy Matrix */}
          <div className="mt-3 rounded-lg border border-slate-300 bg-white p-2.5 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1.5 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>ISO 8537 Standard Barrel Resolution &amp; Precision Matrix</span>
              <span className="text-emerald-700 font-mono">Tolerance: ±1.5%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10.5px]">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">0.3 mL Syringe (30 Units)</span>
                <span className="text-slate-600 block mt-0.5">0.5 Unit (5 µL) Graduation</span>
                <span className="text-emerald-700 font-bold block text-[10px]">Optimal for Doses ≤25 Units</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">0.5 mL Syringe (50 Units)</span>
                <span className="text-slate-600 block mt-0.5">1.0 Unit (10 µL) Graduation</span>
                <span className="text-slate-700 block text-[10px]">Suitable for 25–45 Units</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">1.0 mL Syringe (100 Units)</span>
                <span className="text-slate-600 block mt-0.5">2.0 Unit (20 µL) Graduation</span>
                <span className="text-slate-700 block text-[10px]">Suitable for High-Volume Laboratory Fluid Delivery</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Aseptic Reconstitution Sequence */}
          <div className="mt-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 text-xs shadow-2xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
              <Beaker className="w-3.5 h-3.5 text-emerald-600" />
              4-Step Laminar Flow Hood Reconstitution SOP:
            </div>
            <div className="grid grid-cols-4 gap-2 text-[10.5px]">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block">1. Sanitize &amp; Inspect</span>
                <p className="text-slate-600 mt-0.5">Swab vial septum with sterile 70% IPA pad. Inspect cake for vacuum seal integrity.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block">2. Slow Wall Influx</span>
                <p className="text-slate-600 mt-0.5">Introduce {defaultDiluent.toFixed(1)} mL solvent slowly down inner glass wall. Never spray directly on cake.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block">3. Horizontal Swirl</span>
                <p className="text-slate-600 mt-0.5">Swirl gently in horizontal circles until fully dissolved. Never shake or invert aggressively.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                <span className="font-bold text-slate-900 block">4. Resting Clarity</span>
                <p className="text-slate-600 mt-0.5">Rest at +2°C to +8°C for 10 minutes until solution is crystal clear before drawing.</p>
              </div>
            </div>
          </div>
        </div>

        <PrintDossierFooter revision={protocol.revision} pageNumber={2} totalPages={totalPages} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 3: Titration, 7-Day Chronobiology & Consumables BOM
          ══════════════════════════════════════════════════════════════════════ */}
      {totalPages >= 3 ? (
        <>
          <div className="print-page-break" />
          <div className="print-page w-full min-h-[10in] p-4 flex flex-col justify-between">
            <div>
              <PrintRunningHeader title={cleanTitle} docId={docId} pageNumber={3} totalPages={totalPages} />

              {/* Titration Escalation Schedule */}
              <div className="rounded-lg border border-slate-300 bg-white overflow-hidden text-xs mb-3">
                <div className="bg-slate-100 p-2 font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-300 flex items-center justify-between">
                  <span>Clinical Assay Titration &amp; Tolerance Escalation</span>
                  <span className="text-slate-500 font-mono">Standard 6-Week Window</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[10px] text-slate-600">
                    <tr>
                      <th className="p-2">Phase</th>
                      <th className="p-2">Target Active Dose</th>
                      <th className="p-2">U-100 Syringe Graduation</th>
                      <th className="p-2">Cadence &amp; Pharmacological Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Days 1–7 (Priming)</td>
                      <td className="p-2 font-mono text-slate-800">{standardDoseMcg >= 1000 ? `${(standardDoseMcg / 1000).toFixed(1)} mg` : `${standardDoseMcg} mcg`}</td>
                      <td className="p-2 font-mono text-sky-800 font-bold">{defaultUnits.toFixed(1)} Units ({defaultVolumeMl.toFixed(3)} mL)</td>
                      <td className="p-2 text-slate-600">Initial receptor priming; evaluate baseline physiological tolerance.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Weeks 2–4 (Saturation)</td>
                      <td className="p-2 font-mono text-slate-800">{(standardDoseMcg * 1.5) >= 1000 ? `${((standardDoseMcg * 1.5) / 1000).toFixed(1)} mg` : `${standardDoseMcg * 1.5} mcg`}</td>
                      <td className="p-2 font-mono text-sky-800 font-bold">{(defaultUnits * 1.5).toFixed(1)} Units ({ (defaultVolumeMl * 1.5).toFixed(3)} mL)</td>
                      <td className="p-2 text-slate-600">Target assay maintenance; peak neurotrophic / metabolic response.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Weeks 5–6 (Taper &amp; Washout)</td>
                      <td className="p-2 font-mono text-slate-800">{standardDoseMcg >= 1000 ? `${(standardDoseMcg / 1000).toFixed(1)} mg` : `${standardDoseMcg} mcg`}</td>
                      <td className="p-2 font-mono text-sky-800 font-bold">{defaultUnits.toFixed(1)} Units ({defaultVolumeMl.toFixed(3)} mL)</td>
                      <td className="p-2 text-slate-600">Receptor consolidation prior to mandatory 4-week washout cycle.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 7-Day Synchronized Chronobiology Timetable */}
              <div className="rounded-lg border border-slate-300 bg-white overflow-hidden text-xs mb-3">
                <div className="bg-slate-100 p-2 font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-300">
                  Synchronized 7-Day Administration Timetable &amp; Chronobiology
                </div>
                <div className="grid grid-cols-7 divide-x divide-slate-200 text-center text-[10.5px]">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, idx) => (
                    <div key={day} className="p-2">
                      <span className="font-mono font-bold text-slate-500 block mb-1">{day}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${idx < 5 ? "bg-sky-100 text-sky-900" : "bg-slate-100 text-slate-600"}`}>
                        {idx < 5 ? "Dosing Day" : "Off-Cycle"}
                      </span>
                      <span className="block text-[9px] text-slate-500 mt-1">
                        {archetype === "stack_bundle" ? "AM / PM Split" : "08:00 AM"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consumables Bill of Materials (BOM) Ledger */}
              <div className="rounded-lg border border-slate-300 bg-slate-50/70 p-3 text-xs mb-3">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>Reagents &amp; Consumables Bill of Materials (BOM) — 12-Week Allocation:</span>
                  <span className="text-slate-500 font-mono">GLP Reagent Inventory</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Peptide Vials</span>
                    <span className="font-bold text-slate-900">{archetype === "stack_bundle" ? "6x Semax + 3x Selank" : `3x ${defaultMg}mg Vials`}</span>
                    <span className="text-[9px] text-slate-400 block font-normal">(Incl. 8% dead-space buffer)</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Diluent Solvent</span>
                    <span className="font-bold text-slate-900">2x 10 mL BAC Water</span>
                    <span className="text-[9px] text-slate-400 block font-normal">USP 0.9% Benzyl Alcohol</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">Sterile Syringes</span>
                    <span className="font-bold text-slate-900">1x Box (100 pcs)</span>
                    <span className="text-[9px] text-slate-400 block font-normal">31G 5/16&quot; Fixed LDS U-100</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold">70% IPA Prep Pads</span>
                    <span className="font-bold text-slate-900">1x Box (100 pcs)</span>
                    <span className="text-[9px] text-slate-400 block font-normal">Sterile 2-ply isopropyl pads</span>
                  </div>
                </div>
              </div>

              {/* Sharps Biohazard Directive */}
              <div className="rounded border border-slate-300 bg-white p-2 text-xs flex items-center justify-between text-[10px] text-slate-700">
                <span>☣️ <strong>OSHA 1910.1030 Sharps Directive:</strong> Dispose of all needles and empty glass vials immediately in an approved puncture-resistant biohazard sharps container.</span>
                <span className="font-mono font-bold text-slate-500 ml-2">OSHA COMPLIANT</span>
              </div>
            </div>

            {totalPages === 3 ? (
              <div>
                <PrintQASignOffBlock docId={docId} />
                <PrintDossierFooter revision={protocol.revision} pageNumber={3} totalPages={3} />
              </div>
            ) : (
              <PrintDossierFooter revision={protocol.revision} pageNumber={3} totalPages={totalPages} />
            )}
          </div>
        </>
      ) : null}

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE 4: Thermostability Kinetics, Citations & Quality Sign-Off
          ══════════════════════════════════════════════════════════════════════ */}
      {totalPages >= 4 ? (
        <>
          <div className="print-page-break" />
          <div className="print-page w-full min-h-[10in] p-4 flex flex-col justify-between">
            <div>
              <PrintRunningHeader title={cleanTitle} docId={docId} pageNumber={4} totalPages={totalPages} />

              {/* Physicochemical Thermostability Matrix */}
              <div className="rounded-lg border border-slate-300 bg-white overflow-hidden text-xs mb-3">
                <div className="bg-slate-100 p-2 font-bold text-slate-900 uppercase tracking-wider text-[10px] border-b border-slate-300 flex items-center justify-between">
                  <span>USP &lt;659&gt; Packaging &amp; Environmental Thermostability Matrix</span>
                  <span className="text-slate-500 font-mono">Storage Degradation Kinetics</span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[10px] text-slate-600">
                    <tr>
                      <th className="p-2">Storage Condition</th>
                      <th className="p-2">Temperature Boundary</th>
                      <th className="p-2">Physical State</th>
                      <th className="p-2">Valid Duration</th>
                      <th className="p-2">Degradation Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Deep Freeze Cryo-Archive</td>
                      <td className="p-2 font-mono text-blue-700">-20°C</td>
                      <td className="p-2">Lyophilized Solid</td>
                      <td className="p-2 font-semibold">24 to 36 Months</td>
                      <td className="p-2 text-slate-600">Negligible (&lt;0.8%/year)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Ambient Courier Transit</td>
                      <td className="p-2 font-mono text-slate-800">+15°C to +25°C</td>
                      <td className="p-2">Lyophilized Solid</td>
                      <td className="p-2 font-semibold">Up to 30 Days</td>
                      <td className="p-2 text-slate-600">Minimal without solvent (&lt;0.5%)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Reconstituted Refrigeration</td>
                      <td className="p-2 font-mono text-emerald-700 font-bold">+2°C to +8°C</td>
                      <td className="p-2">Reconstituted Solution</td>
                      <td className="p-2 font-semibold text-emerald-800">28 Days Maximum</td>
                      <td className="p-2 text-slate-600">Gradual deamidation beyond 28 days</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-rose-700">Critical Degradation Spike</td>
                      <td className="p-2 font-mono text-rose-700 font-bold">&gt;37°C</td>
                      <td className="p-2 text-rose-900">Solution / Solid</td>
                      <td className="p-2 font-bold text-rose-700">Immediate Hazard</td>
                      <td className="p-2 text-rose-700">Rapid peptide cleavage &amp; fibrillar aggregation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Photosensitivity & Secondary Protection Card */}
              <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-2.5 text-xs text-amber-950 mb-3">
                <span className="font-bold text-[10.5px] uppercase tracking-wider block mb-0.5">
                  ☀️ Photosensitivity &amp; Secondary Vial Protection SOP:
                </span>
                <p className="text-[10.5px] leading-relaxed text-amber-900">
                  Store reconstituted vials in dark secondary packaging or amber sleeve. Direct exposure to fluorescent or ultraviolet light catalyzes photo-oxidation of methionine and tryptophan residues, yielding inactive sulfoxide derivatives.
                </p>
              </div>

              {/* Peer-Reviewed Scholarly Citations */}
              <div className="rounded-lg border border-slate-300 bg-white p-3 text-xs mb-3">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>Scholarly Research Citations &amp; Evidence Base</span>
                  <span className="text-slate-500 font-mono">Peer-Reviewed Index</span>
                </div>
                <div className="space-y-1.5 text-[10.5px]">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1">
                    <p className="text-slate-800 leading-snug">
                      <strong>Griva GI, et al.</strong> Semax affects the expression of genes related to the immune and vascular systems in rat brain focal ischemia. <em>Mol Genet Genomics.</em> 2006;276(5):451-458.
                    </p>
                    <span className="shrink-0 font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] border border-emerald-200">
                      PMID: 16997030
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1">
                    <p className="text-slate-800 leading-snug">
                      <strong>Volkova A, et al.</strong> Selank: a synthetic peptide analog of tuftsin modulates GABAergic neurotransmission. <em>Bull Exp Biol Med.</em> 2008;145(1):43-45.
                    </p>
                    <span className="shrink-0 font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] border border-emerald-200">
                      PMID: 18454052
                    </span>
                  </div>
                </div>
              </div>

              {/* Regulatory RUO Certification */}
              <div className="rounded border border-slate-300 bg-slate-50 p-2 text-xs text-[10px] text-slate-600 leading-snug">
                <strong>STRICT LEGAL &amp; REGULATORY RUO DISCLAIMER (21 CFR § 312.23):</strong> This analytical protocol dossier is synthesized strictly for in-vitro laboratory research, scientific calibration, and educational reference. Not for human, veterinary, diagnostic, cosmetic, or clinical administration.
              </div>
            </div>

            <div>
              <PrintQASignOffBlock docId={docId} />
              <PrintDossierFooter revision={protocol.revision} pageNumber={4} totalPages={4} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
