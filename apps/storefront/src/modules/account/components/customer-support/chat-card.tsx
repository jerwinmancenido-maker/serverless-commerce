"use client"

import { addToCart, applyPromotions } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState, useTransition } from "react"

export type ParsedCard =
  | {
      type: "order"
      displayId: string | number
      total: string
      status: string
      orderId: string
    }
  | {
      type: "product"
      variantId: string
      title: string
      price: string
      handle: string
      imageUrl?: string
    }
  | {
      type: "protocol"
      handle: string
      title: string
      duration: string
    }
  | {
      type: "promo"
      code: string
      title: string
      description: string
    }

export function parseMessageCards(body: string): {
  cleanText: string
  cards: ParsedCard[]
} {
  const cards: ParsedCard[] = []
  let cleanText = body

  // Match [card:order:displayId:total:status:orderId]
  const orderRegex = /\[card:order:([^:]+):([^:]+):([^:]+):([^\]]+)\]/g
  let match: RegExpExecArray | null
  while ((match = orderRegex.exec(body)) !== null) {
    cards.push({
      type: "order",
      displayId: match[1],
      total: match[2],
      status: match[3],
      orderId: match[4],
    })
  }
  cleanText = cleanText.replace(orderRegex, "").trim()

  // Match [card:product:variantId:title:price:handle:imageUrl?]
  const productRegex = /\[card:product:([^:]+):([^:]+):([^:]+):([^:]+)(?::([^\]]*))?\]/g
  while ((match = productRegex.exec(body)) !== null) {
    cards.push({
      type: "product",
      variantId: match[1],
      title: match[2],
      price: match[3],
      handle: match[4],
      imageUrl: match[5] || undefined,
    })
  }
  cleanText = cleanText.replace(productRegex, "").trim()

  // Match [card:protocol:handle:title:duration]
  const protocolRegex = /\[card:protocol:([^:]+):([^:]+):([^\]]+)\]/g
  while ((match = protocolRegex.exec(body)) !== null) {
    cards.push({
      type: "protocol",
      handle: match[1],
      title: match[2],
      duration: match[3],
    })
  }
  cleanText = cleanText.replace(protocolRegex, "").trim()

  // Match [card:promo:code:title:description]
  const promoRegex = /\[card:promo:([^:]+):([^:]+):([^\]]+)\]/g
  while ((match = promoRegex.exec(body)) !== null) {
    cards.push({
      type: "promo",
      code: match[1],
      title: match[2],
      description: match[3],
    })
  }
  cleanText = cleanText.replace(promoRegex, "").trim()

  return { cleanText, cards }
}

export function ChatCard({
  card,
  countryCode = "ph",
}: {
  card: ParsedCard
  countryCode?: string
}) {
  const [added, setAdded] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAddToCart = () => {
    if (card.type !== "product") return
    setError(null)
    startTransition(async () => {
      try {
        await addToCart({
          variantId: card.variantId,
          quantity: 1,
          countryCode,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 3000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add to cart")
      }
    })
  }

  const handleApplyPromo = () => {
    if (card.type !== "promo") return
    setError(null)
    startTransition(async () => {
      try {
        await applyPromotions([card.code])
        setApplied(true)
        setTimeout(() => setApplied(false), 4000)
      } catch (err) {
        const rawMsg = err instanceof Error ? err.message : "Could not apply code"
        if (rawMsg.toLowerCase().includes("no existing cart") || rawMsg.toLowerCase().includes("cart not found")) {
          setError("Please add a compound to your cart before applying this voucher.")
        } else {
          setError(rawMsg)
        }
      }
    })
  }

  if (card.type === "order") {
    const isPendingStatus = card.status?.toLowerCase().includes("pending")
    const isCompletedStatus = card.status?.toLowerCase().includes("completed") || card.status?.toLowerCase().includes("delivered")
    return (
      <div className="w-full max-w-[310px] rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] transition-all text-zinc-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200/60 text-base">
              📦
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Order Inquiry
              </span>
              <p className="font-semibold text-xs text-zinc-900 truncate">Order #{card.displayId}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize shrink-0 border ${
              isPendingStatus
                ? "bg-amber-50 text-amber-700 border-amber-200/80"
                : isCompletedStatus
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-sky-50 text-sky-700 border-sky-200/80"
            }`}
          >
            {card.status}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs">
          <span className="text-zinc-500 font-medium">Total Amount</span>
          <span className="font-bold text-zinc-900">{card.total}</span>
        </div>

        <LocalizedClientLink
          href={`/account/orders/details/${card.orderId}`}
          className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl border border-zinc-200/90 bg-zinc-50 hover:bg-zinc-100 py-1.5 text-xs font-semibold text-zinc-800 transition-colors"
        >
          View Order Details ↗
        </LocalizedClientLink>
      </div>
    )
  }

  if (card.type === "product") {
    return (
      <div className="w-full max-w-[310px] rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] transition-all text-zinc-900">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200/60 overflow-hidden text-base">
            {card.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
            ) : (
              "🧪"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Compound
            </span>
            <p className="truncate text-xs font-semibold text-zinc-900">{card.title}</p>
            <p className="text-xs font-bold text-emerald-700">{card.price}</p>
          </div>
        </div>

        {error && <p className="mt-2 text-[10px] text-red-600">{error}</p>}

        <div className="mt-2.5 flex items-center gap-2 border-t border-zinc-100 pt-2.5">
          <LocalizedClientLink
            href={`/products/${card.handle}`}
            className="flex-1 rounded-xl border border-zinc-200/90 bg-zinc-50 hover:bg-zinc-100 py-1.5 text-center text-xs font-semibold text-zinc-700 transition-colors"
          >
            View
          </LocalizedClientLink>
          <button
            type="button"
            disabled={isPending}
            onClick={handleAddToCart}
            className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 py-1.5 text-xs font-semibold text-white shadow-2xs disabled:opacity-50 transition-all active:scale-95"
          >
            {isPending ? "Adding…" : added ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    )
  }

  if (card.type === "protocol") {
    return (
      <div className="w-full max-w-[310px] rounded-2xl border border-zinc-200/90 bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] transition-all text-zinc-900">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-base">
            🔬
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
              Research Protocol
            </span>
            <p className="truncate text-xs font-semibold text-zinc-900">{card.title}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{card.duration}</p>
          </div>
        </div>
        <LocalizedClientLink
          href={`/research-protocols/${card.handle}`}
          className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl border border-zinc-200/90 bg-zinc-50 hover:bg-zinc-100 py-1.5 text-center text-xs font-semibold text-zinc-800 transition-colors"
        >
          View Research Protocol ↗
        </LocalizedClientLink>
      </div>
    )
  }

  if (card.type === "promo") {
    return (
      <div className="w-full max-w-[310px] rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-3.5 shadow-xs text-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            Exclusive Voucher
          </span>
          <span className="font-mono text-xs font-bold text-zinc-900 bg-white border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs">
            {card.code}
          </span>
        </div>
        <p className="mt-1.5 text-xs font-bold text-zinc-900">{card.title}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{card.description}</p>

        {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}

        <button
          type="button"
          disabled={isPending}
          onClick={handleApplyPromo}
          className="mt-2.5 w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 py-1.5 text-xs font-semibold text-white shadow-2xs disabled:opacity-50 transition-all active:scale-95"
        >
          {isPending ? "Applying…" : applied ? "✓ Applied to Cart" : "Apply to Cart"}
        </button>
      </div>
    )
  }

  return null
}
