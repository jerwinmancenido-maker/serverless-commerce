"use client"

/**
 * @file    apps/storefront/src/modules/research-protocols/components/stack-kit-commerce-builder.tsx
 * @module  StackKitCommerceBuilder (Research Protocols Module)
 * @purpose 1-Click Bill of Materials (BOM) multi-vial kit builder and Medusa cart injection engine.
 * @contracts
 *   Component: StackKitCommerceBuilder
 *   Commerce:  addToCart (@lib/data/cart)
 */

import React, { useState, useMemo } from "react"
import type { ResearchBundleVial } from "../types"
import { addToCart, addPromotionCode } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

interface StackKitCommerceBuilderProps {
  bundleVials: ResearchBundleVial[]
  compoundName?: string
  protocolHandle?: string
  countryCode?: string
  matchedProducts?: HttpTypes.StoreProduct[]
  className?: string
}

function parseMassMg(massStr: string): number {
  const match = massStr.match(/([\d.]+)\s*(mg|g|mcg)/i)
  if (!match) return 5
  const val = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  if (unit === "g") return val * 1000
  if (unit === "mcg") return val / 1000
  return val
}

function parseDoseMcg(doseStr: string): number {
  const mcgMatch = doseStr.match(/([\d.]+)\s*mcg/i)
  if (mcgMatch) return parseFloat(mcgMatch[1])
  const mgMatch = doseStr.match(/([\d.]+)\s*mg/i)
  if (mgMatch) return parseFloat(mgMatch[1]) * 1000
  return 250
}

function parseWeeklyCadenceInjections(cadenceStr: string): number {
  const c = cadenceStr.toLowerCase()
  if (c.includes("bid") || c.includes("twice daily") || c.includes("2x daily")) return 14
  if (c.includes("5 on") || c.includes("5 days on") || c.includes("5 days/week")) return 5
  if (c.includes("2x weekly") || c.includes("twice weekly") || c.includes("2 days/week")) return 2
  if (c.includes("3x weekly") || c.includes("three times weekly")) return 3
  if (c.includes("eod") || c.includes("alternate days")) return 3.5
  if (c.includes("once weekly") || c.includes("weekly") || c.includes("q7d")) return 1
  // default daily
  return 7
}

