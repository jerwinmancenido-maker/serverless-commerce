import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { sdk } from "../../lib/sdk"

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
  <div>
    <Label>{label}</Label>
    <Select
      value={value ? "enabled" : "disabled"}
      onValueChange={(next) => onChange(next === "enabled")}
      disabled={disabled}
    >
      <Select.Trigger><Select.Value /></Select.Trigger>
      <Select.Content>
        <Select.Item value="enabled">Enabled</Select.Item>
        <Select.Item value="disabled">Disabled</Select.Item>
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

  const setNumber = (key: keyof Settings, value: string) =>
    setSettings({ ...settings, [key]: Number(value) })

  return (
    <div className="flex flex-col gap-4">
      <Container className="px-6 py-4">
        <Heading>Research Hub settings</Heading>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          Configure customer scheduling features and operational defaults. Admin
          never receives private Journal text, measurement values, or saved
          calculation inputs from this page.
        </Text>
      </Container>

      <Container className="px-6 py-4">
        <Heading level="h2">Features</Heading>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          <BooleanSelect label="Reminders" value={settings.reminders_enabled} onChange={(value) => setSettings({ ...settings, reminders_enabled: value })} />
          <BooleanSelect label="Calendar" value={settings.calendar_enabled} onChange={(value) => setSettings({ ...settings, calendar_enabled: value })} />
          <BooleanSelect label="Saved calculations" value={settings.calculator_snapshots_enabled} onChange={(value) => setSettings({ ...settings, calculator_snapshots_enabled: value })} />
          <BooleanSelect label="Goals and badges" value={settings.goals_enabled} onChange={(value) => setSettings({ ...settings, goals_enabled: value })} />
          <BooleanSelect label="Referrals" value={settings.referrals_enabled} onChange={(value) => setSettings({ ...settings, referrals_enabled: value })} />
        </div>
      </Container>

      <Container className="px-6 py-4">
        <Heading level="h2">Reminder channels</Heading>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          In-app reminders are available now. External channels remain disabled
          until their delivery providers are configured and verified.
        </Text>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <BooleanSelect label="In-app" value={settings.in_app_enabled} onChange={(value) => setSettings({ ...settings, in_app_enabled: value })} />
          <BooleanSelect label="Email · provider not configured" value={false} onChange={() => undefined} disabled />
          <BooleanSelect label="Browser push · provider not configured" value={false} onChange={() => undefined} disabled />
          <BooleanSelect label="Mobile push · provider not configured" value={false} onChange={() => undefined} disabled />
        </div>
      </Container>

      <Container className="px-6 py-4">
        <Heading level="h2">Defaults and limits</Heading>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div><Label>Timezone</Label><Input value={settings.default_timezone} onChange={(event) => setSettings({ ...settings, default_timezone: event.target.value })} /></div>
          <div><Label>Lead minutes</Label><Input value={settings.default_lead_minutes.join(", ")} onChange={(event) => setSettings({ ...settings, default_lead_minutes: event.target.value.split(",").map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value >= 0) })} /></div>
          <div><Label>Quiet hours start</Label><Input type="time" value={settings.default_quiet_hours_start} onChange={(event) => setSettings({ ...settings, default_quiet_hours_start: event.target.value })} /></div>
          <div><Label>Quiet hours end</Label><Input type="time" value={settings.default_quiet_hours_end} onChange={(event) => setSettings({ ...settings, default_quiet_hours_end: event.target.value })} /></div>
          <div><Label>Calendar history days</Label><Input type="number" min="0" value={settings.calendar_past_days} onChange={(event) => setNumber("calendar_past_days", event.target.value)} /></div>
          <div><Label>Calendar future days</Label><Input type="number" min="1" value={settings.calendar_future_days} onChange={(event) => setNumber("calendar_future_days", event.target.value)} /></div>
          <div><Label>Reorder-soon threshold (days)</Label><Input type="number" min="1" value={settings.reorder_now_days} onChange={(event) => setNumber("reorder_now_days", event.target.value)} /></div>
          <div><Label>Plan-reorder threshold (days)</Label><Input type="number" min="1" value={settings.plan_reorder_days} onChange={(event) => setNumber("plan_reorder_days", event.target.value)} /></div>
          <div><Label>Default reorder reminder (days)</Label><Input type="number" min="1" value={settings.default_replenishment_snooze_days} onChange={(event) => setNumber("default_replenishment_snooze_days", event.target.value)} /></div>
          <div><Label>Attachment limit (bytes)</Label><Input type="number" min="1" value={settings.attachment_max_bytes} onChange={(event) => setNumber("attachment_max_bytes", event.target.value)} /></div>
          <div><Label>Allowed attachment MIME types</Label><Input value={settings.attachment_allowed_types.join(", ")} onChange={(event) => setSettings({ ...settings, attachment_allowed_types: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button size="small" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Save settings</Button>
        </div>
      </Container>

      <Container className="p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Notification delivery operations</Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Operational metadata only; customer notification text is private.
          </Text>
        </div>
        <div className="divide-y">
          {deliveriesQuery.data?.notifications.length ? deliveriesQuery.data.notifications.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-3">
              <div><Text weight="plus">{item.type.replaceAll("_", " ")}</Text><Text size="xsmall" className="text-ui-fg-subtle">{item.channel} · {new Date(item.scheduled_for).toLocaleString()} · template {item.template_version}</Text></div>
              <Badge color={item.status === "delivered" ? "green" : item.status === "failed" ? "red" : "grey"}>{item.status}</Badge>
            </div>
          )) : <Text size="small" className="px-6 py-8 text-ui-fg-subtle">No delivery records yet.</Text>}
        </div>
      </Container>

      <Container className="p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Journal attachment operations</Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Operational metadata only. Admin cannot open filenames, customer
            Journal records, or attachment contents. Malware scanning is shown
            as unavailable until a scanning provider is configured.
          </Text>
          <Text size="xsmall" className="mt-2 text-ui-fg-muted">
            {attachmentsQuery.data?.total ?? 0} total attachment records
          </Text>
        </div>
        <div className="divide-y">
          {attachmentsQuery.data?.attachments.length ? attachmentsQuery.data.attachments.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-6 py-3">
              <div>
                <Text weight="plus">{item.mime_type}</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {(item.size_bytes / 1024).toFixed(1)} KiB · {new Date(item.uploaded_at).toLocaleString()}
                </Text>
              </div>
              <div className="flex gap-2">
                <Badge color={item.status === "active" ? "green" : "grey"}>{item.status}</Badge>
                <Badge color={item.scan_status === "clean" ? "green" : item.scan_status === "quarantined" ? "red" : "orange"}>{item.scan_status}</Badge>
              </div>
            </div>
          )) : <Text size="small" className="px-6 py-8 text-ui-fg-subtle">No attachment records yet.</Text>}
        </div>
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({ label: "Research Hub settings" })

export default ResearchHubSettingsPage
