import LocalizedClientLink from "@modules/common/components/localized-client-link"

type FeatureItem = {
  title: string
  category: string
  description: string
  linkHref: string
  linkText: string
  iconSvg: React.ReactNode
}

const features: FeatureItem[] = [
  {
    category: "Inventory Intelligence",
    title: "Private Vial Inventory",
    description:
      "Automatically register and track active vials, remaining milligrams, and reconstitution stability dates in your private portal.",
    linkHref: "/account/research-hub",
    linkText: "Access Research Hub",
    iconSvg: (
      <svg
        className="w-5 h-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    category: "Precision Dosage",
    title: "Reconstitution Math Engine",
    description:
      "Eliminate calculation errors. Calculate precise bacteriostatic water ratios, concentration curves, and exact U-100 syringe tick marks.",
    linkHref: "/research-protocols",
    linkText: "Launch Calculator",
    iconSvg: (
      <svg
        className="w-5 h-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    category: "Handling Standards",
    title: "Clinical Protocol Library",
    description:
      "Detailed guidance on half-life decay curves, cold-chain temperature thresholds, reconstitution procedures, and compound stability.",
    linkHref: "/research-protocols",
    linkText: "View Protocol Guides",
    iconSvg: (
      <svg
        className="w-5 h-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    category: "Philippine Fulfillment",
    title: "Cold-Chain & Instant QR",
    description:
      "Nationwide insulated shipping from Metro Manila with cold-pack protection. Instant settlement verification via GCash, Maya, and MariBank.",
    linkHref: "/account/support",
    linkText: "Delivery & Settlement",
    iconSvg: (
      <svg
        className="w-5 h-5 text-emerald-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
]

export default function ResearchSuiteFeatures() {
  return (
    <section className="w-full py-12 small:py-16 bg-zinc-50/50 dark:bg-zinc-950/40 border-b border-zinc-200/80 dark:border-zinc-800">
      <div className="content-container">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            The PepStack Research Suite
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Included With Every Compound Order
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Every purchase automatically unlocks full access to our digital research tools, inventory logging, and reconstitution math engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col justify-between rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center mb-4">
                  {feature.iconSvg}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                  {feature.category}
                </p>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                <LocalizedClientLink
                  href={feature.linkHref}
                  className="inline-flex items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{feature.linkText}</span>
                  <span className="ml-1 transition-transform group-hover:translate-x-0.5">&rarr;</span>
                </LocalizedClientLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
