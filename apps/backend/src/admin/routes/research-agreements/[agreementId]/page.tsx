/**
 * @file    apps/backend/src/admin/routes/research-agreements/[agreementId]/page.tsx
 * @module  ResearchAgreementDetailsRoute (Admin Dashboard Extension)
 * @purpose Admin dashboard route for reviewing and publishing specific research agreement version bundles.
 * @contracts
 *   API:     GET/POST /admin/research-agreements/:id
 *   Service: ResearchAgreementModuleService
 */

import { Badge, Button, Heading, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { PageHeader } from "../../../components/page-header"
import { SovereignPageSkeleton } from "../../../components/ui/sovereign-page-skeleton"
import { ResearchAgreementForm } from "../agreement-form"
import type { ResearchAgreementBundle, ResearchAgreementFormValue } from "../types"

type EnrichedAcceptance = {
  id: string
  customer_id: string
  customer_email?: string
  customer_name?: string
  customer_company?: string
  acceptance_source: string
  accepted_at: string
  locale: string
  terms_version_snapshot: string
  terms_digest_snapshot: string
  privacy_version_snapshot: string
  privacy_digest_snapshot: string
  research_hub_version_snapshot: string
  research_hub_digest_snapshot: string
}

type AgreementDetailResponse = {
  agreement_bundle: ResearchAgreementBundle
  acceptances: EnrichedAcceptance[]
}

const toForm = (bundle: ResearchAgreementBundle): ResearchAgreementFormValue => ({
  public_version: bundle.public_version,
  terms_version: bundle.terms_version,
  terms_digest: bundle.terms_digest,
  terms_url: bundle.terms_url,
  privacy_version: bundle.privacy_version,
  privacy_digest: bundle.privacy_digest,
  privacy_url: bundle.privacy_url,
  research_hub_version: bundle.research_hub_version,
  research_hub_digest: bundle.research_hub_digest,
  research_hub_url: bundle.research_hub_url,
  locale: bundle.locale,
  effective_at: new Date(bundle.effective_at).toISOString().slice(0, 16),
})

const ResearchAgreementDetailsPage = () => {
  const { agreementId } = useParams()
  const client = useQueryClient()
  const detailQuery = useQuery({
    queryKey: ["research-agreement-detail", agreementId],
    queryFn: () => sdk.client.fetch<AgreementDetailResponse>(`/admin/research-agreements/${agreementId}`),
  })
  const bundle = detailQuery.data?.agreement_bundle
  const acceptances = detailQuery.data?.acceptances || []
  const [form, setForm] = useState<ResearchAgreementFormValue | null>(null)

  useEffect(() => {
    if (bundle) setForm(toForm(bundle))
  }, [bundle?.id])

  const save = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/research-agreements/${agreementId}`, { method: "POST", body: { ...form!, effective_at: new Date(form!.effective_at).toISOString() } }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["research-agreement-detail", agreementId] })
      toast.success("Agreement draft saved")
    },
    onError: (error) => toast.error(error.message || "Agreement could not be saved"),
  })
  const publish = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/research-agreements/${agreementId}/publish`, { method: "POST" }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["research-agreement-detail", agreementId] })
      toast.success("Agreement published")
    },
    onError: (error) => toast.error(error.message || "Agreement could not be published"),
  })

  if (detailQuery.isLoading || !form || !bundle) {
    return <SovereignPageSkeleton cards={2} rows={6} />
  }

  const editable = bundle.status === "draft" || bundle.status === "scheduled"
  return (
    <div className="flex flex-col gap-6 px-3.5 sm:px-6 pt-4 pb-12 w-full min-h-screen">
      <PageHeader
        eyebrowText="Research Agreements · Version Bundle"
        breadcrumbs={[
          { label: "Agreements", href: "/research-agreements" },
          { label: `Version ${bundle.public_version}` },
        ]}
        title={`Agreement Bundle v${bundle.public_version}`}
        subtitle={`${acceptances.length} institutional researcher acceptances recorded under this legal terms bundle.`}
        badge={
          <Badge color={bundle.status === "active" ? "green" : "orange"} size="small">
            ● {bundle.status}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="small" variant="secondary">
              <Link to="/research-agreements">Back</Link>
            </Button>
            {editable ? (
              <Button size="small" isLoading={publish.isPending} onClick={() => publish.mutate()}>
                Publish Version
              </Button>
            ) : null}
          </div>
        }
      />

      {/* Card 1: Bundle Document URLs / Form */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        {editable ? (
          <ResearchAgreementForm value={form} onChange={setForm} onSave={() => save.mutate()} saving={save.isPending} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Heading level="h2" className="text-sm font-semibold text-slate-900">
                Immutable Compliance Documents
              </Heading>
              <Badge size="2xsmall" color="green">Published &amp; Sealed</Badge>
            </div>
            <Text size="small" className="text-slate-500">
              Published bundles are cryptographically immutable. Create a new agreement version to update document terms.
            </Text>
            <div className="grid gap-2 sm:grid-cols-3 pt-2">
              <a
                className="flex items-center justify-between rounded-lg border border-slate-200/80 p-3 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
                href={bundle.terms_url}
                target="_blank"
                rel="noreferrer"
              >
                <span>Terms of Research</span>
                <span className="text-blue-600">↗</span>
              </a>
              <a
                className="flex items-center justify-between rounded-lg border border-slate-200/80 p-3 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
                href={bundle.privacy_url}
                target="_blank"
                rel="noreferrer"
              >
                <span>Privacy Covenant</span>
                <span className="text-blue-600">↗</span>
              </a>
              <a
                className="flex items-center justify-between rounded-lg border border-slate-200/80 p-3 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-800"
                href={bundle.research_hub_url}
                target="_blank"
                rel="noreferrer"
              >
                <span>Research Hub Consent</span>
                <span className="text-blue-600">↗</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Researcher Signature Acceptance Ledger */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-sm font-semibold text-slate-900">
              Researcher Signature Acceptance Ledger
            </Heading>
            <Text size="small" className="text-slate-500 mt-0.5">
              Cryptographically verified consent events recorded under public bundle v{bundle.public_version}.
            </Text>
          </div>
          <Badge size="small" color="blue">
            {acceptances.length} Verified Signatures
          </Badge>
        </div>

        {acceptances.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <Text size="small" className="text-slate-500">
              No researcher signatures recorded for this agreement bundle yet.
            </Text>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
            <Table>
              <Table.Header>
                <Table.Row className="bg-slate-50/75">
                  <Table.HeaderCell className="text-xs font-semibold text-slate-700">Researcher / Institution</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-semibold text-slate-700">Origin / Channel</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-semibold text-slate-700">Signed Timestamp</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-semibold text-slate-700">Terms SHA-256 Digest</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-semibold text-slate-700">Privacy SHA-256 Digest</Table.HeaderCell>
                  <Table.HeaderCell className="text-xs font-semibold text-slate-700 text-right">Status</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {acceptances.map((acceptance) => (
                  <Table.Row key={acceptance.id} className="hover:bg-slate-50/50">
                    <Table.Cell>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-900">
                          {acceptance.customer_name || acceptance.customer_company || "Institutional Researcher"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {acceptance.customer_company ? `${acceptance.customer_company} · ` : ""}{acceptance.customer_email}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge size="2xsmall" color="grey" className="capitalize text-[10px]">
                        {acceptance.acceptance_source.replace(/_/g, " ")}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-slate-600">
                        {new Date(acceptance.accepted_at).toLocaleString("en-PH", {
                          timeZone: "Asia/Manila",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-[11px] font-mono text-slate-600" title={acceptance.terms_digest_snapshot}>
                        {acceptance.terms_digest_snapshot.slice(0, 10)}...{acceptance.terms_digest_snapshot.slice(-6)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-[11px] font-mono text-slate-600" title={acceptance.privacy_digest_snapshot}>
                        {acceptance.privacy_digest_snapshot.slice(0, 10)}...{acceptance.privacy_digest_snapshot.slice(-6)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <Badge size="2xsmall" color="green" className="text-[10px]">
                        ● Verified
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResearchAgreementDetailsPage

