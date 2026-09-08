import { useMemo, useState } from "react"
import { AdminBadge } from "../ui/admin-badge"

export type DeliveryRouteMode = "subq" | "nasal" | "oral" | "supply"

export type AdminReconstitutionCalculatorProps = {
  initialMass?: number
  initialMassUnit?: "mg" | "IU"
  initialDiluentMl?: number
  initialTargetDose?: number
  initialTargetUnit?: "mcg" | "mg" | "IU"
  compoundName?: string
  defaultRoute?: DeliveryRouteMode
  className?: string
}

export const AdminReconstitutionCalculator = ({
  initialMass = 10,
  initialMassUnit = "mg",
  initialDiluentMl = 2.0,
  initialTargetDose = 250,
  initialTargetUnit = "mcg",
  compoundName = "Analytical Compound",
  defaultRoute = "subq",
  className = "",
}: AdminReconstitutionCalculatorProps) => {
  const [route, setRoute] = useState<DeliveryRouteMode>(defaultRoute)
  const [mass, setMass] = useState<number>(initialMass)
  const [massUnit, setMassUnit] = useState<"mg" | "IU">(initialMassUnit)
  const [diluentMl, setDiluentMl] = useState<number>(initialDiluentMl)
  const [targetDose, setTargetDose] = useState<number>(initialTargetDose)
  const [targetUnit, setTargetUnit] = useState<"mcg" | "mg" | "IU">(initialTargetUnit)
  const [capacity, setCapacity] = useState<30 | 50 | 100>(50)

  // Calculations
  const concentrationMgPerMl = useMemo(() => {
    if (diluentMl <= 0 || mass <= 0) return 0
    return massUnit === "mg" ? mass / diluentMl : mass / diluentMl
  }, [mass, massUnit, diluentMl])

  const drawVolumeMl = useMemo(() => {
    if (concentrationMgPerMl <= 0 || targetDose <= 0) return 0
    let doseInMg = targetDose
    if (targetUnit === "mcg") {
      doseInMg = targetDose / 1000
    }
    return doseInMg / concentrationMgPerMl
  }, [concentrationMgPerMl, targetDose, targetUnit])

  const syringeUnits = useMemo(() => {
    return Number((drawVolumeMl * 100).toFixed(1))
  }, [drawVolumeMl])

  // Nasal atomizer: standard 0.10 mL per metered actuation
  const nasalPumpOutputMl = 0.10
  const dosePerSprayMcg = useMemo(() => {
    if (diluentMl <= 0 || mass <= 0) return 0
    const massMcg = massUnit === "mg" ? mass * 1000 : mass * 1000
    const concentrationMcgPerMl = massMcg / diluentMl
    return Number((concentrationMcgPerMl * nasalPumpOutputMl).toFixed(1))
  }, [mass, massUnit, diluentMl])

  const spraysRequired = useMemo(() => {
    if (dosePerSprayMcg <= 0) return 0
    let doseInMcg = targetDose
    if (targetUnit === "mg") doseInMcg = targetDose * 1000
    return Number((doseInMcg / dosePerSprayMcg).toFixed(2))
  }, [dosePerSprayMcg, targetDose, targetUnit])

  // SVG Geometry constants
  const barrelStart = 90
  const barrelEnd = 490
  const barrelWidth = barrelEnd - barrelStart // 400px
  const barrelTop = 38
  const barrelBottom = 86
  const barrelHeight = barrelBottom - barrelTop // 48px

  const maxUnits = capacity
  const isOverCapacity = syringeUnits > maxUnits
  const effectiveUnits = Math.min(Math.max(0, syringeUnits), maxUnits)
  const fillRatio = maxUnits > 0 ? effectiveUnits / maxUnits : 0
  const fillWidth = fillRatio * barrelWidth
  const fillEnd = barrelStart + fillWidth

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
    <div className={`p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {/* Route Selector & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Clinical Reconstitution & Volumetric Calibration
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {compoundName} calibration workbench
          </p>
        </div>

        {/* Route Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {[
            { id: "subq", label: "SubQ Injection" },
            { id: "nasal", label: "Metered Nasal" },
            { id: "oral", label: "Oral Solution" },
            { id: "supply", label: "Supply SOP" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoute(item.id as DeliveryRouteMode)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                route === item.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numerical Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {/* Vial Mass */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">Vial Active Mass</label>
            <span className="text-[10px] font-mono text-slate-400">Total Lyophilized</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={mass}
              onChange={(e) => setMass(Math.max(0.1, Number(e.target.value) || 0.1))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
            />
            <select
              value={massUnit}
              onChange={(e) => setMassUnit(e.target.value as "mg" | "IU")}
              className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
            >
              <option value="mg">mg</option>
              <option value="IU">IU</option>
            </select>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[2, 5, 10, 50, 100].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setMass(v)
                  setMassUnit("mg")
                }}
                className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-100"
              >
                {v}mg
              </button>
            ))}
          </div>
        </div>

        {/* Diluent Volume */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">Diluent Added</label>
            <span className="text-[10px] font-mono text-slate-400">Bac Water USP</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={diluentMl}
              onChange={(e) => setDiluentMl(Math.max(0.1, Number(e.target.value) || 0.5))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
            />
            <span className="text-xs font-bold text-slate-600 pr-1">mL</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[1.0, 2.0, 2.5, 3.0, 5.0].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setDiluentMl(v)}
                className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-100"
              >
                {v.toFixed(1)}mL
              </button>
            ))}
          </div>
        </div>

        {/* Target Research Dose */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-600">Target Dose</label>
            <span className="text-[10px] font-mono text-slate-400">Single Draw</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="10"
              value={targetDose}
              onChange={(e) => setTargetDose(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-blue-600"
            />
            <select
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value as "mcg" | "mg" | "IU")}
              className="px-2 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg"
            >
              <option value="mcg">mcg</option>
              <option value="mg">mg</option>
              <option value="IU">IU</option>
            </select>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[100, 250, 500, 1000, 2000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setTargetDose(v)
                  setTargetUnit("mcg")
                }}
                className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded hover:bg-slate-100"
              >
                {v}mcg
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Metrics Banner */}
      <div className="mt-4 p-4 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
            Stoichiometric Concentration
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {concentrationMgPerMl.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-600">{massUnit}/mL</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
            {route === "nasal" ? "Dose Per Spray" : "Draw Volume"}
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {route === "nasal" ? dosePerSprayMcg : drawVolumeMl.toFixed(3)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {route === "nasal" ? "mcg/spray" : "mL"}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
            {route === "nasal" ? "Actuations Needed" : "Calibrated U-100 Units"}
          </span>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-700">
              {route === "nasal" ? spraysRequired : syringeUnits}
            </span>
            <span className="text-xs font-bold text-blue-700">
              {route === "nasal" ? "sprays" : "units"}
            </span>
          </div>
        </div>

        <AdminBadge variant={route === "nasal" ? "purple" : "emerald"} dot>
          {route === "nasal" ? "0.10 mL Metered Pump" : "U-100 Syringe Needle Calibrated"}
        </AdminBadge>
      </div>

      {/* ROUTE-SPECIFIC VISUALIZATION */}
      {route === "subq" && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              SVG Insulin Syringe Visualizer
            </span>
            <div className="flex items-center gap-1">
              {([30, 50, 100] as const).map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(cap)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded ${
                    capacity === cap ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {cap} Unit
                </button>
              ))}
            </div>
          </div>

          {isOverCapacity && (
            <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Dose volume ({syringeUnits} units) exceeds {capacity}-unit capacity. Switch to a 100-unit syringe.
            </div>
          )}

          <div className="overflow-x-auto py-2 bg-slate-50/50 rounded-xl border border-slate-200/60">
            <svg viewBox="0 0 620 120" className="w-full min-w-[560px] select-none">
              <defs>
                <linearGradient id="adminLiquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
                </linearGradient>
              </defs>

              {/* Needle */}
              <line x1="10" y1="62" x2="55" y2="62" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
              <polygon points="10,62 14,60.5 14,63.5" fill="#64748b" />

              {/* Hub */}
              <polygon points="55,54 75,50 80,44 80,80 75,74 55,70" fill="#f97316" stroke="#c2410c" strokeWidth="1" />

              {/* Barrel background */}
              <rect x={barrelStart} y={barrelTop} width={barrelWidth} height={barrelHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Liquid fill */}
              {fillWidth > 0 && (
                <rect x={barrelStart} y={barrelTop + 1} width={fillWidth} height={barrelHeight - 2} fill="url(#adminLiquidGrad)" />
              )}

              {/* Plunger */}
              <g style={{ transform: `translateX(${fillEnd}px)` }}>
                <rect x="0" y={barrelTop + 1} width="14" height={barrelHeight - 2} fill="#1e293b" rx="1" />
                <rect x="14" y="56" width="90" height="12" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
                <rect x="104" y="36" width="6" height="52" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
              </g>

              {/* Barrel Glass outline */}
              <rect x={barrelStart} y={barrelTop} width={barrelWidth} height={barrelHeight} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x={barrelEnd - 1} y="26" width="8" height="72" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Ticks & Numbers */}
              {ticks.map(({ unit, x, isMajor, isMedium }) => {
                const tickHeight = isMajor ? 14 : isMedium ? 9 : 5
                return (
                  <g key={unit}>
                    <line x1={x} y1={barrelTop} x2={x} y2={barrelTop + tickHeight} stroke="#1e293b" strokeWidth={isMajor ? "1.5" : "1"} />
                    {isMajor && (
                      <text x={x} y={barrelTop - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#334155">
                        {unit}
                      </text>
                    )}
                    <line x1={x} y1={barrelBottom} x2={x} y2={barrelBottom - (isMajor ? 8 : 4)} stroke="#475569" strokeWidth="0.75" />
                  </g>
                )
              })}

              {/* Active Marker */}
              {syringeUnits > 0 && !isOverCapacity && (
                <g style={{ transform: `translateX(${fillEnd}px)` }}>
                  <line x1="0" y1={barrelTop - 2} x2="0" y2={barrelBottom + 2} stroke="#2563eb" strokeWidth="2.5" strokeDasharray="2 1" />
                  <polygon points="-4,94 4,94 0,88" fill="#2563eb" />
                  <rect x="-30" y="96" width="60" height="18" rx="4" fill="#2563eb" />
                  <text x="0" y="108" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
                    {syringeUnits}u
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {route === "nasal" && (
        <div className="mt-4 p-4 rounded-xl border border-purple-200 bg-purple-50/40">
          <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
            Intranasal Metered Pump SOP
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-purple-950">
            <li>• Calibrated pump output: <strong>0.10 mL per metered actuation</strong></li>
            <li>• Total bottle output: <strong>{diluentMl * 10} sprays</strong> per {diluentMl} mL fill volume</li>
            <li>• Standard protocol: Prime 2-3 pumps until fine conical plume appears before administering</li>
            <li>• Storage: Store upright at 2°C to 8°C protected from UV light</li>
          </ul>
        </div>
      )}

      {route === "oral" && (
        <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/40">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Bioavailable Oral Liquid Vehicle SOP
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-amber-950">
            <li>• Use graduated 1.0 mL oral syringe or calibrated dropper pipette</li>
            <li>• Administer sublingually or orally; hold for 60 seconds before swallowing</li>
            <li>• Shake gently for 5 seconds to ensure homogeneous compound distribution</li>
          </ul>
        </div>
      )}

      {route === "supply" && (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Laboratory Ware & Supplies SOP
          </h4>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
            <li>• Inspection: Verify tamper-evident seals and absence of particulate matter</li>
            <li>• Sterility: Single-use disposable or autoclave-certified at 121°C for 30 minutes</li>
            <li>• Cryo rating: Polypropylene labware rated from -80°C to +121°C</li>
          </ul>
        </div>
      )}
    </div>
  )
}
