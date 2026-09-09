/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-library/comparisons/[slug]/page.tsx
 * @module  PeptideComparisonDetailPage
 * @purpose Server-rendered monograph page for head-to-head peptide comparison matrices with dynamic vector evaluation.
 * @contracts
 *   Route: GET /:countryCode/research-library/comparisons/:slug
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  retrievePeptideComparison,
  listPeptideComparisons,
} from "@lib/data/peptide-comparisons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import { Sparkles, ArrowRightMini } from "@medusajs/icons"

type Props = {
  params: Promise<{
    countryCode: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const comparisons = await listPeptideComparisons()
  return comparisons.map((comp) => ({
    slug: comp.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const comparison = await retrievePeptideComparison(slug)

  if (!comparison) {
    return {
      title: "Peptide Comparison | Research Library",
    }
  }

  return {
    title: `${comparison.title} | Research Library`,
    description: comparison.summary.slice(0, 160),
    openGraph: {
      title: comparison.title,
      description: comparison.summary.slice(0, 160),
      type: "article",
    },
  }
}

export default async function PeptideComparisonPage({ params }: Props) {
  const { slug } = await params
  const comparison = await retrievePeptideComparison(slug)

  if (!comparison) {
    notFound()
  }

  const { compoundA, compoundB, vectors = [], citations = [] } = comparison

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* ── Breadcrumbs ── */}
      <div className="border-b border-slate-200/80 bg-slate-50/60 py-3">
        <div className="content-container flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <LocalizedClientLink href="/" className="hover:text-slate-800 transition-colors">
            Home
          </LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink
            href="/research-library?tab=comparisons"
            className="hover:text-slate-800 transition-colors"
          >
            Research Library
          </LocalizedClientLink>
          <span>/</span>
          <span className="text-indigo-800 font-semibold">{comparison.category}</span>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{comparison.title}</span>
        </div>
      </div>

      {/* ── Monograph Header ── */}
      <div className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50/60 via-indigo-50/20 to-white py-12 sm:py-16">
        <div className="content-container max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-800 uppercase tracking-wide">
              {comparison.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              • Head-to-Head Pharmacodynamics
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {comparison.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {comparison.subtitle}
          </p>

          {/* Synergy Verdict Callout */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                Synergy &amp; Co-Administration Verdict
              </span>
              <p className="text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                {comparison.synergy_verdict}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="content-container max-w-4xl mx-auto py-10 space-y-12">
        {/* Executive Summary Section */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Executive Summary &amp; Pharmacodynamic Profile
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {comparison.summary}
          </p>
        </section>

        {/* ── Side-by-Side Specimen Cards ── */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Comparative Compounds Under Evaluation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compound A */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    Reference Specimen A
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {compoundA.category}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {compoundA.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{compoundA.tag}</p>

                <div className="space-y-2 pt-2 text-xs border-t border-slate-200/60">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Molecular Mass:</span>
                    <span className="font-bold text-slate-900 font-mono">{compoundA.molecular_mass}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">In-Vitro Half-Life:</span>
                    <span className="font-bold text-slate-900">{compoundA.half_life}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Primary Mechanism:</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{compoundA.primary_target}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Reconstitution:</span>
                    <span className="font-bold text-slate-900 text-right">{compoundA.reconstitution_diluent}</span>
                  </div>
                </div>
              </div>

              <LocalizedClientLink
                href={`/products/${getCanonicalProductSlug(compoundA.handle)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs text-center"
              >
                <span>View {compoundA.name} Reference Standard</span>
                <ArrowRightMini className="h-3.5 w-3.5" />
              </LocalizedClientLink>
            </div>

            {/* Compound B */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                    Comparative Specimen B
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                    {compoundB.category}
                  </span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {compoundB.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{compoundB.tag}</p>

                <div className="space-y-2 pt-2 text-xs border-t border-slate-200/60">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Molecular Mass:</span>
                    <span className="font-bold text-slate-900 font-mono">{compoundB.molecular_mass}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">In-Vitro Half-Life:</span>
                    <span className="font-bold text-slate-900">{compoundB.half_life}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Primary Mechanism:</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{compoundB.primary_target}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Reconstitution:</span>
                    <span className="font-bold text-slate-900 text-right">{compoundB.reconstitution_diluent}</span>
                  </div>
                </div>
              </div>

              <LocalizedClientLink
                href={`/products/${getCanonicalProductSlug(compoundB.handle)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-all shadow-xs text-center"
              >
                <span>View {compoundB.name} Reference Standard</span>
                <ArrowRightMini className="h-3.5 w-3.5" />
              </LocalizedClientLink>
            </div>
          </div>
        </section>

        {/* ── Detailed Vector Comparison Matrix Table ── */}
        <section className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Analytical Comparison Matrix (6 Dimensional Vectors)
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700">
                  <th className="p-3.5 sm:p-4 font-bold w-1/4">Evaluation Vector</th>
                  <th className="p-3.5 sm:p-4 font-bold text-emerald-900 w-1/3">
                    {compoundA.name}
                  </th>
                  <th className="p-3.5 sm:p-4 font-bold text-indigo-900 w-1/3">
                    {compoundB.name}
                  </th>
                  <th className="p-3.5 sm:p-4 font-bold text-slate-600 hidden md:table-cell">
                    Analytical Distinction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {vectors.map((vec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 align-top">
                      {vec.feature}
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-700 font-medium leading-relaxed align-top">
                      {vec.compoundA_val}
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-700 font-medium leading-relaxed align-top">
                      {vec.compoundB_val}
                    </td>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-500 hidden md:table-cell align-top">
                      {vec.verdict || "Distinct"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── PubMed Citations ── */}
        {citations.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Peer-Reviewed Scientific Citations ({citations.length})
            </h3>
            <div className="space-y-2.5">
              {citations.map((cit, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-start gap-3"
                >
                  <span className="font-bold text-slate-400 font-mono shrink-0">
                    [{cit.number || idx + 1}]
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {cit.text}
                    </p>
                    {cit.url && (
                      <a
                        href={cit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-semibold underline mt-1 inline-block"
                      >
                        Verify on PubMed &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Preclinical Laboratory Research Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Preclinical Laboratory Reference Disclaimer:</strong>{" "}
          This comparative monograph is synthesized strictly for analytical laboratory referencing,
          in-vitro receptor kinetics, and volumetric stoichiometry. Research compounds are strictly
          not for human consumption, clinical diagnostic use, or veterinary administration.
        </div>
      </div>
    </div>
  )
}
