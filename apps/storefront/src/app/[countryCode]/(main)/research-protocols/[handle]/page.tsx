import {
  listResearchProtocolRecommendations,
  retrieveResearchProtocol,
  type StoreResearchProtocol,
} from "@lib/data/research-protocols"
import {
  getCompoundProtocol,
  type CompoundAnalyticalProtocol,
} from "@lib/data/compound-protocols"
import { listProducts } from "@lib/data/products"
import { getCanonicalProductSlug } from "@lib/util/product-handles"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductRecommendations from "@modules/research-protocols/product-recommendations"
import { Metadata } from "next"
import { notFound } from "next/navigation"

function adaptCompoundToStoreProtocol(
  analytical: CompoundAnalyticalProtocol,
  handle: string
): StoreResearchProtocol {
  return {
    handle,
    revision: 1,
    title: `${analytical.compoundName} Analytical Protocol`,
    summary: analytical.subtitle,
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products: analytical.handles.map((h) => ({
      id: `prod_${h}`,
      title: analytical.compoundName,
      handle: h,
      thumbnail: null,
    })),
    access: {
      full_protocol: "purchaser",
      community: "member",
    },
    search_indexable: true,
    recommendations_enabled: false,
    content: {
      compound_name: analytical.compoundName,
      short_introduction: analytical.subtitle,
      product_format: "Lyophilized Analytical Standard",
      category: analytical.category,
      research_use_label: "In-Vitro Laboratory Protocol",
      last_reviewed_at: "September 2026",
      quick_reference: [
        {
          key: "target_solvent",
          label: "Target Solvent",
          value: "Bacteriostatic Water USP",
          description: "0.9% Benzyl Alcohol preserved water",
          evidence_label: null,
          reference_keys: [],
        },
        {
          key: "diluent_ratio",
          label: "Diluent Ratio",
          value: `${analytical.reconstitution.defaultDiluentMl.toFixed(1)} mL / ${analytical.reconstitution.defaultVialNetMg} mg`,
          description: `Target concentration: ${analytical.reconstitution.resultingConcentrationMgPerMl.toFixed(1)} mg/mL`,
          evidence_label: null,
          reference_keys: [],
        },
        {
          key: "lyophilized_storage",
          label: "Lyophilized Storage",
          value: "-20°C Desiccated",
          description: "24-month sealed stability standard",
          evidence_label: null,
          reference_keys: [],
        },
        {
          key: "liquid_stability",
          label: "Reconstituted Stability",
          value: "2°C–8°C Refrigerated",
          description: "Use within 28 days; protect from light",
          evidence_label: null,
          reference_keys: [],
        },
        {
          key: "purity",
          label: "Purity Release Spec",
          value: analytical.purityStandard.split("(")[0].trim(),
          description: "HPLC analytical release standard",
          evidence_label: null,
          reference_keys: [],
        },
        {
          key: "cadence",
          label: "Analytical Cadence",
          value: analytical.dosing.standardDoseDisplay,
          description: analytical.dosing.cadence,
          evidence_label: null,
          reference_keys: [],
        },
      ],
      sections: [
        {
          key: "preparation",
          title: "Reconstitution & Handling Protocol",
          body: `${analytical.reconstitution.dissolutionMethod}\n\nHandling Standard: ${analytical.reconstitution.handlingRule}`,
          visible: true,
          position: 1,
          reference_keys: [],
        },
        {
          key: "dosing_schedule",
          title: "Calibrated Titration & Dosing Roadmap",
          body: analytical.dosing.titrationSteps
            .map(
              (s) =>
                `• ${s.stage} (${s.timeframe}): ${s.doseDisplay} — Cadence: ${s.cadence}\n  Focus: ${s.focus}${
                  s.notes ? `\n  Notes: ${s.notes}` : ""
                }`
            )
            .join("\n\n"),
          visible: true,
          position: 2,
          reference_keys: [],
        },
        {
          key: "storage",
          title: "Storage & Stability Guidelines",
          body: `Lyophilized Standard: ${analytical.storage.lyophilized}\nReconstituted Solution: ${
            analytical.storage.reconstituted
          }\nProtection: ${
            analytical.storage.lightProtection
              ? "Protect from direct ultraviolet light."
              : "Standard analytical laboratory storage."
          }`,
          visible: true,
          position: 3,
          reference_keys: [],
        },
      ],
      faqs: [
        {
          key: "reconstitution_faq",
          question: `How should ${analytical.compoundName} be reconstituted?`,
          answer: analytical.reconstitution.dissolutionMethod,
          position: 1,
        },
        {
          key: "half_life_faq",
          question: `What is the estimated laboratory half-life of ${analytical.compoundName}?`,
          answer: `${analytical.compoundName} displays an estimated half-life of ${analytical.dosing.halfLife}. Typical study protocols run for ${analytical.dosing.typicalProtocolDuration} followed by a washout period of ${analytical.dosing.washoutPeriod}.`,
          position: 2,
        },
      ],
      references: [
        {
          reference_key: "ref-1",
          title: `${analytical.compoundName} Analytical Profile & High-Performance Liquid Chromatography Assay Standard`,
          authors: "PepStack Analytical Bioresearch Registry",
          published_at: "2026",
          url: null,
          doi: null,
          evidence_type: "HPLC Monograph",
          supported_claim:
            "Standardized peptide sequence, molecular purity, and handling guidelines.",
          customer_annotation:
            "Authoritative reference dossier for research laboratory use.",
        },
      ],
      disclaimer: analytical.disclaimer,
    },
  }
}

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
    const analytical = getCompoundProtocol(handle)
    return {
      title: `${analytical.compoundName} Protocol | Research Protocols`,
      description: analytical.subtitle,
    }
  }
}

