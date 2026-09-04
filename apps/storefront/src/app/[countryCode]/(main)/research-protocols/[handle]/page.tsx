import {
  listResearchProtocolRecommendations,
  retrieveResearchProtocol,
} from "@lib/data/research-protocols"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRecommendations from "@modules/research-protocols/product-recommendations"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ handle: string; countryCode: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  try {
    const { protocol } = await retrieveResearchProtocol(handle)
    return {
      title: protocol.content.compound_name || protocol.title,
      description:
        protocol.content.short_introduction || protocol.summary || undefined,
      robots:
        protocol.search_indexable === false
          ? { index: false, follow: false }
          : undefined,
    }
  } catch {
    return { title: "Research Protocol" }
  }
}

export default async function ResearchProtocolPage({ params }: Props) {
  const { handle, countryCode } = await params
  const protocol = await retrieveResearchProtocol(handle)
    .then((response) => response.protocol)
    .catch(() => null)
  if (!protocol) notFound()

  const recommendationResult = protocol.recommendations_enabled
    ? await listResearchProtocolRecommendations({
        handle,
        placement: "protocol",
        excludeProductIds: protocol.products.map((product) => product.id),
      }).catch(() => ({ recommendations: [] }))
    : { recommendations: [] }
  const recommendedProducts = recommendationResult.recommendations.length
    ? await listProducts({
        countryCode,
        queryParams: {
          id: recommendationResult.recommendations.map(
            (item) => item.product_id,
          ),
          limit: recommendationResult.recommendations.length,
        },
      })
        .then(({ response }) => response.products)
        .catch(() => [])
    : []
  const recommendedProductById = new Map(
    recommendedProducts.map((product) => [product.id, product]),
  )
  const recommendationItems = recommendationResult.recommendations.flatMap(
    (recommendation) => {
      const product = recommendedProductById.get(recommendation.product_id)
      return product ? [{ recommendation, product }] : []
    },
  )
  const content = protocol.content
  const sections = [...content.sections]
    .filter((section) => section.visible)
    .sort((a, b) => a.position - b.position)
  const faqs = [...content.faqs].sort((a, b) => a.position - b.position)

  // Emoji icons for quick-reference card keys
  const qrIcons: Record<string, string> = {
    target_solvent: "🧪",
    diluent_ratio: "💧",
    lyophilized_storage: "❄️",
    liquid_stability: "🔬",
    reconstitution: "⚗️",
    purity: "✅",
    molecular_weight: "⚖️",
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div className="border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="content-container py-10 small:py-14">

          {/* Research-use badge */}
          {content.research_use_label ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xsmall-semi uppercase tracking-wider"
              style={{
                backgroundColor: "rgb(254 243 199)",
                color: "rgb(146 64 14)",
                border: "1px solid rgb(253 230 138)",
              }}
            >
              ⚠️ {content.research_use_label}
            </span>
          ) : null}

          {/* Compound name + format badge */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl-semi text-ui-fg-base">
              {content.compound_name || protocol.title}
            </h1>
            {content.product_format ? (
              <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-small-semi text-ui-fg-subtle">
                {content.product_format}
              </span>
            ) : null}
          </div>

          {/* Short introduction */}
          {(content.short_introduction || protocol.summary) ? (
            <p className="mt-4 max-w-3xl text-base-regular leading-relaxed text-ui-fg-subtle">
              {content.short_introduction || protocol.summary}
            </p>
          ) : null}

          {/* Metadata chips */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-small-regular text-ui-fg-subtle">
              Revision {protocol.revision}
            </span>
            {content.last_reviewed_at ? (
              <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-small-regular text-ui-fg-subtle">
                Reviewed {content.last_reviewed_at}
              </span>
            ) : null}
            {content.category ? (
              <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-small-regular text-ui-fg-subtle">
                {content.category}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Main content (full-width, no sidebar) ── */}
      <main className="content-container py-10 small:py-14">

        {/* Back breadcrumb */}
        <LocalizedClientLink
          href="/research-protocols"
          className="text-small-semi text-ui-fg-interactive hover:underline"
        >
          ← Back to protocol directory
        </LocalizedClientLink>

        {/* ── Quick-reference cards ── */}
        {content.quick_reference.length ? (
          <section className="mt-8 grid gap-4 small:grid-cols-2 large:grid-cols-4">
            {content.quick_reference.map((item) => {
              const icon = qrIcons[item.key] ?? "📋"
              return (
                <div
                  key={item.key}
                  className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-5"
                  style={{ borderLeft: "3px solid rgb(99 102 241)" }}
                >
                  <p className="flex items-center gap-1.5 text-xsmall-semi uppercase tracking-wide text-ui-fg-subtle">
                    <span aria-hidden="true">{icon}</span>
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl-semi text-ui-fg-base">
                    {item.value}
                  </p>
                  {item.description ? (
                    <p className="mt-1.5 text-small-regular text-ui-fg-subtle">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </section>
        ) : null}

        {/* ── Content sections ── */}
        {sections.map((section) => (
          <section key={section.key} className="mt-12 max-w-3xl">
            <h2 className="text-2xl-semi text-ui-fg-base">{section.title}</h2>
            <div className="mt-2 h-px bg-ui-border-base" />
            <p className="mt-4 whitespace-pre-wrap text-base-regular leading-relaxed text-ui-fg-subtle">
              {section.body}
            </p>
          </section>
        ))}

        {/* ── FAQ accordion ── */}
        {faqs.length ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl-semi text-ui-fg-base">
              Frequently asked questions
            </h2>
            <div className="mt-2 h-px bg-ui-border-base" />
            <div className="mt-5 grid gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.key}
                  className="group rounded-rounded border border-ui-border-base bg-ui-bg-base p-5 open:bg-ui-bg-subtle"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base-semi text-ui-fg-base">
                    {faq.question}
                    <span className="shrink-0 text-ui-fg-muted transition-transform group-open:rotate-180" aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-base-regular leading-relaxed text-ui-fg-subtle">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── References & evidence ── */}
        {content.references.length ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl-semi text-ui-fg-base">
              References & evidence
            </h2>
            <div className="mt-2 h-px bg-ui-border-base" />
            <ol className="mt-5 grid gap-4">
              {content.references.map((reference, index) => (
                <li
                  key={reference.reference_key || `${reference.title}-${index}`}
                  className="flex gap-4 rounded-rounded border border-ui-border-base bg-ui-bg-base p-4"
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xsmall-semi text-white"
                    style={{ backgroundColor: "rgb(99 102 241)" }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-base-semi text-ui-fg-base">
                      {reference.title}
                    </p>
                    {reference.customer_annotation ? (
                      <p className="mt-1 text-small-regular text-ui-fg-subtle">
                        {reference.customer_annotation}
                      </p>
                    ) : null}
                    {reference.url ? (
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-1 text-small-semi text-ui-fg-interactive transition-colors hover:bg-ui-bg-base"
                      >
                        Open source ↗
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* ── Applicable compounds ── */}
        {protocol.products.length ? (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl-semi text-ui-fg-base">
              Applicable compounds
            </h2>
            <div className="mt-2 h-px bg-ui-border-base" />
            <p className="mt-3 text-small-regular text-ui-fg-subtle">
              This protocol applies to the following compounds.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {protocol.products.map((product) => (
                <LocalizedClientLink
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="inline-flex items-center gap-2 rounded-rounded border border-ui-border-base bg-ui-bg-base px-4 py-2.5 text-small-semi transition-colors hover:border-ui-border-interactive hover:bg-ui-bg-subtle"
                >
                  {product.title}
                  <span aria-hidden="true" className="text-ui-fg-muted">→</span>
                </LocalizedClientLink>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Product recommendations ── */}
        <ProductRecommendations
          handle={handle}
          items={recommendationItems}
          countryCode={countryCode}
        />

        {/* ── Disclaimer ── */}
        <div className="mt-12 max-w-3xl rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-5">
          <p className="text-small-semi text-ui-fg-base">Important information</p>
          <p className="mt-2 text-small-regular text-ui-fg-subtle">
            {content.disclaimer}
          </p>
        </div>

        {/* ── Full Protocol Access CTA (replaces sidebar) ── */}
        <div
          className="mt-12 overflow-hidden rounded-rounded"
          style={{ backgroundColor: "rgb(17 24 39)" }}
        >
          <div className="flex flex-col gap-8 p-8 small:flex-row small:items-center small:justify-between">
            <div className="min-w-0">
              <p
                className="text-small-semi uppercase tracking-wider"
                style={{ color: "rgb(165 180 252)" }}
              >
                Research Hub
              </p>
              <h2 className="mt-2 text-2xl-semi text-white">
                Unlock full protocol access
              </h2>
              <ul className="mt-4 grid gap-2">
                {[
                  "Complete dosage schedules & titration steps",
                  "Reconstitution calculator with custom defaults",
                  "Protected community discussion & research observations",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-small-regular"
                    style={{ color: "rgb(209 213 219)" }}
                  >
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: "rgb(129 140 248)" }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p
                className="mt-4 text-xsmall-regular"
                style={{ color: "rgb(156 163 175)" }}
              >
                Available to customers with an eligible purchase.
              </p>
            </div>
            <div className="shrink-0">
              <LocalizedClientLink
                href="/account/research-hub"
                className="inline-flex items-center gap-2 rounded-rounded px-6 py-3 text-base-semi text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "rgb(99 102 241)" }}
              >
                Open Research Hub
                <span aria-hidden="true">→</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
