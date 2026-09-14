/**
 * @file    apps/backend/src/admin/routes/promotions-studio/components/promotion-live-preview.tsx
 * @module  PromotionLivePreview
 * @purpose Renders the 38% right column sticky inspector dock (voucher, cart simulator, rule summary).
 * @contracts
 *   Studio:  PromotionLivePreviewProps
 */

import React from "react"
import { StorefrontVoucherCard } from "./storefront-voucher-card"
import { CartSimulator } from "./cart-simulator"
import { RuleSynthesizer } from "./rule-synthesizer"
import { PromotionStudioState } from "../types"

interface PromotionLivePreviewProps {
  state: PromotionStudioState
  lastSaved: Date | null
  onClearDraft: () => void
  isEditMode: boolean
}

export const PromotionLivePreview: React.FC<PromotionLivePreviewProps> = ({
  state,
  lastSaved,
  onClearDraft,
  isEditMode,
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* 3-Column Inspection Dock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Live Storefront Voucher Badge */}
        <StorefrontVoucherCard state={state} />

        {/* Real-time Cart Simulator with Margin Floor Lock */}
        <CartSimulator state={state} />

        {/* Dynamic Plain-English Rule Synthesizer */}
        <RuleSynthesizer state={state} />
      </div>

      {/* Draft persistence telemetry banner */}
      {!isEditMode && lastSaved && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Draft auto-saved: {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClearDraft}
            className="text-slate-500 hover:text-rose-600 font-medium underline transition-colors cursor-pointer"
          >
            Clear Draft
          </button>
        </div>
      )}
    </div>
  )
}
