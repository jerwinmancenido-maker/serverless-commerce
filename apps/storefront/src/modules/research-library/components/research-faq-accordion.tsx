"use client"

import React, { useMemo, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  ChevronDownMini,
  MagnifyingGlass,
  InformationCircle,
  ChatBubbleLeftRight,
  Beaker,
  Sparkles,
  ArrowRightMini,
} from "@medusajs/icons"

interface FaqItem {
  q: string
  a: string
  category: string
}

const EXTENDED_FAQS: FaqItem[] = [
  // Reconstitution & Mixing
  {
    category: "Reconstitution & Chemistry",
    q: "Why can't I shake or vortex a peptide vial after adding Bacteriostatic Water?",
    a: "Peptides are fragile linear chains of amino acids held in tertiary three-dimensional conformations by delicate hydrogen bonds and hydrophobic interactions. Shaking, vortexing, or dropping the vial creates violent hydrodynamic shear stress and foaming at the liquid-air interface. This causes irreversible foaming denaturation, breaking tertiary bonds and rendering the compound biologically inactive. Always dissolve by gentle circular rolling between your palms.",
  },
  {
    category: "Reconstitution & Chemistry",
    q: "What is the difference between Bacteriostatic Water USP and Sterile Water for Injection?",
    a: "Bacteriostatic Water USP contains 0.9% (9 mg/mL) Benzyl Alcohol, an antimicrobial preservative that prevents bacterial and fungal replication. This allows the reconstituted vial to be safely drawn from multiple times over a 21–28 day refrigerated window. Sterile Water for Injection contains zero preservatives; once opened, bacterial colonization begins within 24 hours. Sterile water must be discarded within 24 hours of puncture.",
  },
  {
    category: "Reconstitution & Chemistry",
    q: "What does it mean if my peptide solution remains cloudy or milky after gentle rolling?",
    a: "Cloudiness indicates that the peptide has not dissolved into a true monomeric solution and is forming microscopic aggregates or precipitating out. This usually occurs when a hydrophobic or basic peptide is reconstituted in neutral pH water instead of a mildly acidic solvent (e.g. 0.6% Acetic Acid). Review our Solvent Chemistry Guide. Never inject cloudy solutions into analytical assays.",
  },
  {
    category: "Reconstitution & Chemistry",
    q: "How do I calculate the concentration (mg/mL) of my reconstituted peptide?",
    a: "Concentration is governed by the stoichiometry formula: Concentration (mg/mL) = Lyophilized Mass (mg) / Diluent Volume (mL). For example, adding 2.0 mL of Bacteriostatic Water to a 10 mg vial yields exactly 5.0 mg/mL (or 5,000 mcg/mL). On a standard U-100 syringe (where 1 unit = 0.01 mL), each unit will deliver exactly 50 mcg.",
  },

  // Storage & Stability
  {
    category: "Storage & Stability",
    q: "Can I freeze my peptide after it has been reconstituted with water?",
    a: "NO. Absolutely never freeze reconstituted peptides. When water freezes into ice, it expands into a hexagonal crystal lattice that exerts intense mechanical shear force onto the peptide molecules, fracturing tertiary folding and causing permanent denaturation upon thawing. Store reconstituted vials strictly in the refrigerator at 2°C–8°C (36°F–46°F). Only unmixed, dry lyophilized powder may be frozen at -20°C to -80°C.",
  },
  {
    category: "Storage & Stability",
    q: "How long does a lyophilized peptide powder remain viable before reconstitution?",
    a: "Under sub-zero freezer storage (-20°C to -80°C) with desiccants, dry lyophilized cakes maintain 99%+ molecular integrity for 24 to 36 months. In a standard laboratory refrigerator (2°C–8°C), dry vials remain stable for 12 to 18 months. At ambient room temperature (20°C–25°C), dry cakes remain viable for 72 to 96 hours during express transit.",
  },
  {
    category: "Storage & Stability",
    q: "How are research compound orders packaged and shipped across the Philippines?",
    a: "All analytical compounds are dispatched from Metro Manila. Dry lyophilized vials are packed in secure, discreet protective mailers with shock-absorbing foam. Lyophilized peptide powders are highly stable in solid state during standard express courier transit via J&T Express. Shipments typically arrive within 24–48 hours across Luzon and 48–72 hours across Visayas and Mindanao.",
  },

  // Analytical Quality & Standards
  {
    category: "Quality & Testing",
    q: "What testing methodologies are used to verify peptide identity and quality?",
    a: "Analytical reference compounds are sourced and characterized for in-vitro laboratory research. Formulations are documented with verified molecular identity, theoretical molecular weights, and handling specifications documented in our open-access Research Library.",
  },
  {
    category: "Quality & Testing",
    q: "What are endotoxins and why does PepStack enforce <0.02 EU/mg limits?",
    a: "Endotoxins (lipopolysaccharides or LPS) are toxic pyrogenic molecules shed from the cell walls of Gram-negative bacteria during synthesis. High endotoxin levels trigger non-specific inflammatory cytokines and alter cellular receptor affinity in in vitro assays, invalidating research conclusions. PepStack lots strictly maintain ultra-low endotoxin thresholds (<0.02 EU/mg) verified via Limulus Amebocyte Lysate (LAL) testing.",
  },

  // Philippine Operations & Settlement
  {
    category: "Orders & Philippine Settlement",
    q: "What payment methods are supported for Philippine laboratory researchers?",
    a: "We support real-time Philippine payments via GCash, Maya, and Bank QR under the national QR Ph interoperability standard. Manual bank transfers via BDO, BPI, and UnionBank are also supported with instant proof upload and automated reconciliation.",
  },
  {
    category: "Orders & Philippine Settlement",
    q: "What is the legal status and intended use of compounds on this platform?",
    a: "All analytical compounds, research stacks, lyophilized formulations, and bacteriostatic diluents distributed by PepStack Labs are manufactured and cataloged strictly for in vitro laboratory analysis, receptor binding studies, and scientific investigation. They are not approved for human or veterinary administration, diagnostic screening, or clinical therapies. Purchases require acceptance of our binding Research Hub Agreement.",
  },
]

