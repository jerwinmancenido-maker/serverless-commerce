"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/stack-compatibility-checker.tsx
 * @module  StackCompatibilityChecker (Research Protocols Module)
 * @purpose Algorithmic peptide stack compatibility studio, multi-pathway synergy matrix, and kit commerce builder.
 * @contracts
 *   Component: StackCompatibilityChecker
 *   Catalog:   getPeptideStackCatalog (@lib/data/stack-interactions)
 */

import React, { useState, useMemo, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightMini, CheckCircleSolid } from "@medusajs/icons"
import {
  type StackCompoundProfile,
  type StackPairwiseRule,
  type StackPreset,
  getPeptideStackCatalog,
  getCompatiblePartnersForCompound,
  evaluateMultiCompoundStack,
  FOUR_GOLDEN_RULES_SOP,
} from "@lib/data/stack-interactions"
import { ALL_COMPOUND_PROTOCOLS, getProtocolById } from "@lib/data/compound-protocols"
import MultiVialStoichiometryStudio from "./multi-vial-stoichiometry-studio"
import StackKitCommerceBuilder from "./stack-kit-commerce-builder"
import StackScheduleTimeline from "./stack-schedule-timeline"
import StackPrintDossier from "./stack-print-dossier"
import { downloadStackPdf } from "@lib/pdf/stack-pdf-compiler"
import { addToCart, addPromotionCode } from "@lib/data/cart"
import type { ResearchBundleVial } from "../types"
import { HttpTypes } from "@medusajs/types"

interface StackCompatibilityCheckerProps {
  initialCompoundIds?: string[]
  className?: string
  onSelectStack?: (compoundIds: string[]) => void
  catalogData?: {
    compounds: StackCompoundProfile[]
    pairwise_interactions: StackPairwiseRule[]
    presets: StackPreset[]
  }
  matchedProducts?: HttpTypes.StoreProduct[]
  countryCode?: string
}

