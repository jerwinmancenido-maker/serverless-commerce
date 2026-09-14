"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

const STORAGE_KEY = "rc_first_visit_compliance_accepted_v1"

export default function FirstVisitDisclaimerModal() {
  const [hasMounted, setHasMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDeclined, setIsDeclined] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      if (!accepted) {
        setIsOpen(true)
      }
    } catch {
      // If localStorage is unavailable, default to open
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!hasMounted) return

    if (isOpen || isDeclined) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [hasMounted, isOpen, isDeclined])

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // Ignore write errors
    }
    setIsOpen(false)
    setIsDeclined(false)
  }

  const handleDecline = () => {
    setIsOpen(false)
    setIsDeclined(true)
  }

  const handleReconsider = () => {
    setIsDeclined(false)
    setIsOpen(true)
  }

  const handleExitSite = () => {
    window.location.href = "https://www.google.com"
  }

  if (!hasMounted || (!isOpen && !isDeclined)) {
    return null
  }

  // Declined Screen View
  if (isDeclined) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
        data-testid="disclaimer-declined-screen"
      >
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 border border-rose-200 mb-2">
            Access Restricted
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            Laboratory Clearance Required
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Access to chemical analytical monographs, peptide protocols, and research formulations is restricted to authorized researchers who accept our Research Use Only (RUO) terms, Terms &amp; Conditions, and Privacy Policy.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleReconsider}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-[0.99]"
              data-testid="reconsider-terms-btn"
            >
              Review &amp; Accept Terms
            </button>
            <button
              onClick={handleExitSite}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-all"
              data-testid="exit-site-btn"
            >
              Exit Site
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active Acceptance Modal View
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
      data-testid="first-visit-disclaimer-modal"
    >
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Clinical Header Bar */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
              Laboratory Entry Verification
            </span>
          </div>
          <span className="text-[10px] font-mono font-medium text-slate-400">
            RUO Protocol v2.4
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[calc(90vh-140px)] overflow-y-auto space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Research Use &amp; Compliance Agreement
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Please review and confirm our research authorization and laboratory terms before accessing this catalog.
            </p>
          </div>

          {/* Core RUO Warning Box */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 sm:p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <svg
                className="size-4 text-amber-700 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Strictly For In Vitro Laboratory Research Only</span>
            </div>
            <p className="leading-relaxed text-[11px] sm:text-xs text-amber-900/90">
              All lyophilized peptide compounds, analytical reagents, and supplies cataloged on this platform are manufactured and distributed solely for <strong>in vitro laboratory experimentation, stoichiometric assays, and receptor affinity studies</strong>.
            </p>
            <p className="leading-relaxed text-[11px] sm:text-xs text-amber-900/90 font-medium">
              Products are <u>NOT</u> approved for human or veterinary administration, medical treatment, diagnostic procedures, or clinical consumption.
            </p>
          </div>

          {/* Acknowledgments Checklist */}
          <div className="space-y-2.5 pt-1 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <div className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="leading-snug text-[11px] sm:text-xs">
                I affirm that I am at least 18 years old and acquiring supplies for laboratory or analytical research purposes.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="size-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="leading-snug text-[11px] sm:text-xs">
                I have read and agree to the{" "}
                <Link
                  href="/legal/terms"
                  target="_blank"
                  className="font-semibold text-slate-900 underline hover:text-black"
                >
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/legal/privacy"
                  target="_blank"
                  className="font-semibold text-slate-900 underline hover:text-black"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all text-center"
            data-testid="decline-disclaimer-btn"
          >
            I Do Not Accept (Decline)
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5"
            data-testid="accept-disclaimer-btn"
          >
            <span>I Accept &amp; Enter</span>
            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Bottom micro-footer */}
        <div className="bg-slate-100/70 py-2 text-center text-[10px] text-slate-600 border-t border-slate-200/60 font-medium">
          256-Bit SSL Encryption • RUO Laboratory Protocols • Confidential Client Privacy
        </div>
      </div>
    </div>
  )
}
