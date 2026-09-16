/**
 * @file    apps/backend/src/admin/routes/customer-support/settings/page.tsx
 * @module  CustomerSupportSettingsPage
 * @purpose Admin configuration for customer support widget, business hours, and auto-acknowledgements.
 * @contracts
 *   API:     GET/POST /admin/customer-support-settings
 *   Service: CustomerSupportModuleService
 */

import {
  Badge,
  Button,
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

import { PageHeader } from "../../../components/page-header"
import { SovereignPageSkeleton } from "../../../components/ui/sovereign-page-skeleton"
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

  if (!settings) {
    return (
      <div className="sovereign-page px-3.5 sm:px-6 pt-4 pb-12 w-full min-h-screen">
        <SovereignPageSkeleton cards={2} rows={8} />
      </div>
    )
  }

  return (
    <div className="sovereign-page px-3.5 sm:px-6 pt-4 pb-12 flex flex-col gap-y-6 w-full min-h-screen">
      <PageHeader
        title="Support Settings"
        subtitle="Manage the customer support experience, business hours, SLA response times, and automated acknowledgements."
        eyebrowText="Customer Support · Settings & Operations"
        actions={
          <Link to="/customer-support">
            <Button size="small" variant="secondary" className="h-8 text-xs font-semibold">Back to inbox</Button>
          </Link>
        }
      />

      {/* Card 1: General Settings & Throttling */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col gap-y-6">
        <div>
          <Heading level="h2" className="text-sm font-semibold text-slate-900">General Support &amp; Availability</Heading>
          <Text size="small" className="text-slate-500 mt-0.5">Control customer-facing launcher visibility, messaging quotas, and auto-acknowledgement wording.</Text>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Toggle label="Support Enabled" description="Allows signed-in researchers and customers to open conversations." checked={settings.support_enabled} onChange={(support_enabled) => setSettings({ ...settings, support_enabled })} />
          <Toggle label="Side Panel Dock Launcher" description="Displays the floating support bubble throughout the storefront." checked={settings.side_panel_enabled} onChange={(side_panel_enabled) => setSettings({ ...settings, side_panel_enabled })} />
          <Field label="Display Name"><Input value={settings.display_name} onChange={(event) => setSettings({ ...settings, display_name: event.target.value })} className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" /></Field>
          <Field label="Time Zone"><Input value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })} className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" /></Field>
          <Field label="Response-Time SLA Message"><Input value={settings.response_time_message} onChange={(event) => setSettings({ ...settings, response_time_message: event.target.value })} className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" /></Field>
          <Field label="Offline Message"><Input value={settings.offline_message} onChange={(event) => setSettings({ ...settings, offline_message: event.target.value })} className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" /></Field>
          <Field label="Customer Messages Per Hour Limit"><Input type="number" min={1} max={100} value={settings.customer_message_limit_per_hour} onChange={(event) => setSettings({ ...settings, customer_message_limit_per_hour: Number(event.target.value) })} className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" /></Field>
          <Field label="Maximum Attachment Size (MiB)"><Input type="number" min={1} max={25} value={Math.floor(settings.maximum_attachment_size_bytes / 1024 / 1024)} onChange={(event) => setSettings({ ...settings, maximum_attachment_size_bytes: Number(event.target.value) * 1024 * 1024 })} className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" /></Field>
          <Toggle label="Attachments Enabled" description="Accepts validated private PDF, PNG, and JPEG files." checked={settings.attachment_uploads_enabled} onChange={(attachment_uploads_enabled) => setSettings({ ...settings, attachment_uploads_enabled })} />
          <Toggle label="Business Hours Filter" description="Labels staff presence based on structured weekly schedule." checked={settings.business_hours_enabled} onChange={(business_hours_enabled) => setSettings({ ...settings, business_hours_enabled })} />
          <Toggle label="Automatic Acknowledgement" description="Instantly acknowledges inbound customer messages." checked={settings.auto_acknowledgement_enabled} onChange={(auto_acknowledgement_enabled) => setSettings({ ...settings, auto_acknowledgement_enabled })} />
          <Toggle label="Email Notifications Gate" description="Requires an authorized transactional email provider." checked={settings.email_notifications_enabled} onChange={(email_notifications_enabled) => setSettings({ ...settings, email_notifications_enabled })} />
          <div className="md:col-span-2">
            <Field label="Automatic Acknowledgement Body">
              <Textarea value={settings.auto_acknowledgement_text} onChange={(event) => setSettings({ ...settings, auto_acknowledgement_text: event.target.value })} className="text-xs bg-slate-50 border-slate-200/80 focus:bg-white min-h-[72px]" />
            </Field>
          </div>
        </div>

        {/* Business Hours Matrix */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div>
            <Text size="small" weight="plus" className="text-slate-900">Weekly Operating Schedule</Text>
            <Text size="small" className="text-slate-500">Philippine Standard Time (PST, UTC+8).</Text>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {settings.business_hours.map((day, index) => (
              <div key={day.day} className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-2.5">
                <Switch checked={day.open} onCheckedChange={(open) => setSettings({ ...settings, business_hours: settings.business_hours.map((item, itemIndex) => itemIndex === index ? { ...item, open } : item) })} />
                <span className="text-xs font-semibold w-24 text-slate-700">{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day.day]}</span>
                <Input type="time" disabled={!day.open} value={day.opens_at || "09:00"} onChange={(event) => setSettings({ ...settings, business_hours: settings.business_hours.map((item, itemIndex) => itemIndex === index ? { ...item, opens_at: event.target.value } : item) })} className="h-7 text-xs bg-white" />
                <Input type="time" disabled={!day.open} value={day.closes_at || "17:00"} onChange={(event) => setSettings({ ...settings, business_hours: settings.business_hours.map((item, itemIndex) => itemIndex === index ? { ...item, closes_at: event.target.value } : item) })} className="h-7 text-xs bg-white" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button size="small" isLoading={saveSettings.isPending} disabled={saveSettings.isPending} onClick={() => saveSettings.mutate()} className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800">
            Save Support Settings
          </Button>
        </div>
      </div>

      {/* Card 2: Customer Inquiry Categories */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col gap-y-4">
        <div>
          <Heading level="h2" className="text-sm font-semibold text-slate-900">Inquiry Categories</Heading>
          <Text size="small" className="text-slate-500 mt-0.5">Define structured inquiry categories to route customer support tickets effectively.</Text>
        </div>
        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-lg overflow-hidden">
          {categories.map((category, index) => (
            <div key={category.key} className="grid gap-3 p-3.5 sm:grid-cols-[160px_1fr_auto] items-center hover:bg-slate-50/50 transition-colors">
              <div>
                <span className="text-xs font-mono font-bold text-slate-900">{category.key}</span>
                <div className="mt-1">
                  <Badge size="small" color={category.enabled ? "green" : "grey"} className="text-[10px]">
                    {category.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <Input value={category.label} onChange={(event) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="Label" className="h-7 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" />
                <Input value={category.guidance || ""} placeholder="Optional customer guidance text" onChange={(event) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, guidance: event.target.value || null } : item))} className="h-7 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={category.enabled} onCheckedChange={(enabled) => setCategories(categories.map((item, itemIndex) => itemIndex === index ? { ...item, enabled } : item))} />
                <Button size="small" variant="secondary" isLoading={saveCategory.isPending} onClick={() => saveCategory.mutate(category)} className="h-7 text-xs font-semibold">
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Support Roles Note */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 shadow-2xs flex items-start gap-3">
        <span className="text-blue-600 font-bold text-sm">ℹ</span>
        <div>
          <span className="text-xs font-bold text-slate-900">Support Access Control</span>
          <p className="text-xs text-slate-600 mt-0.5">
            Support Agent and Support Manager permissions utilize Medusa’s native RBAC roles. Assign team members from Settings → Users.
          </p>
        </div>
      </div>

      {/* Card 4: Saved Responses */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col gap-y-4">
        <div>
          <Heading level="h2" className="text-sm font-semibold text-slate-900">Saved Canned Responses</Heading>
          <Text size="small" className="text-slate-500 mt-0.5">Pre-approved response library. Agents can insert these drafts directly into live chat.</Text>
        </div>

        <div className="space-y-2">
          {savedQuery.data?.responses.map((response) => (
            <div key={response.id} className="flex items-start justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors">
              <div>
                <span className="text-xs font-bold text-slate-900">{response.title}</span>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{response.body}</p>
              </div>
              <Button size="small" variant="danger" onClick={() => removeSaved.mutate(response.id)} className="h-7 text-xs font-semibold ml-4 shrink-0">
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-900">Create New Canned Response</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Response Title">
              <Input value={savedTitle} onChange={(event) => setSavedTitle(event.target.value)} placeholder="e.g. Standard Protocol Dosage Guidance" className="h-8 text-xs bg-slate-50 border-slate-200/80 focus:bg-white" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Response Body Text">
                <Textarea value={savedBody} onChange={(event) => setSavedBody(event.target.value)} placeholder="Enter the complete response text..." className="text-xs bg-slate-50 border-slate-200/80 focus:bg-white min-h-[80px]" />
              </Field>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="small" disabled={savedTitle.trim().length < 3 || savedBody.trim().length < 3} isLoading={createSaved.isPending} onClick={() => createSaved.mutate()} className="h-8 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800">
              Create Saved Response
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-y-2"><Label>{label}</Label>{children}</div> }
function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-start justify-between gap-4 rounded-lg border border-ui-border-base p-4"><div><Text size="small" leading="compact" weight="plus">{label}</Text><Text size="small" leading="compact" className="text-ui-fg-subtle">{description}</Text></div><Switch checked={checked} onCheckedChange={onChange} /></div> }

export default CustomerSupportSettingsPage
