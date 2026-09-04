import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../../lib/sdk"
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
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between gap-x-4 px-6 py-4">
        <div className="flex flex-col gap-y-1">
          <Heading>Create research guide</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Create a versioned laboratory guide now. You can link compatible products later.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button asChild size="small" variant="secondary">
            <Link to="/research-protocols">Cancel</Link>
          </Button>
          <Button
            size="small"
            isLoading={createMutation.isPending}
            disabled={!protocolKey.trim() || !form.title.trim()}
            onClick={() => createMutation.mutate()}
          >
            Create draft
          </Button>
        </div>
      </Container>
      <Container className="flex flex-col gap-y-6 px-6 py-4">
        <div className="flex flex-col gap-y-2">
          <Label>Protocol key</Label>
          <Input value={protocolKey} onChange={(event) => setProtocolKey(event.target.value)} placeholder="ghk-cu-laboratory-handling" />
          <Text size="small" leading="compact" className="text-ui-fg-subtle">
            Stable lowercase identifier used for future links. It cannot be reused.
          </Text>
        </div>
        <ProtocolEditorFields value={form} onChange={setForm} />
      </Container>
    </div>
  )
}

export default NewResearchProtocolPage
