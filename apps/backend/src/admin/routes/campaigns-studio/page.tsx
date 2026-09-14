/**
 * @file    apps/backend/src/admin/routes/campaigns-studio/page.tsx
 * @module  CampaignsStudioPage
 * @purpose Modern Split-Canvas Studio route for creating and managing commercial campaigns with live budget exposure and margin locks.
 * @contracts
 *   Route:   /app/campaigns-studio
 *   API:     POST /admin/campaigns · POST /admin/campaigns/:id
 */

import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  Buildings,
  Tag,
  CurrencyDollar,
  Calendar,
  XMark,
  ShieldCheck,
} from "@medusajs/icons"
import { toast } from "@medusajs/ui"

import { CampaignStudioState, CampaignBudgetType } from "./types"
import { CampaignBudgetPreview } from "./components/campaign-budget-preview"
import { sdk } from "../../lib/sdk"

const DRAFT_STORAGE_KEY = "hacien_campaign_studio_draft_v1"

const DEFAULT_STATE: CampaignStudioState = {
  name: "",
  campaignIdentifier: "",
  description: "",
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: "",
  hasEndDate: false,
  budgetType: "spend",
  budgetLimit: 50000,
  currencyCode: "php",
  targetChannels: ["Storefront Direct", "B2B Partner Network"],
  promotionalHeadline: "",
  estimatedAvgOrderValue: 5000,
}

