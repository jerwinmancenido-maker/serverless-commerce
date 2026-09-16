/**
 * @file    apps/backend/src/admin/routes/research-agreements/new/page.tsx
 * @module  NewResearchAgreementRoute (Admin Dashboard Extension)
 * @purpose Admin route for creating and drafting new legal agreement bundles.
 * @contracts
 *   API:     POST /admin/research-agreements
 *   Service: ResearchAgreementModuleService
 */

import { Button, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { PageHeader } from "../../../components/page-header"
import { ResearchAgreementForm } from "../agreement-form"
import type { ResearchAgreementBundle, ResearchAgreementFormValue } from "../types"

const empty: ResearchAgreementFormValue = {
  public_version: "",
  terms_version: "",
  terms_digest: "",
  terms_url: "",
  privacy_version: "",
  privacy_digest: "",
  privacy_url: "",
  research_hub_version: "",
  research_hub_digest: "",
  research_hub_url: "",
  locale: "en-PH",
  effective_at: "",
}

const NewResearchAgreementPage = () => {
  const [form, setForm] = useState(empty)
  const navigate = useNavigate()
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => sdk.client.fetch<{ agreement_bundle: ResearchAgreementBundle }>("/admin/research-agreements", {
      method: "POST",
      body: { ...form, effective_at: new Date(form.effective_at).toISOString() },
    }),
    onSuccess: async ({ agreement_bundle }) => {
      await client.invalidateQueries({ queryKey: ["research-agreements"] })
      toast.success("Agreement draft created")
      navigate(`/research-agreements/${agreement_bundle.id}`)
    },
    onError: (error) => toast.error(error.message || "Agreement draft could not be created"),
  })

  return (
    <div className="flex flex-col gap-4 px-3.5 sm:px-6 pt-4 pb-12 w-full min-h-screen">
      <PageHeader
        eyebrowText="Research Agreements · New Compliance Bundle"
        breadcrumbs={[
          { label: "Agreements", href: "/research-agreements" },
          { label: "New Agreement Bundle" },
        ]}
        title="New Research Agreement"
        subtitle="Create the immutable source bundle researchers will review once."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild size="small" variant="secondary">
              <Link to="/research-agreements">Cancel</Link>
            </Button>
            <Button
              size="small"
              isLoading={mutation.isPending}
              disabled={!form.public_version.trim() || !form.terms_url.trim()}
              onClick={() => mutation.mutate()}
            >
              Create Draft
            </Button>
          </div>
        }
      />
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <ResearchAgreementForm value={form} onChange={setForm} onSave={() => mutation.mutate()} saving={mutation.isPending} />
      </div>
    </div>
  )
}

export default NewResearchAgreementPage