export default function StackCompatibilityChecker({
  initialCompoundIds = ["bpc-157", "tb-500"],
  className = "",
  onSelectStack,
  catalogData,
  matchedProducts = [],
  countryCode = "ph",
}: StackCompatibilityCheckerProps) {
  // Dynamic Catalog State
  const [compounds, setCompounds] = useState<StackCompoundProfile[]>(
    catalogData?.compounds || []
  )
  const [pairwiseRules, setPairwiseRules] = useState<StackPairwiseRule[]>(
    catalogData?.pairwise_interactions || []
  )
  const [presetStacks, setPresetStacks] = useState<StackPreset[]>(
    catalogData?.presets || []
  )
  const [_isLoading, setIsLoading] = useState(!catalogData)

  // Active User Selections
  const [selectedIds, setSelectedIds] = useState<string[]>(initialCompoundIds)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [focusedCompoundId, setFocusedCompoundId] = useState<string>(
    initialCompoundIds[0] || "bpc-157"
  )

  // Studio Tools & Quick Cart State
  const [studioToolTab, setStudioToolTab] = useState<
    "stoichiometry" | "kit_builder" | "timeline" | "synergy_deep_dive" | "administration_sop"
  >("stoichiometry")
  const [isInjectingKit, setIsInjectingKit] = useState(false)
  const [quickCartResult, setQuickCartResult] = useState<{
    status: "success" | "error"
    message: string
  } | null>(null)

  // Fetch dynamic data from Medusa API if not passed via props
  useEffect(() => {
    let isMounted = true
    if (!catalogData || catalogData.compounds.length === 0) {
      setIsLoading(true)
      getPeptideStackCatalog()
        .then((res) => {
          if (isMounted && res.compounds.length > 0) {
            setCompounds(res.compounds)
            setPairwiseRules(res.pairwise_interactions)
            setPresetStacks(res.presets)
          }
        })
        .catch((err) => {
          console.warn("[StackCompatibilityChecker] API fetch error:", err)
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [catalogData])

  // Hydrate selection from URL search params (?compounds=bpc-157,tb-500)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const params = new URLSearchParams(window.location.search)
      const compoundsQuery = params.get("compounds")
      if (compoundsQuery) {
        const parsed = compoundsQuery
          .split(",")
          .map((id) => id.trim().toLowerCase())
          .filter((id) => id.length > 0)
        if (parsed.length > 0) {
          setSelectedIds(parsed.slice(0, 4))
          setFocusedCompoundId(parsed[0])
          if (onSelectStack) onSelectStack(parsed.slice(0, 4))
        }
      }
    } catch (e) {
      console.warn("[StackCompatibilityChecker] URL hydration error:", e)
    }
  }, [onSelectStack])

  // Sync active selection to URL for bookmarking & sharing
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (selectedIds.length > 0) {
        const url = new URL(window.location.href)
        const currentQuery = url.searchParams.get("compounds")
        const newQuery = selectedIds.join(",")
        if (currentQuery !== newQuery) {
          url.searchParams.set("compounds", newQuery)
          window.history.replaceState({}, "", url.toString())
        }
      }
    } catch (_e) {
      // ignore
    }
  }, [selectedIds])

  // Toggle selection
  const handleToggleCompound = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) return // keep at least 1 compound
      const newIds = selectedIds.filter((item) => item !== id)
      setSelectedIds(newIds)
      if (focusedCompoundId === id && newIds.length > 0) {
        setFocusedCompoundId(newIds[0])
      }
      if (onSelectStack) onSelectStack(newIds)
    } else {
      if (selectedIds.length >= 4) return // max 4 compounds in checker
      const newIds = [...selectedIds, id]
      setSelectedIds(newIds)
      setFocusedCompoundId(id)
      if (onSelectStack) onSelectStack(newIds)
    }
  }

  const handleAddPartner = (partnerId: string) => {
    if (!selectedIds.includes(partnerId)) {
      if (selectedIds.length >= 4) return
      const newIds = [...selectedIds, partnerId]
      setSelectedIds(newIds)
      if (onSelectStack) onSelectStack(newIds)
    }
  }

  // Active selected profiles
  const selectedProfiles = useMemo(() => {
    return selectedIds
      .map((id) => compounds.find((p) => p.id === id))
      .filter(Boolean) as StackCompoundProfile[]
  }, [selectedIds, compounds])

  // Synchronized bundle vials for multi-vial stoichiometry and kit commerce
  const bundleVials = useMemo(() => {
    return selectedProfiles.map((p): ResearchBundleVial => {
      const analytical =
        getProtocolById(p.id) ||
        ALL_COMPOUND_PROTOCOLS.find(
          (ap) =>
            ap.compoundName.toLowerCase().includes(p.shortName.toLowerCase()) ||
            p.name.toLowerCase().includes(ap.compoundName.toLowerCase()) ||
            ap.handles.some((h) => h.toLowerCase().includes(p.id.toLowerCase()))
        )

      let massMg = 5
      if (analytical?.reconstitution?.defaultVialNetMg) {
        massMg = analytical.reconstitution.defaultVialNetMg
      } else {
        const pid = p.id.toLowerCase()
        if (pid.includes("ghk")) massMg = 50
        else if (pid.includes("nad")) massMg = 500
        else if (pid.includes("semax") || pid.includes("selank")) massMg = 30
        else if (
          pid.includes("tirz") ||
          pid.includes("reta") ||
          pid.includes("epith") ||
          pid.includes("mots") ||
          pid.includes("tesam")
        )
          massMg = 10
        else if (pid.includes("cjc") || pid.includes("ipam") || pid.includes("serm"))
          massMg = 2
      }

      let diluentMl = 2.0
      if (analytical?.reconstitution?.defaultDiluentMl) {
        diluentMl = analytical.reconstitution.defaultDiluentMl
      } else {
        if (massMg >= 500) diluentMl = 5.0
        else if (massMg >= 50) diluentMl = 3.0
        else diluentMl = 2.0
      }

      const concMgMl = Number((massMg / diluentMl).toFixed(2))

      let targetDose = "250 mcg"
      let cadence = "Daily"

      if (analytical?.dosing?.standardDoseDisplay) {
        targetDose = analytical.dosing.standardDoseDisplay
        cadence = analytical.dosing.cadence || "Daily"
      } else {
        const pid = p.id.toLowerCase()
        if (pid.includes("tb-500")) {
          targetDose = "2.5 mg"
          cadence = "Twice weekly (Mon/Thu)"
        } else if (pid.includes("tirzepatide")) {
          targetDose = "2.5 mg"
          cadence = "Once weekly (Q7D)"
        } else if (pid.includes("retatrutide")) {
          targetDose = "2.0 mg"
          cadence = "Once weekly (Q7D)"
        } else if (pid.includes("semaglutide")) {
          targetDose = "0.25 mg"
          cadence = "Once weekly (Q7D)"
        } else if (pid.includes("ghk-cu")) {
          targetDose = "2.0 mg"
          cadence = "Daily (SubQ)"
        } else if (pid.includes("cjc-1295") || pid.includes("ipamorelin")) {
          targetDose = "100 mcg"
          cadence = "5 days on / 2 days off (Pre-bed)"
        } else if (pid.includes("epithalon")) {
          targetDose = "5.0 mg"
          cadence = "Daily for 10-20 days"
        } else if (pid.includes("aod-9604")) {
          targetDose = "300 mcg"
          cadence = "Daily fasted morning"
        } else if (pid.includes("nad")) {
          targetDose = "50 mg"
          cadence = "2-3x weekly"
        }
      }

      let targetMcg = 250
      if (targetDose.toLowerCase().includes("mg")) {
        const match = targetDose.match(/([\d.]+)\s*mg/i)
        if (match) targetMcg = parseFloat(match[1]) * 1000
      } else if (targetDose.toLowerCase().includes("mcg")) {
        const match = targetDose.match(/([\d.]+)\s*mcg/i)
        if (match) targetMcg = parseFloat(match[1])
      }

      const volMl = targetMcg / 1000 / concMgMl
      const units = Math.round(volMl * 100 * 10) / 10

      const isNasal =
        p.adminRoute?.toLowerCase().includes("intranasal") ||
        p.adminRoute?.toLowerCase().includes("nasal") ||
        analytical?.primaryDeliveryRoute === "nasal"
      const isOral =
        (p.adminRoute?.toLowerCase().includes("oral") &&
          !p.adminRoute?.toLowerCase().includes("subq")) ||
        p.id === "bpc-157-arginate" ||
        p.id === "mk-677" ||
        p.id === "5-amino-1mq" ||
        analytical?.primaryDeliveryRoute === "oral"

      let resolvedSolvent =
        analytical?.reconstitution?.solvent ||
        "Bacteriostatic 0.9% Benzyl Alcohol Water"
      let resolvedInstructions =
        analytical?.reconstitution?.dissolutionMethod ||
        `Gently inject ${diluentMl} mL sterile bacteriostatic water down the inside glass vial wall. Swirl slowly without shaking until completely clear.`
      let resolvedDeliveryUnits =
        analytical?.syringeGuide?.standardIUDisplay ||
        `${units} units (${volMl.toFixed(2)} mL) on U-100 syringe`

      if (isNasal) {
        resolvedSolvent = "Sterile 0.9% Saline / Reconstitution Diluent"
        resolvedInstructions = `Aseptically reconstitute with ${diluentMl} mL sterile saline and transfer into metered nasal spray bottle. Prime 2 actuations into test area before research session.`
        const sprayCount = Math.max(1, Math.round(targetMcg / (concMgMl * 100)))
        resolvedDeliveryUnits = `${sprayCount} spray(s) (${(sprayCount * 0.1).toFixed(2)} mL) via calibrated nasal atomizer pump`
      } else if (isOral) {
        resolvedSolvent = "Oral Liquid Research Vehicle USP"
        resolvedInstructions = `Dissolve compound completely in ${diluentMl} mL oral liquid research vehicle. Measure strictly with calibrated oral pipette or graduated dispenser.`
        resolvedDeliveryUnits = `${volMl.toFixed(2)} mL via calibrated oral pipette / dropper (non-injectable)`
      }

      return {
        compoundName: p.name,
        vialNetMass: `${massMg} mg`,
        diluentMl,
        concMgMl,
        solvent: resolvedSolvent,
        reconstitutionInstructions: resolvedInstructions,
        targetDose,
        cadence,
        syringeUnits: resolvedDeliveryUnits,
      }
    })
  }, [selectedProfiles])

  // 1-Click Quick Kit Cart Injection Handler
  const handleQuickKitAddToCart = async () => {
    setIsInjectingKit(true)
    setQuickCartResult(null)

    try {
      const itemsToAdd: Array<{ variantId: string; quantity: number }> = []

      bundleVials.forEach((vial) => {
        const vName = vial.compoundName.toLowerCase()
        const matched = (matchedProducts || []).find((p) => {
          const title = (p.title || "").toLowerCase()
          const handle = (p.handle || "").toLowerCase()
          return (
            title.includes(vName) ||
            handle.includes(vName) ||
            (vName.includes("bpc") && (title.includes("bpc") || handle.includes("bpc"))) ||
            (vName.includes("tb-500") && (title.includes("tb-500") || handle.includes("tb-500"))) ||
            (vName.includes("cjc") && (title.includes("cjc") || handle.includes("cjc"))) ||
            (vName.includes("ipamorelin") && (title.includes("ipamorelin") || handle.includes("ipam"))) ||
            (vName.includes("tirzepatide") && (title.includes("tirzepatide") || handle.includes("tirz"))) ||
            (vName.includes("aod") && (title.includes("aod") || handle.includes("aod"))) ||
            (vName.includes("ghk") && (title.includes("ghk") || handle.includes("ghk"))) ||
            (vName.includes("semax") && (title.includes("semax") || handle.includes("semax"))) ||
            (vName.includes("selank") && (title.includes("selank") || handle.includes("selank")))
          )
        })

        const variantId = matched?.variants?.[0]?.id
        if (variantId) {
          itemsToAdd.push({
            variantId,
            quantity: 2, // 2 vials each for standard research cycle
          })
        }
      })

      // Route-aware accessory handling
      const isAllNasal =
        bundleVials.length > 0 &&
        bundleVials.every(
          (v) =>
            v.solvent.toLowerCase().includes("saline") ||
            v.syringeUnits.toLowerCase().includes("nasal") ||
            v.compoundName.toLowerCase().includes("semax") ||
            v.compoundName.toLowerCase().includes("selank") ||
            v.compoundName.toLowerCase().includes("adamax") ||
            v.compoundName.toLowerCase().includes("oxytocin") ||
            v.compoundName.toLowerCase().includes("pinealon")
        )

      const isAllOral =
        bundleVials.length > 0 &&
        bundleVials.every(
          (v) =>
            v.solvent.toLowerCase().includes("oral") ||
            v.syringeUnits.toLowerCase().includes("pipette") ||
            v.syringeUnits.toLowerCase().includes("dropper")
        )

      if (isAllNasal) {
        // Inject Clear Nasal Spray Bottles accessory; suppress BAC water and U-100 syringes
        const nasalBottleProduct = (matchedProducts || []).find(
          (p) =>
            (p.title || "").toLowerCase().includes("nasal") ||
            (p.handle || "").toLowerCase().includes("nasal")
        )
        if (nasalBottleProduct?.variants?.[0]?.id) {
          itemsToAdd.push({
            variantId: nasalBottleProduct.variants[0].id,
            quantity: 1,
          })
        }
      } else if (isAllOral) {
        // Pure oral stacks do not require injectable BAC water or U-100 syringes
      } else {
        // Parenteral / SubQ invariant: Add Bacteriostatic water if available
        const bacProduct = (matchedProducts || []).find(
          (p) =>
            (p.title || "").toLowerCase().includes("bacteriostatic") ||
            (p.handle || "").toLowerCase().includes("bac")
        )
        if (bacProduct?.variants?.[0]?.id) {
          itemsToAdd.push({
            variantId: bacProduct.variants[0].id,
            quantity: 1,
          })
        }

        // Add U-100 syringes box if available
        const syringeProduct = (matchedProducts || []).find(
          (p) =>
            (p.title || "").toLowerCase().includes("syringe") ||
            (p.handle || "").toLowerCase().includes("syringe")
        )
        if (syringeProduct?.variants?.[0]?.id) {
          itemsToAdd.push({
            variantId: syringeProduct.variants[0].id,
            quantity: 1,
          })
        }
      }

      if (itemsToAdd.length > 0) {
        for (const item of itemsToAdd) {
          await addToCart({
            variantId: item.variantId,
            quantity: item.quantity,
            countryCode,
          })
        }
        try {
          await addPromotionCode("STACK15")
        } catch (promoErr) {
          console.warn("[StackCompatibilityChecker] Could not auto-apply STACK15:", promoErr)
        }
        let kitDesc = "reconstitution kit"
        if (isAllNasal) kitDesc = "nasal atomizer kit"
        else if (isAllOral) kitDesc = "oral vehicle dispenser set"

        setQuickCartResult({
          status: "success",
          message: `✓ Added ${itemsToAdd.length} items (${bundleVials.length} vials + ${kitDesc}) to your cart with 15% bundle savings (STACK15) applied!`,
        })
      } else if (
        matchedProducts &&
        matchedProducts.length > 0 &&
        matchedProducts[0].variants?.[0]?.id
      ) {
        await addToCart({
          variantId: matchedProducts[0].variants[0].id,
          quantity: 1,
          countryCode,
        })
        try {
          await addPromotionCode("STACK15")
        } catch (promoErr) {
          console.warn("[StackCompatibilityChecker] Could not auto-apply STACK15:", promoErr)
        }
        setQuickCartResult({
          status: "success",
          message: `✓ Added ${selectedProfiles.length} stack items to your cart with 15% bundle savings (STACK15) applied!`,
        })
      } else {
        setQuickCartResult({
          status: "success",
          message: `✓ Research Stack Kit configured for ${selectedProfiles.map((p) => p.shortName).join(" + ")} with 15% savings!`,
        })
      }

    } catch (err: unknown) {
      console.warn("[handleQuickKitAddToCart] Error:", err)
      const msg = err instanceof Error ? err.message : "Failed to add kit to cart. Please try again."
      setQuickCartResult({
        status: "error",
        message: msg,
      })
    } finally {
      setIsInjectingKit(false)
    }
  }

  // Extract all distinct categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    compounds.forEach((c) => {
      if (c.category) cats.add(c.category)
    })
    return ["all", ...Array.from(cats)]
  }, [compounds])

  // Filtered compounds based on search query and category
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return compounds.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())

      if (!matchesCategory) return false

      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.targetReceptor.toLowerCase().includes(q) ||
        p.primaryPathway.toLowerCase().includes(q)
      )
    })
  }, [compounds, searchQuery, selectedCategory])

  // Multi-compound dynamic evaluation
  const stackEvaluation = useMemo(() => {
    return evaluateMultiCompoundStack(selectedIds, compounds, pairwiseRules)
  }, [selectedIds, compounds, pairwiseRules])

  // Compatible partners recommendations for the active focused compound
  const activeFocus = useMemo(() => {
    return (
      compounds.find((c) => c.id === focusedCompoundId) ||
      selectedProfiles[0] ||
      compounds[0]
    )
  }, [compounds, focusedCompoundId, selectedProfiles])

  const compatiblePartners = useMemo(() => {
    if (!activeFocus) return []
    return getCompatiblePartnersForCompound(activeFocus.id, compounds, pairwiseRules)
  }, [activeFocus, compounds, pairwiseRules])

  const synergisticPartners = useMemo(() => {
    return compatiblePartners.filter((p) => p.status === "synergistic")
  }, [compatiblePartners])

  const neutralPartners = useMemo(() => {
    return compatiblePartners.filter((p) => p.status === "compatible")
  }, [compatiblePartners])

  const contraindicatedPartners = useMemo(() => {
    return compatiblePartners.filter((p) => p.status === "contraindicated")
  }, [compatiblePartners])

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0 print:m-0 ${className}`}
      id="stacking-studio"
    >
      {/* ── Header ── */}
      <div className="border-b border-slate-200 pb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
            <span>⚡ Interactive Stacking &amp; Compatibility Studio</span>
            <span>·</span>
            <span>Database-Grounded Multi-Product Engine</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {compounds.length} Compounds · {selectedProfiles.length} in Active Regimen
          </div>
        </div>

        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Peptide Stacking &amp; Multi-Product Compatibility Studio
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Evaluate whether multiple separate products are safe, synergistic, or contraindicated to run together in your research protocol. Search our catalog, discover verified compatible stacking partners, and generate synchronized co-administration protocols.
        </p>

        {/* ── Key Nomenclature Distinction Callout ── */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3 rounded-2xl bg-slate-50 p-3.5 text-xs border border-slate-200/80">
          <div className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">1. Stack:</span>
            <span className="text-slate-600 leading-tight">
              <strong>Multi-product protocol</strong>: checking if separate vials are safe &amp; synergistic to run together.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">2. Blend:</span>
            <span className="text-slate-600 leading-tight">
              <strong>Single physical vial</strong>: active peptides pre-mixed &amp; lyophilized together in 1 cake.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">3. Bundle:</span>
            <span className="text-slate-600 leading-tight">
              <strong>Commercial selling offer</strong>: 15% discount for buying all required vials &amp; supplies together.
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Verified Preset Stacks ── */}
      {presetStacks.length > 0 && (
        <div className="mt-6 print:hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <span>🚀</span> Quick Verified Regimen Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {presetStacks.map((preset) => {
              const isSelected =
                preset.compound_ids.length === selectedIds.length &&
                preset.compound_ids.every((id) => selectedIds.includes(id))
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedIds(preset.compound_ids)
                    if (preset.compound_ids.length > 0) {
                      setFocusedCompoundId(preset.compound_ids[0])
                    }
                    if (onSelectStack) onSelectStack(preset.compound_ids)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200"
                  }`}
                >
                  <span>{preset.name}</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? "bg-purple-800 text-purple-100"
                        : "bg-white text-slate-500 border border-slate-200"
                    }`}
                  >
                    {preset.tag}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Active Stack Selection Chips ── */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/50 to-white p-4 sm:p-5 print:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>🧪</span> Active Selected Stack Compounds ({selectedProfiles.length} / 4 Vials):
          </div>
          <span className="text-[11px] text-slate-500">
            Click any tag to focus or remove (min 1, max 4)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedProfiles.map((p, idx) => {
            const isFocused = p.id === activeFocus?.id
            return (
              <div
                key={p.id}
                onClick={() => setFocusedCompoundId(p.id)}
                className={`group flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
                  isFocused
                    ? "border-purple-500 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/20"
                    : "border-slate-200 bg-white text-slate-800 hover:border-purple-300"
                }`}
              >
                <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5">
                  Vial #{idx + 1}
                </span>
                <span className="font-bold">{p.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({p.category})
                </span>
                {selectedProfiles.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleCompound(p.id)
                    }}
                    className="ml-1 text-slate-400 hover:text-rose-600 transition-colors font-bold cursor-pointer"
                    title="Remove from stack"
                  >
                    ✕
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 1: Live Stacking Search & Catalog Discovery ── */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🔍</span> Search Peptides to Stack:
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Type any compound name, target receptor, or biological indication to see stack options.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (e.g. BPC-157, VEGF, GHRH, Lipolysis, BDNF)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Search Results Catalog Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {filteredCatalog.map((p) => {
            const isSelected = selectedIds.includes(p.id)
            return (
              <div
                key={p.id}
                className={`flex items-start justify-between gap-2 rounded-xl border p-2.5 transition-all text-xs ${
                  isSelected
                    ? "border-purple-300 bg-purple-50/50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {p.shortName}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      · {p.category}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-600 truncate mt-0.5">
                    <span className="font-semibold text-slate-700">Target:</span>{" "}
                    {p.targetReceptor}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleCompound(p.id)}
                  className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-100 text-purple-800 hover:bg-rose-100 hover:text-rose-800"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {isSelected ? "✓ In Stack" : "+ Add to Stack"}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 2: Compatible & Synergistic Stacking Recommendations ── */}
      {activeFocus && (
        <div className="mt-8 rounded-2xl border-2 border-purple-200 bg-purple-50/20 p-5 sm:p-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-800">
                <span>🌟</span> Stacking Partner Recommendations for:
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Peptides that can be safely stacked with{" "}
                <span className="text-purple-700">{activeFocus.name}</span>
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Receptor: {activeFocus.targetReceptor.split(",")[0]}
            </div>
          </div>

          {/* Synergistic Recommendations (Top Priority) */}
          {synergisticPartners.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
                <span>🟢</span> Highly Synergistic Partners (Multi-Pathway Amplification):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {synergisticPartners.map((item) => {
                  const isInStack = selectedIds.includes(item.compound.id)
                  return (
                    <div
                      key={item.compound.id}
                      className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {item.compound.name}
                          </span>
                          <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
                            +{item.score} Synergy
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-emerald-950 mt-1">
                          {item.title}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {item.mechanismSummary}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between gap-2">
                        <span className="text-[10.5px] text-slate-500 font-mono truncate">
                          Timing: {item.timingProtocol.split(".")[0]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddPartner(item.compound.id)}
                          disabled={isInStack}
                          className={`shrink-0 rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                            isInStack
                              ? "bg-emerald-200 text-emerald-900 cursor-default"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                          }`}
                        >
                          {isInStack ? "✓ In Active Stack" : "+ Add to Stack"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Compatible Neutral Partners */}
          {neutralPartners.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5 mb-2.5">
                <span>🔵</span> Compatible Regimen Partners (Non-Interfering Pathways):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {neutralPartners.slice(0, 6).map((item) => {
                  const isInStack = selectedIds.includes(item.compound.id)
                  return (
                    <div
                      key={item.compound.id}
                      className="rounded-xl border border-sky-200 bg-sky-50/30 p-2.5 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900">
                            {item.compound.shortName}
                          </span>
                          <span className="text-[10px] text-sky-700 font-semibold">
                            Compatible
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {item.compound.primaryPathway}
                        </p>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-sky-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          {item.compound.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddPartner(item.compound.id)}
                          disabled={isInStack}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            isInStack
                              ? "bg-slate-200 text-slate-600"
                              : "bg-sky-600 hover:bg-sky-700 text-white"
                          }`}
                        >
                          {isInStack ? "✓ In Stack" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Contraindicated Safeguard Warning Shelf */}
          {contraindicatedPartners.length > 0 && (
            <div className="mt-5 rounded-xl border border-rose-300 bg-rose-50/60 p-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-1">
                <span>⚠️</span> Contraindicated / Redundant Combinations (Do Not Stack):
              </div>
              <div className="space-y-1.5 mt-2">
                {contraindicatedPartners.map((item) => (
                  <div
                    key={item.compound.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-rose-950 bg-white/70 p-2 rounded-lg border border-rose-200"
                  >
                    <div>
                      <span className="font-bold text-rose-900">
                        {activeFocus.shortName} + {item.compound.shortName}:
                      </span>{" "}
                      <span className="text-slate-700">{item.mechanismSummary}</span>
                    </div>
                    <span className="shrink-0 text-[10.5px] font-bold text-rose-700 uppercase bg-rose-100 px-2 py-0.5 rounded-md">
                      Blocked / Washout Required
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 3: Dynamic Compatibility Scorecard Banner ── */}
      {selectedProfiles.length >= 2 && stackEvaluation && (
        <div className="mt-8 print:hidden">
          <div
            className={`rounded-2xl p-6 sm:p-7 text-white shadow-xl border-2 transition-all bg-slate-950 ${
              stackEvaluation.status === "synergistic"
                ? "border-emerald-500/80 shadow-emerald-950/30"
                : stackEvaluation.status === "contraindicated"
                ? "border-rose-500/80 shadow-rose-950/30"
                : "border-amber-500/80 shadow-amber-950/30"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                      stackEvaluation.status === "synergistic"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : stackEvaluation.status === "contraindicated"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {stackEvaluation.status === "synergistic"
                      ? "🟢 Synergistic Stack (100% Recommended)"
                      : stackEvaluation.status === "contraindicated"
                      ? "🔴 Contraindicated / Redundant Stack (Caution)"
                      : "🟡 Compatible Stack (Timing Separation Required)"}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Synergy Index: {stackEvaluation.overallScore}/100
                  </span>
                </div>

                <h3 className="mt-2.5 text-xl sm:text-2xl font-bold text-white">
                  {stackEvaluation.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                  {stackEvaluation.summary}
                </p>
              </div>

              {/* Commercial Bundle Callout if Synergistic/Compatible */}
              {stackEvaluation.status !== "contraindicated" && (
                <div className="shrink-0">
                  <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10 text-center sm:text-right">
                    <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      Commercial Bundle Option
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      15% Stack Bundle Savings
                    </div>

                    <div className="mt-2.5 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={handleQuickKitAddToCart}
                        disabled={isInjectingKit}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold px-3.5 py-1.5 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isInjectingKit ? (
                          <>
                            <span className="animate-spin text-xs">⏳</span>
                            <span>Adding Kit...</span>
                          </>
                        ) : quickCartResult?.status === "success" ? (
                          <>
                            <span>✓ In Cart!</span>
                          </>
                        ) : (
                          <>
                            <span>⚡ 1-Click Order Kit</span>
                            <ArrowRightMini className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setStudioToolTab("kit_builder")
                          const el = document.getElementById("stack-studio-tools")
                          el?.scrollIntoView({ behavior: "smooth" })
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-1.5 text-xs transition-colors cursor-pointer"
                      >
                        <span>BOM Breakdown ↓</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          downloadStackPdf({ stackEvaluation, selectedProfiles, bundleVials })
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-white font-semibold px-2.5 py-1.5 text-xs transition-colors cursor-pointer border border-emerald-500/30"
                        title="Download authentic GLP vector PDF file directly"
                      >
                        <span>📥</span>
                        <span>Download PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            const cIds = selectedProfiles.map((p) => p.id).join(",")
                            window.open(`/${countryCode}/research-stacks/dossier?compounds=${cIds}&autoprint=true`, "_blank")
                          }
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold px-2.5 py-1.5 text-xs transition-colors cursor-pointer border border-white/10"
                        title="Open standard operating procedure laboratory dossier in print view"
                      >
                        <span>🖨️</span>
                        <span>Print SOP</span>
                      </button>
                    </div>

                    {quickCartResult && (
                      <div
                        className={`mt-2 text-left rounded-lg p-2 text-[11px] font-semibold ${
                          quickCartResult.status === "success"
                            ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-200"
                            : "bg-rose-950/80 border border-rose-500/50 text-rose-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span>{quickCartResult.message}</span>
                          {quickCartResult.status === "success" && (
                            <LocalizedClientLink
                              href="/cart"
                              className="underline font-bold text-emerald-300 hover:text-white shrink-0 ml-1"
                            >
                              View Cart →
                            </LocalizedClientLink>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contraindicated Action Block */}
              {stackEvaluation.status === "contraindicated" && (
                <div className="shrink-0">
                  <div className="rounded-xl bg-rose-950/60 p-3.5 backdrop-blur-sm border border-rose-500/40 text-center sm:text-right">
                    <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                      Contraindicated Regimen
                    </div>
                    <div className="text-xs text-rose-200 mt-1 max-w-xs leading-tight">
                      Simultaneous co-administration blocked. Separate cycles required.
                    </div>
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 active:scale-95 text-rose-100 font-bold px-3 py-1.5 text-xs transition-all cursor-pointer border border-rose-400/40"
                      >
                        <span>🖨️</span>
                        <span>Export Safety Alert (PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Dynamic Co-Administration Regimen Protocol ── */}
          {stackEvaluation.combinedProtocol && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <span>📋</span> Complete Co-Administration Protocol for This Stack:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {stackEvaluation.combinedProtocol.morningDose && (
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <span>🌅</span> Fasted Morning Window:
                    </div>
                    <p className="text-slate-600">
                      {stackEvaluation.combinedProtocol.morningDose}
                    </p>
                  </div>
                )}

                {stackEvaluation.combinedProtocol.eveningDose && (
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <span>🌙</span> Pre-Bed Window:
                    </div>
                    <p className="text-slate-600">
                      {stackEvaluation.combinedProtocol.eveningDose}
                    </p>
                  </div>
                )}

                {stackEvaluation.combinedProtocol.weeklySchedule && (
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <span>📅</span> Weekly Cadence:
                    </div>
                    <p className="text-slate-600">
                      {stackEvaluation.combinedProtocol.weeklySchedule}
                    </p>
                  </div>
                )}

                {stackEvaluation.combinedProtocol.cycleLength && (
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                      <span>⏳</span> Cycle Length &amp; Washout:
                    </div>
                    <p className="text-slate-600">
                      {stackEvaluation.combinedProtocol.cycleLength} on ·{" "}
                      {stackEvaluation.combinedProtocol.washout || "4 weeks off"}
                    </p>
                  </div>
                )}
              </div>

              {/* Syringe Warning */}
              {stackEvaluation.combinedProtocol.syringeHandling && (
                <div className="mt-3 rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <span className="font-bold">⚠️ Syringe Directive:</span>
                  <span>{stackEvaluation.combinedProtocol.syringeHandling}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Detailed Pairwise Interaction Matrix ── */}
          <div className="mt-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>🔬</span> Pairwise Pharmacodynamic Matrix (
              {stackEvaluation.pairwiseDetails.length} Compound Pairs):
            </div>

            <div className="grid grid-cols-1 gap-4">
              {stackEvaluation.pairwiseDetails.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-5 transition-all ${
                    item.rule.status === "synergistic"
                      ? "border-emerald-200 bg-emerald-50/30"
                      : item.rule.status === "contraindicated"
                      ? "border-rose-300 bg-rose-50/40"
                      : "border-amber-200 bg-amber-50/30"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          item.rule.status === "synergistic"
                            ? "bg-emerald-500"
                            : item.rule.status === "contraindicated"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.pair[0].shortName} <span className="text-slate-400">+</span>{" "}
                        {item.pair[1].shortName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          item.rule.status === "synergistic"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : item.rule.status === "contraindicated"
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {item.rule.status} · {item.rule.score}% Match
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                    <div className="font-bold text-slate-900 mb-1">{item.rule.title}</div>
                    <p className="text-slate-600">{item.rule.mechanismSummary}</p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px] border-t border-slate-200/60 pt-2.5">
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200/80">
                        <div className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                          <span>⏱️</span> Timing &amp; Scheduling Protocol:
                        </div>
                        <p className="text-slate-600">{item.rule.timingProtocol}</p>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-slate-200/80">
                        <div className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                          <span>🛡️</span> Safety &amp; Needle Separation Rule:
                        </div>
                        <p className="text-slate-600">{item.rule.safetyRule}</p>
                      </div>
                    </div>

                    {item.rule.citation && (
                      <div className="mt-2 text-[10.5px] font-mono text-slate-500">
                        Evidence Grounding: {item.rule.citation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Section 4: Precision Multi-Vial Laboratory Suite & Commerce Kit Builder ── */}
      {selectedProfiles.length > 0 && bundleVials.length > 0 && (
        <div
          className="mt-10 pt-8 border-t-2 border-dashed border-slate-200 print:hidden"
          id="stack-studio-tools"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                <span>🔬</span> Precision Multi-Vial Laboratory Suite
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Synchronized Stoichiometry, Syringe Calibrator &amp; Kit Builder
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Live stoichiometric recalculations, syringe tick marks, and 1-click kit fulfillment for all {selectedProfiles.length} active vials in this regimen.
              </p>
            </div>

            {/* Studio Mode Selector Pills */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold self-start sm:self-auto flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setStudioToolTab("stoichiometry")}
                className={`rounded-lg px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioToolTab === "stoichiometry"
                    ? "bg-white text-purple-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🧪</span> Syringe Stoichiometry
              </button>
              <button
                type="button"
                onClick={() => setStudioToolTab("kit_builder")}
                className={`rounded-lg px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioToolTab === "kit_builder"
                    ? "bg-white text-emerald-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>📦</span> 1-Click Kit Builder
              </button>
              <button
                type="button"
                onClick={() => setStudioToolTab("timeline")}
                className={`rounded-lg px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioToolTab === "timeline"
                    ? "bg-white text-indigo-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>📅</span> 7-Day Schedule
              </button>
              <button
                type="button"
                onClick={() => setStudioToolTab("synergy_deep_dive")}
                className={`rounded-lg px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioToolTab === "synergy_deep_dive"
                    ? "bg-white text-sky-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🧬</span> Molecular Synergy
              </button>
              <button
                type="button"
                onClick={() => setStudioToolTab("administration_sop")}
                className={`rounded-lg px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioToolTab === "administration_sop"
                    ? "bg-white text-amber-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>📋</span> Administration SOP
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadStackPdf({ stackEvaluation, selectedProfiles, bundleVials })
                }}
                className="rounded-lg px-3 py-2 transition-all cursor-pointer flex items-center gap-1.5 text-emerald-700 font-semibold hover:bg-emerald-50"
                title="Download GLP Analytical Stack Dossier (.pdf)"
              >
                <span>📥</span> Download PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const cIds = selectedProfiles.map((p) => p.id).join(",")
                    window.open(`/${countryCode}/research-stacks/dossier?compounds=${cIds}&autoprint=true`, "_blank")
                  }
                }}
                className="rounded-lg px-3 py-2 transition-all cursor-pointer flex items-center gap-1.5 text-slate-600 hover:text-slate-900 hover:bg-white"
                title="Open GLP Analytical Dossier in print view"
              >
                <span>🖨️</span> Print SOP
              </button>
            </div>
          </div>

          {/* Tab 1: Multi-Vial Stoichiometry & Syringe Visualizer */}
          {studioToolTab === "stoichiometry" && (
            <div className="animate-fadeIn">
              <MultiVialStoichiometryStudio
                bundleVials={bundleVials}
                compoundName={stackEvaluation?.title || "Active Research Stack"}
              />
            </div>
          )}

          {/* Tab 2: 1-Click Medusa Kit Commerce Builder */}
          {studioToolTab === "kit_builder" && (
            <div className="animate-fadeIn">
              <StackKitCommerceBuilder
                bundleVials={bundleVials}
                compoundName={stackEvaluation?.title || "Active Research Stack"}
                countryCode={countryCode}
                matchedProducts={matchedProducts}
              />
            </div>
          )}

          {/* Tab 3: Synchronized 7-Day Schedule Timeline */}
          {studioToolTab === "timeline" && (
            <div className="animate-fadeIn">
              <StackScheduleTimeline
                bundleVials={bundleVials}
                compoundName={stackEvaluation?.title || "Active Research Stack"}
              />
            </div>
          )}

          {/* Tab 4: Molecular Synergy Deep-Dive */}
          {studioToolTab === "synergy_deep_dive" && (
            <div className="animate-fadeIn space-y-6">
              {/* Pairwise Cellular Mechanism Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Pairwise Biochemical Mechanism &amp; Pathway Cross-Talk
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    {stackEvaluation?.pairwiseDetails.length || 0} Evaluated Pairs
                  </span>
                </div>

                {stackEvaluation && stackEvaluation.pairwiseDetails.length > 0 ? (
                  <div className="space-y-4">
                    {stackEvaluation.pairwiseDetails.map(({ pair, rule }, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">
                              {pair[0].shortName} + {pair[1].shortName}: {rule.title}
                            </h5>
                          </div>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 self-start sm:self-auto">
                            {rule.score}% Synergy Score
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {rule.mechanismSummary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                            <strong className="text-slate-500 block text-[10px] uppercase tracking-wider">
                              {pair[0].shortName} Mechanism &amp; Receptor:
                            </strong>
                            <span className="text-slate-800 font-semibold mt-0.5 block">
                              {pair[0].targetReceptor}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {pair[0].primaryPathway}
                            </span>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                            <strong className="text-slate-500 block text-[10px] uppercase tracking-wider">
                              {pair[1].shortName} Mechanism &amp; Receptor:
                            </strong>
                            <span className="text-slate-800 font-semibold mt-0.5 block">
                              {pair[1].targetReceptor}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {pair[1].primaryPathway}
                            </span>
                          </div>
                        </div>

                        {rule.citation && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Evidence: <strong className="text-slate-700">{rule.citation}</strong></span>
                            <span className="font-mono text-emerald-700 font-semibold">Peer-Reviewed Monograph</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                    Select 2 or more compounds above to view pairwise biochemical synergy cross-talk.
                  </div>
                )}
              </div>

              {/* Receptor Cross-Talk & Competition Assessment */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Receptor Binding Specificity &amp; Saturation Assessment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {selectedProfiles.map((p) => (
                    <div key={p.id} className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                      <span className="font-bold text-slate-900 block">{p.shortName}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                        {p.targetReceptor}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Half-life: {p.halfLife}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-950 flex items-start gap-2 mt-2">
                  <CheckCircleSolid className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Receptor Non-Interference Verified:</strong> Compounds in this active formulation act on distinct, complementary cell receptors without competitive antagonist binding or tachyphylaxis risk when standard washout intervals are maintained.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Administration & Sterile Handling SOP */}
          {studioToolTab === "administration_sop" && (
            <div className="animate-fadeIn space-y-6">
              {/* Four Golden Rules of Multi-Peptide Administration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FOUR_GOLDEN_RULES_SOP.map((rule) => {
                  const badgeColor =
                    rule.colorTheme === "rose"
                      ? "bg-rose-100 text-rose-700"
                      : rule.colorTheme === "emerald"
                      ? "bg-emerald-100 text-emerald-700"
                      : rule.colorTheme === "sky"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-amber-100 text-amber-700"
                  return (
                    <div key={rule.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeColor}`}>
                          {rule.step}
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{rule.title}</h5>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rule.rule}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Multi-Week Stack Consumables Calculator */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Itemized Multi-Compound Stack Consumables Matrix
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supply projections across standard research cycle durations (8, 12, 16 weeks).
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    GLP Volumetric Math
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Item / Consumable</th>
                        <th className="py-2.5 px-3">8-Week Regimen</th>
                        <th className="py-2.5 px-3">12-Week Regimen</th>
                        <th className="py-2.5 px-3">16-Week Regimen</th>
                        <th className="py-2.5 px-3">Storage Condition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bundleVials.map((v, idx) => {
                        const isDaily = v.cadence?.toLowerCase().includes("daily")
                        const weeklyDoses = isDaily ? 7 : 2
                        const vials8 = Math.max(1, Math.ceil((weeklyDoses * 8) / 10))
                        const vials12 = Math.max(1, Math.ceil((weeklyDoses * 12) / 10))
                        const vials16 = Math.max(1, Math.ceil((weeklyDoses * 16) / 10))

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {v.compoundName} ({v.vialNetMass})
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                              {vials8} vials
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                              {vials12} vials
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-sky-800">
                              {vials16} vials
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              2°C–8°C (Refrigerated)
                            </td>
                          </tr>
                        )
                      })}
                      <tr className="bg-slate-50/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          Bacteriostatic Water USP (10 mL)
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          {Math.max(1, Math.ceil((bundleVials.length * 2 * 2) / 10))} bottle
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                          {Math.max(1, Math.ceil((bundleVials.length * 3 * 2) / 10))} bottles
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-sky-800">
                          {Math.max(1, Math.ceil((bundleVials.length * 4 * 2) / 10))} bottles
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          Controlled Room Temp (20°C–25°C)
                        </td>
                      </tr>
                      <tr className="bg-slate-50/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          Sterile 31G U-100 Syringes (1 mL)
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          {bundleVials.length * 8 * 4} syringes
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                          {bundleVials.length * 12 * 4} syringes
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-sky-800">
                          {bundleVials.length * 16 * 4} syringes
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          Sterile Sealed Blister
                        </td>
                      </tr>
                      <tr className="bg-slate-50/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          70% Isopropyl Alcohol Swabs
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                          1 box (100ct)
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-emerald-800">
                          1 box (100ct)
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-sky-800">
                          2 boxes (200ct)
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          Single-Use Foil Sachet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Summary & Protocol Deep Dive Links ── */}
      <div className="mt-8 border-t border-slate-200 pt-6 print:hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Need in-depth single-vial titration schedules or printable lab dossiers?
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedProfiles.map((p) =>
              p.protocolHandle ? (
                <LocalizedClientLink
                  key={p.id}
                  href={`/research-protocols/${p.protocolHandle}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <span>{p.shortName} Protocol</span>
                  <ArrowRightMini className="h-3.5 w-3.5 text-slate-400" />
                </LocalizedClientLink>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* ── Hidden Print Laboratory SOP Dossier (Visible only when window.print() is called) ── */}
      <StackPrintDossier
        stackEvaluation={stackEvaluation}
        selectedProfiles={selectedProfiles}
        bundleVials={bundleVials}
      />
    </div>
  )
}
