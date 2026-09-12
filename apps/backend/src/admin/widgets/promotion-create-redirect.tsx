/**
 * @file    apps/backend/src/admin/widgets/promotion-create-redirect.tsx
 * @module  PromotionCreateRedirectWidget
 * @purpose Intercepts legacy /app/promotions/create modal calls and redirects to /app/promotions-studio.
 * @contracts
 *   Widget:  defineWidgetConfig({ zone: "promotion.list.before" })
 *   Route:   /app/promotions/create -> /app/promotions-studio
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import React, { useEffect } from "react"
import { Sparkles } from "@medusajs/icons"

import { shouldRedirectPromotionCreate } from "../lib/studio-redirect-routes"

const PromotionCreateRedirect = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 1. If user accessed /app/promotions/create directly without ?view=raw_modal, redirect to Studio
  if (shouldRedirectPromotionCreate(location.pathname, location.search)) {
    return <Navigate to="/promotions-studio" replace />
  }

  // 2. Add an authoritative "Open Promotion Studio" quick banner at the top of the Promotions list
  return (
    <div className="mb-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-4 border border-blue-800/40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Promotion Creation Studio</span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200">
              Live Preview & Margin Safe
            </span>
          </h3>
          <p className="text-xs text-slate-300">
            Create high-conversion compound vouchers with real-time cart simulation and 35% margin floor protection.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate("/promotions-studio")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
      >
        <span>+ Open Promotion Studio</span>
      </button>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "promotion.list.before",
})

export default PromotionCreateRedirect
