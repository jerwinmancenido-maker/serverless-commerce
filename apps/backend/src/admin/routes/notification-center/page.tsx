import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BellAlert } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { sdk } from "../../lib/sdk"

type Template = {
  id: string | null
  event_key: string
  display_name: string
  category: string
  enabled: boolean
  priority: "low" | "normal" | "high" | "urgent"
  default_enabled: boolean
  customer_can_disable: boolean
  retention_days: number
  title_template: string
  body_template: string
  action_label: string | null
  allowed_variables: string[]
  current_version: number
  updated_at: string | null
}

type StatusResponse = {
  enabled: boolean
  channels: Record<string, "available" | "unavailable">
  scheduler: { status: string; last_successful_delivery_at: string | null }
  failed_delivery_count: number
}

type Operation = {
  id: string
  event_key: string
  channel: string
  status: "delivered" | "failed" | "skipped" | "retry_pending"
  template_revision_id: string | null
  attempted_at: string
  failure_code: string | null
  retry_at: string | null
  is_test: boolean
}

type Revision = {
  id: string
  version: number
  title_template: string
  body_template: string
  action_label: string | null
  change_reason: string
  changed_by_actor_id: string
  created_at: string
}

const CATEGORY_COLORS: Record<string, "blue" | "purple" | "orange" | "green" | "grey"> = {
  support: "blue",
  community: "purple",
  protocols: "orange",
  research: "blue",
  rewards: "green",
  system: "grey",
}