export default async function ResearchProtocolPage({ params }: Props) {
  const { handle, countryCode } = await params
  let protocol: StoreResearchProtocol | null = await retrieveResearchProtocol(handle)
    .then((response) => response.protocol)
    .catch(() => null)

  if (!protocol) {
    const analytical = getCompoundProtocol(handle)
    if (analytical) {
      protocol = adaptCompoundToStoreProtocol(analytical, handle)
    }
  }

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

  const qrLabels: Record<string, string> = {
    target_solvent: "Solvent",
    diluent_ratio: "Ratio",
    lyophilized_storage: "Storage",
    liquid_stability: "Stability",
    reconstitution: "Preparation",
    purity: "Specifications",
    molecular_weight: "Mass",
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
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-600" />
              {content.research_use_label}
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
          <section className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {content.quick_reference.map((item) => {
              const tag = qrLabels[item.key] ?? "Parameter"
              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-ui-border-base bg-white p-4 sm:p-5 border-l-4 border-l-emerald-500 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ui-fg-subtle">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item.label || tag}
                    </p>
                    <p className="mt-1.5 text-base sm:text-lg font-bold text-ui-fg-base tracking-tight leading-snug">
                      {item.value}
                    </p>
                  </div>
                  {item.description ? (
                    <p className="mt-2 text-xs text-ui-fg-subtle leading-relaxed line-clamp-2">
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
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xsmall-semi text-white"
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
                  href={`/products/${getCanonicalProductSlug(product.handle)}`}
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

        {/* ── Full Protocol Access CTA ── */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white p-6 small:p-8 shadow-xs">
          <div className="flex flex-col gap-6 medium:flex-row medium:items-center medium:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Customer Research Hub
                </p>
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900 small:text-2xl">
                Unlock Full Protocol &amp; Titration Schedules
              </h2>
              <ul className="mt-4 grid gap-2">
                {[
                  "Complete dosage schedules & titration steps",
                  "Automated dose calendar & routine tracking",
                  "Private vial hub & encrypted research journal",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <span
                      className="mt-0.5 shrink-0 font-bold text-emerald-600"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Automatically unlocked for customers with a verified compound order.
              </p>
            </div>
            <div className="shrink-0">
              <LocalizedClientLink
                href="/account/research-hub"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500"
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
