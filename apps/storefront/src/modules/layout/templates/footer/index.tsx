import { listCategories } from "@lib/data/categories"
import { storeConfig } from "@lib/store-config"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-700">
      <div className="content-container flex w-full flex-col">
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 gap-10 py-12 small:grid-cols-2 small:py-16 medium:grid-cols-12 medium:gap-8">
          {/* Column 1: Brand, Identity & Logistics (5 cols on medium) */}
          <div className="flex flex-col gap-y-4 medium:col-span-5">
            <LocalizedClientLink
              href="/"
              className="inline-flex items-center gap-2 text-base font-bold uppercase tracking-wider text-slate-900"
            >
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              {storeConfig.name}
            </LocalizedClientLink>

            <p className="max-w-sm text-xs leading-relaxed text-slate-600">
              Philippine laboratory reference supplier for high-purity research compounds and biochemical reagents. Every batch is formulated for scientific inquiry and precision analysis.
            </p>

            {/* Cold-Chain Dispatch Signal */}
            <div className="mt-2 inline-flex max-w-sm items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-medium text-emerald-900">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              <span>Metro Manila Cold-Chain Dispatch (2°C - 8°C Insulated)</span>
            </div>

            {/* Legal Notice */}
            <p className="text-[11px] text-slate-500 leading-normal">
              For in vitro research use only. Not intended for diagnostic or therapeutic applications.
            </p>
          </div>

          {/* Column 2: Compound Catalog (2 cols on medium) */}
          <div className="flex flex-col gap-y-3 medium:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Compound Catalog
            </span>
            <ul className="flex flex-col gap-y-2 text-xs text-slate-600" data-testid="footer-categories">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="transition-colors hover:text-emerald-700"
                >
                  All Research Compounds
                </LocalizedClientLink>
              </li>
              {productCategories && productCategories.length > 0 ? (
                productCategories.slice(0, 5).map((c) => {
                  if (c.parent_category) return null
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/categories/${c.handle}`}
                        className="transition-colors hover:text-emerald-700"
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })
              ) : (
                <>
                  <li>
                    <LocalizedClientLink
                      href="/store"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Lyophilized Peptides
                    </LocalizedClientLink>
                  </li>
                  <li>
                    <LocalizedClientLink
                      href="/store"
                      className="transition-colors hover:text-emerald-700"
                    >
                      Bacteriostatic Diluents
                    </LocalizedClientLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Digital Tools & Reference (2 cols on medium) */}
          <div className="flex flex-col gap-y-3 medium:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Laboratory Tools
            </span>
            <ul className="flex flex-col gap-y-2 text-xs text-slate-600">
              <li>
                <LocalizedClientLink
                  href="/research-library#calculator"
                  className="transition-colors hover:text-emerald-700"
                >
                  Reconstitution Calculator
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/research-library#coa"
                  className="transition-colors hover:text-emerald-700 font-medium text-emerald-800"
                >
                  Certificates of Analysis (CoA)
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/research-library#comparisons"
                  className="transition-colors hover:text-emerald-700"
                >
                  Peptide Comparisons
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/research-library#articles"
                  className="transition-colors hover:text-emerald-700"
                >
                  Scientific Monographs
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/research-library#protocols"
                  className="transition-colors hover:text-emerald-700"
                >
                  Published Protocols
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account/research-hub"
                  className="transition-colors hover:text-emerald-700"
                >
                  My Research Hub
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account/orders"
                  className="transition-colors hover:text-emerald-700"
                >
                  Order Tracking
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Philippine Settlement & Security (3 cols on medium) */}
          <div className="flex flex-col gap-y-3 medium:col-span-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Settlement &amp; Logistics
            </span>
            <div className="space-y-3 text-xs text-slate-600">
              <p className="text-[11px] leading-relaxed">
                Philippine payment methods supported with instant reference verification:
              </p>
              {/* Payment Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800">
                  QR Ph
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800">
                  GCash
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800">
                  Maya
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800">
                  Bank Transfer
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Logistics dispatched via temperature-controlled courier packaging (J&amp;T Express &amp; Metro Manila Express).
              </p>
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
              href="/store"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Catalog
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/research-library#protocols"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Protocols
            </LocalizedClientLink>
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
              Terms of Service
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/legal/research-hub"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Research Agreement
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
