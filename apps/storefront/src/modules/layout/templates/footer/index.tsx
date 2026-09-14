import { listCategories } from "@lib/data/categories"
import { storeConfig } from "@lib/store-config"
import { getNavMetrics } from "@lib/data/navigation-data"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsletterLeadWidget from "@modules/layout/components/newsletter-lead-widget"
import { ExclamationCircle } from "@medusajs/icons"

export default async function Footer() {
  const metrics = getNavMetrics()
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-700 print:hidden">
      <div className="content-container flex w-full flex-col">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 gap-8 py-12 small:grid-cols-2 small:py-16 medium:grid-cols-12 medium:gap-8">
          {/* Column 1: Brand & Protocols (3 cols on medium) */}
          <div className="flex flex-col gap-y-3 medium:col-span-3">
            <LocalizedClientLink
              href="/"
              className="inline-flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-900"
            >
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              {storeConfig.name}
            </LocalizedClientLink>

            <p className="text-xs leading-relaxed text-slate-600 mb-1">
              Philippine analytical supplier for laboratory research compounds and stoichiometric reagents.
            </p>

            <div className="relative pb-1.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Research Categories
              </span>
              <div className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-emerald-600" />
            </div>

            <ul
              className="flex flex-col gap-y-1.5 text-xs text-slate-600"
              data-testid="footer-categories"
            >
              {productCategories && productCategories.length > 0 ? (
                productCategories.slice(0, 5).map((c) => (
                  <li key={c.id} className="group flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                    <LocalizedClientLink
                      href={`/categories/${c.handle}`}
                      className="transition-colors hover:text-emerald-700"
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))
              ) : (
                <>
                  <li className="group flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                    <LocalizedClientLink
                      href="/categories/metabolic-weight-management-peptides"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Metabolic &amp; GLP-1 Peptides
                    </LocalizedClientLink>
                  </li>
                  <li className="group flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                    <LocalizedClientLink
                      href="/categories/healing-tissue-repair-peptides"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Healing &amp; Tissue Repair
                    </LocalizedClientLink>
                  </li>
                  <li className="group flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                    <LocalizedClientLink
                      href="/categories/growth-hormone-recovery-peptides"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Growth Hormone Releasing Factors
                    </LocalizedClientLink>
                  </li>
                  <li className="group flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                    <LocalizedClientLink
                      href="/categories/longevity-cellular-health-peptides"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Cellular Longevity &amp; Bioregulators
                    </LocalizedClientLink>
                  </li>
                  <li className="group flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                    <LocalizedClientLink
                      href="/categories/research-supplies-accessories"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Consumables &amp; Sterile Reagents
                    </LocalizedClientLink>
                  </li>
                </>
              )}
            </ul>

            <div className="relative pb-1.5 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Research Protocols
              </span>
              <div className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-emerald-600" />
            </div>

            <ul className="flex flex-col gap-y-1.5 text-xs text-slate-600">
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/store"
                  className="transition-colors hover:text-emerald-700"
                >
                  Single Peptides ({metrics.totalCompounds} Compounds)
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/research-stacks"
                  className="transition-colors hover:text-emerald-700"
                >
                  Peptide Stacks &amp; Regimens Studio
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/dosage-chart"
                  className="transition-colors hover:text-emerald-700"
                >
                  Master Peptide Dosage Chart
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/research-library#calculator"
                  className="transition-colors hover:text-emerald-700"
                >
                  Reconstitution &amp; Syringe Calculator
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 2: Learn & Laboratory SOPs (3 cols on medium) */}
          <div className="flex flex-col gap-y-3 medium:col-span-3">
            <div className="relative pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Learn &amp; Laboratory SOPs
              </span>
              <div className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-emerald-600" />
            </div>

            <ul className="flex flex-col gap-y-1.5 text-xs text-slate-600">
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/research-library#articles"
                  className="transition-colors hover:text-emerald-700"
                >
                  Scientific Monographs (83 Articles)
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/learn/beginners-guide"
                  className="transition-colors hover:text-emerald-700"
                >
                  Beginner&apos;s Aseptic SOP
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/learn/reconstitution-guide"
                  className="transition-colors hover:text-emerald-700"
                >
                  Reconstitution &amp; Solvent Guide
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/learn/storage-guide"
                  className="transition-colors hover:text-emerald-700"
                >
                  Storage &amp; Degradation Matrix
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/learn/syringe-guide"
                  className="transition-colors hover:text-emerald-700"
                >
                  Syringe &amp; Measurement Guide
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/learn/glossary"
                  className="transition-colors hover:text-emerald-700"
                >
                  A–Z Scientific Glossary
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/faq"
                  className="transition-colors hover:text-emerald-700"
                >
                  Frequently Asked Questions (FAQ)
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/research-library#comparisons"
                  className="transition-colors hover:text-emerald-700"
                >
                  Head-to-Head Peptide Comparisons
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Company, Quality & Settlement (2 cols on medium) */}
          <div className="flex flex-col gap-y-3 medium:col-span-2">
            <div className="relative pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Company &amp; Quality
              </span>
              <div className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-emerald-600" />
            </div>

            <ul className="flex flex-col gap-y-1.5 text-xs text-slate-600">
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/research-library#coa"
                  className="transition-colors hover:text-emerald-700"
                >
                  Certificates of Analysis (CoA)
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/editorial-policy"
                  className="transition-colors hover:text-emerald-700"
                >
                  Scientific Editorial Policy
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/account/support"
                  className="transition-colors hover:text-emerald-700"
                >
                  Contact Lab Support
                </LocalizedClientLink>
              </li>
              <li className="group flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-bold transition-colors">▸</span>
                <LocalizedClientLink
                  href="/account/orders"
                  className="transition-colors hover:text-emerald-700"
                >
                  Order Tracking
                </LocalizedClientLink>
              </li>
            </ul>

            {/* Protective Packaging Signal */}
            <div className="mt-1 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2 text-[11px] font-medium text-emerald-900">
              <span className="font-bold block text-emerald-950">Protective Packaging:</span>
              Insulation Foam Cushioning &middot; J&amp;T Express Nationwide
            </div>

            {/* Payment Badges */}
            <div className="mt-1 space-y-1.5 text-xs text-slate-600">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Philippine Settlement:
              </span>
              <div className="flex flex-wrap gap-1">
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                  QR Ph
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                  GCash
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                  Maya
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                  Bank QR
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Stay Updated / Newsletter (4 cols on medium) */}
          <div className="flex flex-col justify-start medium:col-span-4">
            <div className="relative pb-1.5 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Stay Updated
              </span>
              <div className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-emerald-600" />
            </div>
            <NewsletterLeadWidget />
          </div>
        </div>

        {/* High-Contrast Regulatory Research Disclaimer Callout Card */}
        <div className="my-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <ExclamationCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold text-amber-950 block mb-0.5">
                IMPORTANT REGULATORY RESEARCH DISCLAIMER:
              </strong>
              All analytical compounds, research stacks, lyophilized formulations, and bacteriostatic
              diluents cataloged on this platform are manufactured and distributed strictly for in vitro
              laboratory analysis, biochemical assays, and receptor affinity studies. They are not
              approved for human or veterinary administration, medical treatment, diagnostics, or clinical
              use. All purchases are governed by our binding Research Hub Agreement.
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 py-6 text-xs text-slate-500 medium:flex-row">
          <Text className="txt-compact-small text-slate-500">
            © {new Date().getFullYear()} {storeConfig.name}. All rights reserved. Precision Formulation for Research In Vitro.
          </Text>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Philippine Research Standard
            </span>
            <LocalizedClientLink
              href="/legal/privacy"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/legal/terms"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Terms &amp; Conditions
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/legal/privacy"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Cookie Policy
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/legal/research-hub"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Disclaimer
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/settings/privacy"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Analytics opt-out
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
