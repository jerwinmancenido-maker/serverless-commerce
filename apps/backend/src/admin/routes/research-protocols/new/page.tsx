/**
 * @file    apps/backend/src/admin/routes/research-protocols/new/page.tsx
 * @module  NewResearchProtocolRoute (Admin Dashboard Extension)
 * @purpose Admin route for authoring and drafting new clinical research protocol series.
 * @contracts
 *   API:     POST /admin/research-protocols
 *   Service: ResearchProtocolModuleService
 */

import { Button, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
import { PageHeader } from "../../../components/page-header"
import { ProtocolEditorFields } from "../../compounded-products/protocol-editor-fields"
import type { ResearchProtocolMutationBody } from "../../compounded-products/research-protocol-types"
import { emptyResearchProtocol } from "../form-defaults"

const messageFromError = (error: unknown) =>
  error instanceof Error ? error.message : "Research guide could not be created"

const NewResearchProtocolPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [protocolKey, setProtocolKey] = useState("")
  const [form, setForm] = useState<ResearchProtocolMutationBody>(emptyResearchProtocol)
  const createMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{
        protocol: { series: { id: string }; revision: { id: string } }
      }>("/admin/research-protocols", {
        method: "POST",
        body: { protocol_key: protocolKey, ...form },
      }),
    onSuccess: async ({ protocol }) => {
      await queryClient.invalidateQueries({ queryKey: ["research-protocols"] })
      toast.success("Research guide draft created")
      navigate(`/research-protocols/${protocol.series.id}`)
    },
    onError: (error) => toast.error(messageFromError(error)),
  })

  return (
    <div className="flex flex-col gap-4 pb-8 px-6 pt-6 w-full">
      <PageHeader
        eyebrowText="Research Protocols · New Protocol Series"
        breadcrumbs={[
          { label: "Protocols", href: "/research-protocols" },
          { label: "Create Protocol" },
        ]}
        title="Create research guide"
        subtitle="Create a versioned laboratory guide now. You can link compatible products later."
        actions={
          <div className="flex items-center gap-x-2">
            <Button asChild size="small" variant="secondary" className="h-8 text-xs font-semibold">
              <Link to="/research-protocols">Cancel</Link>
            </Button>
            <Button
              size="small"
              isLoading={createMutation.isPending}
              disabled={!protocolKey.trim() || !form.title.trim()}
              onClick={() => createMutation.mutate()}
              className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
            >
              Create Draft
            </Button>
          </div>
        }
      />
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-2">
          <Label className="text-xs font-bold text-slate-900">Protocol Key</Label>
          <Input value={protocolKey} onChange={(event) => setProtocolKey(event.target.value)} placeholder="ghk-cu-laboratory-handling" className="h-8 text-xs font-mono bg-slate-50 border-slate-200/80 focus:bg-white" />
          <Text size="small" leading="compact" className="text-slate-500 text-xs">
            Stable lowercase identifier used for future links. It cannot be reused.
          </Text>
        </div>
        <ProtocolEditorFields value={form} onChange={setForm} />
      </div>
    </div>
  )
}

export default NewResearchProtocolPage
