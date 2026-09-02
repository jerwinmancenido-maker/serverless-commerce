"use client"

import { useState, useEffect, useTransition } from "react"
import {
  listCustomerOrdersForChat,
  listStoreProductsForChat,
  listStoreProtocolsForChat,
} from "@lib/data/customer-support"
import type { ParsedCard } from "./chat-card"

type CustomerOrder = {
  id: string
  display_id: string | number
  created_at: string
  status: string
  total: string
  items_summary: string
}

type StoreProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  variant_id: string
  price: string
}

type StoreProtocol = {
  handle: string
  title: string
  summary: string
  duration: string
}

export default function CustomerEntityPickerModal({
  isOpen,
  initialTab = "order",
  onClose,
  onSelect,
}: {
  isOpen: boolean
  initialTab?: "order" | "product" | "protocol"
  onClose: () => void
  onSelect: (card: ParsedCard) => void
}) {
  const [tab, setTab] = useState<"order" | "product" | "protocol">(initialTab)
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [protocols, setProtocols] = useState<StoreProtocol[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
      setSearch("")
      setIsLoading(true)
      startTransition(async () => {
        try {
          const [loadedOrders, loadedProducts, loadedProtocols] = await Promise.all([
            listCustomerOrdersForChat(),
            listStoreProductsForChat(),
            listStoreProtocolsForChat(),
          ])
          setOrders(loadedOrders)
          setProducts(loadedProducts)
          setProtocols(loadedProtocols)
        } catch {
          // Handled gracefully
        } finally {
          setIsLoading(false)
        }
      })
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  const filteredOrders = orders.filter((o) =>
    String(o.display_id).toLowerCase().includes(search.toLowerCase()) ||
    o.items_summary.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.handle.toLowerCase().includes(search.toLowerCase())
  )

  const filteredProtocols = protocols.filter((proto) =>
    proto.title.toLowerCase().includes(search.toLowerCase()) ||
    proto.summary.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 bg-zinc-50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Attach to Message</h3>
            <p className="text-[11px] text-zinc-500">Ask support directly about an order, compound, or protocol</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-white p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setTab("order")
              setSearch("")
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === "order"
                ? "bg-blue-50 text-blue-950 border border-blue-200 shadow-2xs"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            📦 My Orders
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("product")
              setSearch("")
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === "product"
                ? "bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-2xs"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            🧪 Compounds
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("protocol")
              setSearch("")
            }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === "protocol"
                ? "bg-indigo-50 text-indigo-950 border border-indigo-200 shadow-2xs"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            🔬 Protocols
          </button>
        </div>

        {/* Search Input */}
        <div className="p-2.5 border-b border-zinc-100 bg-white">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "order"
                ? "Filter by Order # or item name…"
                : tab === "product"
                ? "Search compound name (e.g. BPC-157, Semaglutide)…"
                : "Search protocol guide (e.g. Wolverine, Tissue Repair)…"
            }
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
            autoFocus
          />
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-72">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-400">Loading items…</div>
          ) : tab === "order" ? (
            filteredOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                <span className="text-2xl block mb-1">📦</span>
                <p className="font-semibold text-zinc-700">No previous orders found</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Sign in with your account to view past orders, or type your Order Number in the message.
                </p>
              </div>
            ) : (
              filteredOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onSelect({
                      type: "order",
                      displayId: o.display_id,
                      total: o.total,
                      status: o.status,
                      orderId: o.id,
                    })
                    onClose()
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-2xs group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-900 group-hover:text-blue-950">
                        Order #{o.display_id}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 capitalize">
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{o.items_summary}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {new Date(o.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="ml-3 text-right">
                    <span className="font-bold text-xs text-blue-900">{o.total}</span>
                    <span className="block text-[10px] text-blue-700 font-semibold mt-1">Select →</span>
                  </div>
                </button>
              ))
            )
          ) : tab === "product" ? (
            filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">No compounds matching &ldquo;{search}&rdquo;</div>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect({
                      type: "product",
                      variantId: p.variant_id,
                      title: p.title,
                      price: p.price,
                      handle: p.handle,
                      imageUrl: p.thumbnail || undefined,
                    })
                    onClose()
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-2.5 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base border border-emerald-100">
                      🧪
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-zinc-900 group-hover:text-emerald-950">{p.title}</p>
                      <p className="text-[11px] font-extrabold text-emerald-700">{p.price}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 ml-2">Attach →</span>
                </button>
              ))
            )
          ) : (
            filteredProtocols.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">No protocols matching &ldquo;{search}&rdquo;</div>
            ) : (
              filteredProtocols.map((proto) => (
                <button
                  key={proto.handle}
                  type="button"
                  onClick={() => {
                    onSelect({
                      type: "protocol",
                      handle: proto.handle,
                      title: proto.title,
                      duration: proto.duration,
                    })
                    onClose()
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-2.5 text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-base border border-indigo-100">
                      🔬
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-zinc-900 group-hover:text-indigo-950">{proto.title}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{proto.duration}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 ml-2">Attach →</span>
                </button>
              ))
            )
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-2 text-[10px] text-zinc-500 flex items-center justify-between">
          <span>Click any item to attach as a card to your message</span>
          <button type="button" onClick={onClose} className="font-semibold text-zinc-700 hover:underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
