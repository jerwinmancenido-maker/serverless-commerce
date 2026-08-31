import { retrieveCustomer } from "@lib/data/customer"
import {
  listResearchProtocolComments,
  listResearchProtocolRecommendations,
  retrieveResearchProtocol,
} from "@lib/data/research-protocols"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ProtocolCalculator } from "@modules/research-protocols/calculator"
import CommunityBoard from "@modules/research-protocols/community-board"
import ProductRecommendations from "@modules/research-protocols/product-recommendations"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = { params: Promise<{ handle: string; countryCode: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { handle } = await params; try { const { protocol } = await retrieveResearchProtocol(handle); return { title: protocol.content.compound_name || protocol.title, description: protocol.content.short_introduction || protocol.summary || undefined } } catch { return { title: "Research Protocol" } } }

export default async function ResearchProtocolPage({ params }: Props) {
  const { handle, countryCode } = await params
  const protocol = await retrieveResearchProtocol(handle).then((response) => response.protocol).catch(() => null)
  if (!protocol) notFound()
  const [commentResult, customer, recommendationResult] = await Promise.all([
    listResearchProtocolComments(handle).catch(() => ({ comments: [], count: 0 })),
    retrieveCustomer(),
    listResearchProtocolRecommendations({
      handle,
      placement: "protocol",
      excludeProductIds: protocol.products.map((product) => product.id),
    }).catch(() => ({ recommendations: [] })),
  ])
  const recommendedProducts = recommendationResult.recommendations.length
    ? await listProducts({
        countryCode,
        queryParams: {
          id: recommendationResult.recommendations.map((item) => item.product_id),
          limit: recommendationResult.recommendations.length,
        },
      }).then(({ response }) => response.products).catch(() => [])
    : []
  const recommendedProductById = new Map(
    recommendedProducts.map((product) => [product.id, product])
  )
  const recommendationItems = recommendationResult.recommendations.flatMap(
    (recommendation) => {
      const product = recommendedProductById.get(recommendation.product_id)
      return product ? [{ recommendation, product }] : []
    }
  )
  const content = protocol.content
  const sections = [...content.sections].filter((section) => section.visible).sort((a, b) => a.position - b.position)
  const faqs = [...content.faqs].sort((a, b) => a.position - b.position)
  return <div>
    <div className="border-b border-ui-border-base bg-ui-bg-subtle"><div className="content-container py-12 small:py-16"><p className="text-small-semi uppercase tracking-wider text-ui-fg-interactive">{content.research_use_label}</p><div className="mt-5 flex flex-wrap items-center gap-3"><h1 className="text-3xl-semi text-ui-fg-base">{content.compound_name || protocol.title}</h1>{content.product_format ? <span className="rounded-full bg-ui-bg-base px-3 py-1 text-small-semi">{content.product_format}</span> : null}</div><p className="mt-4 max-w-3xl text-base-regular text-ui-fg-subtle">{content.short_introduction || protocol.summary || content.research_purpose}</p><div className="mt-5 flex flex-wrap gap-3 text-small-regular text-ui-fg-subtle"><span>Revision {protocol.revision}</span>{content.last_reviewed_at ? <span>Reviewed {content.last_reviewed_at}</span> : null}{content.category ? <span>{content.category}</span> : null}</div></div></div>
    <main className="content-container py-10 small:py-14"><LocalizedClientLink href="/research-protocols" className="text-small-semi text-ui-fg-interactive">← Back to protocol directory</LocalizedClientLink>
      <div className="mt-8 grid gap-8 large:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
      {content.quick_reference.length ? <section className="grid gap-3 small:grid-cols-2 large:grid-cols-3">{content.quick_reference.map((item) => <div key={item.key} className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-5"><p className="text-small-semi uppercase tracking-wide text-ui-fg-subtle">{item.label}</p><p className="mt-2 text-large-semi text-ui-fg-base">{item.value}</p>{item.description ? <p className="mt-2 text-small-regular text-ui-fg-subtle">{item.description}</p> : null}{item.evidence_label ? <p className="mt-3 text-xsmall-regular text-ui-fg-muted">{item.evidence_label}</p> : null}</div>)}</section> : null}
      {content.calculator.enabled ? <div className="mt-8"><ProtocolCalculator configuration={content.calculator} /></div> : null}
      {content.protocol_levels.length ? <section className="mt-12"><h2 className="text-2xl-semi text-ui-fg-base">Protocol by level</h2><div className="mt-5 grid gap-4">{content.protocol_levels.map((level) => <article key={level.key} className="overflow-hidden rounded-rounded border border-ui-border-base bg-ui-bg-base"><div className="p-5"><h3 className="text-xl-semi text-ui-fg-base">{level.title}</h3><p className="mt-1 text-small-regular text-ui-fg-subtle">{[level.duration, level.interval].filter(Boolean).join(" · ")}</p>{level.summary ? <p className="mt-3 text-base-regular text-ui-fg-base">{level.summary}</p> : null}</div>{level.rows.length ? <div className="border-t border-ui-border-base">{level.rows.map((row, index) => <div key={`${level.key}-${index}`} className="grid grid-cols-3 gap-3 border-b border-ui-border-base px-5 py-3 last:border-b-0"><span>{row.period}</span><span>{row.amount} {row.unit}</span><span>{row.frequency}</span></div>)}</div> : null}</article>)}</div></section> : null}
      {sections.map((section) => <section key={section.key} className="mt-12 max-w-4xl"><h2 className="text-2xl-semi text-ui-fg-base">{section.title}</h2><p className="mt-4 whitespace-pre-wrap text-base-regular text-ui-fg-subtle">{section.body}</p></section>)}
      {faqs.length ? <section className="mt-12 max-w-4xl"><h2 className="text-2xl-semi text-ui-fg-base">Frequently asked questions</h2><div className="mt-5 grid gap-3">{faqs.map((faq) => <details key={faq.key} className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-5"><summary className="cursor-pointer text-base-semi text-ui-fg-base">{faq.question}</summary><p className="mt-3 whitespace-pre-wrap text-base-regular text-ui-fg-subtle">{faq.answer}</p></details>)}</div></section> : null}
      {content.references.length ? <section className="mt-12 max-w-4xl"><h2 className="text-2xl-semi text-ui-fg-base">References and evidence</h2><ol className="mt-5 grid gap-3">{content.references.map((reference, index) => <li key={`${reference.title}-${index}`} className="rounded-rounded border border-ui-border-base p-4"><p className="text-base-semi">{reference.title}</p>{reference.customer_annotation ? <p className="mt-1 text-small-regular text-ui-fg-subtle">{reference.customer_annotation}</p> : null}{reference.url ? <a href={reference.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-small-semi text-ui-fg-interactive">Open source ↗</a> : null}</li>)}</ol></section> : null}
      {protocol.products.length ? <section className="mt-12"><h2 className="text-2xl-semi text-ui-fg-base">Related products</h2><div className="mt-4 flex flex-wrap gap-3">{protocol.products.map((product) => <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} className="rounded-rounded border border-ui-border-base px-4 py-3 text-small-semi">{product.title}</LocalizedClientLink>)}</div></section> : null}
      <ProductRecommendations handle={handle} items={recommendationItems} />
      <div className="mt-12 max-w-4xl rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-5"><p className="text-small-semi">Important information</p><p className="mt-2 text-small-regular text-ui-fg-subtle">{content.disclaimer}</p></div>
      </div>
      <CommunityBoard
        handle={handle}
        comments={commentResult.comments}
        signedIn={Boolean(customer)}
      />
      </div>
    </main>
  </div>
}
