import { storeConfig } from "@/config/store";

export default function Home() {
  const checkoutFoundation = [
    {
      number: "01",
      title: "Customer accounts",
      description: "Account-only checkout with saved Philippine addresses.",
    },
    {
      number: "02",
      title: "Flexible payments",
      description: "Admin-configurable payment methods and instructions.",
    },
    {
      number: "03",
      title: "Flexible shipping",
      description: "Admin-configurable carriers, services, and rates.",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dcece0_0,_transparent_34%),linear-gradient(135deg,#f7f8f3_0%,#edf2ed_100%)] px-6 py-10 text-[#17211b] sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[#17211b]/15 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#35704a]">
              {storeConfig.tagline}
            </p>
            <p className="mt-1 text-xl font-semibold">{storeConfig.name}</p>
          </div>
          <span className="rounded-full border border-[#35704a]/30 bg-white/70 px-4 py-2 text-sm font-medium text-[#285a3a]">
            Foundation in progress
          </span>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-5 font-mono text-sm text-[#487258]">
              ACCOUNT-BASED COMMERCE × PHP × SERVERLESS
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl">
              A precise commerce system, built around one inventory truth.
            </h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#506158]">
            Customer accounts, flexible payment and shipping choices, recipe
            inventory, vouchers, and fulfillment documents—designed as one
            auditable workflow.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {checkoutFoundation.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-[#17211b]/10 bg-white/75 p-6 shadow-[0_16px_50px_rgba(32,56,39,0.06)] backdrop-blur"
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="font-mono text-xs text-[#66746b]">
                  {item.number}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-[#59a36f] shadow-[0_0_0_5px_rgba(89,163,111,0.14)]" />
              </div>
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#617067]">
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-4 grid gap-4 rounded-3xl bg-[#17211b] p-6 text-[#eff8f1] sm:grid-cols-3 sm:p-8">
          {[
            ["Inventory", "Transactional BOM recipes"],
            ["Promotions", "Auditable vouchers"],
            ["Fulfillment", "Receipts, lists, and labels"],
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
