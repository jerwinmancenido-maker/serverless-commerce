"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import {
  COMPARABLE_COMPOUNDS,
  getDynamicComparison,
  type PeptideComparison,
  type CompoundProfile,
} from "@lib/data/peptide-comparisons"
import { CheckCircleSolid } from "@medusajs/icons"

type Props = {
  comparisons?: PeptideComparison[]
}

const PRESET_MATCHUPS = [
  {
    label: "BPC-157 vs. TB-500",
    tag: "Wolverine Synergy",
    a: "bpc-157",
    b: "tb-500",
  },
  {
    label: "Tirzepatide vs. Semaglutide",
    tag: "Dual Incretin vs. Mono GLP-1",
    a: "tirzepatide",
    b: "semaglutide",
  },
  {
    label: "BPC-157 vs. GHK-Cu",
    tag: "Angiogenesis vs. Collagen",
    a: "bpc-157",
    b: "ghk-cu",
  },
  {
    label: "GHK-Cu vs. Epithalon",
    tag: "Cellular Longevity Matrix",
    a: "ghk-cu",
    b: "epithalon",
  },
  {
    label: "Tesamorelin vs. BPC-157",
    tag: "Anabolic Healing Axis",
    a: "tesamorelin",
    b: "bpc-157",
  },
]

