import { Badge, Button, Input } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { sdk } from "../lib/sdk"
import type { ParsedCard } from "./admin-chat-card"

type ChatEntityPickerModalProps = {
  isOpen: boolean
  initialTab?: "product" | "protocol" | "promo"
  onClose: () => void
  onSelect: (card: ParsedCard) => void
}

type ProductResponse = {
  products: Array<{
    id: string
    title: string
    handle: string
    thumbnail?: string | null
    variants?: Array<{
      id: string
      title: string
      prices?: Array<{
        amount: number
        currency_code: string
      }>
    }>
  }>
}

type ProtocolResponse = {
  protocols: Array<{
    id: string
    handle: string
    revisions?: Array<{
      id: string
      title: string
      duration?: string
      status?: string
      target_goal?: string
    }>
  }>
}

type PromotionResponse = {
  promotions: Array<{
    id: string
    code: string
    type?: string
    application_method?: {
      value?: number
      type?: string
    }
  }>
}

export function ChatEntityPickerModal({
  isOpen,
  initialTab = "product",
  onClose,
  onSelect,
}: ChatEntityPickerModalProps) {
  const [tab, setTab] = useState<"product" | "protocol" | "promo">(initialTab)
  const [search, setSearch] = useState("")

  // Custom promo fields
  const [customCode, setCustomCode] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [customDesc, setCustomDesc] = useState("")

  // 1. Fetch live products
  const productsQuery = useQuery({
    queryKey: ["admin-products-picker"],
    queryFn: () =>
      sdk.client.fetch<ProductResponse>("/admin/products", {
        query: {
          limit: 50,
          fields: "id,title,handle,thumbnail,+variants.id,+variants.title,+variants.prices.amount,+variants.prices.currency_code",
        },
      }),
    enabled: isOpen && tab === "product",
  })

  // 2. Fetch live research protocols
  const protocolsQuery = useQuery({
    queryKey: ["admin-protocols-picker"],
    queryFn: () =>
      sdk.client.fetch<ProtocolResponse>("/admin/research-protocols", {
        query: {
          limit: 50,
        },
      }),
    enabled: isOpen && tab === "protocol",
  })

  // 3. Fetch live promotions
  const promotionsQuery = useQuery({
    queryKey: ["admin-promotions-picker"],
    queryFn: () =>
      sdk.client.fetch<PromotionResponse>("/admin/promotions", {
        query: {
          limit: 50,
        },
      }),
    enabled: isOpen && tab === "promo",
  })

  if (!isOpen) return null

  // Filter products by search
  const filteredProducts = (productsQuery.data?.products || []).filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.handle.toLowerCase().includes(search.toLowerCase()) : true,
  )

  // Filter protocols by search
  const filteredProtocols = (protocolsQuery.data?.protocols || []).filter((p) => {
    const title = p.revisions?.[0]?.title || p.handle
    return search ? title.toLowerCase().includes(search.toLowerCase()) || p.handle.toLowerCase().includes(search.toLowerCase()) : true
  })

  // Filter promotions by search
  const filteredPromotions = (promotionsQuery.data?.promotions || []).filter((p) =>
    search ? p.code.toLowerCase().includes(search.toLowerCase()) : true,
  )

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Attach Catalog Entity to Chat</h3>
            <p className="text-xs text-zinc-500">Select an item from your live database to recommend to customer</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            ✕
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/70 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setTab("product")
              setSearch("")
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "product"
                ? "border-emerald-600 text-emerald-950 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            🧪 Products ({productsQuery.data?.products?.length ?? "…"})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("protocol")
              setSearch("")
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "protocol"
                ? "border-indigo-600 text-indigo-950 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            🔬 Research Protocols ({protocolsQuery.data?.protocols?.length ?? "…"})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("promo")
              setSearch("")
            }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "promo"
                ? "border-amber-600 text-amber-950 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            🎁 Promotions & Codes
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-zinc-100 bg-white">
          <Input
            size="small"
            placeholder={
              tab === "product"
                ? "Search products by name or handle…"
                : tab === "protocol"
                ? "Search research protocols…"
                : "Search active promotion codes…"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* PRODUCT TAB */}
          {tab === "product" && (
            <>
              {productsQuery.isLoading && (
                <div className="py-8 text-center text-xs text-zinc-400">Loading catalog products…</div>
              )}
              {!productsQuery.isLoading && filteredProducts.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-400">No products found matching &ldquo;{search}&rdquo;</div>
              )}
              {filteredProducts.map((p) => {
                const defaultVariant = p.variants?.[0]
                const rawPrice = defaultVariant?.prices?.[0]?.amount ?? 0
                const priceFormatted = `₱${rawPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all shadow-2xs cursor-pointer group"
                    onClick={() => {
                      if (!defaultVariant) return
                      onSelect({
                        type: "product",
                        variantId: defaultVariant.id,
                        title: p.title,
                        price: priceFormatted,
                        handle: p.handle,
                        imageUrl: p.thumbnail || undefined,
                      })
                      onClose()
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="h-10 w-10 rounded-lg object-cover border border-zinc-100"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-800 font-bold text-base">
                          🧪
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-zinc-900 group-hover:text-emerald-950">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          Variant: <span className="font-medium text-zinc-700">{defaultVariant?.title || "Standard"}</span> · Handle: {p.handle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-emerald-700">{priceFormatted}</p>
                      <span className="text-[10px] text-zinc-400 group-hover:text-emerald-700 font-semibold">
                        Click to Attach →
                      </span>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* PROTOCOL TAB */}
          {tab === "protocol" && (
            <>
              {protocolsQuery.isLoading && (
                <div className="py-8 text-center text-xs text-zinc-400">Loading research protocols…</div>
              )}
              {!protocolsQuery.isLoading && filteredProtocols.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-400">No research protocols found matching &ldquo;{search}&rdquo;</div>
              )}
              {filteredProtocols.map((p) => {
                const revision = p.revisions?.[0]
                const title = revision?.title || p.handle
                const duration = revision?.duration || revision?.target_goal || "Standard research protocol cycle"

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all shadow-2xs cursor-pointer group"
                    onClick={() => {
                      onSelect({
                        type: "protocol",
                        handle: p.handle,
                        title,
                        duration,
                      })
                      onClose()
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100/70 text-indigo-800 font-bold text-base">
                        🔬
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-zinc-900 group-hover:text-indigo-950">
                          {title}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">{duration}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge color="blue" className="text-[10px]">Verified Protocol</Badge>
                      <p className="text-[10px] text-zinc-400 group-hover:text-indigo-700 font-semibold mt-1">
                        Click to Attach →
                      </p>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {/* PROMO TAB */}
          {tab === "promo" && (
            <div className="space-y-4">
              {/* Existing live promotions */}
              {promotionsQuery.isLoading && (
                <div className="py-4 text-center text-xs text-zinc-400">Loading active promotions…</div>
              )}
              {filteredPromotions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">Active Promotions in Store</p>
                  {filteredPromotions.map((pr) => {
                    const discountValue = pr.application_method?.value
                    const discountType = pr.application_method?.type
                    const label = discountValue
                      ? discountType === "percentage"
                        ? `${discountValue}% OFF`
                        : `₱${discountValue} OFF`
                      : "Discount Voucher"

                    return (
                      <div
                        key={pr.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 hover:border-amber-300 hover:bg-amber-50/40 transition-all shadow-2xs cursor-pointer group"
                        onClick={() => {
                          onSelect({
                            type: "promo",
                            code: pr.code,
                            title: `${pr.code} · ${label}`,
                            description: `Apply coupon ${pr.code} at checkout for ${label}`,
                          })
                          onClose()
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900 font-bold text-base">
                            🎁
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded">
                              {pr.code}
                            </span>
                            <p className="text-xs font-semibold text-zinc-900 mt-1">{label}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-400 group-hover:text-amber-800 font-semibold">
                          Click to Attach →
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Custom Promo Code Generator */}
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-3">
                <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                  Create Custom Promo Voucher Card
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-0.5">Coupon Code</label>
                    <Input
                      size="small"
                      placeholder="e.g. WELCOME200, VIP10, RECOVERY15"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-0.5">Title</label>
                    <Input
                      size="small"
                      placeholder="e.g. ₱200 OFF First Order"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-0.5">Description</label>
                    <Input
                      size="small"
                      placeholder="e.g. Get ₱200 discount applied directly at checkout"
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <Button
                  size="small"
                  variant="primary"
                  disabled={!customCode.trim()}
                  onClick={() => {
                    onSelect({
                      type: "promo",
                      code: customCode.trim(),
                      title: customTitle.trim() || `${customCode.trim()} Discount Voucher`,
                      description: customDesc.trim() || `Use code ${customCode.trim()} at checkout`,
                    })
                    onClose()
                  }}
                  className="w-full text-xs font-semibold"
                >
                  Attach Custom Voucher Card
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-100 bg-zinc-50 px-5 py-3 flex justify-end">
          <Button size="small" variant="secondary" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </footer>
      </div>
    </div>
  )
}