export const CampaignsStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const campaignId = searchParams.get("id") || undefined
  const isEditMode = Boolean(campaignId)

  const [formState, setFormState] = useState<CampaignStudioState>(DEFAULT_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // 1. Draft Storage & Live Campaign Retrieval
  useEffect(() => {
    if (isEditMode && campaignId) {
      sdk.admin.campaign
        .retrieve(campaignId)
        .then((res: any) => {
          const c = res.campaign
          if (c) {
            setFormState({
              name: c.name || "",
              campaignIdentifier: c.campaign_identifier || "",
              description: c.description || "",
              startsAt: c.starts_at ? c.starts_at.slice(0, 10) : "",
              endsAt: c.ends_at ? c.ends_at.slice(0, 10) : "",
              hasEndDate: Boolean(c.ends_at),
              budgetType: c.budget?.type || "spend",
              budgetLimit: c.budget?.limit || 50000,
              currencyCode: c.budget?.currency_code || "php",
              targetChannels: ["Storefront Direct", "B2B Partner Network"],
              promotionalHeadline: c.name || "",
              estimatedAvgOrderValue: 5000,
            })
          }
        })
        .catch((err: any) => {
          console.error("Failed to load campaign:", err)
          toast.error("Failed to load campaign details.")
        })
    } else {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && (parsed.name || parsed.campaignIdentifier)) {
            setFormState(parsed)
            setDraftRestored(true)
          }
        }
      } catch (e) {
        console.error("Draft load error:", e)
      }
    }
  }, [isEditMode, campaignId])

  useEffect(() => {
    if (!isEditMode && formState) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState))
          setLastSaved(new Date())
        } catch (e) {
          console.error("Draft autosave error:", e)
        }
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [formState, isEditMode])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setFormState(DEFAULT_STATE)
    setDraftRestored(false)
    setLastSaved(null)
    toast.info("Draft reset to default.")
  }

  // Quick preset loader
  const applyPreset = (preset: "spend" | "usage") => {
    if (preset === "spend") {
      setFormState((prev) => ({
        ...prev,
        budgetType: "spend",
        budgetLimit: 250000,
        currencyCode: "php",
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        budgetType: "usage",
        budgetLimit: 500,
      }))
    }
    toast.success(`Configured ${preset === "spend" ? "Spend Limit" : "Usage Limit"} preset.`)
  }

  const generateCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000)
    const prefix = formState.name
      ? formState.name.replace(/[^a-zA-Z]/g, "").slice(0, 6).toUpperCase()
      : "CAMP"
    const newCode = `${prefix}-${random}`
    setFormState({ ...formState, campaignIdentifier: newCode })
    toast.info(`Generated campaign code: ${newCode}`)
  }

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.name.trim()) {
      toast.error("Campaign name is required.")
      return
    }
    if (!formState.campaignIdentifier.trim()) {
      toast.error("Campaign identifier code is required.")
      return
    }
    if (formState.budgetLimit <= 0) {
      toast.error("Budget limit must be greater than zero.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name: formState.name,
        campaign_identifier: formState.campaignIdentifier,
        description: formState.description,
        starts_at: formState.startsAt ? new Date(formState.startsAt).toISOString() : undefined,
        ends_at:
          formState.hasEndDate && formState.endsAt
            ? new Date(formState.endsAt).toISOString()
            : undefined,
        budget: {
          type: formState.budgetType,
          limit: Number(formState.budgetLimit),
          currency_code: formState.budgetType === "spend" ? "php" : undefined,
        },
      }

      if (isEditMode && campaignId) {
        await sdk.admin.campaign.update(campaignId, payload)
        toast.success("Strategic campaign updated successfully!")
      } else {
        await sdk.admin.campaign.create(payload)
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        toast.success("Strategic campaign successfully created and registered!")
      }

      navigate("/promotions")
    } catch (err: any) {
      console.error("Failed to save campaign:", err)
      toast.error(err.message || "Failed to save campaign")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Studio Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/promotions")}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Return to Promotions & Campaigns"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Campaigns Studio
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Commercial Budget Studio
              </span>
              {draftRestored && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Draft Auto-Restored
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Strategic Multi-Channel Commercial Promotions with Real-Time Budget Liability & Margin Safeguards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          <button
            type="button"
            onClick={clearDraft}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            Reset Form
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>{isSubmitting ? "Launching Campaign..." : "Authorize & Launch Campaign"}</span>
          </button>
        </div>
      </div>

      {/* Main Maximized Canvas Layout */}
      <div className="px-6 py-6 flex flex-col gap-8 w-full">
        {/* Primary Form Builder */}
        <div className="w-full flex flex-col gap-6">
          {/* Quick Presets Bar */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Budget Archetypes:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => applyPreset("spend")}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-md transition-all cursor-pointer"
              >
                + ₱500K Spend Cap
              </button>
              <button
                type="button"
                onClick={() => applyPreset("usage")}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-md transition-all cursor-pointer"
              >
                + 1,000 Redemptions Cap
              </button>
            </div>
          </div>

          {/* Card 1: Strategic Identity */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              1. Strategic Campaign Identity
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Define the executive title, unique tracking code, and business objectives.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Q3 Clinical Longevity & Recovery Series"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Campaign Identifier Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateCode}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={formState.campaignIdentifier}
                  onChange={(e) =>
                    setFormState({ ...formState, campaignIdentifier: e.target.value.toUpperCase() })
                  }
                  placeholder="CAMP-LONGEVITY-2026"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Est. Average Order Value (₱ AOV)
                </label>
                <input
                  type="number"
                  value={formState.estimatedAvgOrderValue}
                  onChange={(e) =>
                    setFormState({ ...formState, estimatedAvgOrderValue: Number(e.target.value) })
                  }
                  placeholder="8500"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Storefront Announcement Headline
                </label>
                <input
                  type="text"
                  value={formState.promotionalHeadline}
                  onChange={(e) => setFormState({ ...formState, promotionalHeadline: e.target.value })}
                  placeholder="e.g. Q3 Clinical Series: Up to 25% Off Verified Research Compounds"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Internal Strategic Objective & Description
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Document the purpose, partner terms, and expected clinical volume..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Budget Caps & Financial Exposure */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                2. Budget Cap & Financial Exposure Safeguards
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Hard Stop Auto-Lock
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Set rigid financial boundaries. The campaign autonomously deactivates when the threshold is reached.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Option 1: Currency Spend */}
              <button
                type="button"
                onClick={() => setFormState({ ...formState, budgetType: "spend" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  formState.budgetType === "spend"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <CurrencyDollar className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Currency Spend Cap (₱)</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Caps total cumulative Philippine Peso discount value distributed to buyers.
                </p>
              </button>

              {/* Option 2: Redemption Usage */}
              <button
                type="button"
                onClick={() => setFormState({ ...formState, budgetType: "usage" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  formState.budgetType === "usage"
                    ? "border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Redemption Volume Cap</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Limits the maximum number of order redemptions across all linked promotions.
                </p>
              </button>

              <div className="col-span-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {formState.budgetType === "spend"
                    ? "Maximum Currency Discount Limit (PHP ₱)"
                    : "Maximum Allowed Order Redemptions"}
                </label>
                <div className="relative">
                  {formState.budgetType === "spend" && (
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">
                      ₱
                    </span>
                  )}
                  <input
                    type="number"
                    value={formState.budgetLimit}
                    onChange={(e) =>
                      setFormState({ ...formState, budgetLimit: Number(e.target.value) })
                    }
                    className={`w-full ${
                      formState.budgetType === "spend" ? "pl-7" : "pl-3"
                    } pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Timeline & Scheduling */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              3. Campaign Schedule & Active Duration
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Determine the start and end dates for automatic activation and expiration.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Starts On <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formState.startsAt}
                  onChange={(e) => setFormState({ ...formState, startsAt: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Expires On</label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.hasEndDate}
                      onChange={(e) =>
                        setFormState({ ...formState, hasEndDate: e.target.checked })
                      }
                      className="rounded text-blue-600 cursor-pointer"
                    />
                    <span>Set Expiry</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={!formState.hasEndDate}
                  value={formState.endsAt}
                  onChange={(e) => setFormState({ ...formState, endsAt: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Campaign Exposure & ROI Simulator (Full Width Bottom Dock) */}
        <div className="w-full mt-6">
          <CampaignBudgetPreview state={formState} />
        </div>
      </div>
    </div>
  )
}

export default CampaignsStudioPage
