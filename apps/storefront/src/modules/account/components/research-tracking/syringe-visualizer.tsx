"use client"

/**
 * @file    apps/storefront/src/modules/account/components/research-tracking/syringe-visualizer.tsx
 * @module  SyringeVisualizer (Research Tracking Module)
 * @purpose Calibrated SVG syringe fill visualizer and barrel resolution guide for customer vial hub.
 * @contracts
 *   Component: SyringeVisualizer
 *   Parent:    ResearchCalculator, ResearchOccurrenceActions
 */

import React, { useMemo, useState } from "react"

export type SyringeCapacity = 30 | 50 | 100

interface SyringeVisualizerProps {
  volumeMl?: number | null
  deviceMeasurements?: number | null
  deviceLabel?: string
  compoundName?: string
}

export default function SyringeVisualizer({
  volumeMl,
  deviceMeasurements,
  deviceLabel = "U-100 Syringe",
  compoundName,
}: SyringeVisualizerProps) {
  // Calculate units based on standard U-100 (1 mL = 100 units) or explicit device measurements
  const calculatedUnits = useMemo(() => {
    if (volumeMl != null && Number.isFinite(volumeMl) && volumeMl > 0) {
      return Number((volumeMl * 100).toFixed(1))
    }
    if (deviceMeasurements != null && Number.isFinite(deviceMeasurements) && deviceMeasurements > 0) {
      return Number(deviceMeasurements.toFixed(1))
    }
    return null
  }, [deviceMeasurements, volumeMl])

  // Intelligent default capacity based on the calculated volume
  const defaultCapacity: SyringeCapacity = useMemo(() => {
    if (!calculatedUnits) return 50
    if (calculatedUnits <= 30) return 30
    if (calculatedUnits <= 50) return 50
    return 100
  }, [calculatedUnits])

  const [capacity, setCapacity] = useState<SyringeCapacity>(defaultCapacity)
  const [interactiveUnits, setInteractiveUnits] = useState<number | null>(null)
  const prevUnitsRef = React.useRef<number | null>(calculatedUnits)

  // Keep capacity in sync only when calculatedUnits externally changes
  React.useEffect(() => {
    if (calculatedUnits !== prevUnitsRef.current) {
      prevUnitsRef.current = calculatedUnits
      setInteractiveUnits(null)
      if (calculatedUnits != null) {
        if (calculatedUnits <= 30) {
          setCapacity(30)
        } else if (calculatedUnits <= 50) {
          setCapacity(50)
        } else {
          setCapacity(100)
        }
      }
    }
  }, [calculatedUnits])

  const activeDisplayUnits = interactiveUnits != null ? interactiveUnits : calculatedUnits
  const maxUnits = capacity
  const maxVolumeMl = capacity / 100
  const isOverCapacity = activeDisplayUnits != null && activeDisplayUnits > maxUnits
  const effectiveUnits = activeDisplayUnits != null ? Math.min(activeDisplayUnits, maxUnits) : 0

  // SVG Geometry constants
  const barrelStart = 90
  const barrelEnd = 490
  const barrelWidth = barrelEnd - barrelStart // 400px
  const barrelTop = 38
  const barrelBottom = 86
  const barrelHeight = barrelBottom - barrelTop // 48px

  // Compute fill width and plunger position
  const fillRatio = activeDisplayUnits != null ? Math.min(1, Math.max(0, effectiveUnits / maxUnits)) : 0
  const fillWidth = fillRatio * barrelWidth
  const fillEnd = barrelStart + fillWidth

  // Generate tick marks based on selected capacity
  const ticks = useMemo(() => {
    const items: Array<{ unit: number; x: number; isMajor: boolean; isMedium: boolean }> = []
    const step = capacity === 100 ? 2 : 1
    for (let u = 0; u <= capacity; u += step) {
      const isMajor = u % 10 === 0
      const isMedium = !isMajor && (capacity === 30 ? u % 5 === 0 : u % 5 === 0)
      const x = barrelStart + (u / capacity) * barrelWidth
      items.push({ unit: u, x, isMajor, isMedium })
    }
    return items
  }, [capacity, barrelStart, barrelWidth])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm text-slate-900">
      {/* Header Bar & Capacity Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Calibrated Syringe Volumetric Engine
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {compoundName ? `Verified analytical draw calibration for ${compoundName}` : "Precision U-100 insulin syringe stoichiometric guide"}
          </p>
        </div>

        {/* Syringe Capacity Selector */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
          {(
            [
              { size: 30, label: "30 Unit", sub: "0.3 mL" },
              { size: 50, label: "50 Unit", sub: "0.5 mL" },
              { size: 100, label: "100 Unit", sub: "1.0 mL" },
            ] as const
          ).map(({ size, label, sub }) => {
            const active = capacity === size
            return (
              <button
                key={size}
                type="button"
                onClick={() => setCapacity(size)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>{label}</span>
                <span className="ml-1 text-[10px] font-normal opacity-90">({sub})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Target Callout Card */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50/70 px-4 py-3.5 border border-emerald-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Target Draw Graduation
            </span>
            {interactiveUnits != null && interactiveUnits !== calculatedUnits && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                Manual Calibration
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950 tabular-nums tracking-tight">
              {activeDisplayUnits != null ? activeDisplayUnits : "—"}
            </span>
            <span className="text-sm font-bold text-emerald-700">Units (IU)</span>
            {volumeMl != null && (
              <span className="text-xs font-mono text-slate-500">
                ({volumeMl.toFixed(3)} mL)
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Calibrated Standard
          </span>
          <p className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">
            {deviceLabel} ({capacity} U / {maxVolumeMl} mL)
          </p>
        </div>
      </div>

      {/* Over Capacity Warning */}
      {isOverCapacity && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>
              <strong>Volume exceeds {capacity}-unit barrel.</strong> Calculated draw is {activeDisplayUnits} units.
            </span>
          </div>
          {capacity < 100 && (
            <button
              type="button"
              onClick={() => setCapacity(100)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Switch to 100 U Barrel &rarr;
            </button>
          )}
        </div>
      )}

      {/* Micro-dose accuracy tip */}
      {calculatedUnits != null && calculatedUnits > 0 && calculatedUnits < 8 && capacity === 100 && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900">
          <svg className="h-4 w-4 shrink-0 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Resolution Standard:</strong> For micro-doses under 8 units, a 30-unit (0.3 mL) barrel reduces dead space error and expands visual tick separation.
          </span>
        </div>
      )}

      {/* SVG Syringe Canvas */}
      <div className="mt-4 overflow-x-auto py-2 rounded-2xl bg-slate-50 border border-slate-200 p-3 shadow-inner">
        <svg
          viewBox="0 0 620 120"
          className="w-full min-w-[560px] select-none"
          aria-label="Syringe fill illustration"
        >
          <defs>
            {/* Liquid gradient */}
            <linearGradient id="liquidGradModern" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
            </linearGradient>

            {/* Glass barrel gradient */}
            <linearGradient id="glassGradModern" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#f8fafc" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#f1f5f9" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.4" />
            </linearGradient>

            {/* Plunger shaft gradient */}
            <linearGradient id="plungerGradModern" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* 1. NEEDLE (Left: x=10 to x=60) */}
          <line
            x1="10"
            y1="62"
            x2="55"
            y2="62"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Needle bevel tip */}
          <polygon points="10,62 15,60 15,64" fill="#64748b" />

          {/* 2. NEEDLE HUB (Plastic orange connector: x=55 to x=80) */}
          <polygon
            points="55,54 75,50 80,44 80,80 75,74 55,70"
            fill="#f97316"
            stroke="#c2410c"
            strokeWidth="1"
          />
          {/* Hub ridges */}
          <line x1="68" y1="52" x2="68" y2="72" stroke="#fb923c" strokeWidth="1" />

          {/* 3. BARREL BACKGROUND (Inside chamber) */}
          <rect
            x={barrelStart}
            y={barrelTop}
            width={barrelWidth}
            height={barrelHeight}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            rx="2"
          />

          {/* 4. LIQUID FILL & MENISCUS CURVATURE */}
          {fillWidth > 0 && (
            <g>
              <rect
                x={barrelStart}
                y={barrelTop + 1}
                width={fillWidth}
                height={barrelHeight - 2}
                fill="url(#liquidGradModern)"
                className="transition-all duration-150 ease-out"
              />
              {fillWidth > 4 && (
                <path
                  d={`M ${fillEnd} ${barrelTop + 1} Q ${fillEnd + 3} ${barrelTop + barrelHeight / 2} ${fillEnd} ${barrelBottom - 1}`}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="1.5"
                  opacity="0.95"
                  className="transition-all duration-150 ease-out"
                />
              )}
            </g>
          )}

          {/* 5. PLUNGER STOPPER (Dark double-seal rubber gasket at fillEnd) */}
          <g
            className="transition-all duration-300 ease-out"
            style={{ transform: `translateX(${fillEnd}px)` }}
          >
            {/* Main rubber stopper body */}
            <rect
              x="0"
              y={barrelTop + 1}
              width="14"
              height={barrelHeight - 2}
              fill="#1e293b"
              rx="1"
            />
            {/* Dual sealing rings */}
            <rect x="1" y={barrelTop + 2} width="3" height={barrelHeight - 4} fill="#334155" />
            <rect x="9" y={barrelTop + 2} width="3" height={barrelHeight - 4} fill="#334155" />
            {/* Recessed cavity for plunger stem */}
            <polygon points="14,48 10,54 10,70 14,76" fill="#0f172a" />

            {/* Plunger shaft extending right */}
            <rect
              x="14"
              y="56"
              width="90"
              height="12"
              fill="url(#plungerGradModern)"
              stroke="#64748b"
              strokeWidth="0.5"
            />
            {/* Plunger structural ribbing */}
            <line x1="30" y1="50" x2="30" y2="74" stroke="#94a3b8" strokeWidth="2" />
            <line x1="60" y1="50" x2="60" y2="74" stroke="#94a3b8" strokeWidth="2" />
            <line x1="90" y1="50" x2="90" y2="74" stroke="#94a3b8" strokeWidth="2" />

            {/* Plunger thumb rest flange */}
            <rect
              x="104"
              y="36"
              width="6"
              height="52"
              rx="2"
              fill="#64748b"
              stroke="#475569"
              strokeWidth="1"
            />
          </g>

          {/* 6. BARREL FOREGROUND (Glass reflection & frame) */}
          <rect
            x={barrelStart}
            y={barrelTop}
            width={barrelWidth}
            height={barrelHeight}
            fill="url(#glassGradModern)"
            stroke="#94a3b8"
            strokeWidth="1.5"
            pointerEvents="none"
            rx="2"
          />

          {/* Barrel flange at finger grip (Right edge of barrel: x=490) */}
          <rect
            x={barrelEnd - 1}
            y="26"
            width="8"
            height="72"
            rx="3"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* 7. CALIBRATION HASHMARKS & NUMBERS (Crisp dark for light mode) */}
          {ticks.map(({ unit, x, isMajor, isMedium }) => {
            const tickHeight = isMajor ? 14 : isMedium ? 9 : 5
            return (
              <g key={unit}>
                {/* Top tick mark */}
                <line
                  x1={x}
                  y1={barrelTop}
                  x2={x}
                  y2={barrelTop + tickHeight}
                  stroke="#334155"
                  strokeWidth={isMajor ? "1.5" : "1"}
                  opacity={isMajor ? "1" : "0.75"}
                />
                {/* Major numbers on top */}
                {isMajor && (
                  <text
                    x={x}
                    y={barrelTop - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#1e293b"
                    className="tabular-nums"
                  >
                    {unit}
                  </text>
                )}
                {/* Bottom tick mark */}
                <line
                  x1={x}
                  y1={barrelBottom}
                  x2={x}
                  y2={barrelBottom - (isMajor ? 8 : 4)}
                  stroke="#475569"
                  strokeWidth={isMajor ? "1" : "0.75"}
                  opacity={isMajor ? "0.9" : "0.6"}
                />
              </g>
            )
          })}

          {/* 8. ACTIVE DOSE MARKER & CALLOUT */}
          {calculatedUnits != null && calculatedUnits > 0 && !isOverCapacity && (
            <g
              className="transition-all duration-300 ease-out"
              style={{ transform: `translateX(${fillEnd}px)` }}
            >
              {/* Highlight line on front edge of stopper */}
              <line
                x1="0"
                y1={barrelTop - 2}
                x2="0"
                y2={barrelBottom + 2}
                stroke="#059669"
                strokeWidth="2.5"
                strokeDasharray="2 1"
              />
              {/* Arrow indicator at bottom */}
              <polygon
                points="-4,94 4,94 0,88"
                fill="#059669"
              />
              {/* Pill Callout below barrel */}
              <rect
                x="-36"
                y="96"
                width="72"
                height="18"
                rx="9"
                fill="#065f46"
                stroke="#047857"
                strokeWidth="1"
              />
              <text
                x="0"
                y="108"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#ffffff"
                className="tabular-nums"
              >
                {activeDisplayUnits} Units
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Interactive Calibration Range Slider */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] font-bold font-mono text-slate-500">0 U</span>
        <input
          type="range"
          min="0"
          max={capacity}
          step={capacity === 30 ? 0.25 : 0.5}
          value={activeDisplayUnits != null ? Math.min(capacity, Math.max(0, activeDisplayUnits)) : 0}
          onChange={(e) => setInteractiveUnits(parseFloat(e.target.value))}
          className="h-2 flex-1 rounded-lg bg-slate-200 accent-emerald-600 cursor-pointer"
          aria-label={`Calibrated U-${capacity} syringe units slider`}
        />
        <span className="text-[11px] font-bold font-mono text-slate-500">{capacity} U</span>
        {interactiveUnits != null && calculatedUnits != null && interactiveUnits !== calculatedUnits && (
          <button
            type="button"
            onClick={() => setInteractiveUnits(null)}
            className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
            title="Reset slider to calculated target dose"
          >
            Reset Target
          </button>
        )}
      </div>

      {/* GLP Technical & Aseptic Specifications Strip */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-500 block tracking-wider">
            Dead Space Residual
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
            &lt;0.005 mL (Ultra-Low)
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-500 block tracking-wider">
            Needle Gauge / Length
          </span>
          <span className="text-xs font-mono font-bold text-slate-800">
            31G &times; 5/16&quot; (8 mm)
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-500 block tracking-wider">
            Refrigerated Storage
          </span>
          <span className="text-xs font-mono font-bold text-emerald-700">
            2&deg;C–8&deg;C (Reconstituted)
          </span>
        </div>
      </div>

      {/* Safety and Instruction Caption */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span>
          Calibrated to <strong className="text-slate-800">{deviceLabel}</strong> (1 Unit = 0.01 mL). Align front rubber stopper ring with mark.
        </span>
        <span className="text-slate-400">
          Strict laboratory in-vitro analytical reference standard.
        </span>
      </div>
    </div>
  )
}