const NotificationCenterAdminPage = () => {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Template | null>(null)
  const [draft, setDraft] = useState<Template | null>(null)
  const [changeReason, setChangeReason] = useState("")
  const [testCustomerId, setTestCustomerId] = useState("")

  const statusQuery = useQuery({
    queryKey: ["notification-center-status"],
    queryFn: () => sdk.client.fetch<StatusResponse>("/admin/notification-center/status"),
  })
  const templatesQuery = useQuery({
    queryKey: ["notification-center-templates"],
    queryFn: () => sdk.client.fetch<{ templates: Template[] }>("/admin/notification-center/templates"),
  })
  const operationsQuery = useQuery({
    queryKey: ["notification-center-operations"],
    queryFn: () => sdk.client.fetch<{ operations: Operation[]; count: number }>("/admin/notification-center/operations?offset=0&limit=25"),
  })
  const revisionsQuery = useQuery({
    queryKey: ["notification-center-revisions", selected?.event_key],
    queryFn: () => sdk.client.fetch<{ revisions: Revision[] }>(`/admin/notification-center/templates/${encodeURIComponent(selected!.event_key)}/revisions`),
    enabled: Boolean(selected),
  })

  useEffect(() => setDraft(selected ? { ...selected } : null), [selected])

  const saveTemplate = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/notification-center/templates/${encodeURIComponent(draft!.event_key)}`, {
      method: "POST",
      body: {
        title_template: draft!.title_template,
        body_template: draft!.body_template,
        action_label: draft!.action_label,
        priority: draft!.priority,
        default_enabled: draft!.default_enabled,
        enabled: draft!.enabled,
        retention_days: draft!.retention_days,
        change_reason: changeReason,
      },
    }),
    onSuccess: async () => {
      toast.success("Notification template saved")
      setSelected(null)
      setChangeReason("")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notification-center-templates"] }),
        queryClient.invalidateQueries({ queryKey: ["notification-center-revisions"] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })

  const restoreTemplate = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/notification-center/templates/${encodeURIComponent(draft!.event_key)}/restore`, {
      method: "POST",
      body: { change_reason: changeReason },
    }),
    onSuccess: async () => {
      toast.success("Registered default wording restored")
      setSelected(null)
      setChangeReason("")
      await queryClient.invalidateQueries({ queryKey: ["notification-center-templates"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const sendTest = useMutation({
    mutationFn: () => sdk.client.fetch<{ notification_id: string | null }>("/admin/notification-center/test", {
      method: "POST",
      body: { customer_id: testCustomerId.trim() },
    }),
    onSuccess: async (result) => {
      toast.success(result.notification_id ? "Test notification delivered" : "Test notification skipped")
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notification-center-status"] }),
        queryClient.invalidateQueries({ queryKey: ["notification-center-operations"] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })

  const status = statusQuery.data
  const templates = templatesQuery.data?.templates || []
  const operations = operationsQuery.data?.operations || []

  return (
    <div className="flex flex-col gap-4">
      <Container className="divide-y p-0">
        <div className="flex items-start justify-between gap-4 px-6 py-4">
          <div>
            <Heading>Notification Center</Heading>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">Manage private customer notification wording and inspect in-app delivery.</Text>
          </div>
          <Badge color={status?.enabled ? "green" : "red"}>{status?.enabled ? "Enabled" : "Unavailable"}</Badge>
        </div>
        <div className="grid gap-4 px-6 py-5 md:grid-cols-3">
          <StatusCard label="In-app channel" value={status?.channels.in_app === "available" ? "Available" : "Unavailable"} tone={status?.channels.in_app === "available" ? "green" : "red"} />
          <StatusCard label="Scheduler" value={status?.scheduler.status || "Checking…"} tone={status?.scheduler.status === "available" ? "green" : "orange"} />
          <StatusCard label="Failed deliveries" value={String(status?.failed_delivery_count ?? 0)} tone={status?.failed_delivery_count ? "red" : "green"} />
        </div>
        <div className="px-6 py-4">
          <Text size="xsmall" className="text-ui-fg-subtle">Email, browser push, mobile push, and SMS remain unavailable until their providers and consent flows are configured. The system does not silently send them.</Text>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Customer event templates</Heading>
          <Text size="small" leading="compact" className="text-ui-fg-subtle">Edit registered wording without exposing private customer content. Every save creates an immutable revision.</Text>
        </div>
        <div className="divide-y">
          {templatesQuery.isLoading ? <Text size="small" className="px-6 py-8 text-ui-fg-subtle">Loading templates…</Text> : templates.map((template) => (
            <button key={template.event_key} type="button" onClick={() => setSelected(template)} className="grid w-full gap-3 px-6 py-4 text-left hover:bg-ui-bg-subtle md:grid-cols-[1fr_180px_160px_100px] md:items-center">
              <div><Text weight="plus">{template.display_name}</Text><Text size="xsmall" className="text-ui-fg-subtle">{template.event_key}</Text></div>
              <div><Badge color={CATEGORY_COLORS[template.category] || "grey"}>{template.category}</Badge></div>
              <Text size="small">{template.customer_can_disable ? "Customer optional" : "Required"}</Text>
              <div className="flex gap-2"><Badge color={template.enabled ? "green" : "grey"}>{template.enabled ? "Enabled" : "Disabled"}</Badge><Badge color="grey">v{template.current_version}</Badge></div>
            </button>
          ))}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4"><Heading level="h2">Send a private test</Heading><Text size="small" leading="compact" className="text-ui-fg-subtle">Use a local customer ID. The test is clearly labeled in operations and appears only in that customer’s signed-in Notification Center.</Text></div>
        <div className="flex flex-col gap-3 px-6 py-5 md:flex-row">
          <Input value={testCustomerId} onChange={(event) => setTestCustomerId(event.target.value)} placeholder="customer_…" />
          <Button disabled={!testCustomerId.trim() || sendTest.isPending} isLoading={sendTest.isPending} onClick={() => sendTest.mutate()}>Send test notification</Button>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4"><Heading level="h2">Recent in-app delivery</Heading><Text size="small" leading="compact" className="text-ui-fg-subtle">Operational metadata only. Customer notification bodies and private records are not shown here.</Text></div>
        <div className="divide-y">
          {operationsQuery.isLoading ? <Text size="small" className="px-6 py-8 text-ui-fg-subtle">Loading delivery activity…</Text> : operations.length ? operations.map((operation) => (
            <div key={operation.id} className="grid gap-2 px-6 py-4 md:grid-cols-[1fr_120px_160px_90px] md:items-center">
              <div><Text size="small" weight="plus">{operation.event_key}</Text><Text size="xsmall" className="text-ui-fg-muted">{operation.template_revision_id || "No template revision"}</Text></div>
              <Text size="small">{operation.channel}</Text>
              <Text size="small">{new Date(operation.attempted_at).toLocaleString()}</Text>
              <Badge color={operation.status === "delivered" ? "green" : operation.status === "failed" ? "red" : "grey"}>{operation.is_test ? `Test · ${operation.status}` : operation.status}</Badge>
            </div>
          )) : <Text size="small" className="px-6 py-8 text-ui-fg-subtle">No delivery attempts yet.</Text>}
        </div>
      </Container>

      <Drawer open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <Drawer.Content>
          <Drawer.Header><Drawer.Title>{draft?.display_name || "Notification template"}</Drawer.Title><Drawer.Description>{draft?.event_key}</Drawer.Description></Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            {draft ? <div className="flex flex-col gap-5 py-2">
              <Field label="Title"><Input value={draft.title_template} onChange={(event) => setDraft({ ...draft, title_template: event.target.value })} /></Field>
              <Field label="Message"><Textarea rows={5} value={draft.body_template} onChange={(event) => setDraft({ ...draft, body_template: event.target.value })} /></Field>
              <Field label="Action label"><Input value={draft.action_label || ""} onChange={(event) => setDraft({ ...draft, action_label: event.target.value || null })} /></Field>
              <div><Label>Allowed variables</Label><div className="mt-2 flex flex-wrap gap-2">{draft.allowed_variables.length ? draft.allowed_variables.map((item) => <Badge key={item} color="grey">{`{{${item}}}`}</Badge>) : <Text size="small" className="text-ui-fg-subtle">No variables</Text>}</div></div>
              <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4"><Text size="xsmall" weight="plus" className="uppercase text-ui-fg-muted">Customer preview</Text><Text className="mt-2" weight="plus">{draft.title_template}</Text><Text size="small" className="mt-1 text-ui-fg-subtle">{draft.body_template}</Text>{draft.action_label ? <Text size="small" className="mt-3 text-ui-fg-interactive">{draft.action_label}</Text> : null}</div>
              <Field label="Priority"><Select value={draft.priority} onValueChange={(priority) => setDraft({ ...draft, priority: priority as Template["priority"] })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content>{["low", "normal", "high", "urgent"].map((value) => <Select.Item key={value} value={value}>{value}</Select.Item>)}</Select.Content></Select></Field>
              <Field label="Retention days"><Input type="number" min={1} max={3650} value={draft.retention_days} onChange={(event) => setDraft({ ...draft, retention_days: Number(event.target.value) })} /></Field>
              <Toggle label="Event enabled" description="When disabled, new events of this type are skipped." checked={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })} />
              <Toggle label="Enabled for customers by default" description={draft.customer_can_disable ? "Customers may override this in Account Settings." : "This required event cannot be disabled by customers."} checked={draft.default_enabled} disabled={!draft.customer_can_disable} onChange={(default_enabled) => setDraft({ ...draft, default_enabled })} />
              <Field label="Change reason"><Textarea value={changeReason} onChange={(event) => setChangeReason(event.target.value)} placeholder="Explain why this wording or behavior changed" /></Field>
              <div><Heading level="h3">Revision history</Heading><div className="mt-3 space-y-2">{revisionsQuery.data?.revisions.map((revision) => <div key={revision.id} className="rounded-lg bg-ui-bg-subtle p-3"><div className="flex justify-between"><Text size="small" weight="plus">Version {revision.version}</Text><Text size="xsmall" className="text-ui-fg-muted">{new Date(revision.created_at).toLocaleString()}</Text></div><Text size="xsmall" className="mt-1 text-ui-fg-subtle">{revision.change_reason}</Text></div>) || <Text size="small" className="text-ui-fg-subtle">No stored revisions yet.</Text>}</div></div>
            </div> : null}
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex w-full items-center justify-between gap-3">
              <Button variant="secondary" disabled={changeReason.trim().length < 3 || restoreTemplate.isPending} isLoading={restoreTemplate.isPending} onClick={() => restoreTemplate.mutate()}>Restore registered default</Button>
              <div className="flex gap-2"><Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button><Button disabled={changeReason.trim().length < 3 || saveTemplate.isPending} isLoading={saveTemplate.isPending} onClick={() => saveTemplate.mutate()}>Save new revision</Button></div>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

const StatusCard = ({ label, value, tone }: { label: string; value: string; tone: "green" | "red" | "orange" }) => <div className="rounded-lg border border-ui-border-base p-4"><Text size="xsmall" className="text-ui-fg-subtle">{label}</Text><div className="mt-2"><Badge color={tone}>{value}</Badge></div></div>
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="flex flex-col gap-y-2"><Label>{label}</Label>{children}</div>
const Toggle = ({ label, description, checked, onChange, disabled = false }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) => <div className="flex items-start justify-between gap-4 rounded-lg border border-ui-border-base p-4"><div><Text size="small" weight="plus">{label}</Text><Text size="xsmall" className="text-ui-fg-subtle">{description}</Text></div><Switch checked={checked} disabled={disabled} onCheckedChange={onChange} /></div>

export const config = defineRouteConfig({ label: "Notification Center", icon: BellAlert })

export default NotificationCenterAdminPage