const FAQ_CATEGORIES = [
  "All Questions",
  "Reconstitution & Chemistry",
  "Storage & Stability",
  "Quality & Testing",
  "Orders & Philippine Settlement",
]

export function ResearchFaqAccordion() {
  const [activeCategory, setActiveCategory] = useState<string>("All Questions")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([
    "Why can't I shake or vortex a peptide vial after adding Bacteriostatic Water?",
  ])

  const toggleQuestion = (q: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]
    )
  }

  const expandAll = () => {
    setExpandedQuestions(filteredFaqs.map((f) => f.q))
  }

  const collapseAll = () => {
    setExpandedQuestions([])
  }

  const filteredFaqs = useMemo(() => {
    return EXTENDED_FAQS.filter((faq) => {
      // Category match
      if (activeCategory !== "All Questions" && faq.category !== activeCategory) {
        return false
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        return (
          faq.q.toLowerCase().includes(q) ||
          faq.a.toLowerCase().includes(q) ||
          faq.category.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="w-full space-y-10">
      {/* Quick Action Reference Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-bold">
            💡
          </span>
          <span>Laboratory Knowledge Companion Links:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <LocalizedClientLink
            href="/learn/beginners-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <span>Beginner&apos;s Reconstitution SOP</span>
            <ArrowRightMini className="h-4 w-4" />
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/reconstitution-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Beaker className="h-3.5 w-3.5 text-emerald-600" />
            <span>Solvent Chemistry Guide</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/learn/storage-guide"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-600 hover:text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Storage &amp; Stability Matrix</span>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Instant Knowledge Base
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Search Frequently Asked Questions
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              Expand All
            </button>
            <span className="text-slate-300">&bull;</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic (e.g. Freezing, BAC water, J&T courier, Endotoxin, GCash)..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-xs text-slate-900 placeholder-slate-400 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FAQ_CATEGORIES.map((category) => {
            const isSelected = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Accordion List */}
      {filteredFaqs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <InformationCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-800">No questions matched your search query.</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or contact our laboratory desk directly.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("")
              setActiveCategory("All Questions")
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedQuestions.includes(faq.q)

            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(faq.q)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3 pr-4">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-0.5">
                      Q
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        {faq.q}
                      </h3>
                    </div>
                  </div>

                  <ChevronDownMini
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-emerald-700" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-5 sm:p-6 text-xs text-slate-700 leading-relaxed space-y-3">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Direct Lab Support Callout */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ChatBubbleLeftRight className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Have an Advanced Protocol Question?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Our scientific team provides technical assistance on solvent compatibility and stoichiometry.
            </p>
          </div>
        </div>

        <LocalizedClientLink
          href="/account/support"
          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 shrink-0"
        >
          <span>Contact Lab Support</span>
          <ArrowRightMini className="h-4 w-4" />
        </LocalizedClientLink>
      </div>
    </div>
  )
}
