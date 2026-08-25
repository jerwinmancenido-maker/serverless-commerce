export default function Home() {
  const marketplaces = ["Lazada", "TikTok Shop", "Shopee"];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dcece0_0,_transparent_34%),linear-gradient(135deg,#f7f8f3_0%,#edf2ed_100%)] px-6 py-10 text-[#17211b] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[#17211b]/15 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#35704a]">
              Commerce infrastructure
            </p>
            <p className="mt-1 text-xl font-semibold">Serverless Core</p>
          </div>
          <span className="rounded-full border border-[#35704a]/30 bg-white/70 px-4 py-2 text-sm font-medium text-[#285a3a]">
            Ready for configuration
          </span>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-5 font-mono text-sm text-[#487258]">
              NEXT.JS × NEON × DRIZZLE
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl">
              One inventory truth across every channel.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#506158]">
            A PHP-native commerce foundation with recipe-based stock, atomic
            raw-material deductions, and authenticated marketplace webhooks.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {marketplaces.map((marketplace, index) => (
            <article
              key={marketplace}
              className="rounded-3xl border border-[#17211b]/10 bg-white/75 p-6 shadow-[0_16px_50px_rgba(32,56,39,0.06)] backdrop-blur"
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="font-mono text-xs text-[#66746b]">
                  0{index + 1}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#59a36f] shadow-[0_0_0_5px_rgba(89,163,111,0.14)]" />
              </div>
              <h2 className="text-2xl font-semibold">{marketplace}</h2>
              <p className="mt-2 text-sm leading-6 text-[#617067]">
                Signed webhook route scaffolded and ready for credentials.
              </p>
            </article>
          ))}
        </section>

        <section className="mt-4 grid gap-4 rounded-3xl bg-[#17211b] p-6 text-[#eff8f1] sm:grid-cols-3 sm:p-8">
          {[
            ["Database", "8 connected tables"],
            ["Inventory", "Transactional BOM engine"],
            ["Currency", "PHP by default"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-white/10 py-2 first:border-0 first:pl-0 sm:border-l sm:pl-6"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[#a8b9ad]">
                {label}
              </p>
              <p className="mt-2 text-lg font-medium">{value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
