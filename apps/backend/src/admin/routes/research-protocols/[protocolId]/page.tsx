import { Spinner } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { ProtocolEditorFields } from "../../compounded-products/protocol-editor-fields"
import type { ResearchProtocolDetailResponse, ResearchProtocolMutationBody } from "../../compounded-products/research-protocol-types"
import { CompatibleProducts } from "../compatible-products"
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
        <Container className="px-6 py-4"><ProtocolEditorFields value={form} onChange={setForm} disabled={!draft} /></Container>
        <div className="flex flex-col gap-y-4">
          <Container className="flex flex-col gap-y-4 px-6 py-4"><CompatibleProducts protocolId={protocolId} /></Container>
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
