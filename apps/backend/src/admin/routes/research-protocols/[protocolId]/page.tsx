import { Spinner } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { ProtocolEditorFields } from "../../compounded-products/protocol-editor-fields"
import type { ResearchProtocolDetailResponse, ResearchProtocolMutationBody, ResearchProtocolRevision } from "../../compounded-products/research-protocol-types"
import { CompatibleProducts } from "../compatible-products"
import { ProductMerchandising } from "../product-merchandising"
import { CommunityComments } from "../community-comments"

const messageFromError = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback

const auditLabels: Record<string, string> = {
  series_created: "Protocol created",
  draft_updated: "Draft updated",
  revision_created: "Draft revision created",
  publication_readiness_evaluated: "Publication readiness evaluated",
  revision_published: "Revision published",
  revision_withdrawn: "Revision withdrawn",
  product_linked: "Compatible product linked",
  product_link_updated: "Product compatibility updated",
  product_unlinked: "Compatible product unlinked",
  primary_protocol_changed: "Primary guide changed",
  series_archived: "Protocol archived",
}

const PublishedProtocolDocument = ({
  revision,
}: {
  revision: ResearchProtocolRevision
}) => {
  const content = revision.content
  const visibleSections = content.sections
    .filter((section) => section.visible)
    .sort((left, right) => left.position - right.position)

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <Text size="large" weight="plus">
          {content.compound_name || revision.title}
        </Text>
        {content.short_introduction ? (
          <Text className="max-w-3xl text-ui-fg-subtle">
            {content.short_introduction}
          </Text>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {content.product_format ? <Badge>{content.product_format}</Badge> : null}
          {content.category ? <Badge>{content.category}</Badge> : null}
          {content.last_reviewed_at ? (
            <Badge>Reviewed {content.last_reviewed_at}</Badge>
          ) : null}
        </div>
      </div>

      {content.protocol_levels.length ? (
        <section className="flex flex-col gap-y-3">
          <div>
            <Heading level="h2">Dosage schedule</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Published structured schedule shown in the customer experience.
            </Text>
          </div>
          {content.protocol_levels.map((level) => (
            <div key={level.key} className="overflow-hidden rounded-lg border border-ui-border-base">
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <Text weight="plus">{level.title}</Text>
                  <Text size="small" className="text-ui-fg-subtle">
                    {[level.duration, level.interval].filter(Boolean).join(" · ")}
                  </Text>
                </div>
                {level.routine_enabled ? <Badge color="blue">Routine ready</Badge> : null}
              </div>
              {level.rows.length ? (
                <div className="border-t border-ui-border-base">
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 bg-ui-bg-subtle px-4 py-2">
                    <Text size="xsmall" weight="plus">Period</Text>
                    <Text size="xsmall" weight="plus">Amount</Text>
                    <Text size="xsmall" weight="plus">Frequency</Text>
                    <Text size="xsmall" weight="plus">Suggested time</Text>
                  </div>
                  {level.rows.map((row, index) => (
                    <div key={row.row_key || `${level.key}-${index}`} className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 border-t border-ui-border-base px-4 py-3 first:border-t-0">
                      <Text size="small">{row.period}</Text>
                      <Text size="small">{row.amount} {row.unit}</Text>
                      <Text size="small">{row.frequency}</Text>
                      <Text size="small">{row.suggested_local_times?.join(", ") || "Flexible"}</Text>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {content.quick_reference.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {content.quick_reference.map((item) => (
            <div key={item.key} className="rounded-lg border border-ui-border-base p-4">
              <Text size="small" className="text-ui-fg-subtle">{item.label}</Text>
              <Text weight="plus">{item.value}</Text>
              {item.description ? <Text size="small">{item.description}</Text> : null}
            </div>
          ))}
        </section>
      ) : null}

      {visibleSections.length ? (
        <section className="flex flex-col gap-y-4">
          <Heading level="h2">Preparation and guidance</Heading>
          {visibleSections.map((section) => (
            <div key={section.key} className="rounded-lg border border-ui-border-base p-4">
              <Text weight="plus">{section.title}</Text>
              <Text size="small" className="mt-2 whitespace-pre-wrap text-ui-fg-subtle">{section.body}</Text>
            </div>
          ))}
        </section>
      ) : null}

      <div className="rounded-lg bg-ui-bg-subtle p-4">
        <Text size="small">{content.disclaimer}</Text>
      </div>
    </div>
  )
}

const ResearchProtocolEditorPage = () => {
  const { protocolId = "" } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ResearchProtocolMutationBody | null>(null)
  const [decisionReason, setDecisionReason] = useState("")
  const protocolQuery = useQuery({
    queryKey: ["research-protocol", protocolId],
    enabled: Boolean(protocolId),
    queryFn: () => sdk.client.fetch<ResearchProtocolDetailResponse>(`/admin/research-protocols/${protocolId}`),
  })
  const protocol = protocolQuery.data?.protocol
  const draft = useMemo(() => protocol?.revisions.find((revision) => revision.status === "draft"), [protocol?.revisions])
  const published = useMemo(() => protocol?.revisions.find((revision) => revision.status === "published"), [protocol?.revisions])
  const displayedRevision = draft || published || protocol?.revisions[0]
  useEffect(() => {
    if (!protocol || !displayedRevision) return
    setForm({ title: displayedRevision.title, summary: displayedRevision.summary, purpose: protocol.purpose, evidence_scope: displayedRevision.evidence_scope, content: displayedRevision.content })
  }, [displayedRevision, protocol])
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["research-protocol", protocolId] }),
      queryClient.invalidateQueries({ queryKey: ["research-protocol-preview", protocolId] }),
      queryClient.invalidateQueries({ queryKey: ["research-protocols"] }),
    ])
  }
  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form || !draft) throw new Error("Create a draft revision before editing")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}`, { method: "POST", body: form })
    },
    onSuccess: async () => { toast.success("Research guide draft saved"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Draft could not be saved")),
  })
  const publishMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("There is no draft revision to publish")
      if (decisionReason.trim().length < 3) throw new Error("Enter a publication reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/publish`, { method: "POST", body: { revision_id: draft.id, reason: decisionReason.trim(), effective_at: null } })
    },
    onSuccess: async () => { setDecisionReason(""); toast.success("Research guide published"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Guide could not be published")),
  })
  const revisionMutation = useMutation({
    mutationFn: () => {
      if (decisionReason.trim().length < 3) throw new Error("Enter a revision reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/revisions`, { method: "POST", body: { reason: decisionReason.trim() } })
    },
    onSuccess: async () => { setDecisionReason(""); toast.success("New draft revision created"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Draft revision could not be created")),
  })
  const withdrawMutation = useMutation({
    mutationFn: () => {
      if (!published) throw new Error("There is no published revision to withdraw")
      if (decisionReason.trim().length < 3) throw new Error("Enter a withdrawal reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/withdraw`, { method: "POST", body: { revision_id: published.id, reason: decisionReason.trim() } })
    },
    onSuccess: async () => { setDecisionReason(""); toast.success("Published guide withdrawn"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Guide could not be withdrawn")),
  })
  const archiveMutation = useMutation({
    mutationFn: () => {
      if (decisionReason.trim().length < 3) throw new Error("Enter an archive reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/archive`, {
        method: "POST",
        body: { reason: decisionReason.trim() },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["research-protocols"] })
      toast.success("Research guide archived. Revisions and product history were preserved.")
      navigate("/research-protocols")
    },
    onError: (error) => toast.error(messageFromError(error, "Guide could not be archived")),
  })
  if (protocolQuery.isLoading || !form) return <Container className="flex min-h-96 items-center justify-center"><Spinner /></Container>
  if (protocolQuery.isError || !protocol || !displayedRevision) return <Container className="flex flex-col gap-y-2 px-6 py-4"><Heading>Research guide unavailable</Heading><Text size="small" className="text-ui-fg-error">The research guide could not be loaded.</Text></Container>
  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="flex flex-col gap-y-1"><div className="flex items-center gap-x-2"><Heading>{displayedRevision.title}</Heading><Badge color={draft ? "orange" : published ? "green" : "grey"}>{draft ? `Draft r${draft.revision}` : published ? `Published r${published.revision}` : displayedRevision.status}</Badge></div><Text size="small" className="text-ui-fg-subtle">{protocol.protocol_key} · {protocol.product_links.length} compatible product{protocol.product_links.length === 1 ? "" : "s"}</Text></div>
        <div className="flex gap-x-2"><Button asChild size="small" variant="secondary"><Link to={`/research-protocols/${protocolId}/preview`}>Preview customer view</Link></Button><Button asChild size="small" variant="secondary"><Link to="/research-protocols">All guides</Link></Button></div>
      </Container>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-y-3">
          {draft ? (
            <Container className="sticky top-2 z-10 flex flex-wrap gap-2 px-4 py-3">
              {[
                ["Overview", "#overview"],
                ["Dosage schedule", "#dosage-schedule"],
                ["Calculator", "#calculator"],
                ["Guidance", "#detailed-sections"],
                ["FAQs", "#faqs"],
              ].map(([label, href]) => (
                <Button key={href} asChild size="small" variant="secondary">
                  <a href={href}>{label}</a>
                </Button>
              ))}
            </Container>
          ) : null}
          <Container id="overview" className="scroll-mt-24 px-6 py-4">
            {draft ? (
              <ProtocolEditorFields value={form} onChange={setForm} />
            ) : (
              <PublishedProtocolDocument revision={displayedRevision} />
            )}
          </Container>
        </div>
        <div className="flex flex-col gap-y-4">
          <Container className="flex flex-col gap-y-4 px-6 py-4"><CompatibleProducts protocolId={protocolId} /></Container>
          <Container className="flex flex-col gap-y-4 px-6 py-4"><ProductMerchandising protocolId={protocolId} /></Container>
          <Container className="flex flex-col gap-y-4 px-6 py-4"><CommunityComments protocolId={protocolId} /></Container>
          <Container className="flex flex-col gap-y-4 px-6 py-4">
            <div className="flex flex-col gap-y-1"><Text size="small" leading="compact" weight="plus">Revision controls</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">Published revisions are immutable. Changes require a new draft.</Text></div>
            <div className="flex flex-col gap-y-2"><Label>Decision reason</Label><Input value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} placeholder={draft ? "Why this revision is being published" : "Why a new revision is needed"} /></div>
            {draft ? <><Button size="small" variant="secondary" isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>Save draft</Button><Button size="small" isLoading={publishMutation.isPending} disabled={decisionReason.trim().length < 3} onClick={() => publishMutation.mutate()}>Publish revision</Button></> : <><Button size="small" isLoading={revisionMutation.isPending} disabled={decisionReason.trim().length < 3} onClick={() => revisionMutation.mutate()}>Create new draft revision</Button>{published ? <Button size="small" variant="danger" isLoading={withdrawMutation.isPending} disabled={decisionReason.trim().length < 3} onClick={() => withdrawMutation.mutate()}>Withdraw published revision</Button> : null}</>}
          </Container>
          <Container className="flex flex-col gap-y-3 px-6 py-4"><Text size="small" leading="compact" weight="plus">Revision history</Text>{protocol.revisions.map((revision) => <div key={revision.id} className="flex items-center justify-between gap-x-3"><div><Text size="small">Revision {revision.revision}</Text><Text size="small" className="text-ui-fg-subtle">{new Date(revision.updated_at).toLocaleString()}</Text></div><Badge color={revision.status === "published" ? "green" : revision.status === "draft" ? "orange" : "grey"}>{revision.status}</Badge></div>)}</Container>
          <Container className="flex flex-col gap-y-3 px-6 py-4">
            <div className="flex flex-col gap-y-1"><Text size="small" leading="compact" weight="plus">Activity history</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">Immutable protocol and product-link decisions.</Text></div>
            {protocol.audit_events.length ? protocol.audit_events.map((event) => <div key={event.id} className="flex flex-col gap-y-1 rounded-lg border border-ui-border-base p-3"><div className="flex items-center justify-between gap-x-3"><Text size="small" weight="plus">{auditLabels[event.event_type] || "Protocol activity"}</Text><Text size="xsmall" className="text-ui-fg-subtle">{new Date(event.created_at).toLocaleString()}</Text></div>{event.reason ? <Text size="small" className="text-ui-fg-subtle">{event.reason}</Text> : null}</div>) : <Text size="small" className="text-ui-fg-subtle">No activity recorded yet.</Text>}
          </Container>
          <Container className="flex flex-col gap-y-3 px-6 py-4">
            <div className="flex flex-col gap-y-1"><Text size="small" leading="compact" weight="plus">Advanced lifecycle</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">Archive this guide without deleting revisions, product links, or history.</Text></div>
            <Button size="small" variant="danger" isLoading={archiveMutation.isPending} disabled={decisionReason.trim().length < 3} onClick={() => archiveMutation.mutate()}>Archive guide</Button>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default ResearchProtocolEditorPage
