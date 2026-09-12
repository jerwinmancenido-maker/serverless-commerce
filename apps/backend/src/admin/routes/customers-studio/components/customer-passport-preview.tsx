/**
 * @file    apps/backend/src/admin/routes/customers-studio/components/customer-passport-preview.tsx
 * @module  CustomerPassportPreview
 * @purpose Live Buyer Passport interactive simulator for the Customer Intelligence Studio.
 * @contracts
 *   Component: CustomerPassportPreview
 *   Types:     CustomerStudioState · CustomerGroupOption
 */

import React from "react"
import {
  Sparkles,
  Buildings,
  User,
  CheckCircle,
  ExclamationCircle,
  MapPin,
  Phone,
  Envelope,
  DocumentText,
  ShieldCheck,
} from "@medusajs/icons"
import { CustomerStudioState, CustomerGroupOption } from "../types"

interface CustomerPassportPreviewProps {
  state: CustomerStudioState
  availableGroups: CustomerGroupOption[]
}

export const CustomerPassportPreview: React.FC<CustomerPassportPreviewProps> = ({
  state,
  availableGroups,
}) => {
  const selectedGroups = availableGroups.filter((g) =>
    state.customerGroupIds.includes(g.id)
  )

  const isPhysician = state.archetype === "clinical_physician"
  const isLab = state.archetype === "research_lab"

  const hasName = Boolean(state.firstName || state.lastName)
  const displayName = hasName
    ? `${state.firstName} ${state.lastName}`.trim()
    : "Dr. Alexander Reyes, MD"

  const displayCompany = state.companyName || (isPhysician ? "St. Luke's Medical Aesthetic Clinic" : isLab ? "Apex BioAnalytics Research Lab" : "Private Research Practice")

  // Compliance completeness check
  const checks = [
    { label: "Full Identity", valid: Boolean(state.firstName && state.lastName) },
    { label: "Verified Email", valid: Boolean(state.email && state.email.includes("@")) },
    { label: isPhysician ? "PRC MD License" : isLab ? "Facility Reg ID" : "Contact Phone", valid: isPhysician ? Boolean(state.prcLicenseNumber) : isLab ? Boolean(state.facilityRegistrationId) : Boolean(state.phone) },
    { label: "Delivery Address", valid: Boolean(state.shippingAddress.address1 && state.shippingAddress.city) },
  ]
  const passedChecks = checks.filter((c) => c.valid).length
  const complianceScore = Math.round((passedChecks / checks.length) * 100)

  return (
    <div className="flex flex-col gap-5 sticky top-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Buyer Passport Simulator
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Storefront Checkout View
        </span>
      </div>

      {/* Main Passport Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Archetype Badge & Seal */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
                isPhysician
                  ? "bg-blue-500/20 text-blue-300 border border-blue-400/40"
                  : isLab
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isPhysician
                ? "Licensed Physician (MD)"
                : isLab
                ? "Research Institution / Lab"
                : "Direct Researcher"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            PASSPORT #PH-{state.facilityRegistrationId ? state.facilityRegistrationId.slice(-4) : "2026"}
          </span>
        </div>

        {/* Identity Row */}
        <div className="flex items-start gap-4 mb-5 relative z-10">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-400/40 flex items-center justify-center text-white text-xl font-extrabold shadow-md flex-shrink-0">
            {state.firstName ? state.firstName.charAt(0).toUpperCase() : "A"}
            {state.lastName ? state.lastName.charAt(0).toUpperCase() : "R"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white tracking-tight truncate">
              {displayName}
            </h2>
            <p className="text-xs font-medium text-blue-300 flex items-center gap-1.5 mt-0.5 truncate">
              <Buildings className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
              <span>{displayCompany}</span>
            </p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
              {state.email && (
                <span className="flex items-center gap-1 truncate">
                  <Envelope className="w-3 h-3 text-slate-500" />
                  {state.email}
                </span>
              )}
              {state.phone && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {state.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verification & Clinical Accreditation Matrix */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-5 relative z-10 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              PRC MD License
            </span>
            <span className="font-mono text-xs font-bold text-white mt-0.5 block">
              {state.prcLicenseNumber || "— Not Submitted"}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Facility / Lab Reg ID
            </span>
            <span className="font-mono text-xs font-bold text-white mt-0.5 block">
              {state.facilityRegistrationId || "REG-2026-0001"}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Clinical Onboarding Status</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
              Verified Clinical Partner
            </span>
          </div>
        </div>

        {/* Wholesale Tiers / Customer Groups */}
        <div className="mb-5 relative z-10">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Institutional Pricing Tiers Assigned ({selectedGroups.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedGroups.length > 0 ? (
              selectedGroups.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  {g.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">
                Standard Retail Group (No B2B wholesale discounts applied)
              </span>
            )}
          </div>
        </div>

        {/* Cold-Chain Shipping Destination */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 relative z-10">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Verified Shipping Route
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Cold-Chain Insulated
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {state.shippingAddress.address1 ? (
              <>
                {state.shippingAddress.address1}
                {state.shippingAddress.address2 ? `, ${state.shippingAddress.address2}` : ""}
                {state.shippingAddress.city ? `, ${state.shippingAddress.city}` : ""}
                {state.shippingAddress.province ? `, ${state.shippingAddress.province}` : ""}
                {state.shippingAddress.postalCode ? ` ${state.shippingAddress.postalCode}` : ""}
                {` (${state.shippingAddress.countryCode.toUpperCase()})`}
              </>
            ) : (
              <span className="italic text-slate-600">
                Clinic Address Pending · Default Metro Manila Hub
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Compliance Health Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900">B2B Onboarding Health</h4>
            <p className="text-[11px] text-slate-500">Autonomous verification criteria</p>
          </div>
          <span
            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
              complianceScore === 100
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : complianceScore >= 50
                ? "bg-blue-100 text-blue-800 border border-blue-300"
                : "bg-amber-100 text-amber-800 border border-amber-300"
            }`}
          >
            {complianceScore}% Ready
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              complianceScore === 100
                ? "bg-emerald-500"
                : complianceScore >= 50
                ? "bg-blue-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${complianceScore}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {c.valid ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <ExclamationCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              )}
              <span className={c.valid ? "text-slate-700 font-medium" : "text-slate-400"}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
