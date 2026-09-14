/**
 * @file    apps/backend/src/admin/routes/promotions-studio/page.tsx
 * @module  PromotionsStudioPage
 * @purpose Main Split-Canvas Studio route for creating and editing promotions with real-time feedback.
 * @contracts
 *   Route:   /app/promotions-studio (Create & Edit modes)
 *   API:     POST /admin/promotions · POST /admin/promotions/:id
 */

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, Sparkles } from "@medusajs/icons"
import { toast } from "@medusajs/ui"

import { PromotionStudioState, ClinicalPreset } from "./types"
import { PresetPills } from "./components/preset-pills"
import { PromotionStudioForm } from "./components/promotion-studio-form"
import { PromotionLivePreview } from "./components/promotion-live-preview"
import { useDraftStorage } from "./hooks/use-draft-storage"
import { sdk } from "../../lib/sdk"

const DEFAULT_PROMOTION_STATE: PromotionStudioState = {
  type: "percentage",
  code: "",
  title: "",
  description: "",
  value: 0,
  currencyCode: "PHP",
  allocation: "across",
  minOrderValue: 0,
  targetCategories: [],
  customerGroups: [],
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  hasEndDate: false,
  maxRedemptions: null,
  maxPerCustomer: 1,
}

export const PromotionsStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const promoId = searchParams.get("id") || undefined
  const isEditMode = Boolean(promoId)

  const [formState, setFormState] = useState<PromotionStudioState>(DEFAULT_PROMOTION_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingPromo, setIsLoadingPromo] = useState(isEditMode)

  const { checkStoredDraft, saveDraft, clearDraft, lastSaved, draftRestored, setDraftRestored } =
    useDraftStorage(DEFAULT_PROMOTION_STATE, isEditMode)

  // Load existing promo in Edit Mode or load Draft in Create Mode
  useEffect(() => {
    if (isEditMode && promoId) {
      setIsLoadingPromo(true)
      sdk.admin.promotion
        .retrieve(promoId)
        .then((res: any) => {
          const p = res.promotion
          if (p) {
            setFormState({
              id: p.id,
              type: p.application_method?.type || "percentage",
              code: p.code || "",
              title: p.campaign?.name || p.code || "Promotion",
              description: p.campaign?.description || "",
              value: p.application_method?.value || 0,
              currencyCode: (p.application_method?.currency_code || "PHP").toUpperCase() as "PHP" | "USD",
              allocation: p.application_method?.allocation || "across",
              minOrderValue: 0,
              targetCategories: ["peptides"],
              customerGroups: [],
              startDate: p.campaign?.starts_at ? p.campaign.starts_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
              endDate: p.campaign?.ends_at ? p.campaign.ends_at.slice(0, 10) : "",
              hasEndDate: Boolean(p.campaign?.ends_at),
              maxRedemptions: p.application_method?.max_quantity || null,
              maxPerCustomer: 1,
            })
          }
        })
        .catch((err: any) => {
          console.error("Failed to load promotion:", err)
          toast.error("Failed to load promotion details.")
        })
        .finally(() => setIsLoadingPromo(false))
    } else {
      // Check stored draft
      const stored = checkStoredDraft()
      if (stored && stored.code) {
        setFormState(stored)
        setDraftRestored(true)
      }
    }
  }, [isEditMode, promoId, checkStoredDraft, setDraftRestored])

  // Trigger autosave when formState changes
  useEffect(() => {
    if (!isEditMode && formState) {
      const timer = setTimeout(() => {
        saveDraft(formState)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formState, isEditMode, saveDraft])

  const handleUpdate = (updates: Partial<PromotionStudioState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }

  const handleSelectPreset = (preset: ClinicalPreset) => {
    setFormState((prev) => ({
      ...prev,
      ...preset.state,
    }))
    toast.success(`Applied preset: ${preset.label}`)
  }

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard this promotion? Unsaved changes will be cleared.")) {
      clearDraft()
      navigate("/app/promotions")
    }
  }

  const handleSave = useCallback(async () => {
    if (!formState.code.trim()) {
      toast.error("Voucher code is required.")
      return
    }
    if (!formState.value || formState.value <= 0) {
      toast.error("Please enter a valid discount value greater than 0.")
      return
    }

    setIsSubmitting(true)
    try {
      // Construct Medusa 2.0 Promotion creation payload
      const payload: any = {
        code: formState.code.trim().toUpperCase(),
        type: "standard",
        is_automatic: false,
        application_method: {
          type: formState.type === "fixed" ? "fixed" : "percentage",
          target_type: "order",
          allocation: formState.allocation,
          value: formState.value,
          currency_code: formState.currencyCode.toLowerCase(),
          max_quantity: formState.maxRedemptions || undefined,
        },
      }

      if (isEditMode && promoId) {
        await sdk.admin.promotion.update(promoId, payload)
        toast.success(`Promotion ${formState.code} updated successfully!`)
      } else {
        await sdk.admin.promotion.create(payload)
        toast.success(`Promotion ${formState.code} created successfully!`)
        clearDraft()
      }

      navigate("/app/promotions")
    } catch (err: any) {
      console.error("Failed to save promotion:", err)
      const msg = err?.message || err?.toString() || "Server validation error."
      toast.error(`Error saving promotion: ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }, [formState, isEditMode, promoId, clearDraft, navigate])

  // Keyboard shortcut: Cmd+S / Ctrl+S to save
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
      if (e.key === "Escape") {
        // Prevent accidental closing without confirm
        e.preventDefault()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleSave])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* ── TOP STUDIO NAVIGATION BAR ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/promotions")}
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Return to Promotions List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Promotions /</span>
                <span className="text-sm font-bold text-slate-900">
                  {isEditMode ? "Edit Promotion Studio" : "New Promotion Studio"}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Split-Canvas Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isEditMode
                  ? "Modifying active operational compound rules and redemption limits."
                  : "Design high-conversion discounts with live voucher & cart margin simulation."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Discard Draft
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Publishing..." : isEditMode ? "Update Promotion" : "Publish Promotion"}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
                ⌘S
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── RESTORED DRAFT BANNER ── */}
      {!isEditMode && draftRestored && (
        <div className="w-full px-6 pt-4">
          <div className="bg-blue-50/80 border border-blue-200 text-blue-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
            <span>
              ℹ️ We automatically restored your unsaved promotion draft from your previous session.
            </span>
            <button
              type="button"
              onClick={() => {
                clearDraft()
                setFormState(DEFAULT_PROMOTION_STATE)
              }}
              className="text-blue-700 font-bold hover:underline ml-3"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN STUDIO WORKSPACE ── */}
      <div className="px-6 pt-6 flex flex-col gap-6 w-full">
        {/* 1-Click Clinical Presets */}
        {!isEditMode && (
          <PresetPills onSelectPreset={handleSelectPreset} activeCode={formState.code} />
        )}

        {/* Maximized Workspace Canvas */}
        <div className="w-full flex flex-col gap-8">
          {/* Primary Form Flow */}
          <div className="w-full">
            <PromotionStudioForm
              state={formState}
              onChange={handleUpdate}
              isEditMode={isEditMode}
            />
          </div>

          {/* Live Preview & Simulation Dock */}
          <div className="w-full mt-6">
            <PromotionLivePreview
              state={formState}
              lastSaved={lastSaved}
              onClearDraft={clearDraft}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromotionsStudioPage
