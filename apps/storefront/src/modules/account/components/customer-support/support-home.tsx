"use client"

import {
  createSupportConversationAction,
  type SupportActionState,
  type SupportConversation,
} from "@lib/data/customer-support"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

const initial: SupportActionState = { success: false, error: null }

export default function SupportHome({
  countryCode,
  conversations,
  orderId = "",
  protocolSeriesId = "",
}: {
  countryCode: string
  conversations: SupportConversation[]
  orderId?: string
  protocolSeriesId?: string
}) {
  const [state, action, pending] = useActionState(createSupportConversationAction, initial)

  return (
    <div className="grid gap-8 large:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <h1 className="text-2xl font-semibold">Customer support</h1>
        <p className="mt-2 text-sm text-ui-fg-subtle">
          Private conversations about orders, payments, shipping, products, protocol access, and your account.
        </p>

        <div className="mt-6 space-y-3">
          {conversations.map((item) => (
            <LocalizedClientLink
              key={item.id}
              href={`/account/support/${item.id}`}
              className="block rounded-xl border border-ui-border-base bg-white p-5 hover:bg-ui-bg-subtle transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{item.subject}</h2>
                <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs">
                  {item.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-xs text-ui-fg-subtle">
                {item.category.replaceAll("_", " ")} · Updated {new Date(item.last_activity_at).toLocaleString("en-PH")}
              </p>
            </LocalizedClientLink>
          ))}

          {!conversations.length && (
            <div className="rounded-xl border border-ui-border-base bg-white p-5 text-sm text-ui-fg-subtle">
              You have no support conversations.
            </div>
          )}
        </div>
      </div>

      <form
        action={action}
        className="space-y-3 rounded-xl border border-ui-border-base bg-white p-5 large:sticky large:top-24 large:self-start shadow-sm"
      >
        <h2 className="font-semibold">Contact support</h2>
        <p className="text-xs text-ui-fg-subtle">
          Only you and authorized support staff can read this conversation. Research Hub records are not attached automatically.
        </p>

        <input type="hidden" name="country_code" value={countryCode} />
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="protocol_series_id" value={protocolSeriesId} />

        <label className="block text-sm font-medium">
          Category
          <select
            name="category"
            defaultValue={protocolSeriesId ? "protocol_access" : orderId ? "order" : "other"}
            className="mt-1 w-full rounded-lg border border-ui-border-base bg-white px-3 py-2 text-sm"
          >
            <option value="order">Order</option>
            <option value="payment">Payment</option>
            <option value="shipping">Shipping</option>
            <option value="product">Product</option>
            <option value="protocol_access">Protocol access</option>
            <option value="account">Account</option>
            <option value="rewards">Rewards</option>
            <option value="technical">Technical issue</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          Subject
          <input
            name="subject"
            minLength={5}
            maxLength={180}
            required
            className="mt-1 w-full rounded-lg border border-ui-border-base px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm font-medium">
          Message
          <textarea
            name="body"
            minLength={3}
            maxLength={10_000}
            rows={5}
            required
            className="mt-1 w-full rounded-lg border border-ui-border-base p-3 text-sm"
          />
        </label>

        <button
          disabled={pending}
          className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-black transition-all"
        >
          {pending ? "Sending…" : "Start conversation"}
        </button>

        {state.error ? (
          <p className="text-xs text-red-600">{state.error}</p>
        ) : state.success ? (
          <p className="text-xs text-emerald-700">Conversation created.</p>
        ) : null}
      </form>
    </div>
  )
}
