import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { sdk } from "../../../lib/sdk"

type BusinessDay = {
  day: number
  open: boolean
  opens_at: string | null
  closes_at: string | null
}
type Settings = {
  support_enabled: boolean
  side_panel_enabled: boolean
  display_name: string
  response_time_message: string
  timezone: string
  offline_message: string
  business_hours_enabled: boolean
  business_hours: BusinessDay[]
  attachment_uploads_enabled: boolean
  maximum_attachment_size_bytes: number
  allowed_mime_types: string[]
  customer_message_limit_per_hour: number
  email_notifications_enabled: boolean
  auto_acknowledgement_enabled: boolean
  auto_acknowledgement_text: string
  retention_days: number | null
}
type Category = {
  id?: string
  key: string
  label: string
  guidance: string | null
  enabled: boolean
  sort_order: number
  default_priority: "low" | "normal" | "high" | "urgent"
}
type SavedResponse = {
  id: string
  title: string
  body: string
  category: string | null
  active: boolean
  sort_order: number
}

const CustomerSupportSettingsPage = () => {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ["support-settings"],
    queryFn: () => sdk.client.fetch<{ settings: Settings; categories: Category[] }>("/admin/support-settings"),
  })
  const savedQuery = useQuery({
    queryKey: ["support-saved-responses"],
    queryFn: () => sdk.client.fetch<{ responses: SavedResponse[] }>("/admin/support-saved-responses"),
  })
  const [settings, setSettings] = useState<Settings | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [savedTitle, setSavedTitle] = useState("")
  const [savedBody, setSavedBody] = useState("")

  useEffect(() => {
    if (!query.data) return
    setSettings(query.data.settings)
    setCategories(query.data.categories)
  }, [query.data])

  const saveSettings = useMutation({
    mutationFn: () => sdk.client.fetch("/admin/support-settings", { method: "POST", body: settings }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["support-settings"] })
      toast.success("Support settings saved")
    },
    onError: (error) => toast.error(error.message),
  })
  const saveCategory = useMutation({
    mutationFn: (category: Category) => sdk.client.fetch("/admin/support-categories", { method: "POST", body: category }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["support-settings"] })
      toast.success("Support category saved")
    },
    onError: (error) => toast.error(error.message),
  })
  const createSaved = useMutation({
    mutationFn: () => sdk.client.fetch("/admin/support-saved-responses", { method: "POST", body: { title: savedTitle, body: savedBody, category: null, active: true, sort_order: 0 } }),
    onSuccess: async () => {
      setSavedTitle("")
      setSavedBody("")
      await client.invalidateQueries({ queryKey: ["support-saved-responses"] })
      toast.success("Saved response created")
    },
  })
  const removeSaved = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/support-saved-responses/${id}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["support-saved-responses"] }),
  })

  if (!settings) return <Container><Text>Loading support settings…</Text></Container>

  return <div className="flex flex-col gap-4">
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between px-6 py-4">
        <div><Heading>Support settings</Heading><Text size="small" leading="compact" className="text-ui-fg-subtle">Manage the private customer Support experience without changing source code.</Text></div>
        <Link to="/customer-support"><Button size="small" variant="secondary">Back to inbox</Button></Link>
      </div>
      <div className="grid gap-5 px-6 py-5 md:grid-cols-2">
        <Toggle label="Support enabled" description="Allows signed-in customers to create and continue conversations." checked={settings.support_enabled} onChange={(support_enabled) => setSettings({ ...settings, support_enabled })} />
        <Toggle label="Side panel enabled" description="Shows the compact launcher throughout the storefront." checked={settings.side_panel_enabled} onChange={(side_panel_enabled) => setSettings({ ...settings, side_panel_enabled })} />
        <Field label="Display name"><Input value={settings.display_name} onChange={(event) => setSettings({ ...settings, display_name: event.target.value })} /></Field>
        <Field label="Time zone"><Input value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })} /></Field>
        <Field label="Response-time message"><Input value={settings.response_time_message} onChange={(event) => setSettings({ ...settings, response_time_message: event.target.value })} /></Field>
        <Field label="Offline message"><Input value={settings.offline_message} onChange={(event) => setSettings({ ...settings, offline_message: event.target.value })} /></Field>
        <Field label="Customer messages per hour"><Input type="number" min={1} max={100} value={settings.customer_message_limit_per_hour} onChange={(event) => setSettings({ ...settings, customer_message_limit_per_hour: Number(event.target.value) })} /></Field>
        <Field label="Maximum attachment size (MiB)"><Input type="number" min={1} max={25} value={Math.floor(settings.maximum_attachment_size_bytes / 1024 / 1024)} onChange={(event) => setSettings({ ...settings, maximum_attachment_size_bytes: Number(event.target.value) * 1024 * 1024 })} /></Field>
        <Toggle label="Attachments enabled" description="Accepts validated private PDF, PNG, and JPEG files." checked={settings.attachment_uploads_enabled} onChange={(attachment_uploads_enabled) => setSettings({ ...settings, attachment_uploads_enabled })} />
        <Toggle label="Business hours enabled" description="Uses the structured weekly schedule shown below." checked={settings.business_hours_enabled} onChange={(business_hours_enabled) => setSettings({ ...settings, business_hours_enabled })} />
        <Toggle label="Automatic acknowledgement" description="Clearly labels the configured receipt as automated." checked={settings.auto_acknowledgement_enabled} onChange={(auto_acknowledgement_enabled) => setSettings({ ...settings, auto_acknowledgement_enabled })} />
        <Toggle label="Email notifications" description="Keep disabled until an authorized email provider is configured." checked={settings.email_notifications_enabled} onChange={(email_notifications_enabled) => setSettings({ ...settings, email_notifications_enabled })} />
        <div className="md:col-span-2"><Field label="Automatic acknowledgement text"><Textarea value={settings.auto_acknowledgement_text} onChange={(event) => setSettings({ ...settings, auto_acknowledgement_text: event.target.value })} /></Field></div>
      </div>
      <div className="px-6 py-5">
        <Text size="small" leading="compact" weight="plus">Business hours</Text>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">Philippine time by default. This does not claim real-time staff presence.</Text>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{settings.business_hours.map((day, index) => <div key={day.day} className="flex items-center gap-3 rounded-lg bg-ui-bg-subtle p-3"><Switch checked={day.open} onCheckedChange={(open) => setSettings({ ...settings, business_hours: settings.business_hours.map((item, itemIndex) => itemIndex === index ? { ...item, open } : item) })} /><Text size="small" weight="plus" className="w-20">{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.day]}</Text><Input type="time" disabled={!day.open} value={day.opens_at || "09:00"} onChange={(event) => setSettings({ ...settings, business_hours: settings.business_hours.map((item, itemIndex) => itemIndex === index ? { ...item, opens_at: event.target.value } : item) })} /><Input type="time" disabled={!day.open} value={day.closes_at || "17:00"} onChange={(event) => setSettings({ ...settings, business_hours: settings.business_hours.map((item, itemIndex) => itemIndex === index ? { ...item, closes_at: event.target.value } : item) })} /></div>)}</div>
      </div>
      <div className="flex justify-end px-6 py-4"><Button isLoading={saveSettings.isPending} disabled={saveSettings.isPending} onClick={() => saveSettings.mutate()}>Save settings</Button></div>
    </Container>

    <Container className="divide-y p-0">
      <div className="px-6 py-4"><Heading level="h2">Customer categories</Heading><Text size="small" leading="compact" className="text-ui-fg-subtle">Internal keys remain stable when labels or guidance change.</Text></div>
      <div className="divide-y">{categories.map((category, index) => <div key={category.key} className="grid gap-3 px-6 py-4 md:grid-cols-[160px_1fr_auto]"><div><Text size="small" weight="plus">{category.key}</Text><Badge color={category.enabled ? "green" : "grey"}>{category.enabled ? "Enabled" : "Disabled"}</Badge></div><div className="grid gap-2"><Input value={category.label} onChange={(event) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} /><Input value={category.guidance || ""} placeholder="Optional customer guidance" onChange={(event) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, guidance: event.target.value || null } : item))} /></div><div className="flex items-center gap-2"><Switch checked={category.enabled} onCheckedChange={(enabled) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, enabled } : item))} /><Button size="small" variant="secondary" isLoading={saveCategory.isPending} onClick={() => saveCategory.mutate(category)}>Save</Button></div></div>)}</div>
    </Container>

    <Container>
      <Heading level="h2">Support roles</Heading>
      <Text size="small" leading="compact" className="text-ui-fg-subtle">Support Agent and Support Manager use Medusa’s existing roles and permissions. Assign staff from Settings → Users; other Admin roles receive no Support permission by default.</Text>
    </Container>

    <Container>
      <Heading level="h2">Saved responses</Heading><Text size="small" leading="compact" className="text-ui-fg-subtle">Agents insert active drafts; managers control this library. Staff must review every response before sending.</Text>
      <div className="mt-4 space-y-2">{savedQuery.data?.responses.map((response) => <div key={response.id} className="flex items-start justify-between rounded-lg bg-ui-bg-subtle p-3"><div><Text size="small" weight="plus">{response.title}</Text><Text size="xsmall" className="text-ui-fg-subtle">{response.body.slice(0, 120)}</Text></div><Button size="small" variant="danger" onClick={() => removeSaved.mutate(response.id)}>Remove</Button></div>)}</div>
      <div className="mt-5 grid gap-3"><Field label="Response title"><Input value={savedTitle} onChange={(event) => setSavedTitle(event.target.value)} /></Field><Field label="Response text"><Textarea value={savedBody} onChange={(event) => setSavedBody(event.target.value)} /></Field><Button size="small" disabled={savedTitle.trim().length < 3 || savedBody.trim().length < 3} isLoading={createSaved.isPending} onClick={() => createSaved.mutate()}>Create saved response</Button></div>
    </Container>
  </div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-y-2"><Label>{label}</Label>{children}</div> }
function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-start justify-between gap-4 rounded-lg border border-ui-border-base p-4"><div><Text size="small" leading="compact" weight="plus">{label}</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">{description}</Text></div><Switch checked={checked} onCheckedChange={onChange} /></div> }

export default CustomerSupportSettingsPage
