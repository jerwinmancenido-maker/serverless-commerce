import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BellAlert, CheckCircleSolid, MagnifyingGlass } from "@medusajs/icons"
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
import { useEffect, useMemo, useState } from "react"

import { EmptyState } from "../../components/empty-state"
import { FilterPillGroup } from "../../components/filter-pill-group"
import { KpiCard } from "../../components/kpi-card"
import { PageHeader } from "../../components/page-header"
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
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

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
  const allTemplates = templatesQuery.data?.templates || []
  const operations = operationsQuery.data?.operations || []

  // Compute category counts for filter pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of allTemplates) {
      counts[t.category] = (counts[t.category] || 0) + 1
    }
    return counts
  }, [allTemplates])

  // Filter templates by category and search
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchesCat = activeCategory === "all" || t.category === activeCategory
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch = !query ||
        t.display_name.toLowerCase().includes(query) ||
        t.event_key.toLowerCase().includes(query)
      return matchesCat && matchesSearch
    })
  }, [allTemplates, activeCategory, searchQuery])

  return (
    <div className="flex flex-col gap-4 pb-12">
      {/* 1. Standard PageHeader */}
      <PageHeader
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Notification Center" },
        ]}
        title="Notification Center"
        subtitle="Manage private customer notification wording, automated triggers, and telemetry for in-app delivery."
        statusDropdown={
          <Badge size="small" color={status?.enabled ? "green" : "red"} className="font-mono text-[11px]">
            {status?.enabled ? "● System Active" : "● System Disabled"}
          </Badge>
        }
      />

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="In-App Channel"
          value={status?.channels.in_app === "available" ? "Active" : "Unavailable"}
          icon="🔔"
          status={status?.channels.in_app === "available" ? "healthy" : "critical"}
          subtext="Storefront client delivery"
        />
        <KpiCard
          title="Scheduler Engine"
          value={status?.scheduler.status === "available" ? "Running" : (status?.scheduler.status || "Checking…")}
          icon="⚡"
          status={status?.scheduler.status === "available" ? "healthy" : "warning"}
          subtext="Cron dispatch pipeline"
        />
        <KpiCard
          title="Failed Deliveries"
          value={status?.failed_delivery_count ?? 0}
          icon="⚠️"
          status={status?.failed_delivery_count ? "critical" : "healthy"}
          subtext={status?.failed_delivery_count ? "Attention required" : "Zero errors recorded"}
        />
        <KpiCard
          title="Active Templates"
          value={allTemplates.length}
          icon="📋"
          status="info"
          subtext="Registered lifecycle events"
        />
      </div>

      {/* Channel Notice Banner */}
      <div className="px-4 py-2.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 text-xs text-ui-fg-subtle flex items-center gap-2">
        <span className="text-sm">ℹ️</span>
        <span>
          Email, browser push, mobile push, and SMS remain unavailable until their providers and consent flows are configured. The system does not silently send unconsented messages.
        </span>
      </div>

      {/* 3. Customer Event Templates Container */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        <div className="flex flex-col gap-3 p-4 bg-ui-bg-subtle/20 border-b border-ui-border-base">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Heading level="h2" className="text-sm font-semibold">
                Customer Event Templates
              </Heading>
              <Text size="small" className="text-ui-fg-subtle">
                Edit registered wording without exposing private customer content. Every save creates an immutable revision.
              </Text>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-fg-muted">
                <MagnifyingGlass className="h-3.5 w-3.5" />
              </span>
              <Input
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates…"
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <FilterPillGroup
            items={[
              { id: "all", label: "All Events", count: allTemplates.length },
              { id: "support", label: "Support", count: categoryCounts.support || 0, badgeColor: "blue" },
              { id: "community", label: "Community", count: categoryCounts.community || 0, badgeColor: "purple" },
              { id: "protocols", label: "Protocols", count: categoryCounts.protocols || 0, badgeColor: "orange" },
              { id: "rewards", label: "Rewards", count: categoryCounts.rewards || 0, badgeColor: "green" },
              { id: "system", label: "System", count: categoryCounts.system || 0, badgeColor: "grey" },
            ]}
            selectedId={activeCategory}
            onSelect={(id) => setActiveCategory(id)}
          />
        </div>

        {/* Templates List */}
        <div className="divide-y divide-ui-border-base">
          {templatesQuery.isLoading ? (
            <div className="p-8 text-center text-xs text-ui-fg-subtle">
              Loading templates…
            </div>
          ) : filteredTemplates.length === 0 ? (
            <EmptyState
              icon="🔔"
              title="No templates match your filters"
              description="Try adjusting your category selection or clear your search term."
              actionLabel="Clear Filters"
              onAction={() => {
                setActiveCategory("all")
                setSearchQuery("")
              }}
            />
          ) : (
            filteredTemplates.map((template) => (
              <button
                key={template.event_key}
                type="button"
                onClick={() => setSelected(template)}
                className="grid w-full gap-3 p-4 text-left hover:bg-ui-bg-subtle/50 transition-colors md:grid-cols-[1fr_140px_160px_130px] md:items-center"
              >
                <div>
                  <Text weight="plus" className="text-xs hover:text-ui-fg-interactive">
                    {template.display_name}
                  </Text>
                  <Text size="xsmall" className="font-mono text-[11px] text-ui-fg-subtle">
                    {template.event_key}
                  </Text>
                </div>
                <div>
                  <Badge size="small" color={CATEGORY_COLORS[template.category] || "grey"} className="capitalize text-[10px]">
                    {template.category}
                  </Badge>
                </div>
                <Text size="small" className="text-xs text-ui-fg-subtle">
                  {template.customer_can_disable ? "Customer optional" : "Required"}
                </Text>
                <div className="flex items-center gap-1.5 justify-end">
                  <Badge size="small" color={template.enabled ? "green" : "grey"} className="text-[10px]">
                    {template.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge size="small" color="grey" className="font-mono text-[10px]">
                    v{template.current_version}
                  </Badge>
                </div>
              </button>
            ))
          )}
        </div>
      </Container>

      {/* 4. Send a Private Test */}
      <Container className="p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        <div className="px-5 py-4 border-b border-ui-border-base">
          <Heading level="h2" className="text-sm font-semibold">
            Send a Private Test
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Dispatch a verified test notification directly to a customer account without sending emails or SMS.
          </Text>
        </div>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <Input
            size="small"
            value={testCustomerId}
            onChange={(event) => setTestCustomerId(event.target.value)}
            placeholder="Enter customer ID (e.g. cus_01J...)"
            className="flex-1 font-mono text-xs h-8"
          />
          <Button
            size="small"
            disabled={!testCustomerId.trim() || sendTest.isPending}
            isLoading={sendTest.isPending}
            onClick={() => sendTest.mutate()}
            className="h-8 text-xs shrink-0"
          >
            Send test notification
          </Button>
        </div>
      </Container>

      {/* 5. Recent Delivery Activity Log */}
      <Container className="divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base">
        <div className="px-5 py-4 bg-ui-bg-subtle/20 border-b border-ui-border-base flex items-center justify-between">
          <div>
            <Heading level="h2" className="text-sm font-semibold">
              Recent In-App Delivery Telemetry
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Operational delivery records only. Customer privacy is strictly preserved.
            </Text>
          </div>
          <span className="text-xs font-mono text-ui-fg-muted">
            {operations.length} attempts
          </span>
        </div>

        <div className="divide-y divide-ui-border-base">
          {operationsQuery.isLoading ? (
            <Text size="small" className="p-6 text-center text-ui-fg-subtle">
              Loading delivery activity…
            </Text>
          ) : operations.length ? (
            operations.map((operation) => (
              <div
                key={operation.id}
                className="grid gap-2 p-4 text-xs md:grid-cols-[1fr_120px_160px_110px] md:items-center hover:bg-ui-bg-subtle/30 transition-colors"
              >
                <div>
                  <Text size="small" weight="plus" className="font-mono text-xs">
                    {operation.event_key}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted text-[10px]">
                    {operation.template_revision_id || "System default"}
                  </Text>
                </div>
                <span className="font-mono text-[11px] text-ui-fg-subtle uppercase">
                  {operation.channel}
                </span>
                <span className="text-ui-fg-subtle text-xs">
                  {new Date(operation.attempted_at).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <div className="flex justify-end">
                  <Badge
                    size="small"
                    color={
                      operation.status === "delivered"
                        ? "green"
                        : operation.status === "failed"
                        ? "red"
                        : "grey"
                    }
                    className="capitalize text-[10px]"
                  >
                    {operation.is_test ? `Test · ${operation.status}` : operation.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="📡"
              title="No delivery activity yet"
              description="In-app notification events will automatically appear here as customers interact with the platform."
            />
          )}
        </div>
      </Container>

      {/* Drawer: Template Editor */}
      <Drawer open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{draft?.display_name || "Notification template"}</Drawer.Title>
            <Drawer.Description>{draft?.event_key}</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            {draft ? (
              <div className="flex flex-col gap-5 py-2">
                <Field label="Title">
                  <Input
                    value={draft.title_template}
                    onChange={(event) => setDraft({ ...draft, title_template: event.target.value })}
                  />
                </Field>
                <Field label="Message">
                  <Textarea
                    rows={5}
                    value={draft.body_template}
                    onChange={(event) => setDraft({ ...draft, body_template: event.target.value })}
                  />
                </Field>
                <Field label="Action label">
                  <Input
                    value={draft.action_label || ""}
                    onChange={(event) => setDraft({ ...draft, action_label: event.target.value || null })}
                  />
                </Field>
                <div>
                  <Label>Allowed variables</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {draft.allowed_variables.length ? (
                      draft.allowed_variables.map((item) => (
                        <Badge key={item} color="grey">{`{{${item}}}`}</Badge>
                      ))
                    ) : (
                      <Text size="small" className="text-ui-fg-subtle">No variables</Text>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4">
                  <Text size="xsmall" weight="plus" className="uppercase text-ui-fg-muted">
                    Customer preview
                  </Text>
                  <Text className="mt-2" weight="plus">{draft.title_template}</Text>
                  <Text size="small" className="mt-1 text-ui-fg-subtle">{draft.body_template}</Text>
                  {draft.action_label ? (
                    <Text size="small" className="mt-3 text-ui-fg-interactive">{draft.action_label}</Text>
                  ) : null}
                </div>
                <Field label="Priority">
                  <Select
                    value={draft.priority}
                    onValueChange={(priority) => setDraft({ ...draft, priority: priority as Template["priority"] })}
                  >
                    <Select.Trigger><Select.Value /></Select.Trigger>
                    <Select.Content>
                      {["low", "normal", "high", "urgent"].map((value) => (
                        <Select.Item key={value} value={value}>{value}</Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Field>
                <Field label="Retention days">
                  <Input
                    type="number"
                    min={1}
                    max={3650}
                    value={draft.retention_days}
                    onChange={(event) => setDraft({ ...draft, retention_days: Number(event.target.value) })}
                  />
                </Field>
                <Toggle
                  label="Event enabled"
                  description="When disabled, new events of this type are skipped."
                  checked={draft.enabled}
                  onChange={(enabled) => setDraft({ ...draft, enabled })}
                />
                <Toggle
                  label="Enabled for customers by default"
                  description={draft.customer_can_disable ? "Customers may override this in Account Settings." : "This required event cannot be disabled by customers."}
                  checked={draft.default_enabled}
                  disabled={!draft.customer_can_disable}
                  onChange={(default_enabled) => setDraft({ ...draft, default_enabled })}
                />
                <Field label="Change reason">
                  <Textarea
                    value={changeReason}
                    onChange={(event) => setChangeReason(event.target.value)}
                    placeholder="Explain why this wording or behavior changed"
                  />
                </Field>
                <div>
                  <Heading level="h3">Revision history</Heading>
                  <div className="mt-3 space-y-2">
                    {revisionsQuery.data?.revisions.map((revision) => (
                      <div key={revision.id} className="rounded-lg bg-ui-bg-subtle p-3">
                        <div className="flex justify-between">
                          <Text size="small" weight="plus">Version {revision.version}</Text>
                          <Text size="xsmall" className="text-ui-fg-muted">
                            {new Date(revision.created_at).toLocaleString()}
                          </Text>
                        </div>
                        <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
                          {revision.change_reason}
                        </Text>
                      </div>
                    )) || <Text size="small" className="text-ui-fg-subtle">No stored revisions yet.</Text>}
                  </div>
                </div>
              </div>
            ) : null}
          </Drawer.Body>
          <Drawer.Footer>
            <div className="flex w-full items-center justify-between gap-3">
              <Button
                variant="secondary"
                disabled={changeReason.trim().length < 3 || restoreTemplate.isPending}
                isLoading={restoreTemplate.isPending}
                onClick={() => restoreTemplate.mutate()}
              >
                Restore registered default
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
                <Button
                  disabled={changeReason.trim().length < 3 || saveTemplate.isPending}
                  isLoading={saveTemplate.isPending}
                  onClick={() => saveTemplate.mutate()}
                >
                  Save new revision
                </Button>
              </div>
            </div>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-2"><Label>{label}</Label>{children}</div>
)

const Toggle = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border border-ui-border-base p-4">
    <div>
      <Text size="small" weight="plus">{label}</Text>
      <Text size="xsmall" className="text-ui-fg-subtle">{description}</Text>
    </div>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
  </div>
)

export const config = defineRouteConfig({
  label: "Notification Center",
  icon: BellAlert,
  rank: 40,
})

export default NotificationCenterAdminPage
