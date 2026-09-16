/**
 * @file    apps/backend/src/admin/routes/customers-studio/page.tsx
 * @module  CustomersStudioPage
 * @purpose Modern Split-Canvas Studio route for creating and onboarding B2B customers with live Buyer Passport simulator.
 * @contracts
 *   Route:   /app/customers-studio
 *   API:     POST /admin/customers · POST /admin/customer-groups/:id/customers
 */

import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  Buildings,
  User,
  ShieldCheck,
  DocumentText,
  MapPin,
  XMark,
} from "@medusajs/icons"
import { toast } from "@medusajs/ui"

import { CustomerStudioState, CustomerGroupOption, CustomerArchetype } from "./types"
import { CustomerPassportPreview } from "./components/customer-passport-preview"
import { sdk } from "../../lib/sdk"

const DRAFT_STORAGE_KEY = "hacien_customer_studio_draft_v1"

const DEFAULT_STATE: CustomerStudioState = {
  archetype: "institutional_lab",
  firstName: "",
  lastName: "",
  email: "",
  phone: "+63 ",
  companyName: "",
  prcLicenseNumber: "",
  facilityRegistrationId: "",
  customerGroupIds: [],
  shippingAddress: {
    address1: "",
    address2: "",
    city: "Taguig",
    province: "Metro Manila",
    postalCode: "1634",
    countryCode: "ph",
  },
}

