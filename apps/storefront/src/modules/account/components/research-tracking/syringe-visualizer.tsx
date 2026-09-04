"use client"

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
  const prevUnitsRef = React.useRef<number | null>(calculatedUnits)

  // Keep capacity in sync only when calculatedUnits externally changes
  React.useEffect(() => {
    if (calculatedUnits !== prevUnitsRef.current) {
      prevUnitsRef.current = calculatedUnits
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

  const maxUnits = capacity
  const maxVolumeMl = capacity / 100
  const isOverCapacity = calculatedUnits != null && calculatedUnits > maxUnits
  const effectiveUnits = calculatedUnits != null ? Math.min(calculatedUnits, maxUnits) : 0

  // SVG Geometry constants
  const barrelStart = 90
  const barrelEnd = 490
  const barrelWidth = barrelEnd - barrelStart // 400px
  const barrelTop = 38
  const barrelBottom = 86
  const barrelHeight = barrelBottom - barrelTop // 48px

  // Compute fill width and plunger position
  const fillRatio = calculatedUnits != null ? Math.min(1, Math.max(0, effectiveUnits / maxUnits)) : 0
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
    <div className="rounded-2xl border border-ui-border-base bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-ui-border-base pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />
            <h4 className="text-sm font-bold text-ui-fg-base">
              Visual Syringe Fill Guide
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-ui-fg-subtle">
            {compoundName ? `Verified draw calibration for ${compoundName}` : "Precision U-100 insulin syringe calibration"}
          </p>
        </div>

        {/* Syringe Capacity Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-1">
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
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? "bg-white text-ui-fg-base shadow-xs"
                    : "text-ui-fg-subtle hover:text-ui-fg-base"
                }`}
              >
                <span>{label}</span>
                <span className="ml-1 text-[10px] font-normal opacity-70">({sub})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Target Callout */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-cyan-50/70 via-teal-50/40 to-white px-4 py-3 border border-cyan-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800">
            Target Draw Amount
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-cyan-950 tabular-nums">
              {calculatedUnits != null ? calculatedUnits : "—"}
            </span>
            <span className="text-xs font-bold text-cyan-800">Units</span>
            {volumeMl != null && (
              <span className="text-xs text-cyan-700">
                ({volumeMl.toFixed(3)} mL)
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-medium uppercase tracking-wider text-ui-fg-muted">
            Syringe Type
          </span>
          <p className="text-xs font-semibold text-ui-fg-base">
            U-100 Insulin Syringe ({capacity} Units / {maxVolumeMl} mL)
          </p>
        </div>
      </div>

      {/* Over Capacity Warning */}
      {isOverCapacity && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <svg className="h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Volume exceeds {capacity}-unit capacity.</strong> Calculated draw is {calculatedUnits} units. Please select a larger syringe ({calculatedUnits > 50 ? "100 Unit" : "50 Unit"}).
          </span>
        </div>
      )}

      {/* Micro-dose accuracy tip */}
      {calculatedUnits != null && calculatedUnits > 0 && calculatedUnits < 8 && capacity === 100 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900">
          <svg className="h-4 w-4 shrink-0 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Accuracy Tip:</strong> For small doses under 10 units, a 30-unit (0.3 mL) syringe provides clearer graduation markings and less measurement deviation.
          </span>
        </div>
      )}

      {/* SVG Syringe Canvas */}
      <div className="mt-4 overflow-x-auto py-2">
        <svg
          viewBox="0 0 620 120"
          className="w-full min-w-[560px] select-none"
          aria-label="Syringe fill illustration"
        >
          <defs>
            {/* Liquid gradient */}
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#0891b2" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0e7490" stopOpacity="0.95" />
            </linearGradient>

            {/* Glass barrel gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#f8fafc" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#f1f5f9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.6" />
            </linearGradient>

            {/* Plunger shaft gradient */}
            <linearGradient id="plungerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
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
          <polygon points="10,62 14,60.5 14,63.5" fill="#64748b" />

          {/* 2. NEEDLE HUB (Plastic orange/gray connector: x=55 to x=80) */}
          <polygon
            points="55,54 75,50 80,44 80,80 75,74 55,70"
            fill="#f97316"
            stroke="#c2410c"
            strokeWidth="1"
          />
          {/* Hub ridges */}
          <line x1="68" y1="52" x2="68" y2="72" stroke="#ea580c" strokeWidth="1" />

          {/* 3. BARREL BACKGROUND (Inside chamber) */}
          <rect
            x={barrelStart}
            y={barrelTop}
            width={barrelWidth}
            height={barrelHeight}
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* 4. LIQUID FILL */}
          {fillWidth > 0 && (
            <rect
              x={barrelStart}
              y={barrelTop + 1}
              width={fillWidth}
              height={barrelHeight - 2}
              fill="url(#liquidGrad)"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* 5. PLUNGER STOPPER (Black double-seal rubber gasket at fillEnd) */}
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
            <rect x="1" y={barrelTop + 2} width="3" height={barrelHeight - 4} fill="#0f172a" />
            <rect x="9" y={barrelTop + 2} width="3" height={barrelHeight - 4} fill="#0f172a" />
            {/* Recessed cavity for plunger stem */}
            <polygon points="14,48 10,54 10,70 14,76" fill="#334155" />

            {/* Plunger shaft extending right */}
            <rect
              x="14"
              y="56"
              width="90"
              height="12"
              fill="url(#plungerGrad)"
              stroke="#94a3b8"
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
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth="1"
            />
          </g>

          {/* 6. BARREL FOREGROUND (Glass reflection & frame) */}
          <rect
            x={barrelStart}
            y={barrelTop}
            width={barrelWidth}
            height={barrelHeight}
            fill="url(#glassGrad)"
            stroke="#94a3b8"
            strokeWidth="1.5"
            pointerEvents="none"
          />

          {/* Barrel flange at finger grip (Right edge of barrel: x=490) */}
          <rect
            x={barrelEnd - 1}
            y="26"
            width="8"
            height="72"
            rx="3"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* 7. CALIBRATION HASHMARKS & NUMBERS */}
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
                  stroke="#1e293b"
                  strokeWidth={isMajor ? "1.5" : "1"}
                />
                {/* Major numbers on top */}
                {isMajor && (
                  <text
                    x={x}
                    y={barrelTop - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#334155"
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
              {/* Highlight line on the front edge of stopper */}
              <line
                x1="0"
                y1={barrelTop - 2}
                x2="0"
                y2={barrelBottom + 2}
                stroke="#0891b2"
                strokeWidth="2.5"
                strokeDasharray="2 1"
              />
              {/* Arrow indicator at bottom */}
              <polygon
                points="-4,94 4,94 0,88"
                fill="#0891b2"
              />
              {/* Pill Callout below barrel */}
              <rect
                x="-36"
                y="96"
                width="72"
                height="18"
                rx="9"
                fill="#0e7490"
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
                {calculatedUnits} Units
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Safety and Instruction Caption */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ui-border-base pt-3 text-[11px] text-ui-fg-muted">
        <span>
          Calibrated to <strong>{deviceLabel}</strong> (1 Unit = 0.01 mL). Align front ring of black stopper to mark.
        </span>
        <span className="font-medium text-ui-fg-subtle">
          Always inspect needle hub seal and expel air bubbles before administration.
        </span>
      </div>
    </div>
  )
}
