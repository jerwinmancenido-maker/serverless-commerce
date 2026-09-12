/**
 * @file    apps/backend/src/admin/widgets/campaign-create-redirect.tsx
 * @module  CampaignCreateRedirectWidget
 * @purpose Intercepts legacy /app/campaigns/create modal calls and redirects to /app/campaigns-studio.
 * @contracts
 *   Widget:  defineWidgetConfig({ zone: "campaign.list.before" })
 *   Route:   /app/campaigns/create -> /app/campaigns-studio
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import React from "react"
import { Sparkles, Tag } from "@medusajs/icons"

import { shouldRedirectCampaignCreate } from "../lib/studio-redirect-routes"

const CampaignCreateRedirect = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 1. If user accessed /app/campaigns/create directly without ?view=raw_modal, redirect to Studio
  if (shouldRedirectCampaignCreate(location.pathname, location.search)) {
    return <Navigate to="/campaigns-studio" replace />
  }

  // 2. Add an authoritative "Open Campaigns Studio" quick banner at the top of Campaigns list
  return (
    <div className="mb-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-4 border border-blue-800/40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Campaigns Studio</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200">
              Budget Exposure & Safe Margins
            </span>
          </h3>
          <p className="text-xs text-slate-300">
            Design multi-channel commercial campaigns with real-time budget liability limits, projected GMV modeling, and 35% margin floor protection.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate("/campaigns-studio")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-blue-200" />
        <span>+ Open Campaigns Studio</span>
      </button>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "campaign.list.before",
})

export default CampaignCreateRedirect
