/**
 * @file    apps/backend/src/admin/routes/research-protocols/[protocolId]/page.tsx
 * @module  ResearchProtocolDetailRoute (Admin Dashboard Extension)
 * @purpose Admin dashboard route for research protocol detail, clinical dosage schedule, and publication editor.
 * @contracts
 *   API:     GET/POST /admin/research-protocols/:id/*
 *   Service: ResearchProtocolModuleService
 */

import { EllipsisHorizontal, PencilSquare, Spinner } from "@medusajs/icons"
import { Badge, Button, DropdownMenu, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { SovereignPageSkeleton } from "../../../components/ui/sovereign-page-skeleton"
import { SovereignEmptyState } from "../../../components/ui/sovereign-empty-state"
import { PageHeader } from "../../../components/page-header"
import { ProtocolEditorFields } from "../../compounded-products/protocol-editor-fields"
import type { ResearchProtocolDetailResponse, ResearchProtocolMutationBody, ResearchProtocolRevision } from "../../compounded-products/research-protocol-types"
import { CompatibleProducts } from "../compatible-products"
import { ProductMerchandising } from "../product-merchandising"
import { CommunityModeration } from "../community-moderation"
import { ProtocolVisibility } from "../protocol-visibility"
import { evaluatePublicationReadiness } from "../readiness-evaluator"

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
          {content.protocol_category_type === "blend" ? (
            <Badge color="purple">Multi-Peptide Blend</Badge>
          ) : (
            <Badge color="blue">Single Peptide</Badge>
          )}
          {content.product_format ? <Badge>{content.product_format}</Badge> : null}
          {content.category ? <Badge>{content.category}</Badge> : null}
          {content.purity_standard ? (
            <Badge color="green">Release Purity: {content.purity_standard}</Badge>
          ) : null}
          {content.last_reviewed_at ? (
            <Badge>Reviewed {content.last_reviewed_at}</Badge>
          ) : null}
        </div>
      </div>

      {content.full_description ? (
        <div className="rounded-lg border border-ui-border-base p-4 bg-ui-bg-subtle/40">
          <Heading level="h3" className="text-sm font-bold text-ui-fg-base mb-1">
            Pharmacological Monograph & Mechanism of Action
          </Heading>
          <Text size="small" className="whitespace-pre-wrap text-ui-fg-subtle leading-relaxed">
            {content.full_description}
          </Text>
        </div>
      ) : null}

      {(content.investigated_benefits?.length || content.adverse_observations?.length) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {content.investigated_benefits?.length ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4">
              <Heading level="h3" className="text-sm font-bold text-blue-950 mb-2">
                Investigated Research Actions
              </Heading>
              <ul className="list-disc pl-4 space-y-1 text-xs text-blue-900">
                {content.investigated_benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {content.adverse_observations?.length ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4">
              <Heading level="h3" className="text-sm font-bold text-amber-950 mb-2">
                Adverse Observations & Handling Precautions
              </Heading>
              <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900">
                {content.adverse_observations.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {content.molecular_details ? (
        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h3" className="text-sm font-bold text-ui-fg-base mb-2">
            Molecular Identity & Structure
          </Heading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
            <div><span className="text-ui-fg-subtle block text-[10px]">CAS Number</span><span className="font-semibold">{content.molecular_details.cas_number || "—"}</span></div>
            <div><span className="text-ui-fg-subtle block text-[10px]">PubChem CID</span><span className="font-semibold">{content.molecular_details.pubchem_cid || "—"}</span></div>
            <div><span className="text-ui-fg-subtle block text-[10px]">Formula / Sequence</span><span className="font-semibold truncate block max-w-full">{content.molecular_details.sequence_or_formula || "—"}</span></div>
            <div><span className="text-ui-fg-subtle block text-[10px]">Molecular Weight</span><span className="font-semibold">{content.molecular_details.molecular_weight_g_per_mol ? `${content.molecular_details.molecular_weight_g_per_mol} g/mol` : "—"}</span></div>
          </div>
        </div>
      ) : null}

      {content.reconstitution_details ? (
        <div className="rounded-lg border border-ui-border-base p-4">
          <Heading level="h3" className="text-sm font-bold text-ui-fg-base mb-2">
            Laboratory Reconstitution Parameters
          </Heading>
          <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs mb-3">
            <div><span className="text-ui-fg-subtle block text-[10px]">Vial Net Mass</span><span className="font-semibold">{content.reconstitution_details.default_vial_net_mg} mg</span></div>
            <div><span className="text-ui-fg-subtle block text-[10px]">Diluent Volume</span><span className="font-semibold">{content.reconstitution_details.default_diluent_ml} mL</span></div>
            <div><span className="text-ui-fg-subtle block text-[10px]">Target Concentration</span><span className="font-semibold">{content.reconstitution_details.resulting_concentration_mg_per_ml} mg/mL</span></div>
          </div>
          <div className="text-xs space-y-1 text-ui-fg-subtle">
            <div><strong className="text-ui-fg-base font-medium">Solvent:</strong> {content.reconstitution_details.solvent}</div>
            <div><strong className="text-ui-fg-base font-medium">Dissolution Method:</strong> {content.reconstitution_details.dissolution_method}</div>
            <div><strong className="text-ui-fg-base font-medium">Handling Rule:</strong> {content.reconstitution_details.handling_rule}</div>
          </div>
        </div>
      ) : null}

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

const PublicationReadinessCard = ({
  content,
}: {
  content: Partial<ResearchProtocolMutationBody["content"]> | null | undefined
}) => {
  const evaluation = useMemo(
    () => evaluatePublicationReadiness(content as any),
    [content],
  )

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex flex-col gap-y-0.5">
          <Text size="small" leading="compact" weight="plus">
            Publication Readiness
          </Text>
          <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
            {evaluation.passedCount} of {evaluation.totalCount} criteria satisfied
          </Text>
        </div>
        <Badge
          size="small"
          color={evaluation.isReady ? "green" : "orange"}
        >
          {evaluation.isReady ? "Ready to Publish" : "Incomplete Draft"}
        </Badge>
      </div>

      <div className="flex flex-col gap-y-1.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle/30 p-2.5">
        {evaluation.checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-x-2 py-0.5 text-xs"
          >
            <div className="flex items-center gap-x-2 min-w-0">
              <span
                className={`inline-block size-1.5 rounded-full shrink-0 ${
                  item.passed ? "bg-blue-600" : "bg-amber-400"
                }`}
              />
              <span
                className={
                  item.passed
                    ? "text-ui-fg-base"
                    : "text-ui-fg-muted"
                }
              >
                {item.label}
              </span>
            </div>
            <span
              className={`font-mono text-[10px] ${
                item.passed ? "text-blue-700" : "text-amber-700 font-semibold"
              }`}
            >
              {item.passed ? "Passed" : "Missing"}
            </span>
          </div>
        ))}
      </div>

      {evaluation.isReady ? (
        <Text size="xsmall" className="text-blue-800">
          All mandatory monograph publication requirements are satisfied.
        </Text>
      ) : (
        <Text size="xsmall" className="text-ui-fg-subtle">
          Complete the missing monograph sections above before publishing.
        </Text>
      )}
    </div>
  )
}

const ResearchProtocolEditorPage = () => {
  const { protocolId = "" } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ResearchProtocolMutationBody | null>(null)
  const [decisionReason, setDecisionReason] = useState("")
  const [showReasonInput, setShowReasonInput] = useState(false)
  const [pendingAction, setPendingAction] = useState<"publish" | "revision" | "withdraw" | "archive" | null>(null)

  const protocolQuery = useQuery({
    queryKey: ["research-protocol", protocolId],
    enabled: Boolean(protocolId),
    queryFn: () => sdk.client.fetch<ResearchProtocolDetailResponse>(`/admin/research-protocols/${protocolId}`),
  })
  const protocol = protocolQuery.data?.protocol
  const draft = useMemo(() => protocol?.revisions.find((revision) => revision.status === "draft"), [protocol?.revisions])
  const published = useMemo(() => protocol?.revisions.find((revision) => revision.status === "published"), [protocol?.revisions])
  const displayedRevision = draft || published || protocol?.revisions[0]

  const readiness = useMemo(
    () => evaluatePublicationReadiness(form?.content as any),
    [form?.content],
  )

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
    onSuccess: async () => { setDecisionReason(""); setShowReasonInput(false); setPendingAction(null); toast.success("Research guide published"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Guide could not be published")),
  })

  const revisionMutation = useMutation({
    mutationFn: (customReason?: string | void) => {
      const reasonToUse = (typeof customReason === "string" && customReason.trim()) || decisionReason.trim() || "Monograph content update"
      if (reasonToUse.length < 3) throw new Error("Enter a revision reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/revisions`, { method: "POST", body: { reason: reasonToUse } })
    },
    onSuccess: async () => { setDecisionReason(""); setShowReasonInput(false); setPendingAction(null); toast.success("New draft revision created"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Draft revision could not be created")),
  })

  const withdrawMutation = useMutation({
    mutationFn: () => {
      if (!published) throw new Error("There is no published revision to withdraw")
      if (decisionReason.trim().length < 3) throw new Error("Enter a withdrawal reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/withdraw`, { method: "POST", body: { revision_id: published.id, reason: decisionReason.trim() } })
    },
    onSuccess: async () => { setDecisionReason(""); setShowReasonInput(false); setPendingAction(null); toast.success("Published guide withdrawn"); await refresh() },
    onError: (error) => toast.error(messageFromError(error, "Guide could not be withdrawn")),
  })

  const archiveMutation = useMutation({
    mutationFn: () => {
      if (decisionReason.trim().length < 3) throw new Error("Enter an archive reason of at least 3 characters")
      return sdk.client.fetch(`/admin/research-protocols/${protocolId}/archive`, { method: "POST", body: { reason: decisionReason.trim() } })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["research-protocols"] })
      toast.success("Research guide archived. Revisions and product history were preserved.")
      navigate("/research-protocols")
    },
    onError: (error) => toast.error(messageFromError(error, "Guide could not be archived")),
  })

  const triggerAction = (action: "publish" | "revision" | "withdraw" | "archive") => {
    setPendingAction(action)
    setShowReasonInput(true)
    setDecisionReason(action === "revision" ? "Monograph content update" : "")
  }

  const confirmAction = () => {
    if (pendingAction === "publish") publishMutation.mutate()
    else if (pendingAction === "revision") revisionMutation.mutate()
    else if (pendingAction === "withdraw") withdrawMutation.mutate()
    else if (pendingAction === "archive") archiveMutation.mutate()
  }

  const cancelAction = () => {
    setShowReasonInput(false)
    setPendingAction(null)
    setDecisionReason("")
  }

  const isMutating =
    saveMutation.isPending ||
    publishMutation.isPending ||
    revisionMutation.isPending ||
    withdrawMutation.isPending ||
    archiveMutation.isPending

  if (protocolQuery.isLoading || !form) {
    return <SovereignPageSkeleton cards={4} rows={10} />
  }
  if (protocolQuery.isError || !protocol || !displayedRevision) {
    return (
      <div className="p-8">
        <SovereignEmptyState
          heading="Research guide unavailable"
          subtext="The research guide could not be resolved from Medusa backend services."
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-8 px-6 pt-6">
      {/* ── Top Header ── */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2">
              <Heading>{displayedRevision.title}</Heading>
              <Badge color={draft ? (readiness.isReady ? "green" : "orange") : published ? "green" : "grey"}>
                {draft
                  ? `Draft r${draft.revision} (${readiness.isReady ? "Ready" : `${readiness.totalCount - readiness.passedCount} missing`})`
                  : published
                  ? `Published r${published.revision}`
                  : displayedRevision.status}
              </Badge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {protocol.protocol_key} · {protocol.product_links.length} compatible product{protocol.product_links.length === 1 ? "" : "s"}
              {published && !draft ? " · Published revisions are immutable" : ""}
            </Text>
          </div>

          <div className="flex items-center gap-x-2">
            <Button asChild size="small" variant="secondary">
              <Link to={`/research-protocols/${protocolId}/preview`}>Preview customer view</Link>
            </Button>

            {draft ? (
              <>
                <Button
                  size="small"
                  variant="secondary"
                  isLoading={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  Save draft
                </Button>
                <Button
                  size="small"
                  disabled={isMutating}
                  onClick={() => triggerAction("publish")}
                >
                  Publish
                </Button>
              </>
            ) : (
              <Button
                size="small"
                disabled={isMutating}
                isLoading={revisionMutation.isPending}
                onClick={() => revisionMutation.mutate("Monograph content update")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PencilSquare className="mr-1.5 size-3.5" /> Edit Protocol
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button size="small" variant="secondary" className="px-2">
                  <EllipsisHorizontal className="size-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="w-48">
                <DropdownMenu.Item asChild className="gap-x-2">
                  <Link to="/research-protocols">All guides</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                {published && !draft ? (
                  <DropdownMenu.Item
                    className="gap-x-2 !text-ui-fg-error"
                    onClick={() => triggerAction("withdraw")}
                    disabled={isMutating}
                  >
                    Withdraw published revision
                  </DropdownMenu.Item>
                ) : null}
                <DropdownMenu.Item
                  className="gap-x-2 !text-ui-fg-error"
                  onClick={() => triggerAction("archive")}
                  disabled={isMutating}
                >
                  Archive guide
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Contextual Reason Prompt ── */}
      {showReasonInput && pendingAction ? (
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
          <div className="flex flex-col gap-y-3">
            <Text size="small" weight="plus">
              {pendingAction === "revision" && "Create new draft revision"}
              {pendingAction === "publish" && "Publish this revision"}
              {pendingAction === "withdraw" && "Withdraw the published revision"}
              {pendingAction === "archive" && "Archive this guide"}
            </Text>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-1 min-w-60 flex-col gap-y-1">
                <Label size="small">Reason</Label>
                <Input
                  size="small"
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Briefly describe the reason…"
                  autoFocus
                />
              </div>
              <div className="flex shrink-0 gap-x-2">
                <Button size="small" variant="secondary" onClick={cancelAction}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant={pendingAction === "withdraw" || pendingAction === "archive" ? "danger" : "primary"}
                  disabled={decisionReason.trim().length < 3}
                  isLoading={isMutating}
                  onClick={confirmAction}
                >
                  {pendingAction === "revision" ? "Create draft"
                    : pendingAction === "publish" ? "Publish"
                    : pendingAction === "withdraw" ? "Withdraw"
                    : "Archive"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Main content grid ── */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-y-3">
          {draft ? (
            <div className="sticky top-2 z-10 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs backdrop-blur-md">
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
            </div>
          ) : null}
          <div id="overview" className="scroll-mt-24 rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            {draft ? (
              <ProtocolEditorFields value={form} onChange={setForm} />
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-blue-200/80 bg-blue-50/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-blue-950">Active Published Monograph (Read-Only)</span>
                    <span className="text-[11px] text-blue-800">
                      To modify dosages, reconstitution parameters, molecular specs, or guidance sections, initiate a working revision.
                    </span>
                  </div>
                  <Button
                    size="small"
                    disabled={isMutating}
                    isLoading={revisionMutation.isPending}
                    onClick={() => revisionMutation.mutate("Monograph content update")}
                    className="shrink-0 h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                  >
                    <PencilSquare className="mr-1.5 size-3.5" /> Start Editing Protocol
                  </Button>
                </div>
                <PublishedProtocolDocument revision={displayedRevision} />
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar (readiness checklist, compatible products, merchandising, visibility, history) ── */}
        <div className="flex flex-col gap-y-4">
          {draft ? (
            <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
              <PublicationReadinessCard content={form?.content} />
            </div>
          ) : null}
          <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs"><CompatibleProducts protocolId={protocolId} /></div>
          <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs"><ProductMerchandising protocolId={protocolId} /></div>
          <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs"><ProtocolVisibility protocolId={protocolId} content={displayedRevision.content} /></div>
          <div className="flex flex-col gap-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs"><CommunityModeration protocolId={protocolId} compact /></div>

          {/* Revision history */}
          <div className="flex flex-col gap-y-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <Text size="small" leading="compact" weight="plus">Revision history</Text>
            {protocol.revisions.map((revision) => (
              <div key={revision.id} className="flex items-center justify-between gap-x-3">
                <div>
                  <Text size="small">Revision {revision.revision}</Text>
                  <Text size="small" className="text-ui-fg-subtle">{new Date(revision.updated_at).toLocaleString()}</Text>
                </div>
                <Badge color={revision.status === "published" ? "green" : revision.status === "draft" ? "orange" : "grey"}>{revision.status}</Badge>
              </div>
            ))}
          </div>

          {/* Activity history */}
          <div className="flex flex-col gap-y-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex flex-col gap-y-1">
              <Text size="small" leading="compact" weight="plus">Activity history</Text>
              <Text size="small" leading="compact" className="text-ui-fg-subtle">Immutable protocol and product-link decisions.</Text>
            </div>
            {protocol.audit_events.length ? protocol.audit_events.map((event) => (
              <div key={event.id} className="flex flex-col gap-y-1 rounded-lg border border-ui-border-base p-3">
                <div className="flex items-center justify-between gap-x-3">
                  <Text size="small" weight="plus">{auditLabels[event.event_type] || "Protocol activity"}</Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">{new Date(event.created_at).toLocaleString()}</Text>
                </div>
                {event.reason ? <Text size="small" className="text-ui-fg-subtle">{event.reason}</Text> : null}
              </div>
            )) : <Text size="small" className="text-ui-fg-subtle">No activity recorded yet.</Text>}
          </div>

        </div>
      </div>
    </div>
  )
}

export default ResearchProtocolEditorPage
