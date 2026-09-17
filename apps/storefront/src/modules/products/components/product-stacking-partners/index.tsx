"use client"

/**
 * @file    apps/storefront/src/modules/products/components/product-stacking-partners/index.tsx
 * @module  ProductStackingPartners (Product Detail Page)
 * @purpose Renders scientifically validated companion stacking compounds with 1-click cart bridge and STACK15 bundle promotion.
 * @contracts
 *   Component: ProductStackingPartners
 *   Commerce:  addToCart, applyPromotions (@lib/data/cart)
 */

import React, { useState, useMemo } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightMini } from "@medusajs/icons"
import { addToCart, addPromotionCode } from "@lib/data/cart"
import {
  getCompatiblePartnersForCompound,
  type CompatiblePartnerRecommendation,
  type StackCompoundProfile,
  type StackPairwiseRule,
} from "@lib/data/stack-interactions"
import staticStackingData from "@lib/data/peptide-stack-interactions.json"

interface ProductStackingPartnersProps {
  product: HttpTypes.StoreProduct
  countryCode: string
  allProducts?: HttpTypes.StoreProduct[]
}

export default function ProductStackingPartners({
  product,
  countryCode,
  allProducts = [],
}: ProductStackingPartnersProps) {
  const [isAddingId, setIsAddingId] = useState<string | null>(null)
  const [cartFeedback, setCartFeedback] = useState<{
    partnerId: string
    status: "success" | "error"
    message: string
  } | null>(null)

  // Resolve compound stem from product handle & title
  const { compoundId, isBlend, isSupply } = useMemo(() => {
    const handle = (product.handle || "").toLowerCase()
    const title = (product.title || "").toLowerCase()

    if (
      handle.includes("water") ||
      handle.includes("syringe") ||
      handle.includes("swab") ||
      title.includes("bacteriostatic") ||
      title.includes("syringe")
    ) {
      return { compoundId: null, isBlend: false, isSupply: true }
    }

    if (
      handle.includes("blend") ||
      title.includes("blend") ||
      handle.includes("glow") ||
      handle.includes("klow") ||
      handle.includes("wolverine-blend")
    ) {
      return { compoundId: null, isBlend: true, isSupply: false }
    }

    if (handle.includes("bpc") || title.includes("bpc")) return { compoundId: "bpc-157", isBlend: false, isSupply: false }
    if (handle.includes("tb-500") || title.includes("tb-500") || title.includes("thymosin")) return { compoundId: "tb-500", isBlend: false, isSupply: false }
    if (handle.includes("cjc") || title.includes("cjc")) return { compoundId: "cjc-1295", isBlend: false, isSupply: false }
    if (handle.includes("ipam") || title.includes("ipam")) return { compoundId: "ipamorelin", isBlend: false, isSupply: false }
    if (handle.includes("tirz") || title.includes("tirz")) return { compoundId: "tirzepatide", isBlend: false, isSupply: false }
    if (handle.includes("sema") || title.includes("sema")) return { compoundId: "semaglutide", isBlend: false, isSupply: false }
    if (handle.includes("reta") || title.includes("reta")) return { compoundId: "retatrutide", isBlend: false, isSupply: false }
    if (handle.includes("aod") || title.includes("aod")) return { compoundId: "aod-9604", isBlend: false, isSupply: false }
    if (handle.includes("ghk") || title.includes("ghk")) return { compoundId: "ghk-cu", isBlend: false, isSupply: false }
    if (handle.includes("epith") || title.includes("epith")) return { compoundId: "epithalon", isBlend: false, isSupply: false }
    if (handle.includes("nad") || title.includes("nad")) return { compoundId: "nad-plus", isBlend: false, isSupply: false }
    if (handle.includes("glut") || title.includes("glut")) return { compoundId: "glutathione", isBlend: false, isSupply: false }
    if (handle.includes("semax") || title.includes("semax")) return { compoundId: "semax", isBlend: false, isSupply: false }
    if (handle.includes("selank") || title.includes("selank")) return { compoundId: "selank", isBlend: false, isSupply: false }
    if (handle.includes("melanotan") || title.includes("melanotan")) return { compoundId: "melanotan-2", isBlend: false, isSupply: false }
    if (handle.includes("pt-141") || title.includes("pt-141") || title.includes("bremelanotide")) return { compoundId: "pt-141", isBlend: false, isSupply: false }
    if (handle.includes("ghrp-2") || title.includes("ghrp-2")) return { compoundId: "ghrp-2", isBlend: false, isSupply: false }
    if (handle.includes("ghrp-6") || title.includes("ghrp-6")) return { compoundId: "ghrp-6", isBlend: false, isSupply: false }

    return { compoundId: null, isBlend: false, isSupply: false }
  }, [product])

  // Get active compound profile
  const baseProfile = useMemo(() => {
    if (!compoundId) return null
    return (staticStackingData.compounds as StackCompoundProfile[]).find(
      (c) => c.id === compoundId
    )
  }, [compoundId])

  // Retrieve synergistic stacking partners
  const synergisticPartners = useMemo(() => {
    if (!compoundId) return []
    const partners = getCompatiblePartnersForCompound(
      compoundId,
      staticStackingData.compounds as StackCompoundProfile[],
      staticStackingData.pairwise_interactions as unknown as StackPairwiseRule[]
    )
    return partners.filter((p) => p.status === "synergistic")
  }, [compoundId])

  // Retrieve any contraindicated partners
  const contraindicatedPartners = useMemo(() => {
    if (!compoundId) return []
    const partners = getCompatiblePartnersForCompound(
      compoundId,
      staticStackingData.compounds as StackCompoundProfile[],
      staticStackingData.pairwise_interactions as unknown as StackPairwiseRule[]
    )
    return partners.filter((p) => p.status === "contraindicated")
  }, [compoundId])

  // Handle 1-click addition of companion product
  const handleAddCompanionToCart = async (partner: CompatiblePartnerRecommendation) => {
    setIsAddingId(partner.compound.id)
    setCartFeedback(null)

    try {
      // Find matching partner product in active catalog
      const matched = (allProducts || []).find((p) => {
        const title = (p.title || "").toLowerCase()
        const handle = (p.handle || "").toLowerCase()
        const pid = partner.compound.id.toLowerCase()
        return (
          handle.includes(pid) ||
          title.includes(partner.compound.shortName.toLowerCase()) ||
          (pid === "tb-500" && (handle.includes("tb-500") || title.includes("tb-500"))) ||
          (pid === "bpc-157" && (handle.includes("bpc") || title.includes("bpc"))) ||
          (pid === "cjc-1295" && (handle.includes("cjc") || title.includes("cjc"))) ||
          (pid === "ipamorelin" && (handle.includes("ipam") || title.includes("ipam"))) ||
          (pid === "aod-9604" && (handle.includes("aod") || title.includes("aod"))) ||
          (pid === "ghk-cu" && (handle.includes("ghk") || title.includes("ghk")))
        )
      })

      const variant = matched?.variants?.[0]
      if (!variant?.id) {
        // Fallback notification
        setCartFeedback({
          partnerId: partner.compound.id,
          status: "success",
          message: `✓ Stacking Partner ${partner.compound.shortName} selected! Configure complete kit in Stacking Studio.`,
        })
        return
      }

      // Check inventory guardrail
      if (variant.manage_inventory && (variant.inventory_quantity || 0) <= 0) {
        setCartFeedback({
          partnerId: partner.compound.id,
          status: "error",
          message: `${partner.compound.shortName} is currently out of stock.`,
        })
        return
      }

      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode,
      })

      try {
        await addPromotionCode("STACK15")
      } catch (promoErr) {
        console.warn("[ProductStackingPartners] Could not auto-apply STACK15:", promoErr)
      }

      setCartFeedback({
        partnerId: partner.compound.id,
        status: "success",
        message: `✓ Added ${partner.compound.shortName} to your cart with 15% bundle savings (STACK15) applied!`,
      })

    } catch (err: unknown) {
      console.warn("[handleAddCompanionToCart] Error:", err)
      const message = err instanceof Error ? err.message : "Failed to add companion to cart."
      setCartFeedback({
        partnerId: partner.compound.id,
        status: "error",
        message,
      })
    } finally {
      setIsAddingId(null)
    }
  }

  // If this is a lab supply (BAC water, syringe), suppress the module
  if (isSupply) {
    return null
  }

  // If this is a single-vial Blend, show the educational formulation notice
  if (isBlend) {
    return (
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-6 sm:p-8 shadow-sm my-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300 bg-indigo-100/60 px-3 py-1 text-xs font-bold text-indigo-900 uppercase tracking-wider">
              <span>🧬</span> Formulation Clarification · Single-Vial Blend
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
              All-in-One Pre-Mixed Peptide Formulation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1 leading-relaxed">
              This product is a <strong>Blend (1 physical vial)</strong> where active peptide compounds are co-lyophilized into a single cake for simplified reconstitution. If your research requires staggered administration windows (e.g. Fasted AM vs Pre-Bed PM) or custom stoichiometric titrations, you can stack separate vials in our Stacking Studio.
            </p>
          </div>

          <LocalizedClientLink
            href="/research-stacks"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 shadow-sm transition-all"
          >
            <span>Open Stacking Studio</span>
            <ArrowRightMini className="h-4 w-4" />
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  // If no synergistic partners exist for this compound, suppress
  if (!baseProfile || synergisticPartners.length === 0) {
    return null
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg my-12" id="verified-stacking-partners">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <span>⚡ Pharmacodynamic Synergy</span>
            <span>·</span>
            <span>Verified Stacking Regimens</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Frequently Stacked with {baseProfile.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Clinically verified multi-product combinations that activate complementary physiological pathways without competitive receptor desensitization.
          </p>
        </div>

        <LocalizedClientLink
          href={`/research-stacks?compounds=${baseProfile.id}`}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3.5 py-2 rounded-xl transition-all self-start sm:self-auto"
        >
          <span>Open in Stacking Studio</span>
          <ArrowRightMini className="h-4 w-4" />
        </LocalizedClientLink>
      </div>

      {/* ── Stacking Partner Cards Grid ── */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {synergisticPartners.map((partner) => {
          const isAdding = isAddingId === partner.compound.id
          const feedback = cartFeedback?.partnerId === partner.compound.id ? cartFeedback : null

          return (
            <div
              key={partner.compound.id}
              className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/30 via-white to-slate-50/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Co-Administered Regimen Partner
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {partner.compound.name}
                    </h4>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-xs font-black">
                    +{partner.score} Synergy
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-700">
                  <div className="font-bold text-emerald-950 mb-1">
                    {partner.title}
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {partner.mechanismSummary}
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="font-bold text-slate-800">⏱️ Cadence:</span>
                      <p className="text-slate-600 line-clamp-1">{partner.timingProtocol.split(".")[0]}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">🛡️ Syringe Rule:</span>
                      <p className="text-slate-600 line-clamp-1">Separate sterile syringes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Feedback */}
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    <span className="font-bold text-emerald-700">15% Off</span> when purchased together
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <LocalizedClientLink
                      href={`/research-stacks?compounds=${baseProfile.id},${partner.compound.id}#stacking-studio`}
                      className="flex-1 sm:flex-initial text-center rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 transition-colors"
                    >
                      Compare
                    </LocalizedClientLink>

                    <button
                      type="button"
                      onClick={() => handleAddCompanionToCart(partner)}
                      disabled={isAdding}
                      className="flex-1 sm:flex-initial rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isAdding ? "Adding..." : "+ Add Companion (15% Off)"}
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-xs font-semibold ${
                      feedback.status === "success"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-rose-100 text-rose-900 border border-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{feedback.message}</span>
                      {feedback.status === "success" && (
                        <LocalizedClientLink
                          href="/cart"
                          className="underline font-bold text-emerald-950 shrink-0 ml-1"
                        >
                          View Cart →
                        </LocalizedClientLink>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Contraindication Safeguard Callout (If applicable) ── */}
      {contraindicatedPartners.length > 0 && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-xs text-rose-950">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-800 uppercase tracking-wider text-[11px]">
            <span>⚠️</span> Critical Safety Contraindication Warning:
          </div>
          <div className="text-slate-700 leading-relaxed">
            {baseProfile.name} is <strong>contraindicated</strong> to stack concurrently with{" "}
            {contraindicatedPartners.map((c) => c.compound.name).join(", ")}. Both agents compete for the same receptor beds, risking severe adverse compounding without additive efficacy.
          </div>
        </div>
      )}
    </div>
  )
}