// Custom Dropdown Selector Component
function CompoundDropdown({
  value,
  onChange,
  compounds,
  side,
}: {
  value: string
  onChange: (id: string) => void
  compounds: CompoundProfile[]
  side: "a" | "b"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => compounds.find((c) => c.id === value) || compounds[0],
    [compounds, value]
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const accentColor = side === "a" ? "emerald" : "indigo"

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 bg-white shadow-2xs ${
          isOpen
            ? side === "a"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-indigo-500 ring-2 ring-indigo-500/20"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                side === "a" ? "bg-emerald-600" : "bg-indigo-600"
              }`}
            />
            <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate block">
              {selected.name}
            </span>
          </div>
          <span className="text-xs text-slate-500 block truncate mt-0.5 font-medium pl-4">
            {selected.tag} &middot; {selected.category}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-2 pl-2 border-l border-slate-100">
          <span className="text-[10px] font-mono text-slate-600 hidden sm:inline-block">
            {selected.molecular_mass}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-700" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Popover List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fadeIn space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
            Select {side === "a" ? "Primary" : "Comparative"} Research Compound
          </div>
          {compounds.map((c) => {
            const isSelected = c.id === value
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? side === "a"
                      ? "bg-emerald-50 text-emerald-950 font-bold"
                      : "bg-indigo-50 text-indigo-950 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="text-[10px] font-semibold text-slate-600 px-1.5 py-0.5 rounded-md bg-slate-100">
                      {c.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 block truncate mt-0.5">
                    {c.tag}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <span className="font-mono text-[11px] text-slate-600 block">
                    {c.molecular_mass}
                  </span>
                  {isSelected && (
                    <span
                      className={`text-[10px] font-bold ${
                        side === "a" ? "text-emerald-800" : "text-indigo-800"
                      }`}
                    >
                      Active &check;
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function PeptideComparisonsDirectory({ comparisons }: Props) {
  const [compoundAId, setCompoundAId] = useState<string>("bpc-157")
  const [compoundBId, setCompoundBId] = useState<string>("tb-500")

  const compoundList = useMemo(() => {
    return Object.values(COMPARABLE_COMPOUNDS)
  }, [])

  const activeComparison = useMemo(() => {
    return getDynamicComparison(compoundAId, compoundBId)
  }, [compoundAId, compoundBId])

  const handleSwap = () => {
    const temp = compoundAId
    setCompoundAId(compoundBId)
    setCompoundBId(temp)
  }

  const handleSelectPreset = (a: string, b: string) => {
    setCompoundAId(a)
    setCompoundBId(b)
  }

  return (
    <div className="space-y-8">
      {/* ── Header: Title & Clean Presets Rail ── */}
      <div className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Head-to-Head Scientific Comparator
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Comparative Pharmacokinetics &amp; Receptor Profiler
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Direct side-by-side evaluation of receptor affinity, biological half-life, reconstitution parameters, and co-administration dynamics.
          </p>
        </div>

        {/* Minimalist Matchup Presets Strip */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0 mr-1">
            Popular Matchups:
          </span>
          {PRESET_MATCHUPS.map((preset) => {
            const isSelected =
              (compoundAId === preset.a && compoundBId === preset.b) ||
              (compoundAId === preset.b && compoundBId === preset.a)
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset.a, preset.b)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {preset.tag}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── The Dual-Arena: Side-by-Side Specimen Cards with Centered VS Nexus ── */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 items-stretch">
          {/* Specimen A Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-emerald-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
                  Primary Specimen (Compound A)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full uppercase">
                  {activeComparison.compoundA.category}
                </span>
              </div>

              {/* Integrated Dropdown Trigger */}
              <CompoundDropdown
                value={compoundAId}
                onChange={setCompoundAId}
                compounds={compoundList}
                side="a"
              />

              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Purity Release
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {activeComparison.compoundA.purity}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    In-Vitro Half-Life
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeComparison.compoundA.half_life}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Diluent Ratio
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeComparison.compoundA.standard_dilution || "2.0 mL / 10 mg"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Protocol Cadence
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeComparison.compoundA.typical_cadence || "Daily SubQ"}
                  </span>
                </div>
              </div>

              {/* Primary Target Receptor Callout */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                  Primary Receptor &amp; Pathway
                </span>
                <span className="text-slate-900 font-medium leading-relaxed block">
                  {activeComparison.compoundA.primary_target}
                </span>
              </div>
            </div>

            {/* Direct Order Action */}
            <div className="pt-4 border-t border-slate-100">
              <LocalizedClientLink
                href={`/products/${getCanonicalProductSlug(activeComparison.compoundA.handle)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs text-center"
              >
                <span>Order {activeComparison.compoundA.name} Reference Standard</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>

          {/* Specimen B Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-indigo-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 inline-block" />
                  Comparative Specimen (Compound B)
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full uppercase">
                  {activeComparison.compoundB.category}
                </span>
              </div>

              {/* Integrated Dropdown Trigger */}
              <CompoundDropdown
                value={compoundBId}
                onChange={setCompoundBId}
                compounds={compoundList}
                side="b"
              />

              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Purity Release
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {activeComparison.compoundB.purity}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    In-Vitro Half-Life
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeComparison.compoundB.half_life}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Diluent Ratio
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeComparison.compoundB.standard_dilution || "2.0 mL / 10 mg"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Protocol Cadence
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {activeComparison.compoundB.typical_cadence || "Twice Weekly"}
                  </span>
                </div>
              </div>

              {/* Primary Target Receptor Callout */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block mb-0.5">
                  Primary Receptor &amp; Pathway
                </span>
                <span className="text-slate-900 font-medium leading-relaxed block">
                  {activeComparison.compoundB.primary_target}
                </span>
              </div>
            </div>

            {/* Direct Order Action */}
            <div className="pt-4 border-t border-slate-100">
              <LocalizedClientLink
                href={`/products/${getCanonicalProductSlug(activeComparison.compoundB.handle)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs text-center"
              >
                <span>Order {activeComparison.compoundB.name} Reference Standard</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        {/* ── Centered Floating VS Swap Nexus (Desktop Absolute Center, Mobile Centered Divider) ── */}
        <div className="flex md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 justify-center my-4 md:my-0 z-10">
          <button
            type="button"
            onClick={handleSwap}
            title="Click to Swap Left & Right Compounds"
            className="group flex items-center justify-center h-12 w-12 rounded-full bg-white border-2 border-slate-200 text-slate-700 shadow-md hover:border-emerald-500 hover:text-emerald-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-extrabold tracking-tight block group-hover:hidden">
                VS
              </span>
              <svg
                className="w-4 h-4 hidden group-hover:block transition-transform duration-300 group-hover:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* ── Monograph Synthesis Banner ── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            Monograph Synthesis
          </span>
          <span className="text-xs font-medium text-slate-500">
            {activeComparison.category}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {activeComparison.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
          {activeComparison.subtitle}
        </p>
      </div>

      {/* ── Side-by-Side Comparative Analytical Matrix Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Comparative Analytical Matrix
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Side-by-side pharmacokinetic parameters, receptor affinity, and storage stoichiometry.
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md hidden sm:inline-block">
            6 Evaluation Vectors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 sm:px-6 w-1/4">Evaluation Vector</th>
                <th className="py-3 px-4 sm:px-6 w-3/8 text-emerald-950 font-bold">
                  {activeComparison.compoundA.name}
                </th>
                <th className="py-3 px-4 sm:px-6 w-3/8 text-indigo-950 font-bold">
                  {activeComparison.compoundB.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeComparison.vectors.map((v, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                >
                  <td className="py-3 px-4 sm:px-6 font-bold text-slate-800 align-top">
                    {v.feature}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-slate-600 leading-relaxed align-top">
                    {v.compoundA_val}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-slate-600 leading-relaxed align-top">
                    {v.compoundB_val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Co-Administration & Biological Synergy Assessment ── */}
      <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/50 p-5 sm:p-7 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
          <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Biological Synergy &amp; Co-Administration Assessment</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          {activeComparison.synergy_verdict}
        </p>
      </div>

      {/* ── Verified PubMed Citations ── */}
      {activeComparison.citations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs text-slate-500">
          <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
            Verified Comparative Research Literature
          </span>
          <ul className="space-y-1.5">
            {activeComparison.citations.map((cit) => (
              <li key={cit.number} className="flex items-start gap-2">
                <span className="font-mono text-slate-600 font-bold">[{cit.number}]</span>
                <span className="text-slate-600 flex-1">
                  {cit.text}{" "}
                  <a
                    href={cit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:underline font-bold font-mono ml-1"
                  >
                    [PubMed &nearr;]
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
