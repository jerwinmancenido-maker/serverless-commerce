import { Spinner } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"

import { sdk } from "../../../../lib/sdk"
import type { ResearchProtocolPreviewResponse } from "../../../compounded-products/research-protocol-types"

const ResearchProtocolPreviewPage = () => {
  const { protocolId = "" } = useParams()
  const query = useQuery({
    queryKey: ["research-protocol-preview", protocolId],
    enabled: Boolean(protocolId),
    queryFn: () => sdk.client.fetch<ResearchProtocolPreviewResponse>(`/admin/research-protocols/${protocolId}/preview`),
  })
  const preview = query.data?.preview
  if (query.isLoading) return <Container className="flex min-h-96 items-center justify-center"><Spinner /></Container>
  if (!preview) return <Container className="px-6 py-4"><Heading>Preview unavailable</Heading></Container>
  const content = preview.content
  return <div className="flex flex-col gap-y-4">
    <Container className="flex items-start justify-between gap-x-4 px-6 py-4"><div><div className="flex items-center gap-x-2"><Heading>{preview.title}</Heading><Badge color={preview.preview_status === "Published guide" ? "green" : "orange"}>{preview.preview_status}</Badge></div><Text size="small" className="text-ui-fg-subtle">Customer preview · Revision {preview.revision}</Text></div><Button asChild size="small" variant="secondary"><Link to={`/research-protocols/${protocolId}`}>Back to editor</Link></Button></Container>
    <Container className="flex flex-col gap-y-8 px-6 py-6">
      <div className="flex flex-col gap-y-3"><Text size="small" weight="plus" className="uppercase tracking-wide text-ui-fg-interactive">{content.research_use_label}</Text><Heading level="h1">{content.compound_name || preview.title}</Heading>{content.product_format ? <Badge>{content.product_format}</Badge> : null}<Text>{content.short_introduction || preview.summary || content.research_purpose}</Text></div>
      {content.quick_reference.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{content.quick_reference.map((item) => <div key={item.key} className="rounded-lg border border-ui-border-base p-4"><Text size="xsmall" weight="plus" className="uppercase text-ui-fg-subtle">{item.label}</Text><Text size="large" weight="plus">{item.value}</Text>{item.description ? <Text size="small" className="text-ui-fg-subtle">{item.description}</Text> : null}</div>)}</div> : null}
      {content.protocol_levels.length ? <section className="flex flex-col gap-y-4"><Heading level="h2">Protocol levels</Heading>{content.protocol_levels.map((level) => <div key={level.key} className="rounded-lg border border-ui-border-base p-4"><Text weight="plus">{level.title}</Text><Text size="small" className="text-ui-fg-subtle">{[level.duration, level.interval].filter(Boolean).join(" · ")}</Text>{level.summary ? <Text size="small">{level.summary}</Text> : null}<div className="mt-3 flex flex-col gap-y-2">{level.rows.map((row, index) => <div key={`${level.key}-${index}`} className="grid grid-cols-3 gap-3 rounded-lg bg-ui-bg-subtle p-3"><Text size="small">{row.period}</Text><Text size="small">{row.amount} {row.unit}</Text><Text size="small">{row.frequency}</Text></div>)}</div></div>)}</section> : null}
      {content.sections.filter((section) => section.visible).sort((a, b) => a.position - b.position).map((section) => <section key={section.key} className="flex flex-col gap-y-2"><Heading level="h2">{section.title}</Heading><Text className="whitespace-pre-wrap">{section.body}</Text></section>)}
      {content.faqs.length ? <section className="flex flex-col gap-y-3"><Heading level="h2">Frequently asked questions</Heading>{[...content.faqs].sort((a, b) => a.position - b.position).map((faq) => <div key={faq.key} className="rounded-lg border border-ui-border-base p-4"><Text weight="plus">{faq.question}</Text><Text size="small" className="mt-1 whitespace-pre-wrap">{faq.answer}</Text></div>)}</section> : null}
      <section className="flex flex-col gap-y-2"><Heading level="h2">References and evidence</Heading>{content.references.map((reference, index) => <Text key={`${reference.title}-${index}`} size="small">{reference.title}{reference.customer_annotation ? ` — ${reference.customer_annotation}` : ""}</Text>)}</section>
      <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4"><Text size="small" weight="plus">Important information</Text><Text size="small">{content.disclaimer}</Text></div>
    </Container>
  </div>
}

export default ResearchProtocolPreviewPage
