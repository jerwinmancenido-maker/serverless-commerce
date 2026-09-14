/**
 * @file    apps/backend/src/admin/routes/research-hub-settings/page.tsx
 * @module  ResearchHubSettingsRoute (Admin Dashboard Extension)
 * @purpose Admin route for customer Research Hub telemetry, quiet hours, and scheduling engine config with SADS 2.0 visual standard.
 * @contracts
 *   API:     GET/POST /admin/research-hub/settings
 *   Service: ResearchTrackingModuleService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BellAlert, Clock, DocumentText, ShieldCheck, Sparkles } from "@medusajs/icons"
import {
  Badge,
  Button,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import { PageHeader } from "../../components/page-header"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { AdminSegmentedTabs } from "../../components/ui/admin-segmented-tabs"

type Settings = {
  in_app_enabled: boolean
  email_enabled: boolean
  browser_push_enabled: boolean
  mobile_push_enabled: boolean
  default_timezone: string
  default_lead_minutes: number[]
  default_quiet_hours_start: string
  default_quiet_hours_end: string
  calendar_past_days: number
  calendar_future_days: number
  reorder_now_days: number
  plan_reorder_days: number
  default_replenishment_snooze_days: number
  attachment_max_bytes: number
  attachment_allowed_types: string[]
  reminders_enabled: boolean
  calendar_enabled: boolean
  calculator_snapshots_enabled: boolean
  goals_enabled: boolean
  referrals_enabled: boolean
}

type Delivery = {
  id: string
  channel: string
  status: string
  type: string
  scheduled_for: string
  delivered_at: string | null
  template_version: string
  attempt: { status: string; attempted_at: string } | null
}

type AttachmentOperation = {
  id: string
  mime_type: string
  size_bytes: number
  scan_status: string
  status: string
  uploaded_at: string
  removed_at: string | null
}

const defaults: Settings = {
  in_app_enabled: true,
  email_enabled: false,
  browser_push_enabled: false,
  mobile_push_enabled: false,
  default_timezone: "Asia/Manila",
  default_lead_minutes: [30],
  default_quiet_hours_start: "22:00",
  default_quiet_hours_end: "07:00",
  calendar_past_days: 365,
  calendar_future_days: 365,
  reorder_now_days: 14,
  plan_reorder_days: 30,
  default_replenishment_snooze_days: 7,
  attachment_max_bytes: 10_485_760,
  attachment_allowed_types: ["image/jpeg", "image/png", "application/pdf"],
  reminders_enabled: true,
  calendar_enabled: true,
  calculator_snapshots_enabled: true,
  goals_enabled: true,
  referrals_enabled: false,
}

const BooleanSelect = ({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) => (
  <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-200/70 bg-slate-50/50">
    <div className="flex items-center justify-between">
      <Label className="text-xs font-semibold text-slate-700">{label}</Label>
      <span
        className={`size-2 rounded-full ${value ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
      />
    </div>
    <Select
      value={value ? "true" : "false"}
      onValueChange={(val) => onChange(val === "true")}
      disabled={disabled}
    >
      <Select.Trigger className="h-7 text-xs bg-white">
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="true">Active / Enabled</Select.Item>
        <Select.Item value="false">Inactive / Disabled</Select.Item>
      </Select.Content>
    </Select>
  </div>
)

const ResearchHubSettingsPage = () => {
  const client = useQueryClient()
  const settingsQuery = useQuery({
    queryKey: ["research-hub-settings"],
    queryFn: () =>
      sdk.client.fetch<{ settings: Settings }>("/admin/research-hub/settings"),
  })
  const deliveriesQuery = useQuery({
    queryKey: ["research-hub-notifications"],
    queryFn: () =>
      sdk.client.fetch<{ notifications: Delivery[] }>(
        "/admin/research-hub/notifications",
      ),
  })
  const attachmentsQuery = useQuery({
    queryKey: ["research-hub-journal-attachments"],
    queryFn: () =>
      sdk.client.fetch<{
        total: number
        attachments: AttachmentOperation[]
      }>("/admin/research-hub/journal-attachment-operations"),
  })
  const [settings, setSettings] = useState<Settings>(defaults)

  useEffect(() => {
    if (settingsQuery.data?.settings) setSettings(settingsQuery.data.settings)
  }, [settingsQuery.data])

  const mutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/research-hub/settings", {
        method: "POST",
        body: settings,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["research-hub-settings"] })
      toast.success("Research Hub settings saved")
    },
    onError: (error) =>
      toast.error(error.message || "Research Hub settings could not be saved"),
  })

  const [activeTab, setActiveTab] = useState<"modules" | "schedules" | "telemetry">("modules")

  const setNumber = (key: keyof Settings, value: string) =>
    setSettings({ ...settings, [key]: Number(value) })

  const activeFeaturesCount = useMemo(() => {
    return [
      settings.reminders_enabled,
      settings.calendar_enabled,
      settings.calculator_snapshots_enabled,
      settings.goals_enabled,
      settings.referrals_enabled,
    ].filter(Boolean).length
  }, [settings])

  if (settingsQuery.isLoading) {
    return <SovereignPageSkeleton cards={4} rows={6} />
  }

  const tabs = [
    { id: "modules" as const, label: "Features & Channels", badgeText: `${activeFeaturesCount} Active` },
    { id: "schedules" as const, label: "Schedule & Quotas" },
    { id: "telemetry" as const, label: "Telemetry & Logs", count: deliveriesQuery.data?.notifications?.length ?? 0 },
  ]

  return (
    <div className="flex flex-col gap-4 pb-8 px-6 pt-6 w-full">
      {/* 1. Standard PageHeader */}
      <PageHeader
        eyebrowText="Research Hub · System Settings"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Research Hub Settings" },
        ]}
        title="Research Hub Settings"
        subtitle="Configure customer scheduling features, quiet hours, and operational defaults. Private Journal entries, measurement values, and calculation snapshots remain client-side encrypted per DPA 2012."
        actions={
          <Button
            size="small"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            Save Settings
          </Button>
        }
      />

      {/* 2. SADS 2.0 Compact 4-Tile Metric Rail (~82px height) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Active Capabilities"
          value={`${activeFeaturesCount} / 5`}
          icon={<Sparkles className="size-4" />}
          variant="blue"
          status="healthy"
          subtext="Customer research modules enabled"
        />
        <AdminMetricCard
          label="Reminder Telemetry"
          value={settings.in_app_enabled ? "In-App Active" : "Disabled"}
          icon={<BellAlert className="size-4" />}
          variant={settings.in_app_enabled ? "emerald" : "amber"}
          status={settings.in_app_enabled ? "healthy" : "warning"}
          subtext={`Quiet Hours: ${settings.default_quiet_hours_start}–${settings.default_quiet_hours_end}`}
        />
        <AdminMetricCard
          label="Attachment Quota"
          value={`${Math.round(settings.attachment_max_bytes / (1024 * 1024))} MB`}
          icon={<DocumentText className="size-4" />}
          variant="purple"
          status="neutral"
          subtext={`${settings.attachment_allowed_types.length} allowed MIME types`}
        />
        <AdminMetricCard
          label="Privacy Standard"
          value="DPA 2012"
          icon={<ShieldCheck className="size-4" />}
          variant="emerald"
          status="healthy"
          subtext="AES-256 client-side partition"
        />
      </div>

      {/* SADS 2.0 Telemetry Notice Banner */}
      <AdminTelemetryNotice
        title="Research Hub Clinical Settings & Cryptographic Policies Active"
        description="Operational defaults and customer scheduling policies. Private Journal entries, measurement values, and dilution snapshots are client-side encrypted per Republic Act 10173."
        statusText="AES-256 VAULT LOCKED"
        variant="indigo"
      />

      {/* 3. Segmented Navigation Tabs */}
      <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
        <AdminSegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
      </div>

      {/* 4. Tab Panels */}
      {activeTab === "modules" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Features &amp; Modules</h2>
                <p className="text-xs text-slate-500 mt-0.5">Toggle active customer modules in the research hub portal.</p>
              </div>
              <Badge size="small" color="blue">{activeFeaturesCount} Active</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <BooleanSelect label="Reminders" value={settings.reminders_enabled} onChange={(value) => setSettings({ ...settings, reminders_enabled: value })} />
              <BooleanSelect label="Calendar" value={settings.calendar_enabled} onChange={(value) => setSettings({ ...settings, calendar_enabled: value })} />
              <BooleanSelect label="Saved calculations" value={settings.calculator_snapshots_enabled} onChange={(value) => setSettings({ ...settings, calculator_snapshots_enabled: value })} />
              <BooleanSelect label="Goals and badges" value={settings.goals_enabled} onChange={(value) => setSettings({ ...settings, goals_enabled: value })} />
              <BooleanSelect label="Referrals" value={settings.referrals_enabled} onChange={(value) => setSettings({ ...settings, referrals_enabled: value })} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Reminder Channels</h2>
                <p className="text-xs text-slate-500 mt-0.5">In-app notifications are active. External webhook channels remain disabled until configured.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BooleanSelect label="In-app" value={settings.in_app_enabled} onChange={(value) => setSettings({ ...settings, in_app_enabled: value })} />
              <BooleanSelect label="Email (External Provider)" value={false} onChange={() => undefined} disabled />
              <BooleanSelect label="Browser Push (Web API)" value={false} onChange={() => undefined} disabled />
              <BooleanSelect label="Mobile Push (APNs / FCM)" value={false} onChange={() => undefined} disabled />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="small"
              className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Save Module Settings
            </Button>
          </div>
        </div>
      )}

      {activeTab === "schedules" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Schedule &amp; Quiet Hours Boundaries</h2>
                <p className="text-xs text-slate-500 mt-0.5">Calibrate automated alert schedules and quiet hours.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Timezone</Label>
                <Input className="h-8 text-xs mt-1" value={settings.default_timezone} onChange={(event) => setSettings({ ...settings, default_timezone: event.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Lead Minutes</Label>
                <Input className="h-8 text-xs mt-1" value={settings.default_lead_minutes.join(", ")} onChange={(event) => setSettings({ ...settings, default_lead_minutes: event.target.value.split(",").map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value >= 0) })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Quiet Hours Start</Label>
                <Input className="h-8 text-xs mt-1" type="time" value={settings.default_quiet_hours_start} onChange={(event) => setSettings({ ...settings, default_quiet_hours_start: event.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Quiet Hours End</Label>
                <Input className="h-8 text-xs mt-1" type="time" value={settings.default_quiet_hours_end} onChange={(event) => setSettings({ ...settings, default_quiet_hours_end: event.target.value })} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Replenishment &amp; Calendar Limits</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure reorder intervals and historical journal lookback days.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Calendar History (Days)</Label>
                <Input className="h-8 text-xs mt-1" type="number" min="0" value={settings.calendar_past_days} onChange={(event) => setNumber("calendar_past_days", event.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Calendar Future (Days)</Label>
                <Input className="h-8 text-xs mt-1" type="number" min="1" value={settings.calendar_future_days} onChange={(event) => setNumber("calendar_future_days", event.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Reorder-Soon (Days)</Label>
                <Input className="h-8 text-xs mt-1" type="number" min="1" value={settings.reorder_now_days} onChange={(event) => setNumber("reorder_now_days", event.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Plan-Reorder (Days)</Label>
                <Input className="h-8 text-xs mt-1" type="number" min="1" value={settings.plan_reorder_days} onChange={(event) => setNumber("plan_reorder_days", event.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Snooze Duration (Days)</Label>
                <Input className="h-8 text-xs mt-1" type="number" min="1" value={settings.default_replenishment_snooze_days} onChange={(event) => setNumber("default_replenishment_snooze_days", event.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Attachment &amp; File Quotas</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage encrypted Journal file sizes and allowed MIME types.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Attachment Quota (MB)</Label>
                <Input
                  className="h-8 text-xs mt-1"
                  type="number"
                  min="1"
                  max="100"
                  value={Math.round(settings.attachment_max_bytes / (1024 * 1024))}
                  onChange={(event) => {
                    const mb = Math.max(1, Number(event.target.value) || 1)
                    setSettings({ ...settings, attachment_max_bytes: mb * 1024 * 1024 })
                  }}
                />
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {(settings.attachment_max_bytes).toLocaleString()} bytes limit
                </p>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Allowed Attachment MIME Types</Label>
                <Input
                  className="h-8 text-xs mt-1"
                  value={settings.attachment_allowed_types.join(", ")}
                  onChange={(event) => setSettings({ ...settings, attachment_allowed_types: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })}
                />
                <p className="text-[10px] text-slate-400 mt-1">Comma-separated e.g. image/jpeg, image/png, application/pdf</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              size="small"
              className="h-8 text-xs bg-slate-900 text-white hover:bg-slate-800"
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Save Schedule Settings
            </Button>
          </div>
        </div>
      )}

      {activeTab === "telemetry" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Notification Delivery Operations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Operational metadata only; customer notification body is client encrypted.</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 mt-2">
              {deliveriesQuery.data?.notifications.length ? deliveriesQuery.data.notifications.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <Text weight="plus" className="text-xs font-semibold">{item.type.replaceAll("_", " ")}</Text>
                    <Text size="xsmall" className="text-slate-500">{item.channel} · {new Date(item.scheduled_for).toLocaleString()} · template {item.template_version}</Text>
                  </div>
                  <Badge size="small" color={item.status === "delivered" ? "green" : item.status === "failed" ? "red" : "grey"}>{item.status}</Badge>
                </div>
              )) : <Text size="small" className="py-6 text-center text-slate-400">No delivery records yet.</Text>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Journal Attachment Operations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Operational metadata only per DPA 2012. Admin cannot access filenames or customer Journal contents.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {attachmentsQuery.data?.total ?? 0} total records
              </span>
            </div>
            <div className="divide-y divide-slate-100 mt-2">
              {attachmentsQuery.data?.attachments.length ? attachmentsQuery.data.attachments.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <Text weight="plus" className="text-xs font-semibold font-mono">{item.mime_type}</Text>
                    <Text size="xsmall" className="text-slate-500">
                      {(item.size_bytes / 1024).toFixed(1)} KiB · {new Date(item.uploaded_at).toLocaleString()}
                    </Text>
                  </div>
                  <div className="flex gap-2">
                    <Badge size="small" color={item.status === "active" ? "green" : "grey"}>{item.status}</Badge>
                    <Badge size="small" color={item.scan_status === "clean" ? "green" : item.scan_status === "quarantined" ? "red" : "orange"}>{item.scan_status}</Badge>
                  </div>
                </div>
              )) : <Text size="small" className="py-6 text-center text-slate-400">No attachment records yet.</Text>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResearchHubSettingsPage
