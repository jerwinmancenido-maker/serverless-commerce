/**
 * @file    apps/backend/src/admin/routes/promotions-studio/components/preset-pills.tsx
 * @module  PromotionPresetPills
 * @purpose Renders 1-click clinical promotion presets for high-velocity operations.
 * @contracts
 *   Studio:  CLINICAL_PRESETS · PresetPillsProps
 */

import React from "react"
import { Sparkles } from "@medusajs/icons"
import { ClinicalPreset, PromotionStudioState } from "../types"

export const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: "first_time",
    label: "First-Time Researcher",
    tagline: "15% off first order > ₱3,500",
    state: {
      type: "percentage",
      code: "RESEARCH-FIRST-15",
      title: "First-Time Researcher 15% Protocol",
      description: "Welcome voucher for accredited researchers on initial protocol orders.",
      value: 15,
      currencyCode: "PHP",
      allocation: "across",
      minOrderValue: 3500,
      targetCategories: ["peptides"],
      customerGroups: [],
      maxRedemptions: 500,
      maxPerCustomer: 1,
      hasEndDate: true,
    },
  },
  {
    id: "reconstitution_bogo",
    label: "Reconstitution Kit BOGO",
    tagline: "₱500 off reconstitution supplies",
    state: {
      type: "fixed",
      code: "KIT-RECON-500",
      title: "Reconstitution Supply Bundle Voucher",
      description: "Complimentary supplies voucher applied to bacteriostatic water and reconstitution kit.",
      value: 500,
      currencyCode: "PHP",
      allocation: "across",
      minOrderValue: 4000,
      targetCategories: ["supplies", "solutions"],
      customerGroups: [],
      maxRedemptions: 250,
      maxPerCustomer: 2,
      hasEndDate: false,
    },
  },
  {
    id: "bulk_institution",
    label: "Bulk Institution Tier",
    tagline: "20% off high-volume vial orders",
    state: {
      type: "percentage",
      code: "BULK-LAB-20",
      title: "Institutional Volume Discount (20%)",
      description: "Tiered wholesale pricing for verified laboratories ordering 5+ compounded vials.",
      value: 20,
      currencyCode: "PHP",
      allocation: "across",
      minOrderValue: 12000,
      targetCategories: ["peptides"],
      customerGroups: ["wholesale", "vip"],
      maxRedemptions: 100,
      maxPerCustomer: null,
      hasEndDate: true,
    },
  },
  {
    id: "flash_protocol",
    label: "Flash Protocol (48h)",
    tagline: "₱1,000 off orders over ₱8,000",
    state: {
      type: "fixed",
      code: "FLASH-48H-1000",
      title: "48-Hour Protocol Acceleration Voucher",
      description: "Time-limited protocol acceleration discount across all compound catalogs.",
      value: 1000,
      currencyCode: "PHP",
      allocation: "across",
      minOrderValue: 8000,
      targetCategories: ["peptides", "solutions", "supplies"],
      customerGroups: [],
      maxRedemptions: 75,
      maxPerCustomer: 1,
      hasEndDate: true,
    },
  },
]

interface PresetPillsProps {
  onSelectPreset: (preset: ClinicalPreset) => void
  activeCode?: string
}

export const PresetPills: React.FC<PresetPillsProps> = ({ onSelectPreset, activeCode }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 mr-1 pl-1">
        <Sparkles className="w-4 h-4" />
        <span>1-Click Presets:</span>
      </div>
      {CLINICAL_PRESETS.map((preset) => {
        const isSelected = activeCode === preset.state.code
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              isSelected
                ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/20"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/80"
            }`}
          >
            <span>{preset.label}</span>
            <span className={`text-[11px] opacity-75 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
              ({preset.tagline})
            </span>
          </button>
        )
      })}
    </div>
  )
}
