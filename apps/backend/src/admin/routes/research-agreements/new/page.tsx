import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
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
    <div className="flex flex-col gap-4">
      <Container className="flex items-start justify-between px-6 py-4">
        <div><Heading>New customer agreement</Heading><Text size="small" className="mt-1 text-ui-fg-subtle">Create the immutable source bundle customers will review once.</Text></div>
        <Button asChild size="small" variant="secondary"><Link to="/research-agreements">Cancel</Link></Button>
      </Container>
      <Container className="px-6 py-4">
        <ResearchAgreementForm value={form} onChange={setForm} onSave={() => mutation.mutate()} saving={mutation.isPending} />
      </Container>
    </div>
  )
}

export default NewResearchAgreementPage
