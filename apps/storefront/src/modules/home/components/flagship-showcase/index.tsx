/**
 * @file    apps/storefront/src/modules/home/components/flagship-showcase/index.tsx
 * @module  FlagshipShowcase (Storefront Home Module)
 * @purpose Renders flagship analytical standards showcase with dynamic backend asset URLs.
 * @contracts
 *   Component: FlagshipShowcase
 */

import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRightMini, CheckCircleSolid, Sparkles } from "@medusajs/icons"

type FlagshipItem = {
  handle: string
  title: string
  subtitle: string
  category: string
  purity: string
  startingPrice: string
  imageUrl: string
  strengths: string[]
  isNew?: boolean
  isBestseller?: boolean
}

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const FLAGSHIP_COMPOUNDS: FlagshipItem[] = [
  {
    handle: "retatrutide",
    title: "Retatrutide",
    subtitle: "GLP-1 / GIP / Glucagon Tri-Agonist",
    category: "Metabolic & Incretin",
    purity: "Reference Grade",
    startingPrice: "₱2,200",
    imageUrl: `${MEDUSA_BACKEND_URL}/static/catalog/retatrutide/slide1_hero.webp`,
    strengths: ["10mg", "20mg", "40mg"],
    isBestseller: true,
  },
  {
    handle: "tirzepatide",
    title: "Tirzepatide",
    subtitle: "Dual GIP / GLP-1 Incretin Co-Agonist",
    category: "Metabolic & Incretin",
    purity: "Reference Grade",
    startingPrice: "₱2,100",
    imageUrl: `${MEDUSA_BACKEND_URL}/static/catalog/tirzepatide/slide1_hero.webp`,
    strengths: ["10mg", "20mg", "30mg", "40mg"],
    isBestseller: true,
  },
  {
    handle: "bpc-157",
    title: "BPC-157",
    subtitle: "Gastric Pentadecapeptide 15-AA",
    category: "Tissue Repair & Healing",
    purity: "Reference Grade",
    startingPrice: "₱1,650",
    imageUrl: `${MEDUSA_BACKEND_URL}/static/catalog/bpc-157-vial/slide1_hero.webp`,
    strengths: ["5mg", "10mg"],
    isBestseller: true,
  },
  {
    handle: "tesamorelin",
    title: "Tesamorelin",
    subtitle: "GHRH Analog 44-Amino Acid Polypeptide",
    category: "GH Axis & Recovery",
    purity: "Reference Grade",
    startingPrice: "₱2,400",
    imageUrl: `${MEDUSA_BACKEND_URL}/static/catalog/tesamorelin/slide1_hero.webp`,
    strengths: ["10mg"],
  },
  {
    handle: "5-amino-1mq",
    title: "5-Amino-1MQ",
    subtitle: "NNMT Small Molecule Inhibitor",
    category: "Cellular Longevity",
    purity: "Reference Grade",
    startingPrice: "₱2,100",
    imageUrl: `${MEDUSA_BACKEND_URL}/static/catalog/5-amino-1mq/slide1_hero.webp`,
    strengths: ["50mg"],
    isNew: true,
  },
  {
    handle: "aod-9604",
    title: "AOD-9604",
    subtitle: "Modified C-Terminal Fragment of hGH (177-191)",
    category: "Metabolic Research",
    purity: "Reference Grade",
    startingPrice: "₱1,750",
    imageUrl: `${MEDUSA_BACKEND_URL}/static/catalog/aod-9604/slide1_hero.webp`,
    strengths: ["5mg", "10mg"],
  },
]

export default function FlagshipShowcase() {
  return (
    <section className="w-full py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/50 to-white border-b border-slate-200">
      <div className="content-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200/80 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Reference Standard Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
              Featured Research Compounds
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Lyophilized reference compounds prepared for in-vitro laboratory research, dispatched nationwide in protective packaging.
            </p>
          </div>

          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0 group"
          >
            <span>Explore All 154 Formulations</span>
            <ArrowRightMini className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </LocalizedClientLink>
        </div>

        {/* Product Grid with High-Resolution Vial Visuals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FLAGSHIP_COMPOUNDS.map((item) => (
            <LocalizedClientLink
              key={item.handle}
              href={`/products/${item.handle}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all duration-300 overflow-hidden"
            >
              {/* Badges Top Strip */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                  {item.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {item.isBestseller && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Most Requested
                    </span>
                  )}
                  {item.isNew && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      New Batch
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {item.purity}
                  </span>
                </div>
              </div>

              {/* High-Resolution Vial Image Pedestal */}
              <div className="relative aspect-square w-full rounded-xl bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 border border-slate-100 p-4 flex items-center justify-center overflow-hidden mb-4 group-hover:bg-emerald-50/20 transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(241,245,249,0.9)_0%,transparent_70%)] pointer-events-none" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={item.imageUrl}
                    alt={`${item.title} research vial`}
                    fill
                    className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>

              {/* Title & Mechanism Description */}
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">
                  {item.subtitle}
                </p>

                {/* Available Formulations / Strengths */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Sizes:
                  </span>
                  {item.strengths.map((str) => (
                    <span
                      key={str}
                      className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded"
                    >
                      {str}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Starting Price & CTA */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                    From
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {item.startingPrice}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white px-3 py-1.5 rounded-xl border border-emerald-200 group-hover:border-emerald-600 transition-all shadow-2xs">
                  <span>Configure</span>
                  <ArrowRightMini className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>

        {/* Clinical Quality Assurance Banner */}
        <div className="mt-10 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircleSolid className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Laboratory Reagents &amp; Analytical Monograph Access
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Formulated exclusively for in-vitro research use. Stored in borosilicate glass vials with tamper-evident flip-off caps and analytical documentation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <LocalizedClientLink
              href="/research-library#calculator"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-colors shadow-xs"
            >
              Diluent Calculator
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/research-protocols"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Protocol Monograph
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