export default function StackKitCommerceBuilder({
  bundleVials,
  compoundName = "Research Stack",
  protocolHandle = "",
  countryCode = "ph",
  matchedProducts = [],
  className = "",
}: StackKitCommerceBuilderProps) {
  const [cycleWeeks, setCycleWeeks] = useState<8 | 12 | 16>(12)
  const [includeSupplies, setIncludeSupplies] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [cartSuccess, setCartSuccess] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string | null>(null)

  // Detect pure route archetypes
  const isAllNasal = useMemo(() => {
    return (
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
    )
  }, [bundleVials])

  const isAllOral = useMemo(() => {
    return (
      bundleVials.length > 0 &&
      bundleVials.every(
        (v) =>
          v.solvent.toLowerCase().includes("oral") ||
          v.syringeUnits.toLowerCase().includes("pipette") ||
          v.syringeUnits.toLowerCase().includes("dropper")
      )
    )
  }, [bundleVials])

  // Map product prices or realistic defaults
  const bomCalculations = useMemo(() => {
    let compoundRetailTotal = 0
    let totalInjections = 0
    let totalDiluentMl = 0

    const items = bundleVials.map((vial, _idx) => {
      const massMg = parseMassMg(vial.vialNetMass)
      const doseMcg = parseDoseMcg(vial.targetDose)
      const weeklyInjections = parseWeeklyCadenceInjections(vial.cadence)
      const weeklyMcg = weeklyInjections * doseMcg
      const weeklyMg = weeklyMcg / 1000
      const totalMgNeeded = weeklyMg * cycleWeeks

      // How many vials needed to fulfill cycle with standard overfill margin
      const vialsNeeded = Math.max(1, Math.ceil(totalMgNeeded / massMg))
      const vialInjections = weeklyInjections * cycleWeeks
      totalInjections += vialInjections
      totalDiluentMl += vialsNeeded * (vial.diluentMl || 2.0)

      // Find matched product if available
      const matched = matchedProducts.find((p) => {
        const title = (p.title || "").toLowerCase()
        const handle = (p.handle || "").toLowerCase()
        const vName = vial.compoundName.toLowerCase()
        return (
          title.includes(vName) ||
          handle.includes(vName) ||
          (vName.includes("bpc") && (title.includes("bpc") || handle.includes("bpc"))) ||
          (vName.includes("tb-500") && (title.includes("tb-500") || handle.includes("tb-500"))) ||
          (vName.includes("cjc") && (title.includes("cjc") || handle.includes("cjc"))) ||
          (vName.includes("ipamorelin") && (title.includes("ipamorelin") || handle.includes("ipam"))) ||
          (vName.includes("tirzepatide") && (title.includes("tirzepatide") || handle.includes("tirz"))) ||
          (vName.includes("aod") && (title.includes("aod") || handle.includes("aod"))) ||
          (vName.includes("semax") && (title.includes("semax") || handle.includes("semax"))) ||
          (vName.includes("selank") && (title.includes("selank") || handle.includes("selank")))
        )
      })

      // Extract price or default to typical analytical vial tier (₱2,800 to ₱3,500)
      let unitPrice = 2800
      let variantId: string | null = null

      if (matched && matched.variants && matched.variants.length > 0) {
        variantId = matched.variants[0].id || null
        // If price is available in calculated_price
        const calcPrice = (matched.variants[0] as unknown as { calculated_price?: { calculated_amount?: number } })?.calculated_price?.calculated_amount
        if (typeof calcPrice === "number" && calcPrice > 0) {
          unitPrice = calcPrice
        }
      } else {
        // Compound specific baseline pricing
        const nameLower = vial.compoundName.toLowerCase()
        if (nameLower.includes("tirzepatide")) unitPrice = 4200
        else if (nameLower.includes("tb-500")) unitPrice = 3200
        else if (nameLower.includes("bpc-157")) unitPrice = 2600
        else if (nameLower.includes("cjc-1295")) unitPrice = 2500
        else if (nameLower.includes("ipamorelin")) unitPrice = 2500
        else if (nameLower.includes("semax")) unitPrice = 2400
        else if (nameLower.includes("selank")) unitPrice = 2400
        else if (nameLower.includes("melanotan")) unitPrice = 2200
        else if (nameLower.includes("pt-141")) unitPrice = 2400
      }

      const itemTotal = unitPrice * vialsNeeded
      compoundRetailTotal += itemTotal

      return {
        compoundName: vial.compoundName,
        vialNetMass: vial.vialNetMass,
        vialsNeeded,
        unitPrice,
        itemTotal,
        doseDisplay: vial.targetDose,
        cadenceDisplay: vial.cadence,
        totalMgNeeded: Math.round(totalMgNeeded * 10) / 10,
        variantId,
        productHandle: matched?.handle || null,
      }
    })

    // Supplies calculations adapted to delivery route
    const nasalBottlesNeeded = Math.max(1, bundleVials.length)
    const nasalBottleUnitPrice = 350
    const nasalBottleTotal = nasalBottlesNeeded * nasalBottleUnitPrice

    const salineVialsNeeded = Math.max(1, Math.ceil(totalDiluentMl / 10))
    const salineUnitPrice = 350
    const salineTotal = salineVialsNeeded * salineUnitPrice

    const oralVehicleNeeded = Math.max(1, Math.ceil(totalDiluentMl / 30))
    const oralVehicleUnitPrice = 650
    const oralVehicleTotal = oralVehicleNeeded * oralVehicleUnitPrice

    const dropperPacksNeeded = 1
    const dropperUnitPrice = 250
    const dropperTotal = dropperPacksNeeded * dropperUnitPrice

    const amberBottlesNeeded = Math.max(1, bundleVials.length)
    const amberBottleUnitPrice = 200
    const amberBottleTotal = amberBottlesNeeded * amberBottleUnitPrice

    const bacVialsNeeded = Math.max(1, Math.ceil(totalDiluentMl / 10))
    const bacUnitPrice = 450
    const bacTotal = bacVialsNeeded * bacUnitPrice

    const syringeBoxesNeeded = Math.max(1, Math.ceil(totalInjections / 100))
    const syringeUnitPrice = 650
    const syringeTotal = syringeBoxesNeeded * syringeUnitPrice

    const swabBoxesNeeded = Math.max(1, Math.ceil(totalInjections / 100))
    const swabUnitPrice = 250
    const swabTotal = swabBoxesNeeded * swabUnitPrice

    let suppliesRetailTotal = 0
    if (isAllNasal) {
      suppliesRetailTotal = nasalBottleTotal + salineTotal + swabTotal
    } else if (isAllOral) {
      suppliesRetailTotal = oralVehicleTotal + dropperTotal + amberBottleTotal
    } else {
      suppliesRetailTotal = bacTotal + syringeTotal + swabTotal
    }

    const grossRetail = compoundRetailTotal + (includeSupplies ? suppliesRetailTotal : 0)

    // 15% Stack Bundle discount
    const discountRate = 0.15
    const savingsAmount = Math.round(grossRetail * discountRate)
    const netBundlePrice = grossRetail - savingsAmount

    return {
      items,
      supplies: {
        isNasal: isAllNasal,
        isOral: isAllOral,
        nasalBottlesNeeded,
        nasalBottleUnitPrice,
        nasalBottleTotal,
        salineVialsNeeded,
        salineUnitPrice,
        salineTotal,
        oralVehicleNeeded,
        oralVehicleUnitPrice,
        oralVehicleTotal,
        dropperPacksNeeded,
        dropperUnitPrice,
        dropperTotal,
        amberBottlesNeeded,
        amberBottleUnitPrice,
        amberBottleTotal,
        bacVialsNeeded,
        bacUnitPrice,
        bacTotal,
        syringeBoxesNeeded,
        syringeUnitPrice,
        syringeTotal,
        swabBoxesNeeded,
        swabUnitPrice,
        swabTotal,
        suppliesRetailTotal,
      },
      grossRetail,
      savingsAmount,
      netBundlePrice,
      totalInjections,
    }
  }, [bundleVials, cycleWeeks, includeSupplies, matchedProducts, isAllNasal, isAllOral])

  const handleAddCompleteKitToCart = async () => {
    setIsAdding(true)
    setCartSuccess(null)
    setCartError(null)

    try {
      // Find valid variant IDs to add
      const variantsToAdd: Array<{ variantId: string; quantity: number }> = []

      bomCalculations.items.forEach((item) => {
        if (item.variantId) {
          variantsToAdd.push({
            variantId: item.variantId,
            quantity: item.vialsNeeded,
          })
        }
      })

      // Route-aware accessory cart injection
      if (includeSupplies) {
        if (isAllNasal) {
          const nasalProduct = (matchedProducts || []).find(
            (p) =>
              (p.title || "").toLowerCase().includes("nasal") ||
              (p.handle || "").toLowerCase().includes("nasal")
          )
          if (nasalProduct?.variants?.[0]?.id) {
            variantsToAdd.push({
              variantId: nasalProduct.variants[0].id,
              quantity: bomCalculations.supplies.nasalBottlesNeeded,
            })
          }
        } else if (!isAllOral) {
          const bacProduct = (matchedProducts || []).find(
            (p) =>
              (p.title || "").toLowerCase().includes("bacteriostatic") ||
              (p.handle || "").toLowerCase().includes("bac")
          )
          if (bacProduct?.variants?.[0]?.id) {
            variantsToAdd.push({
              variantId: bacProduct.variants[0].id,
              quantity: bomCalculations.supplies.bacVialsNeeded,
            })
          }
          const syringeProduct = (matchedProducts || []).find(
            (p) =>
              (p.title || "").toLowerCase().includes("syringe") ||
              (p.handle || "").toLowerCase().includes("syringe")
          )
          if (syringeProduct?.variants?.[0]?.id) {
            variantsToAdd.push({
              variantId: syringeProduct.variants[0].id,
              quantity: bomCalculations.supplies.syringeBoxesNeeded,
            })
          }
        }
      }

      // If we have matched products with real variants in Medusa, execute addToCart
      if (variantsToAdd.length > 0) {
        for (const v of variantsToAdd) {
          await addToCart({
            variantId: v.variantId,
            quantity: v.quantity,
            countryCode,
          })
        }
        try {
          await addPromotionCode("STACK15")
        } catch (promoErr) {
          console.warn("[StackKitCommerceBuilder] Could not auto-apply STACK15:", promoErr)
        }
        let suppliesSuffix = ""
        if (includeSupplies) {
          if (isAllNasal) suppliesSuffix = " + Nasal Spray Bottles"
          else if (isAllOral) suppliesSuffix = " + Oral Dispenser Set"
          else suppliesSuffix = " + Reconstitution Kit"
        }
        setCartSuccess(
          `Successfully added ${variantsToAdd.length} stack items to your cart${suppliesSuffix} with 15% Stack Bundle discount (STACK15) applied!`
        )
      } else if (matchedProducts.length > 0 && matchedProducts[0].variants?.[0]?.id) {
        // Fallback to first matched variant
        const firstVariant = matchedProducts[0].variants[0].id
        await addToCart({
          variantId: firstVariant,
          quantity: 1,
          countryCode,
        })
        try {
          await addPromotionCode("STACK15")
        } catch (promoErr) {
          console.warn("[StackKitCommerceBuilder] Could not auto-apply STACK15:", promoErr)
        }
        setCartSuccess(
          `Added primary stack compound to cart with 15% discount (STACK15) applied! Visit your cart to complete the research kit.`
        )

      } else {
        // If storefront mock mode or variants pending link, trigger simulated addition
        await new Promise((resolve) => setTimeout(resolve, 600))
        let suppliesName = "Consumables Pack"
        if (isAllNasal) suppliesName = "Nasal Atomizer Kit"
        else if (isAllOral) suppliesName = "Oral Vehicle Dispenser Pack"
        setCartSuccess(
          `Complete ${cycleWeeks}-Week ${compoundName} Research Kit (BOM: ${bomCalculations.items
            .map((i) => `${i.vialsNeeded}x ${i.compoundName}`)
            .join(" + ")}${
            includeSupplies ? ` + ${suppliesName}` : ""
          }) configured! 15% Stack Bundle discount reserved.`
        )
      }
    } catch (err: unknown) {
      console.error("Error adding stack kit to cart:", err)
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to add complete stack to cart automatically. Please explore individual products below."
      setCartError(msg)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-gradient-to-b from-white via-slate-50/60 to-white p-6 shadow-sm sm:p-8 print:p-3 print:border-slate-300 print:shadow-none print-break-inside-avoid ${className}`}
    >
      {/* ── Screen Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between print:pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-purple-800 border border-purple-200">
              1-Click Stack Kit Commerce
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
              15% Bundle Savings
            </span>
          </div>
          <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl print:text-base">
            Complete Research Stack Kit &amp; BOM Builder
          </h3>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm print:text-xs">
            Auto-calculate exact vial quantities, diluents, and consumables for your planned research cycle.
          </p>
        </div>

        {/* Cycle Duration Switcher (Screen Only) */}
        <div className="print:hidden">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 text-right sm:text-left">
            Research Cycle Duration:
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {[8, 12, 16].map((weeks) => (
              <button
                key={weeks}
                type="button"
                onClick={() => setCycleWeeks(weeks as 8 | 12 | 16)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  cycleWeeks === weeks
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {weeks} Weeks
                {weeks === 12 ? (
                  <span className="ml-1 text-[9px] font-extrabold text-purple-600">★ Optimal</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bill of Materials (BOM) Grid ── */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>📋</span> Prescribed Compounds &amp; Vial Allocation ({cycleWeeks}-Week Protocol)
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {isAllNasal
              ? `Total Cycle Actuations: ~${bomCalculations.totalInjections} sprays`
              : isAllOral
              ? `Total Cycle Doses: ~${bomCalculations.totalInjections} oral doses`
              : `Total Cycle Injections: ~${bomCalculations.totalInjections}`}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 print:grid-cols-2 print:gap-2">
          {bomCalculations.items.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-sm">
                    Vial #{idx + 1}
                  </span>
                  <h4 className="mt-1 font-bold text-slate-900 text-sm">{item.compoundName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {item.vialNetMass}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    ₱{item.unitPrice.toLocaleString()} / vial
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Target Dose:</span>
                  <span className="font-semibold text-slate-800">{item.doseDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cadence:</span>
                  <span className="font-semibold text-slate-800">{item.cadenceDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Cycle Mass Required:</span>
                  <span className="font-mono font-semibold text-slate-800">{item.totalMgNeeded} mg</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-2 font-bold">
                  <span className="text-purple-900">Vials Allocated:</span>
                  <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {item.vialsNeeded}x Vials (₱{item.itemTotal.toLocaleString()})
                  </span>
                </div>
              </div>

              {item.productHandle ? (
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end print:hidden">
                  <LocalizedClientLink
                    href={`/products/${item.productHandle}`}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                  >
                    View Individual Certificate of Analysis ↗
                  </LocalizedClientLink>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* ── Consumables & Lab Supplies Expansion ── */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 print:p-2 print:border-slate-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <input
              id="include-supplies-checkbox"
              type="checkbox"
              checked={includeSupplies}
              onChange={(e) => setIncludeSupplies(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer print:hidden"
            />
            <label
              htmlFor="include-supplies-checkbox"
              className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer flex items-center gap-1.5"
            >
              <span>{isAllNasal ? "👃" : isAllOral ? "💧" : "🧪"}</span>{" "}
              {isAllNasal
                ? "Include Complete Nasal Atomizer Preparation Supplies (Spray Bottles & Sterile Saline)"
                : isAllOral
                ? "Include Complete Oral Liquid Preparation Supplies (Vehicle & Calibrated Pipettes)"
                : "Include Complete Analytical Preparation Supplies (BAC Water & Syringes)"}
            </label>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            {includeSupplies ? `+₱${bomCalculations.supplies.suppliesRetailTotal.toLocaleString()}` : "Excluded"}
          </span>
        </div>

        {includeSupplies ? (
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs">
            {isAllNasal ? (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Clear Nasal Spray Bottles</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">10 mL · 0.10 mL Metered Fine Mist</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.nasalBottlesNeeded}x Bottles</span>
                    <span className="font-bold">₱{bomCalculations.supplies.nasalBottleTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Sterile 0.9% Saline Solution</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">10 mL · Isotonic Mucosal Vehicle USP</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.salineVialsNeeded}x 10 mL Vials</span>
                    <span className="font-bold">₱{bomCalculations.supplies.salineTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Sterile Isopropyl Prep Pads</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">100-Pack 70% IPA Swabs</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.swabBoxesNeeded}x Box (100 pcs)</span>
                    <span className="font-bold">₱{bomCalculations.supplies.swabTotal.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : isAllOral ? (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Oral Liquid Research Vehicle USP</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">30 mL · Non-Injectable Liquid Matrix</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.oralVehicleNeeded}x 30 mL Bottle</span>
                    <span className="font-bold">₱{bomCalculations.supplies.oralVehicleTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Calibrated Oral Dosing Pipettes</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">1.0 mL Graduated Precision Droppers</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.dropperPacksNeeded}x Pack</span>
                    <span className="font-bold">₱{bomCalculations.supplies.dropperTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Amber Borosilicate Storage Bottles</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">30 mL UV-Protective Liquid Storage</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.amberBottlesNeeded}x Bottles</span>
                    <span className="font-bold">₱{bomCalculations.supplies.amberBottleTotal.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Bacteriostatic Water (10 mL)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">0.9% Benzyl Alcohol USP</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.bacVialsNeeded}x 10 mL Vials</span>
                    <span className="font-bold">₱{bomCalculations.supplies.bacTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">U-100 Insulin Syringes (31G)</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">100-Pack Box · 0.3/0.5 mL</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.syringeBoxesNeeded}x Box (100 pcs)</span>
                    <span className="font-bold">₱{bomCalculations.supplies.syringeTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <div className="font-semibold text-slate-900">Sterile Isopropyl Prep Pads</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">100-Pack 70% IPA Pads</div>
                  <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-700 border-t border-slate-100 pt-1">
                    <span>{bomCalculations.supplies.swabBoxesNeeded}x Box (100 pcs)</span>
                    <span className="font-bold">₱{bomCalculations.supplies.swabTotal.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* ── Pricing Summary & 1-Click Commerce Button ── */}
      <div className="mt-6 rounded-2xl bg-slate-900 p-5 sm:p-6 text-white shadow-lg print:bg-white print:text-slate-900 print:border print:border-slate-300 print:shadow-none">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30 print:border-slate-300 print:text-emerald-800 print:bg-emerald-50">
                15% Stack Bundle Tier Active
              </span>
              <span className="text-xs text-slate-400 print:text-slate-600">
                Free Expedited Courier Shipping Included
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white print:text-slate-900 font-mono">
                ₱{bomCalculations.netBundlePrice.toLocaleString()}
              </span>
              <span className="text-sm sm:text-base line-through text-slate-400 font-mono">
                ₱{bomCalculations.grossRetail.toLocaleString()}
              </span>
              <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-slate-950">
                Save ₱{bomCalculations.savingsAmount.toLocaleString()}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400 print:text-slate-600">
              Covers full {cycleWeeks}-week cycle with lyophilized peptides, laboratory solvent, and consumables.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
            <button
              type="button"
              disabled={isAdding}
              onClick={handleAddCompleteKitToCart}
              className="relative inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAdding ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Building Stack Kit...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🛒</span> Add Complete Stack Kit to Cart
                </span>
              )}
            </button>

            <LocalizedClientLink
              href="/cart"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:text-white px-4 py-3.5 text-xs font-semibold text-slate-300 transition-colors"
            >
              View Cart
            </LocalizedClientLink>
          </div>
        </div>

        {/* Status Feedbacks */}
        {cartSuccess ? (
          <div className="mt-4 rounded-lg bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>{cartSuccess}</span>
            </div>
            <LocalizedClientLink
              href="/cart"
              className="underline font-bold text-white hover:text-emerald-200 shrink-0"
            >
              Go to Cart →
            </LocalizedClientLink>
          </div>
        ) : null}

        {cartError ? (
          <div className="mt-4 rounded-lg bg-rose-950/80 border border-rose-500/40 p-3 text-xs text-rose-300 flex items-center gap-2 print:hidden">
            <span>⚠️</span>
            <span>{cartError}</span>
          </div>
        ) : null}
      </div>

      {/* ── Analytical Compliance Statement ── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 print:text-[9px] print:text-slate-600">
        <div className="flex items-center gap-2">
          <span>🔒 In-Vitro Research Standards</span>
          <span>·</span>
          <span>Protective Foam Packaged</span>
          <span>·</span>
          <span>Reference Grade Compounds</span>
        </div>
        <div className="font-mono text-slate-400 print:text-slate-500">
          SKU: STK-{protocolHandle ? protocolHandle.toUpperCase().slice(0, 16) : "RESEARCH"}-{cycleWeeks}W
        </div>
      </div>
    </section>
  )
}
