import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { ResearchAgreementForm } from "../agreement-form"
import type { ResearchAgreementBundle, ResearchAgreementFormValue, ResearchAgreementListResponse } from "../types"

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
  const query = useQuery({
    queryKey: ["research-agreements"],
    queryFn: () => sdk.client.fetch<ResearchAgreementListResponse>("/admin/research-agreements"),
  })
  const bundle = query.data?.agreement_bundles.find((item) => item.id === agreementId)
  const [form, setForm] = useState<ResearchAgreementFormValue | null>(null)
  useEffect(() => { if (bundle) setForm(toForm(bundle)) }, [bundle?.id])
  const save = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/research-agreements/${agreementId}`, { method: "POST", body: { ...form!, effective_at: new Date(form!.effective_at).toISOString() } }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["research-agreements"] }); toast.success("Agreement draft saved") },
    onError: (error) => toast.error(error.message || "Agreement could not be saved"),
  })
  const publish = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/research-agreements/${agreementId}/publish`, { method: "POST" }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["research-agreements"] }); toast.success("Agreement published") },
    onError: (error) => toast.error(error.message || "Agreement could not be published"),
  })

  if (query.isLoading || !form || !bundle) return <Container className="px-6 py-8"><Text>Loading agreement…</Text></Container>
  const editable = bundle.status === "draft" || bundle.status === "scheduled"
  return (
    <div className="flex flex-col gap-4">
      <Container className="flex items-start justify-between gap-4 px-6 py-4">
        <div><div className="flex items-center gap-2"><Heading>Agreement {bundle.public_version}</Heading><Badge color={bundle.status === "active" ? "green" : "orange"}>{bundle.status}</Badge></div><Text size="small" className="mt-1 text-ui-fg-subtle">{query.data?.acceptance_counts[bundle.id] || 0} recorded acceptances</Text></div>
        <div className="flex gap-2"><Button asChild size="small" variant="secondary"><Link to="/research-agreements">Back</Link></Button>{editable ? <Button size="small" isLoading={publish.isPending} onClick={() => publish.mutate()}>Publish</Button> : null}</div>
      </Container>
      <Container className="px-6 py-4">
        {editable ? <ResearchAgreementForm value={form} onChange={setForm} onSave={() => save.mutate()} saving={save.isPending} /> : <div className="space-y-4"><Text>Published bundles are immutable. Create a new agreement version to make changes.</Text><a className="text-ui-fg-interactive underline" href={bundle.terms_url} target="_blank" rel="noreferrer">Open Terms</a><br/><a className="text-ui-fg-interactive underline" href={bundle.privacy_url} target="_blank" rel="noreferrer">Open Privacy Policy</a><br/><a className="text-ui-fg-interactive underline" href={bundle.research_hub_url} target="_blank" rel="noreferrer">Open Research Hub agreement</a></div>}
      </Container>
    </div>
  )
}

export default ResearchAgreementDetailsPage
