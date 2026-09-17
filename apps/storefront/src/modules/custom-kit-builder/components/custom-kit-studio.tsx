"use client"

/**
 * @file    apps/storefront/src/modules/custom-kit-builder/components/custom-kit-studio.tsx
 * @module  CustomKitStudioComponent (Storefront Custom Kit Builder)
 * @purpose Interactive multi-compound visual kit studio with live stoichiometry, U-100 syringe visualizer, cycle supply sizing, and 1-click cart bridge.
 * @contracts
 *   Commerce:  addToCart (@lib/data/cart)
 *   Visual:    SyringeVisualizer (@modules/account/components/research-tracking/syringe-visualizer)
 *   Legal:     Non-FDA RUO Legal Shield (Zero Personal Liability)
 */

import React, { useMemo, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import {
  ArchiveBox,
  ArrowPath,
  Beaker,
  CheckCircleSolid,
  Clock,
  CurrencyDollar,
  DocumentText,
  InformationCircle,
  Plus,
  Sparkles,
  XMark,
} from "@medusajs/icons"
import SyringeVisualizer from "@modules/account/components/research-tracking/syringe-visualizer"
import { addToCart, addPromotionCode } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type {
  KitCompoundConfig,
  KitPackagingTier,
} from "../types"
import {
  calculateBundlePricing,
  calculateCycleSupplies,
  calculateStoichiometry,
  parseNetMassMg,
} from "../utils/stoichiometry"

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

interface CustomKitStudioProps {
  products: HttpTypes.StoreProduct[]
  protocols?: unknown[]
  countryCode: string
}

export default function CustomKitStudio({
  products,
  countryCode,
}: CustomKitStudioProps) {
  // Filter products to peptide vials / compounds (exclude pure accessories if possible)
  const compoundProducts = useMemo(() => {
    return products.filter((p) => {
      const t = (p.title || "").toLowerCase()
      return !t.includes("bacteriostatic water") && !t.includes("alcohol prep") && !t.includes("syringe")
    })
  }, [products])

  const initialProducts = compoundProducts.length > 0 ? compoundProducts : products

  // Default initial configuration with up to 2 popular compounds
  const [configuredCompounds, setConfiguredCompounds] = useState<KitCompoundConfig[]>(() => {
    const defaultProd1 = initialProducts[0]
    const defaultProd2 = initialProducts[1] || initialProducts[0]

    const initial: KitCompoundConfig[] = []

    if (defaultProd1) {
      const v = defaultProd1.variants?.[0]
      const mass = parseNetMassMg(defaultProd1.title, v?.title || "")
      initial.push({
        slotId: "slot-1",
        product: defaultProd1,
        variant: v || ({} as HttpTypes.StoreProductVariant),
        netMassMg: mass,
        diluentVolumeMl: 2.0,
        targetDoseMcg: mass >= 50 ? 2000 : 500,
        packagingTier: "complete_subq",
        frequencyPerWeek: 2,
      })
    }

    if (defaultProd2 && defaultProd2.id !== defaultProd1?.id) {
      const v = defaultProd2.variants?.[0]
      const mass = parseNetMassMg(defaultProd2.title, v?.title || "")
      initial.push({
        slotId: "slot-2",
        product: defaultProd2,
        variant: v || ({} as HttpTypes.StoreProductVariant),
        netMassMg: mass,
        diluentVolumeMl: 2.0,
        targetDoseMcg: mass >= 50 ? 2000 : 250,
        packagingTier: "complete_subq",
        frequencyPerWeek: 2,
      })
    }

    return initial
  })

  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [cycleWeeks, setCycleWeeks] = useState<number>(8)
  const [pickerModalOpen, setPickerModalOpen] = useState(false)
  const [pickerTargetSlotIndex, setPickerTargetSlotIndex] = useState<number | null>(null)
  const [pickerSearchQuery, setPickerSearchQuery] = useState("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addingStepMessage, setAddingStepMessage] = useState("")
  const [cartSuccessOpen, setCartSuccessOpen] = useState(false)
  const [dossierModalOpen, setDossierModalOpen] = useState(false)

  const activeCompound = configuredCompounds[activeSlotIndex] || configuredCompounds[0]

  // Active slot stoichiometry
  const activeStoichiometry = useMemo(() => {
    if (!activeCompound) {
      return {
        concentrationMgMl: 0,
        concentrationMcgPerTick: 0,
        doseVolumeMl: 0,
        syringeUnits: 0,
        isOverCapacity: false,
      }
    }
    return calculateStoichiometry({
      netMassMg: activeCompound.netMassMg,
      diluentVolumeMl: activeCompound.diluentVolumeMl,
      targetDoseMcg: activeCompound.targetDoseMcg,
    })
  }, [activeCompound])

  // Active slot cycle supplies
  const activeSupplies = useMemo(() => {
    if (!activeCompound) return null
    return calculateCycleSupplies({
      netMassMg: activeCompound.netMassMg,
      targetDoseMcg: activeCompound.targetDoseMcg,
      frequencyPerWeek: activeCompound.frequencyPerWeek,
      cycleWeeks,
      packagingTier: activeCompound.packagingTier,
    })
  }, [activeCompound, cycleWeeks])

  // Overall commercial pricing summary across all slots
  const bundlePricing = useMemo(() => {
    return calculateBundlePricing({
      configs: configuredCompounds,
      cycleWeeks,
    })
  }, [configuredCompounds, cycleWeeks])

  // Handlers for modifying active compound slot
  const updateActiveCompound = (updates: Partial<KitCompoundConfig>) => {
    setConfiguredCompounds((prev) => {
      const next = [...prev]
      if (!next[activeSlotIndex]) return prev
      next[activeSlotIndex] = { ...next[activeSlotIndex], ...updates }
      return next
    })
  }

  const addCompoundSlot = () => {
    if (configuredCompounds.length >= 4) return
    // Pick an unused product if possible
    const usedIds = new Set(configuredCompounds.map((c) => c.product.id))
    const available = initialProducts.find((p) => !usedIds.has(p.id)) || initialProducts[0]
    if (!available) return

    const v = available.variants?.[0]
    const mass = parseNetMassMg(available.title, v?.title || "")
    const newSlot: KitCompoundConfig = {
      slotId: `slot-${Date.now()}`,
      product: available,
      variant: v || ({} as HttpTypes.StoreProductVariant),
      netMassMg: mass,
      diluentVolumeMl: 2.0,
      targetDoseMcg: mass >= 50 ? 2000 : 500,
      packagingTier: "complete_subq",
      frequencyPerWeek: 2,
    }

    setConfiguredCompounds((prev) => [...prev, newSlot])
    setActiveSlotIndex(configuredCompounds.length)
  }

  const removeCompoundSlot = (indexToRemove: number) => {
    if (configuredCompounds.length <= 1) return
    setConfiguredCompounds((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    if (activeSlotIndex >= indexToRemove && activeSlotIndex > 0) {
      setActiveSlotIndex((prev) => prev - 1)
    }
  }

  const handleSelectProductInPicker = (product: HttpTypes.StoreProduct) => {
    const v = product.variants?.[0]
    const mass = parseNetMassMg(product.title, v?.title || "")

    if (pickerTargetSlotIndex !== null && configuredCompounds[pickerTargetSlotIndex]) {
      setConfiguredCompounds((prev) => {
        const next = [...prev]
        next[pickerTargetSlotIndex] = {
          ...next[pickerTargetSlotIndex],
          product,
          variant: v || ({} as HttpTypes.StoreProductVariant),
          netMassMg: mass,
          targetDoseMcg: mass >= 50 ? 2000 : 500,
        }
        return next
      })
    }
    setPickerModalOpen(false)
    setPickerTargetSlotIndex(null)
  }

  // 1-Click Multi-Item Cart Injection Bridge
  const handleAddEntireKitToCart = async () => {
    if (configuredCompounds.length === 0) return
    setIsAddingToCart(true)

    try {
      for (let i = 0; i < configuredCompounds.length; i++) {
        const config = configuredCompounds[i]
        const supplies = calculateCycleSupplies({
          netMassMg: config.netMassMg,
          targetDoseMcg: config.targetDoseMcg,
          frequencyPerWeek: config.frequencyPerWeek,
          cycleWeeks,
          packagingTier: config.packagingTier,
        })

        setAddingStepMessage(
          `Adding ${config.product.title} (${supplies.vialsRequired} vials)... [${i + 1}/${configuredCompounds.length}]`
        )

        const variantId = config.variant?.id
        if (variantId) {
          await addToCart({
            variantId,
            quantity: supplies.vialsRequired,
            countryCode,
          })
        }
      }

      // If bundle discount is unlocked (multi-compound or bundle tier), auto-apply STACK15
      if (bundlePricing.discountPercent > 0 || configuredCompounds.length >= 2) {
        try {
          await addPromotionCode("STACK15")
        } catch (promoErr) {
          console.warn("[CustomKitStudio] Could not auto-apply STACK15:", promoErr)
        }
      }

      setIsAddingToCart(false)
      setAddingStepMessage("")
      setCartSuccessOpen(true)

    } catch (err: unknown) {
      setIsAddingToCart(false)
      setAddingStepMessage("")
      const message = err instanceof Error ? err.message : "Failed to add items to cart"
      alert(message)
    }
  }

  // Filtered compounds in picker modal
  const filteredPickerProducts = useMemo(() => {
    if (!pickerSearchQuery.trim()) return initialProducts
    const q = pickerSearchQuery.toLowerCase().trim()
    return initialProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    )
  }, [initialProducts, pickerSearchQuery])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Non-FDA RUO Legal Shield Notice */}
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <InformationCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-amber-900 block">
            In-Vitro Analytical Reference Specification · Research Use Only (RUO)
          </span>
          <p className="text-amber-800 leading-relaxed">
            NOT FOR HUMAN OR VETERINARY CONSUMPTION. This configuration studio is strictly an analytical stoichiometric calculator and kit configuration tool for laboratory in-vitro calibration and experimental design. Compounds have not been evaluated or approved by the Philippine Food and Drug Administration (FDA) or US FDA.
          </p>
        </div>
      </div>

      {/* 2. Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <Sparkles className="size-3" />
              Sovereign Multi-Vial Studio
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Up to 4 Compounds · Synchronized Cycles
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Custom Multi-Vial Kit Configurator
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Design your own custom research stack with separate lyophilized active vials, calibrated stoichiometric dilution ratios, dynamic U-100 syringe volumetric visualizers, and 1-click batch cart fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDossierModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
          >
            <DocumentText className="size-3.5 text-slate-500" />
            Print Analytical Dossier
          </button>
        </div>
      </div>

      {/* 3. Compound Tray Navigation (Up to 4 Slots) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-xl bg-slate-100 border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {configuredCompounds.map((comp, idx) => {
            const isActive = idx === activeSlotIndex
            return (
              <div key={comp.slotId} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveSlotIndex(idx)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-slate-900 shadow-xs border border-slate-300"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-slate-900 text-[10px] text-white font-mono">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">
                    {comp.product.title}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    {comp.netMassMg}mg
                  </span>
                </button>
                {configuredCompounds.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove ${comp.product.title}`}
                    onClick={() => removeCompoundSlot(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-0.5"
                  >
                    <XMark className="size-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {configuredCompounds.length < 4 && (
          <button
            type="button"
            onClick={addCompoundSlot}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs ml-auto"
          >
            <Plus className="size-3.5" />
            Add Compound Slot ({configuredCompounds.length}/4)
          </button>
        )}
      </div>

      {/* 4. Main 2-Column Split Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Active Compound Configuration (7 cols) */}
        {activeCompound && (
          <div className="lg:col-span-7 space-y-6">
            {/* Active Compound Identity Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Active Compound Slot #{activeSlotIndex + 1}
                  </span>
                  <h2 className="text-xl font-black text-slate-950 mt-0.5">
                    {activeCompound.product.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {activeCompound.product.description ||
                      "Lyophilized pure reference peptide standard packaged in sterile nitrogen-purged borosilicate vial."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickerTargetSlotIndex(activeSlotIndex)
                    setPickerModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                >
                  <ArrowPath className="size-3 text-slate-500" />
                  Switch Compound
                </button>
              </div>

              {/* Mass Selection Stepper */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. Vial Net Mass Specification (Lyophilized Active)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {activeCompound.product.variants && activeCompound.product.variants.length > 0 ? (
                    activeCompound.product.variants.map((v) => {
                      const mass = parseNetMassMg(activeCompound.product.title, v.title || "")
                      const isSelected = activeCompound.variant?.id === v.id
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() =>
                            updateActiveCompound({
                              variant: v,
                              netMassMg: mass,
                            })
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <span className="font-bold text-xs text-slate-900 block">{v.title}</span>
                          <span className="font-mono text-[11px] text-slate-600">
                            {mass}mg active
                          </span>
                        </button>
                      )
                    })
                  ) : (
                    <div className="col-span-full p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
                      Single standard: {activeCompound.netMassMg}mg
                    </div>
                  )}
                </div>
              </div>

              {/* Diluent Volume Selection */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Bacteriostatic Water Reconstitution Volume
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1.0, 2.0, 3.0, 5.0].map((vol) => {
                    const isSelected = activeCompound.diluentVolumeMl === vol
                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => updateActiveCompound({ diluentVolumeMl: vol })}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500 font-bold"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs block">{vol.toFixed(1)} mL</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {(activeCompound.netMassMg / vol).toFixed(1)} mg/mL
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Target Dose & Weekly Frequency Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    3. Target Research Dose (mcg)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      step={50}
                      value={activeCompound.targetDoseMcg}
                      onChange={(e) =>
                        updateActiveCompound({
                          targetDoseMcg: Math.max(10, parseFloat(e.target.value) || 250),
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-500 font-mono">mcg</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    {[250, 500, 1000, 2500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateActiveCompound({ targetDoseMcg: preset })}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 transition-colors cursor-pointer"
                      >
                        {preset >= 1000 ? `${preset / 1000}mg` : `${preset}mcg`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    4. Dosing Frequency per Week
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { freq: 1, label: "1x" },
                      { freq: 2, label: "2x" },
                      { freq: 3, label: "3x" },
                      { freq: 5, label: "5x" },
                      { freq: 7, label: "Daily" },
                    ].map((f) => {
                      const isSelected = activeCompound.frequencyPerWeek === f.freq
                      return (
                        <button
                          key={f.freq}
                          type="button"
                          onClick={() => updateActiveCompound({ frequencyPerWeek: f.freq })}
                          className={`py-2 rounded-lg border text-center text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-slate-900 bg-slate-900 text-white font-bold"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {f.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Packaging Tier Selection */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  5. Packaging Tier &amp; Consumables Set
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "vial_only" as KitPackagingTier,
                      title: "Lyophilized Vial Only",
                      desc: "Pure vacuum-sealed cake. No diluent or hardware.",
                      addon: "+₱0",
                    },
                    {
                      id: "vial_bac" as KitPackagingTier,
                      title: "Vial + 10mL BAC Water",
                      desc: "Includes 10mL Bacteriostatic Water USP ampoule.",
                      addon: "+₱350",
                    },
                    {
                      id: "complete_subq" as KitPackagingTier,
                      title: "Analytical Lab Set",
                      desc: "BAC Water + 10x 31G U-100 LDS Syringes + 10x 70% IPA Pads.",
                      addon: "+₱750",
                    },
                  ].map((tier) => {
                    const isSelected = activeCompound.packagingTier === tier.id
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => updateActiveCompound({ packagingTier: tier.id })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-2xs"
                            : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 block">
                              {tier.title}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-indigo-700">
                              {tier.addon}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            {tier.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Cycle Duration Sizing Selector */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Research Cycle Protocol Duration
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculates aggregate vial counts with a 10% research buffer for needle dead space.
                  </p>
                </div>
                <Clock className="size-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[4, 8, 12].map((weeks) => {
                  const isSelected = cycleWeeks === weeks
                  return (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => setCycleWeeks(weeks)}
                      className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-500 shadow-2xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-sm font-extrabold block">{weeks} Weeks</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {weeks * 7} Days Protocol
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Interactive Telemetry, Syringe Visualizer & Cart HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Stoichiometry & Volumetric HUD */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Beaker className="size-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Volumetric Stoichiometry HUD
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Slot #{activeSlotIndex + 1} Calibrated
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase">Concentration</span>
                <span className="font-mono text-sm font-bold text-emerald-300 mt-0.5 block">
                  {activeStoichiometry.concentrationMgMl} mg/mL
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  ({activeStoichiometry.concentrationMcgPerTick} mcg/unit)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase">Draw Volume</span>
                <span className="font-mono text-sm font-bold text-cyan-300 mt-0.5 block">
                  {activeStoichiometry.doseVolumeMl} mL
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {activeCompound?.targetDoseMcg} mcg target
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase">U-100 Units</span>
                <span className="font-mono text-sm font-bold text-amber-300 mt-0.5 block">
                  {activeStoichiometry.syringeUnits} Units
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {activeStoichiometry.isOverCapacity ? "Over 100u!" : "Standard LDS"}
                </span>
              </div>
            </div>

            {/* Interactive Syringe Visualizer */}
            <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span>U-100 Syringe Barrel Vector</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {activeStoichiometry.syringeUnits} Units on Plunger
                </span>
              </div>
              <SyringeVisualizer
                volumeMl={activeStoichiometry.doseVolumeMl}
                deviceMeasurements={activeStoichiometry.syringeUnits}
                deviceLabel="U-100 LDS Syringe"
                compoundName={activeCompound?.product.title}
              />
            </div>
          </div>

          {/* Cycle Inventory Requirements Card */}
          {activeSupplies && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Slot #{activeSlotIndex + 1} Cycle Supply Inventory
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">
                  {cycleWeeks} Weeks ({activeSupplies.totalDoses} Doses)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Active Vials</span>
                  <span className="font-mono text-sm font-bold text-slate-900 block mt-0.5">
                    {activeSupplies.vialsRequired}x
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    ({activeSupplies.totalMgNeeded}mg net)
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">BAC Water</span>
                  <span className="font-mono text-sm font-bold text-slate-900 block mt-0.5">
                    {activeSupplies.diluentVialsRequired}x
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">10mL ampoules</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">LDS Syringes</span>
                  <span className="font-mono text-sm font-bold text-slate-900 block mt-0.5">
                    {activeSupplies.syringesRequired}x
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">31G 1mL</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 block">Alcohol Pads</span>
                  <span className="font-mono text-sm font-bold text-slate-900 block mt-0.5">
                    {activeSupplies.alcoholPadsRequired}x
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">70% IPA</span>
                </div>
              </div>
            </div>
          )}

          {/* Aggregate Commercial Pricing & 1-Click Cart Bridge */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Complete Custom Kit Commercial Summary
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {configuredCompounds.length} Compounds · {cycleWeeks} Weeks Sizing
                </span>
              </div>
              <CurrencyDollar className="size-4 text-emerald-600" />
            </div>

            {/* Itemized list */}
            <div className="divide-y divide-slate-100 text-xs">
              {bundlePricing.items.map((item, idx) => (
                <div key={item.slotId} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">
                      {idx + 1}. {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      {item.vialsRequired} vials @ {phpFormatter.format(item.baseUnitVialPrice + item.packagingAddonPerVial)}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    {phpFormatter.format(item.slotGrossTotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tier Savings Breakdown */}
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal Catalog Gross:</span>
                <span className="font-mono">{phpFormatter.format(bundlePricing.grossTotal)}</span>
              </div>

              {bundlePricing.discountPercent > 0 ? (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3" />
                    {bundlePricing.savingsLabel}:
                  </span>
                  <span className="font-mono">
                    -{phpFormatter.format(bundlePricing.discountAmount)}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic">
                  💡 Tip: Add another compound to unlock 10% multi-vial bundle savings!
                </div>
              )}

              <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-sm font-extrabold text-slate-950">
                <span>Bundle Net Price:</span>
                <span className="font-mono text-emerald-600 text-base">
                  {phpFormatter.format(bundlePricing.bundleNetTotal)}
                </span>
              </div>
            </div>

            {/* 1-Click Cart Injection Button */}
            <button
              type="button"
              disabled={isAddingToCart || configuredCompounds.length === 0}
              onClick={handleAddEntireKitToCart}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{addingStepMessage || "Injecting Custom Kit to Cart..."}</span>
                </>
              ) : (
                <>
                  <ArchiveBox className="size-4" />
                  <span>
                    Add Entire Custom Kit to Cart ({bundlePricing.items.reduce((acc, i) => acc + i.vialsRequired, 0)} Vials)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Compound Switcher Modal */}
      {pickerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-slate-900">
                Select Compound for Slot #{(pickerTargetSlotIndex ?? activeSlotIndex) + 1}
              </h3>
              <button
                type="button"
                aria-label="Close compound picker"
                onClick={() => setPickerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMark className="size-5" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                placeholder="Search compounds (e.g. Tirzepatide, BPC-157, GHK-Cu, NAD+)..."
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredPickerProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProductInPicker(p)}
                  className="w-full p-3 text-left hover:bg-slate-50 transition-colors rounded-lg flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                      {p.title}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {p.description || "Lyophilized In-Vitro Reference Standard"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 shrink-0 ml-3">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Cart Success Modal */}
      {cartSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircleSolid className="size-7" />
            </div>

            <div>
              <h3 className="font-black text-xl text-slate-900">Custom Kit Added to Cart!</h3>
              <p className="text-xs text-slate-600 mt-1">
                All {configuredCompounds.length} configured compound vials and analytical laboratory calibration supplies have been staged into your active cart session.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total Items Staged:</span>
                <span className="font-mono">
                  {bundlePricing.items.reduce((acc, i) => acc + i.vialsRequired, 0)} Units
                </span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Bundle Savings:</span>
                <span className="font-mono">{phpFormatter.format(bundlePricing.discountAmount)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCartSuccessOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Continue Customizing
              </button>
              <LocalizedClientLink
                href="/cart"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                View Cart &amp; Checkout
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}

      {/* 7. Printable Analytical Protocol Dossier Modal */}
      {dossierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-h-none print:p-0">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 print:hidden">
              <span className="text-xs font-bold font-mono text-slate-500 uppercase">
                Analytical In-Vitro Protocol Dossier
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Print Dossier (PDF)
                </button>
                <button
                  type="button"
                  aria-label="Close dossier modal"
                  onClick={() => setDossierModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XMark className="size-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="pt-4 space-y-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                    CUSTOM MULTI-COMPOUND RESEARCH PROTOCOL
                  </h1>
                  <span className="text-xs font-mono text-slate-600 mt-1 block">
                    DOSSIER REF: PSL-CUSTOM-{Date.now().toString().slice(-8)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Sizing Horizon: {cycleWeeks} Weeks ({cycleWeeks * 7} Days)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold font-mono px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 rounded uppercase">
                    RUO Reference
                  </span>
                </div>
              </div>

              {/* Formulation Matrix Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  1. Stoichiometric Calibration Matrix
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-300">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Compound Standard</th>
                        <th className="p-2.5">Vial Net</th>
                        <th className="p-2.5">Diluent</th>
                        <th className="p-2.5">Concentration</th>
                        <th className="p-2.5">Target Dose</th>
                        <th className="p-2.5">U-100 Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {configuredCompounds.map((comp) => {
                        const stoich = calculateStoichiometry({
                          netMassMg: comp.netMassMg,
                          diluentVolumeMl: comp.diluentVolumeMl,
                          targetDoseMcg: comp.targetDoseMcg,
                        })
                        return (
                          <tr key={comp.slotId}>
                            <td className="p-2.5 font-sans font-bold text-slate-900">
                              {comp.product.title}
                            </td>
                            <td className="p-2.5">{comp.netMassMg} mg</td>
                            <td className="p-2.5">{comp.diluentVolumeMl.toFixed(1)} mL</td>
                            <td className="p-2.5 text-emerald-700 font-bold">
                              {stoich.concentrationMgMl} mg/mL
                            </td>
                            <td className="p-2.5">{comp.targetDoseMcg} mcg</td>
                            <td className="p-2.5 text-blue-700 font-bold">
                              {stoich.syringeUnits} u ({stoich.doseVolumeMl} mL)
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cycle Supply Inventory */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                  2. Aggregate Cycle Materials ({cycleWeeks} Weeks)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {bundlePricing.items.map((item) => (
                    <div key={item.slotId} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-[10px] text-slate-500 block truncate">{item.title}</span>
                      <span className="font-mono font-bold text-sm text-slate-900 block mt-0.5">
                        {item.vialsRequired} Vials Required
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-FDA RUO Legal Shield Block (Zero Personal Liability) */}
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-[11px] text-slate-700 space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-900 block">
                  Analytical Protocol Specification Standard
                </span>
                <p>
                  Assay Purity Standard: &ge; 98.0% via RP-HPLC &amp; LC-MS. Lyophilized cake stored at -20&deg;C cryo conditions. Upon reconstitution with 0.9% Benzyl Alcohol Bacteriostatic Water USP, store at 2&deg;C–8&deg;C dark refrigerated conditions.
                </p>
                <p className="font-semibold text-slate-900">
                  REGULATORY NOTICE: Synthesized exclusively for in-vitro scientific calibration. NOT FOR HUMAN CONSUMPTION. This compound protocol has not been evaluated or approved by the Philippine Food and Drug Administration (FDA) or US FDA.
                </p>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-mono text-[10px] text-slate-500">
                  <span>STATION: AUTOMATED-STUDIO-ENGINE</span>
                  <span>SECURITY-REF: PSL-RUO-VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
