import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"

import { sdk } from "../lib/sdk"

type Response = { research_hub: { active: boolean; agreement_version: string | null; protocol_entitlements: number; active_routines: number; reminders_enabled: boolean; rewards_balance: number; last_general_activity_at: string | null } }

const CustomerResearchHubStatus = ({ data: customer }: DetailWidgetProps<HttpTypes.AdminCustomer>) => {
  const query = useQuery({ queryKey: ["customer-research-hub", customer.id], queryFn: () => sdk.client.fetch<Response>(`/admin/customers/${customer.id}/research-hub-status`) })
  const data = query.data?.research_hub
  return <Container className="px-6 py-4">
    <div className="flex items-start justify-between gap-3"><div><Heading level="h2">Research Hub status</Heading><Text size="small" className="mt-1 text-ui-fg-subtle">Operational status only. Journal text, measurements, calculations, notes, and private attachments are never shown here.</Text></div>{data && <Badge color={data.active ? "green" : "grey"}>{data.active ? "Active" : "Inactive"}</Badge>}</div>
    {query.isLoading ? <Text size="small" className="mt-4">Loading status…</Text> : query.isError ? <Text size="small" className="mt-4 text-ui-fg-error">Research Hub status could not be loaded.</Text> : data ? <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
      <Status label="Agreement" value={data.agreement_version || "Not accepted"} />
      <Status label="Protocol entitlements" value={String(data.protocol_entitlements)} />
      <Status label="Active routines" value={String(data.active_routines)} />
      <Status label="Reminders" value={data.reminders_enabled ? "Enabled" : "Disabled"} />
      <Status label="Rewards balance" value={`${data.rewards_balance} points`} />
      <Status label="Last general activity" value={data.last_general_activity_at ? new Date(data.last_general_activity_at).toLocaleString() : "—"} />
    </div> : null}
  </Container>
}

const Status = ({ label, value }: { label: string; value: string }) => <div className="rounded-lg bg-ui-bg-subtle p-3"><Text size="xsmall" className="text-ui-fg-muted">{label}</Text><Text size="small" weight="plus" className="mt-1">{value}</Text></div>

export const config = defineWidgetConfig({ zone: "customer.details.before" })

export default CustomerResearchHubStatus
