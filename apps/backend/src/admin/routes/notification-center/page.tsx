/**
 * @file    apps/backend/src/admin/routes/notification-center/page.tsx
 * @module  NotificationCenterRoute (Admin Dashboard Extension)
 * @purpose Admin route for customer lifecycle notification templates, channels, and delivery ops.
 * @contracts
 *   API:     GET/POST/PUT /admin/notification-center/*
 *   Service: NotificationCenterModuleService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  BellAlert,
  Bolt,
  CheckCircleSolid,
  ChevronRight,
  DocumentText,
  ExclamationCircle,
  InformationCircleSolid,
  MagnifyingGlass,
} from "@medusajs/icons"
import {
  Badge,
  Button,
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

import { SovereignEmptyState } from "../../components/ui/sovereign-empty-state"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { AdminSegmentedTabs } from "../../components/ui/admin-segmented-tabs"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminListRowCard } from "../../components/ui/admin-list-row-card"
import { AdminSuiteCard } from "../../components/ui/admin-suite-card"
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

  if (statusQuery.isLoading || templatesQuery.isLoading) {
    return <SovereignPageSkeleton cards={4} rows={8} />
  }

  return (
    <div className="flex flex-col gap-4 px-3.5 sm:px-6 pt-4 pb-12 w-full min-h-screen">
      {/* 1. Standard PageHeader */}
      <PageHeader
        eyebrowText="Notification Center · Lifecycle Events"
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

      {/* 2. KPI Metrics Bar (4-Card Sovereign Grid) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          label="In-App Channel"
          value={status?.channels.in_app === "available" ? "Active" : "Unavailable"}
          icon={<BellAlert className="h-4 w-4" />}
          variant="blue"
          status={status?.channels.in_app === "available" ? "healthy" : "critical"}
          subtext="Storefront client delivery"
        />
        <AdminMetricCard
          label="Scheduler Engine"
          value={status?.scheduler.status === "available" ? "Running" : (status?.scheduler.status || "Checking…")}
          icon={<Bolt className="h-4 w-4" />}
          variant="blue"
          status={status?.scheduler.status === "available" ? "healthy" : "warning"}
          subtext="Cron dispatch pipeline"
        />
        <AdminMetricCard
          label="Failed Deliveries"
          value={status?.failed_delivery_count ?? 0}
          icon={<ExclamationCircle className="h-4 w-4" />}
          variant={status?.failed_delivery_count ? "rose" : "default"}
          status={status?.failed_delivery_count ? "critical" : "healthy"}
          subtext={status?.failed_delivery_count ? "Attention required" : "Zero errors recorded"}
        />
        <AdminMetricCard
          label="Active Templates"
          value={allTemplates.length}
          icon={<DocumentText className="h-4 w-4" />}
          variant="default"
          status="neutral"
          subtext="Registered lifecycle events"
        />
      </div>

      {/* SADS 2.0 Telemetry Notice Banner */}
      <AdminTelemetryNotice
        title="Multi-Channel Communications Dispatch"
        description="Customer lifecycle notifications and transactional dispatch. Email, browser push, mobile push, and SMS adhere strictly to DPA 2012 privacy consents. Unconsented dispatch is automatically blocked."
        statusText="COMMUNICATIONS AUDIT ACTIVE"
        variant="indigo"
      />

      {/* 3. Search & Category Filter Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Events", count: allTemplates.length },
            { id: "support", label: "Support", count: categoryCounts.support || 0 },
            { id: "community", label: "Community", count: categoryCounts.community || 0 },
            { id: "protocols", label: "Protocols", count: categoryCounts.protocols || 0 },
            { id: "rewards", label: "Rewards", count: categoryCounts.rewards || 0 },
            { id: "system", label: "System", count: categoryCounts.system || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10.5px] font-mono ${
                  activeCategory === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates…"
            className="pl-8 pr-7 text-xs h-8 bg-slate-50 border-slate-200/80 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Maximized Full-Screen Operational Stream */}
      <div className="w-full flex flex-col gap-6">
        {/* Primary Template Stream */}
        <div className="w-full flex flex-col gap-3">
          {templatesQuery.isLoading ? (
            <div className="p-8 text-center text-xs text-ui-fg-subtle">
              Loading templates…
            </div>
          ) : filteredTemplates.length === 0 ? (
            <SovereignEmptyState
              icon={<BellAlert className="h-5 w-5" />}
              heading="No templates match your filters"
              subtext="Try adjusting your category selection or clear your search term."
              action={
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setActiveCategory("all")
                    setSearchQuery("")
                  }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            filteredTemplates.map((template) => (
              <AdminListRowCard
                key={template.event_key}
                icon={<BellAlert className="size-4 text-blue-600" />}
                title={template.display_name}
                subtitle={
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-700 uppercase">
                      {template.category}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-mono text-blue-700">
                      v{template.current_version}
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-400">
                      {template.event_key}
                    </span>
                    {template.customer_can_disable && (
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[9.5px]">
                        Customer Optional
                      </span>
                    )}
                  </div>
                }
                badge={
                  <Badge size="small" color={template.enabled ? "green" : "grey"} className="text-[10px]">
                    {template.enabled ? "● Active" : "○ Paused"}
                  </Badge>
                }
                value={
                  <span className="text-xs font-semibold text-slate-700 capitalize">
                    Priority: {template.priority}
                  </span>
                }
                secondaryValue={
                  <span className="text-[10.5px] text-slate-400">
                    Retention: {template.retention_days} days
                  </span>
                }
                onClick={() => setSelected(template)}
                statusPill={
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                      Configure
                    </span>
                    <div className="size-7 rounded-lg border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-all">
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                }
              />
            ))
          )}
        </div>

        {/* Horizontal Operational Suites & Telemetry Dock */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {/* Suite 1: Private Test Notification Dispatcher */}
          <AdminSuiteCard
            icon={<Bolt className="size-4 text-blue-600" />}
            eyebrow="Dispatch Workbench"
            title="Private Test Dispatch"
            description="Dispatch a verified in-app test notification directly to an authorized customer account without external notification leakage."
            variant="blue"
            statusBadge="Sandboxed"
            statusVariant="blue"
          >
            <div className="flex flex-col gap-2.5">
              <Input
                size="small"
                value={testCustomerId}
                onChange={(event) => setTestCustomerId(event.target.value)}
                placeholder="Enter customer ID (e.g. cus_01J...)"
                className="font-mono text-xs h-8 bg-slate-50 border-slate-200/80 focus:bg-white"
              />
              <Button
                size="small"
                disabled={!testCustomerId.trim() || sendTest.isPending}
                isLoading={sendTest.isPending}
                onClick={() => sendTest.mutate()}
                className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Send Test Notification
              </Button>
            </div>
          </AdminSuiteCard>

          {/* Suite 2: Multi-Channel Consent & Governance */}
          <AdminSuiteCard
            icon={<CheckCircleSolid className="size-4 text-emerald-600" />}
            eyebrow="Governance &amp; Privacy"
            title="Channel Sentry"
            description="Delivery channels adhere strictly to DPA 2012 privacy consents. Unconsented delivery is prevented automatically."
            variant="emerald"
            statusBadge="DPA 2012 Active"
            statusVariant="emerald"
          >
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">In-App Channel</span>
                <Badge size="small" color={status?.channels.in_app === "available" ? "green" : "red"}>
                  {status?.channels.in_app === "available" ? "Active" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Cron Scheduler</span>
                <Badge size="small" color={status?.scheduler.status === "available" ? "green" : "orange"}>
                  {status?.scheduler.status || "Checking"}
                </Badge>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium">Email / SMS Gate</span>
                <span className="font-mono text-[10.5px] text-slate-500">Opt-in Required</span>
              </div>
            </div>
          </AdminSuiteCard>

          {/* Elevated Recent Delivery Activity */}
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">Recent Delivery Telemetry</span>
                <p className="text-[10.5px] text-slate-500">Real-time in-app delivery log</p>
              </div>
              <span className="text-[10.5px] font-mono text-slate-400">
                {operations.length} events
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {operationsQuery.isLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading delivery activity…</div>
              ) : operations.length ? (
                operations.map((operation) => (
                  <div
                    key={operation.id}
                    className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-slate-900 truncate">
                        {operation.event_key}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">{operation.channel}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(operation.attempted_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge
                      size="small"
                      color={
                        operation.status === "delivered"
                          ? "green"
                          : operation.status === "failed"
                          ? "red"
                          : "grey"
                      }
                      className="capitalize text-[10px] shrink-0"
                    >
                      {operation.is_test ? `Test · ${operation.status}` : operation.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">No delivery activity yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer: Template Editor */}
      <Drawer open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <Drawer.Content className="w-full sm:max-w-xl h-dvh sm:h-full flex flex-col justify-between">
          <Drawer.Header>
            <Drawer.Title>{draft?.display_name || "Notification template"}</Drawer.Title>
            <Drawer.Description>{draft?.event_key}</Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto px-4 sm:px-6 py-4">
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
          <Drawer.Footer className="px-4 sm:px-6 py-3 sm:py-4 pb-[env(safe-area-inset-bottom,1rem)] border-t border-ui-border-base bg-slate-50/50">
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
  rank: 15,
})

export default NotificationCenterAdminPage
