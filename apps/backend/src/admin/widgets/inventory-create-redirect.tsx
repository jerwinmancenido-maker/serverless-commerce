/**
 * @file    apps/backend/src/admin/widgets/inventory-create-redirect.tsx
 * @module  InventoryCreateRedirectWidget
 * @purpose Intercepts /app/inventory/create and opens modern slide-over drawer directly on the inventory list.
 * @contracts
 *   Widget:  defineWidgetConfig({ zone: "inventory_item.list.before" })
 *   Drawer:  InventoryCreateDrawer
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useLocation, useNavigate } from "react-router-dom"
import React, { useState, useEffect } from "react"
import { Sparkles, Component, ArrowUpRightOnBox } from "@medusajs/icons"
import { InventoryCreateDrawer } from "../components/inventory/inventory-create-drawer"

import { shouldRedirectInventoryCreate } from "../lib/studio-redirect-routes"

const InventoryCreateRedirect = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // 1. Intercept /app/inventory/create and open the Slide-Over Sheet on the list
  useEffect(() => {
    if (shouldRedirectInventoryCreate(location.pathname, location.search)) {
      setDrawerOpen(true)
      navigate("/inventory", { replace: true })
    }
  }, [location.pathname, location.search, navigate])

  return (
    <>
      <div className="mb-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 rounded-xl shadow-sm flex items-center justify-between gap-4 border border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Component className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cleanroom Inventory & Raw Materials</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200">
                Slide-Over Drawer
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Register cleanroom active powders, sterile diluents, and containers with cryo storage standards and yield calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>+ New Inventory Item</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/inventory-studio")}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            title="Open Full Split-Canvas Studio"
          >
            <ArrowUpRightOnBox className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
        </div>
      </div>

      <InventoryCreateDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "inventory_item.list.before",
})

export default InventoryCreateRedirect
