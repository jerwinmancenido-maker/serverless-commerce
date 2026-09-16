/**
 * @file    apps/backend/src/admin/routes/price-lists-studio/page.tsx
 * @module  PriceListsStudioPage
 * @purpose Modern Split-Canvas Studio route for creating and managing price lists with live B2B preview and margin locks.
 * @contracts
 *   Route:   /app/price-lists-studio
 *   API:     POST /admin/price-lists · POST /admin/price-lists/:id
 */

import React, { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Clock,
  Buildings,
  Tag,
  CurrencyDollar,
  XMark,
} from "@medusajs/icons"
import { toast } from "@medusajs/ui"

import { PriceListStudioState, PriceOverrideItem, CustomerGroupOption } from "./types"
import { PriceMatrixTable } from "./components/price-matrix-table"
import { PriceListPreview } from "./components/price-list-preview"
import { sdk } from "../../lib/sdk"

const DRAFT_STORAGE_KEY = "hacien_price_list_studio_draft_v1"

const DEFAULT_ITEMS: PriceOverrideItem[] = []

const DEFAULT_STATE: PriceListStudioState = {
  type: "override",
  title: "",
  description: "",
  status: "active",
  customerGroupIds: [],
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: "",
  hasEndDate: false,
  prices: [],
}

export const PriceListsStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const priceListId = searchParams.get("id") || undefined
  const isEditMode = Boolean(priceListId)

  const [formState, setFormState] = useState<PriceListStudioState>(DEFAULT_STATE)
  const [customerGroups, setCustomerGroups] = useState<CustomerGroupOption[]>([])
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // 1. Fetch available Customer Groups and Products
  useEffect(() => {
    // Fetch customer groups
    sdk.admin.customerGroup
      .list({ limit: 50 })
      .then((res: any) => {
        if (res.customer_groups) {
          setCustomerGroups(
            res.customer_groups.map((g: any) => ({
              id: g.id,
              name: g.name,
              customersCount: g.customers?.length || 0,
            }))
          )
        }
      })
      .catch(() => {
        setCustomerGroups([])
      })

    // Fetch catalog products
    sdk.admin.product
      .list({ limit: 50, fields: "id,title,variants.id,variants.title,variants.sku,variants.prices" })
      .then((res: any) => {
        if (res.products) {
          setAvailableProducts(res.products)
        }
      })
      .catch(() => {
        setAvailableProducts([])
      })
  }, [])

  // 2. Draft Storage & Live Price List Retrieval
  useEffect(() => {
    if (isEditMode && priceListId) {
      sdk.admin.priceList
        .retrieve(priceListId, { fields: "*prices,*prices.variant,*rules" })
        .then((res: any) => {
          const pl = res.price_list
          if (pl) {
            const customerGroupRules =
              pl.rules?.find((r: any) => r.attribute === "customer_group_id")?.value || []
            const mappedPrices: PriceOverrideItem[] = (pl.prices || []).map((pr: any) => ({
              productId: pr.variant?.product_id || pr.variant?.product?.id || "",
              productTitle: pr.variant?.product?.title || "Product",
              variantId: pr.variant_id,
              variantTitle: pr.variant?.title || "Variant",
              sku: pr.variant?.sku || "",
              defaultPrice: pr.amount || 0,
              customPrice: pr.amount || 0,
              estimatedCost: Math.round((pr.amount || 0) * 0.4),
            }))
            setFormState({
              type: pl.type || "override",
              title: pl.title || "",
              description: pl.description || "",
              status: pl.status || "active",
              customerGroupIds: Array.isArray(customerGroupRules)
                ? customerGroupRules
                : [customerGroupRules].filter(Boolean),
              startsAt: pl.starts_at ? pl.starts_at.slice(0, 10) : "",
              endsAt: pl.ends_at ? pl.ends_at.slice(0, 10) : "",
              hasEndDate: Boolean(pl.ends_at),
              prices: mappedPrices,
            })
          }
        })
        .catch((err: any) => {
          console.error("Failed to load price list:", err)
          toast.error("Failed to load price list.")
        })
    } else {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && parsed.title) {
            setFormState(parsed)
            setDraftRestored(true)
          }
        }
      } catch (e) {
        console.error("Draft load error:", e)
      }
    }
  }, [isEditMode, priceListId])

  useEffect(() => {
    if (!isEditMode && formState) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formState))
          setLastSaved(new Date())
        } catch (e) {
          console.error("Draft autosave error:", e)
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [formState, isEditMode])

  // Handlers for price matrix
  const handleUpdatePrice = useCallback((variantId: string, customPrice: number) => {
    setFormState((prev) => ({
      ...prev,
      prices: prev.prices.map((p) => (p.variantId === variantId ? { ...p, customPrice } : p)),
    }))
  }, [])

  const handleUpdateDiscount = useCallback((variantId: string, percentage: number) => {
    const factor = Math.max(0, (100 - percentage) / 100)
    setFormState((prev) => ({
      ...prev,
      prices: prev.prices.map((p) =>
        p.variantId === variantId
          ? { ...p, customPrice: Math.round(p.defaultPrice * factor) }
          : p
      ),
    }))
  }, [])

  const handleSwitchVariant = useCallback((oldVariantId: string, newVariantId: string) => {
    setFormState((prev) => {
      const oldItem = prev.prices.find((p) => p.variantId === oldVariantId)
      if (!oldItem) return prev
      if (prev.prices.some((p) => p.variantId === newVariantId)) {
        toast.info("Variant is already in the price matrix.")
        return prev
      }
      const product = availableProducts.find((prod) => prod.id === oldItem.productId)
      const variant = product?.variants?.find((v: any) => v.id === newVariantId)
      if (!variant) return prev

      const basePhpPrice =
        variant.prices?.find((pr: any) => pr.currency_code?.toLowerCase() === "php")?.amount || 4000
      const estimatedCost = Math.round(basePhpPrice * 0.4)

      return {
        ...prev,
        prices: prev.prices.map((p) =>
          p.variantId === oldVariantId
            ? {
                ...p,
                variantId: variant.id,
                variantTitle: variant.title || "Default Variant",
                sku: variant.sku || `SKU-${variant.id.slice(-6)}`,
                defaultPrice: basePhpPrice,
                customPrice: Math.round(basePhpPrice * 0.8),
                estimatedCost,
              }
            : p
        ),
      }
    })
  }, [availableProducts])

  const handleRemoveItem = useCallback((variantId: string) => {
    setFormState((prev) => ({
      ...prev,
      prices: prev.prices.filter((p) => p.variantId !== variantId),
    }))
  }, [])

  const handleBulkDiscount = useCallback((percentage: number) => {
    const factor = (100 - percentage) / 100
    setFormState((prev) => ({
      ...prev,
      prices: prev.prices.map((p) => ({
        ...p,
        customPrice: Math.round(p.defaultPrice * factor),
      })),
    }))
    toast.success(`Applied -${percentage}% to all selected variants.`)
  }, [])

  const handleResetAll = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      prices: prev.prices.map((p) => ({
        ...p,
        customPrice: p.defaultPrice,
      })),
    }))
    toast.info("Reset all prices to standard retail.")
  }, [])

  const handleToggleCustomerGroup = useCallback((groupId: string) => {
    setFormState((prev) => {
      const exists = prev.customerGroupIds.includes(groupId)
      return {
        ...prev,
        customerGroupIds: exists
          ? prev.customerGroupIds.filter((id) => id !== groupId)
          : [...prev.customerGroupIds, groupId],
      }
    })
  }, [])

  // Add Product from Catalog
  const handleAddProductVariant = (product: any, variant: any) => {
    const exists = formState.prices.some((p) => p.variantId === variant.id)
    if (exists) {
      toast.info("Variant already added to price matrix.")
      return
    }

    const basePhpPrice =
      variant.prices?.find((pr: any) => pr.currency_code?.toLowerCase() === "php")?.amount || 4000
    const estimatedCost = Math.round(basePhpPrice * 0.4) // 40% COGS estimate

    const newItem: PriceOverrideItem = {
      productId: product.id,
      productTitle: product.title,
      variantId: variant.id,
      variantTitle: variant.title || "Default Variant",
      sku: variant.sku || `SKU-${variant.id.slice(-6)}`,
      defaultPrice: basePhpPrice,
      customPrice: Math.round(basePhpPrice * 0.8), // default 20% discount
      estimatedCost,
    }

    setFormState((prev) => ({
      ...prev,
      prices: [...prev.prices, newItem],
    }))
    toast.success(`Added ${product.title} (${newItem.variantTitle}) to price list.`)
  }

  // Submit to Medusa
  const handleSubmit = async (publish: boolean) => {
    if (!formState.title.trim()) {
      toast.error("Please provide a title for the price list.")
      return
    }

    if (formState.prices.length === 0) {
      toast.error("Please add at least one product price to this price list.")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        title: formState.title,
        description: formState.description,
        type: formState.type,
        status: publish ? "active" : "draft",
        starts_at: formState.startsAt ? new Date(formState.startsAt).toISOString() : undefined,
        ends_at:
          formState.hasEndDate && formState.endsAt ? new Date(formState.endsAt).toISOString() : undefined,
        prices: formState.prices.map((p) => ({
          currency_code: "php",
          amount: p.customPrice,
          variant_id: p.variantId,
        })),
      }

      if (formState.customerGroupIds.length > 0) {
        payload.rules = {
          customer_group_id: formState.customerGroupIds,
        }
      }

      if (isEditMode && priceListId) {
        await sdk.admin.priceList.update(priceListId, payload)
        toast.success("Price list updated successfully!")
      } else {
        await sdk.admin.priceList.create(payload)
        toast.success("Price list published successfully!")
        localStorage.removeItem(DRAFT_STORAGE_KEY)
      }

      navigate("/price-lists")
    } catch (err: any) {
      console.error("Failed to save price list:", err)
      // Even if API rejects due to local offline / mock context, provide graceful UX
      toast.error(err?.message || "Failed to submit price list. Check server logs.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      {/* ── STICKY TOP STUDIO BAR ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-3.5 sm:px-6 py-3">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/price-lists")}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              title="Back to Price Lists"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Commercial Pricing Engine
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {isEditMode ? "Edit Studio" : "Studio Canvas"}
                </span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{formState.title || "Untitled Price List"}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Draft status indicator */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lastSaved ? `Autosaved ${lastSaved.toLocaleTimeString()}` : "Ready to save"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/price-lists")}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>{isSubmitting ? "Publishing..." : "Publish Price List"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Restored Draft Alert Banner */}
      {draftRestored && (
        <div className="bg-blue-50 border-b border-blue-200 px-3.5 sm:px-6 py-2 text-xs text-blue-900 flex items-center justify-between">
          <div className="w-full flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Restored unpublished draft from your local session.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(DRAFT_STORAGE_KEY)
                setFormState(DEFAULT_STATE)
                setDraftRestored(false)
                toast.info("Draft cleared.")
              }}
              className="text-blue-700 hover:text-blue-900 underline font-semibold text-[11px]"
            >
              Clear Draft
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN MAXIMIZED WORKSPACE ── */}
      <main className="w-full px-3.5 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
        {/* ── PRIMARY CANVAS: Configuration & Price Matrix ── */}
        <section className="w-full space-y-6">
          {/* Card 1: Pricing Model Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Choose Pricing Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* B2B Wholesale Tier Card */}
              <button
                type="button"
                onClick={() => setFormState((prev) => ({ ...prev, type: "override" }))}
                className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  formState.type === "override"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Buildings className="w-4 h-4 text-blue-600" />
                    <span>B2B Wholesale Tier Override</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formState.type === "override"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {formState.type === "override" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Permanent wholesale rates exclusive to targeted customer groups (e.g. Clinics, Physicians).
                </p>
              </button>

              {/* Promotional Sale Markdown Card */}
              <button
                type="button"
                onClick={() => setFormState((prev) => ({ ...prev, type: "sale" }))}
                className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                  formState.type === "sale"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>Sale Markdown Campaign</span>
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formState.type === "sale"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {formState.type === "sale" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Time-bounded campaign discount visible across the storefront with scheduled start and end dates.
                </p>
              </button>
            </div>
          </div>

          {/* Card 2: Details & Context */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Price List Identity & Targeting
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price List Title</label>
              <input
                type="text"
                placeholder="e.g. VIP Partner Clinic Wholesale Tier"
                value={formState.title}
                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Internal notes regarding eligibility and commercial terms..."
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Customer Groups Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Customer Groups (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2">
                {customerGroups.map((group) => {
                  const selected = formState.customerGroupIds.includes(group.id)
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleToggleCustomerGroup(group.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <Buildings className="w-3.5 h-3.5" />
                      <span>{group.name}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                {formState.customerGroupIds.length === 0
                  ? "Applies to all customers if no specific customer group is chosen."
                  : `Restricted to ${formState.customerGroupIds.length} customer group(s).`}
              </p>
            </div>

            {/* Validity Dates */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Starts At</label>
                <input
                  type="date"
                  value={formState.startsAt}
                  onChange={(e) => setFormState((prev) => ({ ...prev, startsAt: e.target.value }))}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Ends At</label>
                  <label className="text-[11px] text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.hasEndDate}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, hasEndDate: e.target.checked }))
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Set Expiration</span>
                  </label>
                </div>
                <input
                  type="date"
                  disabled={!formState.hasEndDate}
                  value={formState.endsAt}
                  onChange={(e) => setFormState((prev) => ({ ...prev, endsAt: e.target.value }))}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Price Matrix Table */}
          <PriceMatrixTable
            prices={formState.prices}
            onUpdatePrice={handleUpdatePrice}
            onUpdateDiscount={handleUpdateDiscount}
            onSwitchVariant={handleSwitchVariant}
            availableProducts={availableProducts}
            onRemoveItem={handleRemoveItem}
            onBulkDiscount={handleBulkDiscount}
            onResetAll={handleResetAll}
            onOpenProductPicker={() => setShowProductPicker(true)}
          />
        </section>

        {/* ── HORIZONTAL DOCK: Live Simulator & Margin Gauge ── */}
        <section className="w-full mt-6" aria-label="Price List Preview & Margin Intelligence">
          <PriceListPreview state={formState} availableCustomerGroups={customerGroups} />
        </section>
      </main>

      {/* ── PRODUCT PICKER SLIDE-OVER MODAL ── */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90dvh] sm:max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Select Products from Catalog</h3>
                <p className="text-xs text-slate-500">Choose compounds and variants to add to this price list.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XMark className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
              {availableProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <p>Loading catalog items...</p>
                </div>
              ) : (
                availableProducts.map((product) => (
                  <div key={product.id} className="py-3">
                    <div className="font-bold text-xs text-slate-800 mb-1.5">{product.title}</div>
                    <div className="space-y-1 pl-3">
                      {product.variants?.map((v: any) => {
                        const isAdded = formState.prices.some((p) => p.variantId === v.id)
                        return (
                          <div
                            key={v.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-700">{v.title}</span>
                              {v.sku && <span className="text-[11px] text-slate-400 ml-2">SKU: {v.sku}</span>}
                            </div>
                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleAddProductVariant(product, v)}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                                isAdded
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {isAdded ? "Added" : "+ Add to Matrix"}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProductPicker(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
              >
                Done Selecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PriceListsStudioPage
