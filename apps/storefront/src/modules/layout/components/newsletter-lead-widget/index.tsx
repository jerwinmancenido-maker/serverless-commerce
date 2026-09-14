"use client"

import React, { useState } from "react"
import { subscribeToNewsletter } from "@lib/data/newsletter"
import { CheckCircleSolid, Sparkles } from "@medusajs/icons"

export default function NewsletterLeadWidget() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("loading")
    setMessage("")

    const res = await subscribeToNewsletter(email, "footer_lead_widget")

    if (res.success) {
      setStatus("success")
      setMessage(res.message || "Thank you for subscribing!")
      setDiscountCode(res.discountCode || "RESEARCH10")
    } else {
      setStatus("error")
      setMessage(res.message || "Failed to subscribe. Please try again.")
    }
  }

  const handleCopy = () => {
    if (!discountCode) return
    navigator.clipboard.writeText(discountCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-xl text-slate-200">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Stay Updated</span>
      </div>
      <h4 className="text-sm font-bold text-white mb-1">
        Analytical Research &amp; Dosing Updates
      </h4>
      <p className="text-[11.5px] text-slate-400 leading-relaxed mb-3.5">
        Get our latest peptide guides, storage monographs, and dosage updates delivered directly to your inbox.
      </p>

      {status === "success" ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-2.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <CheckCircleSolid className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Welcome to the Research Briefing!</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">{message}</p>

          {discountCode && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-500/40 bg-slate-950 px-3 py-2">
              <div>
                <span className="text-[10px] text-slate-400 block">Your 10% Welcome Code:</span>
                <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                  {discountCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                {copied ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your laboratory email"
              disabled={status === "loading"}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </div>

          {status === "error" && (
            <p className="text-[11px] text-rose-400 pl-1">{message}</p>
          )}

          <p className="text-[10px] text-slate-500 leading-tight pt-1">
            Zero spam. Strictly peer-reviewed scientific releases and batch updates. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  )
}