export const CustomersStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const customerId = searchParams.get("id") || undefined
  const isEditMode = Boolean(customerId)

  const [formState, setFormState] = useState<CustomerStudioState>(DEFAULT_STATE)
  const [customerGroups, setCustomerGroups] = useState<CustomerGroupOption[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // 1. Fetch available Customer Groups
  useEffect(() => {
    sdk.admin.customerGroup
      .list({ limit: 50 })
      .then((res: any) => {
        if (res.customer_groups && res.customer_groups.length > 0) {
          setCustomerGroups(
            res.customer_groups.map((g: any) => ({
              id: g.id,
              name: g.name,
            }))
          )
        } else {
          setCustomerGroups([])
        }
      })
      .catch(() => {
        setCustomerGroups([])
      })
  }, [])

  // 2. Draft Storage & Live Customer Retrieval
  useEffect(() => {
    if (isEditMode && customerId) {
      sdk.admin.customer
        .retrieve(customerId, { fields: "*groups,*addresses" })
        .then((res: any) => {
          const c = res.customer
          if (c) {
            const defaultAddr = c.addresses?.[0] || {}
            setFormState({
              archetype: (c.metadata?.archetype as any) || "institutional_lab",
              firstName: c.first_name || "",
              lastName: c.last_name || "",
              email: c.email || "",
              phone: c.phone || "",
              companyName: c.company_name || "",
              prcLicenseNumber: (c.metadata?.prc_license_number as string) || "",
              facilityRegistrationId: (c.metadata?.facility_registration_id as string) || "",
              customerGroupIds: (c.groups || []).map((g: any) => g.id),
              shippingAddress: {
                address1: defaultAddr.address_1 || "",
                address2: defaultAddr.address_2 || "",
                city: defaultAddr.city || "Taguig",
                province: defaultAddr.province || "Metro Manila",
                postalCode: defaultAddr.postal_code || "1634",
                countryCode: defaultAddr.country_code || "ph",
              },
            })
          }
        })
        .catch((err: any) => {
          console.error("Failed to load customer:", err)
          toast.error("Failed to load customer details.")
        })
    } else {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && (parsed.firstName || parsed.email || parsed.companyName)) {
            setFormState(parsed)
            setDraftRestored(true)
          }
        }
      } catch (e) {
        console.error("Draft load error:", e)
      }
    }
  }, [isEditMode, customerId])

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

  // Preset quick fill for institutional testing
  const applyPreset = (presetType: CustomerArchetype) => {
    if (presetType === "institutional_lab" || presetType === "clinical_physician") {
      setFormState({
        archetype: "institutional_lab",
        firstName: "Lead",
        lastName: "Investigator",
        email: "procurement@apexbioresearch.ph",
        phone: "+63 917 800 1102",
        companyName: "Apex BioAnalytics Research Center",
        prcLicenseNumber: "009-812-491-000",
        facilityRegistrationId: "FAC-APEX-082",
        customerGroupIds: customerGroups.slice(0, 1).map((g) => g.id),
        shippingAddress: {
          address1: "Suite 804, Science Hub Tower 2",
          address2: "Campus Ave, McKinley Hill",
          city: "Taguig",
          province: "Metro Manila",
          postalCode: "1634",
          countryCode: "ph",
        },
      })
    } else if (presetType === "analytical_center" || presetType === "research_lab") {
      setFormState({
        archetype: "analytical_center",
        firstName: "Principal",
        lastName: "Analyst",
        email: "standards@sovereign-reference.ph",
        phone: "+63 920 900 4481",
        companyName: "Sovereign Analytical Reference Laboratories",
        prcLicenseNumber: "008-129-650-000",
        facilityRegistrationId: "FAC-SOV-192",
        customerGroupIds: customerGroups.slice(1, 2).map((g) => g.id),
        shippingAddress: {
          address1: "Biochemistry Annex, Science City",
          address2: "West Valley Road",
          city: "Taguig",
          province: "Metro Manila",
          postalCode: "1630",
          countryCode: "ph",
        },
      })
    } else {
      setFormState({
        archetype: "direct_researcher",
        firstName: "Senior",
        lastName: "Researcher",
        email: "research@invitro-studies.ph",
        phone: "+63 918 500 9912",
        companyName: "Self-Directed Biomolecular Research",
        prcLicenseNumber: "004-912-330-000",
        facilityRegistrationId: "FAC-INDIV-419",
        customerGroupIds: [],
        shippingAddress: {
          address1: "Unit 12B, Two Serendra",
          address2: "11th Ave, BGC",
          city: "Taguig",
          province: "Metro Manila",
          postalCode: "1634",
          countryCode: "ph",
        },
      })
    }
    toast.success(`Loaded ${presetType.replace("_", " ")} configuration.`)
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.firstName || !formState.lastName) {
      toast.error("First and Last name are required.")
      return
    }
    if (!formState.email || !formState.email.includes("@")) {
      toast.error("Valid email address is required.")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create customer with metadata
      const payload: any = {
        first_name: formState.firstName,
        last_name: formState.lastName,
        email: formState.email,
        phone: formState.phone,
        company_name: formState.companyName,
        metadata: {
          archetype: formState.archetype,
          prc_license_number: formState.prcLicenseNumber,
          facility_registration_id: formState.facilityRegistrationId,
          default_shipping_address: formState.shippingAddress,
        },
      }

      let targetCustomerId = customerId

      if (isEditMode && customerId) {
        await sdk.admin.customer.update(customerId, payload)
        toast.success("Customer profile updated successfully!")
      } else {
        const res = await sdk.admin.customer.create(payload)
        targetCustomerId = res.customer?.id
        localStorage.removeItem(DRAFT_STORAGE_KEY)
        toast.success("Customer successfully onboarded and verified!")
      }

      // 2. Add to customer groups if selected
      if (targetCustomerId && formState.customerGroupIds.length > 0) {
        for (const groupId of formState.customerGroupIds) {
          try {
            await sdk.admin.customerGroup.batchCustomers(groupId, {
              add: [targetCustomerId],
            })
          } catch (err) {
            console.warn(`Could not add customer to group ${groupId}:`, err)
          }
        }
      }

      navigate("/customers-registry")
    } catch (err: any) {
      console.error("Failed to save customer:", err)
      toast.error(err.message || "Failed to save customer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Studio Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/customers-registry")}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Return to Customers Registry"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Customer Intelligence Studio
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                B2B Buyer Studio
              </span>
              {draftRestored && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  Draft Auto-Restored
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Institutional Researcher Onboarding, B2B Accounts, and Dynamic Tier Allocation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
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
            <span>{isSubmitting ? "Onboarding Buyer..." : "Verify & Create Customer"}</span>
          </button>
        </div>
      </div>

      {/* Main Maximized Canvas Layout */}
      <div className="px-1 sm:px-6 py-4 sm:py-6 flex flex-col gap-6 sm:gap-8 w-full">
        {/* Primary Form Builder */}
        <div className="w-full flex flex-col gap-6">
          {/* Quick Presets Bar */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Quick Archetype Presets:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap shrink-0 max-w-full pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => applyPreset("institutional_lab")}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                + Enterprise BioLab
              </button>
              <button
                type="button"
                onClick={() => applyPreset("analytical_center")}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                + Calibration Center
              </button>
              <button
                type="button"
                onClick={() => applyPreset("direct_researcher")}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                + Independent Researcher
              </button>
            </div>
          </div>

          {/* Card 1: Archetype ChoiceCards */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              1. Customer Archetype &amp; Institutional Standing
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select the professional research domain for reference standard clearance and tier allocation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Institutional Lab */}
              <button
                type="button"
                onClick={() => setFormState({ ...formState, archetype: "institutional_lab" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formState.archetype === "institutional_lab" || formState.archetype === "clinical_physician"
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Institutional Research Facility</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Biotech lab, university research group, or clinical trial laboratory.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 mt-3 block">
                  Analytical Reference Standard Clearance
                </span>
              </button>

              {/* Option 2: Analytical Center */}
              <button
                type="button"
                onClick={() => setFormState({ ...formState, archetype: "analytical_center" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formState.archetype === "analytical_center" || formState.archetype === "research_lab"
                    ? "border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                    <Buildings className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Analytical Testing Center</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Chemical calibration facility, CRO organization, or independent testing lab.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-purple-600 mt-3 block">
                  Bulk Lyophilized Reference Standards
                </span>
              </button>

              {/* Option 3: Direct Researcher */}
              <button
                type="button"
                onClick={() => setFormState({ ...formState, archetype: "direct_researcher" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formState.archetype === "direct_researcher" || formState.archetype === "direct_client"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Individual Analytical Researcher</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Independent laboratory researcher or scientific analyst ordering reference standards.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 mt-3 block">
                  Standard Research Client
                </span>
              </button>
            </div>
          </div>

          {/* Card 2: Personal & Professional Identity */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              2. Professional Identity & Contact Credentials
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter primary account and verified communication channels.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.firstName}
                  onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                  placeholder="e.g. Lead"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.lastName}
                  onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                  placeholder="e.g. Researcher"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institutional Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="e.g. research@institution.ph"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  placeholder="+63 917 000 0000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institution / Laboratory / Facility Name
                </label>
                <input
                  type="text"
                  value={formState.companyName}
                  onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                  placeholder="e.g. Apex BioAnalytics Research Center"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Institutional Tax Identification & Facility Verification */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                3. Institutional Tax Identification &amp; Facility Verification
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Research Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Institutional credentials and research facility registration for B2B analytical reference standard procurement.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  BIR Tax Identification Number (TIN)
                </label>
                <input
                  type="text"
                  value={formState.prcLicenseNumber || ""}
                  onChange={(e) => setFormState({ ...formState, prcLicenseNumber: e.target.value })}
                  placeholder="000-000-000-000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Research Facility / Laboratory ID
                </label>
                <input
                  type="text"
                  value={formState.facilityRegistrationId || ""}
                  onChange={(e) => setFormState({ ...formState, facilityRegistrationId: e.target.value })}
                  placeholder="FAC-2026-XXXX"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div className="col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Verified Research Reference Standard Clearance
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Accredited institutional partner status unlocks specialized analytical reference formulations, priority batch release, and dispatch tracking.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Research Standard Approved
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Wholesale Tiers & Groups */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              4. Institutional Wholesale Tier Allocation
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Attach the buyer to institutional price books and volume discount policies.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {customerGroups.map((group) => {
                const isSelected = formState.customerGroupIds.includes(group.id)
                return (
                  <label
                    key={group.id}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      {group.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormState({
                            ...formState,
                            customerGroupIds: [...formState.customerGroupIds, group.id],
                          })
                        } else {
                          setFormState({
                            ...formState,
                            customerGroupIds: formState.customerGroupIds.filter((id) => id !== group.id),
                          })
                        }
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* Card 5: Default Delivery Destination */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                5. Default Delivery Destination
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Metro Manila Hub &amp; Provincial
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Registered laboratory or institutional facility receiving address for courier parcel delivery.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street Address (Suite / Room / Floor / Building)
                </label>
                <input
                  type="text"
                  value={formState.shippingAddress.address1}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      shippingAddress: { ...formState.shippingAddress, address1: e.target.value },
                    })
                  }
                  placeholder="e.g. Suite 804 Medical Arts Tower"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Address Line 2 (Hospital Complex / Street / Barangay)
                </label>
                <input
                  type="text"
                  value={formState.shippingAddress.address2}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      shippingAddress: { ...formState.shippingAddress, address2: e.target.value },
                    })
                  }
                  placeholder="e.g. 32nd Street, Bonifacio Global City"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={formState.shippingAddress.city}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      shippingAddress: { ...formState.shippingAddress, city: e.target.value },
                    })
                  }
                  placeholder="e.g. Taguig"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Province / State</label>
                <input
                  type="text"
                  value={formState.shippingAddress.province}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      shippingAddress: { ...formState.shippingAddress, province: e.target.value },
                    })
                  }
                  placeholder="e.g. Metro Manila"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Postal Code</label>
                <input
                  type="text"
                  value={formState.shippingAddress.postalCode}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      shippingAddress: { ...formState.shippingAddress, postalCode: e.target.value },
                    })
                  }
                  placeholder="1634"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country Code</label>
                <input
                  type="text"
                  disabled
                  value="Philippines (PH)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Buyer Passport Simulator (Full Width Bottom Dock) */}
        <div className="w-full mt-6">
          <CustomerPassportPreview state={formState} availableGroups={customerGroups} />
        </div>
      </div>
    </div>
  )
}

export default CustomersStudioPage
