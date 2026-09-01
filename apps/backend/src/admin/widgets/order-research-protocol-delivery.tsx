import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { sdk } from "../lib/sdk"

type Response = {
  protocol_delivery: {
    profile_status: string | null
    accesses: Array<{
      id: string
      line_item_label: string
      protocol_title: string
      revision: number
      qr_status: "active" | "revoked"
      entitlement_status: "granted" | "not_granted"
      issued_at: string
    }>
  }
}

const OrderResearchProtocolDelivery = ({ data: order }: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ["order-protocol-delivery", order.id],
    queryFn: () => sdk.client.fetch<Response>(`/admin/orders/${order.id}/research-protocol-delivery`),
  })
  const repair = useMutation({
    mutationFn: () => sdk.client.fetch<Response>(`/admin/orders/${order.id}/research-protocol-delivery`, { method: "POST" }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["order-protocol-delivery", order.id] }); toast.success("Protocol delivery reconciled") },
    onError: (error) => toast.error(error.message || "Protocol delivery could not be repaired"),
  })
  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div><Heading level="h2">Research protocol delivery</Heading><Text size="small" className="mt-1 text-ui-fg-subtle">Exact published revisions and customer account access for this order.</Text></div>
        <Button size="small" variant="secondary" isLoading={repair.isPending} onClick={() => repair.mutate()}>Repair access</Button>
      </div>
      <div className="px-6 py-4">
        {query.isLoading ? <Text size="small">Loading protocol delivery…</Text> : query.isError ? <Text size="small" className="text-ui-fg-error">Protocol delivery could not be loaded.</Text> : query.data?.protocol_delivery.accesses.length ? <div className="space-y-3">{query.data.protocol_delivery.accesses.map((access) => <div key={access.id} className="rounded-lg border border-ui-border-base p-3"><div className="flex items-start justify-between gap-3"><div><Text weight="plus">{access.protocol_title} · revision {access.revision}</Text><Text size="xsmall" className="mt-1 text-ui-fg-subtle">{access.line_item_label} · granted {new Date(access.issued_at).toLocaleString()}</Text></div><div className="flex gap-2"><Badge color={access.qr_status === "active" ? "green" : "grey"}>QR {access.qr_status}</Badge><Badge color={access.entitlement_status === "granted" ? "green" : "orange"}>{access.entitlement_status.replaceAll("_", " ")}</Badge></div></div></div>)}</div> : <Text size="small" className="text-ui-fg-subtle">No eligible protocol was bound to this order.</Text>}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({ zone: "order.details.before" })

export default OrderResearchProtocolDelivery
