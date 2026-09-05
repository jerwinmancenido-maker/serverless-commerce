import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-24 px-4 flex flex-col justify-center items-center text-center max-w-xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-xs"
      data-testid="empty-cart-message"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-5 border border-slate-200/80">
        <svg
          className="w-8 h-8 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.375A4.5 4.5 0 008.25 21h7.5A4.5 4.5 0 0019 14.375l-4.091-3.966a2.25 2.25 0 01-.659-1.591V3.104"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 3.104h7.5M9.75 14.25h4.5"
          />
        </svg>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
        Analytical Compounds
      </span>
      <Heading
        level="h1"
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Your Research Cart is Empty
      </Heading>
      <Text className="text-sm text-slate-500 mt-2 mb-6 max-w-sm leading-relaxed">
        No lyophilized compounds, bacteriostatic solvents, or reconstitution supplies currently added to your order.
      </Text>
      <div>
        <LocalizedClientLink
          href="/store"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
        >
          <span>Explore Research Catalog</span>
          <span>&rarr;</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
