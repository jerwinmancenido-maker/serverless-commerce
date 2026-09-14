/**
 * @file    apps/backend/src/admin/routes/research-protocols/protocol-visibility.tsx
 * @module  ProtocolVisibility
 * @purpose Protocol visibility scopes, community permissions, and public access controls.
 * @contracts
 *   API:     GET/POST /admin/research-protocols/:id/visibility
 *   Service: ResearchTrackingModuleService
 */

import { Button, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"
import type { ResearchProtocolContent } from "../compounded-products/research-protocol-types"

type AccessLevel = "public" | "member" | "purchaser" | "admin"
type CommunityScope = "member" | "purchaser"
type Visibility = {
  public_page_enabled: boolean
  public_summary: string | null
  public_quick_reference: boolean
  public_faqs: boolean
  public_references: boolean
  public_products: boolean
  public_recommendations: boolean
  member_full_content: boolean
  community_read_scope: CommunityScope
  community_post_scope: CommunityScope
  purchaser_badge_enabled: boolean
  community_edit_window_minutes: number
  community_max_post_length: number
  community_posts_per_hour: number
  community_reports_per_hour: number
  community_reactions_per_minute: number
  community_links_enabled: boolean
  community_attachments_enabled: boolean
  community_auto_hold: boolean
  community_report_hide_threshold: number
  search_indexable: boolean
  field_visibility: Record<string, AccessLevel>
}

type VisibilityResponse = {
  visibility: Visibility
  audit_events: Array<{
    id: string
    reason: string | null
    occurred_at: string
  }>
}

const accessLabels: Record<AccessLevel, string> = {
  public: "Public",
  member: "Signed-in members",
  purchaser: "Verified purchasers",
  admin: "Admin only",
}

const AccessSelect = ({
  value,
  onChange,
  label,
}: {
  value: AccessLevel
  onChange: (value: AccessLevel) => void
  label: string
}) => (
  <label className="grid grid-cols-[minmax(0,1fr)_180px] items-center gap-3">
    <Text size="small">{label}</Text>
    <select
      aria-label={`${label} visibility`}
      value={value}
      onChange={(event) => onChange(event.target.value as AccessLevel)}
      className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
    >
      {(Object.keys(accessLabels) as AccessLevel[]).map((level) => (
        <option key={level} value={level}>
          {accessLabels[level]}
        </option>
      ))}
    </select>
  </label>
)

export const ProtocolVisibility = ({
  protocolId,
  content,
}: {
  protocolId: string
  content: ResearchProtocolContent
}) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Visibility | null>(null)
  const [reason, setReason] = useState("")
  const [previewAccess, setPreviewAccess] =
    useState<AccessLevel>("public")
  const query = useQuery({
    queryKey: ["research-protocol-visibility", protocolId],
    queryFn: () =>
      sdk.client.fetch<VisibilityResponse>(
        `/admin/research-protocols/${protocolId}/visibility`,
      ),
  })
  useEffect(() => {
    if (query.data?.visibility) setForm(query.data.visibility)
  }, [query.data?.visibility])

  const previewQuery = useQuery({
    queryKey: ["research-protocol-access-preview", protocolId, previewAccess],
    queryFn: () =>
      sdk.client.fetch<{
        preview: {
          access_level: AccessLevel
          content: Partial<ResearchProtocolContent>
        }
      }>(`/admin/research-protocols/${protocolId}/preview`, {
        query: { access_level: previewAccess },
      }),
  })

  const fields = useMemo(
    () => [
      { key: "calculator", label: "Calculator defaults", fallback: "purchaser" as const },
      { key: "protocol_levels", label: "Complete schedule tables", fallback: "purchaser" as const },
      { key: "research_purpose", label: "Research purpose", fallback: "purchaser" as const },
      { key: "reference_quantities", label: "Reference quantities", fallback: "purchaser" as const },
      { key: "materials_and_equipment", label: "Materials and equipment", fallback: "purchaser" as const },
      { key: "preparation_and_handling", label: "Preparation and handling", fallback: "purchaser" as const },
      { key: "research_procedure", label: "Research procedure", fallback: "purchaser" as const },
      { key: "storage_and_disposal", label: "Storage and disposal", fallback: "purchaser" as const },
      ...content.quick_reference.map((item) => ({
        key: `quick_reference.${item.key}`,
        label: `Quick fact: ${item.label}`,
        fallback: (form?.public_quick_reference ? "public" : "purchaser") as AccessLevel,
      })),
      ...content.sections.map((section) => ({
        key: `sections.${section.key}`,
        label: `Section: ${section.title}`,
        fallback: "purchaser" as const,
      })),
      ...content.faqs.map((faq) => ({
        key: `faqs.${faq.key}`,
        label: `FAQ: ${faq.question}`,
        fallback: (form?.public_faqs ? "public" : "purchaser") as AccessLevel,
      })),
    ],
    [content, form?.public_faqs, form?.public_quick_reference],
  )

  const save = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Visibility settings are not loaded")
      if (reason.trim().length < 3) {
        throw new Error("Enter a change reason of at least 3 characters")
      }
      return sdk.client.fetch(
        `/admin/research-protocols/${protocolId}/visibility`,
        {
          method: "POST",
          body: { ...form, reason: reason.trim() },
        },
      )
    },
    onSuccess: async () => {
      setReason("")
      toast.success("Protocol visibility updated")
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["research-protocol-visibility", protocolId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["research-protocol-access-preview", protocolId],
        }),
      ])
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Visibility settings could not be saved",
      ),
  })

  if (!form) {
    return <Text size="small" className="text-ui-fg-subtle">Loading visibility settings…</Text>
  }

  const update = <K extends keyof Visibility>(key: K, value: Visibility[K]) =>
    setForm((current) => (current ? { ...current, [key]: value } : current))
  const previewContent = previewQuery.data?.preview.content
  const visibleKeys = previewContent ? Object.keys(previewContent) : []

  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <Text size="small" weight="plus">Visibility and access</Text>
        <Text size="small" className="text-ui-fg-subtle">
          These rules change delivery only. They do not modify an immutable
          published revision.
        </Text>
      </div>
      {[
        ["public_page_enabled", "Public preview page"],
        ["search_indexable", "Allow search-engine indexing"],
        ["public_quick_reference", "Quick facts public by default"],
        ["public_faqs", "FAQs public by default"],
        ["public_references", "References public by default"],
        ["public_products", "Applicable products on public page"],
        ["public_recommendations", "Recommendations on public page"],
        ["member_full_content", "Full current protocol for all members"],
        ["purchaser_badge_enabled", "Allow optional verified-customer badge"],
      ].map(([key, label]) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <Label htmlFor={`visibility-${key}`}>{label}</Label>
          <Switch
            id={`visibility-${key}`}
            checked={Boolean(form[key as keyof Visibility])}
            onCheckedChange={(checked) =>
              update(key as keyof Visibility, checked as never)
            }
          />
        </div>
      ))}
      <div className="grid gap-3">
        <Label>Public summary override</Label>
        <Textarea
          value={form.public_summary || ""}
          onChange={(event) =>
            update("public_summary", event.target.value || null)
          }
          placeholder="Optional public-only summary"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Community read access
          <select
            value={form.community_read_scope}
            onChange={(event) =>
              update("community_read_scope", event.target.value as CommunityScope)
            }
            className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2"
          >
            <option value="purchaser">Verified purchasers</option>
            <option value="member">Signed-in members</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Community posting access
          <select
            value={form.community_post_scope}
            onChange={(event) =>
              update("community_post_scope", event.target.value as CommunityScope)
            }
            className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2"
          >
            <option value="purchaser">Verified purchasers</option>
            <option value="member">Signed-in members</option>
          </select>
        </label>
      </div>
      <details className="rounded-lg border border-ui-border-base p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Community safeguards
        </summary>
        <div className="mt-4 grid gap-4">
          {[
            ["community_auto_hold", "Hold new posts for Admin review"],
            ["community_links_enabled", "Allow links in posts"],
            ["community_attachments_enabled", "Allow community attachments"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={`community-${key}`}>{label}</Label>
              <Switch
                id={`community-${key}`}
                checked={Boolean(form[key as keyof Visibility])}
                onCheckedChange={(checked) =>
                  update(key as keyof Visibility, checked as never)
                }
              />
            </div>
          ))}
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["community_edit_window_minutes", "Edit window (minutes)"],
              ["community_max_post_length", "Maximum post length"],
              ["community_posts_per_hour", "Posts per hour"],
              ["community_reports_per_hour", "Reports per hour"],
              ["community_reactions_per_minute", "Reactions per minute"],
              ["community_report_hide_threshold", "Reports before auto-hide"],
            ].map(([key, label]) => (
              <label key={key} className="grid gap-2 text-sm">
                {label}
                <Input
                  type="number"
                  min={0}
                  value={String(form[key as keyof Visibility])}
                  onChange={(event) =>
                    update(
                      key as keyof Visibility,
                      Number(event.target.value) as never,
                    )
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </details>
      <details className="rounded-lg border border-ui-border-base p-3">
        <summary className="cursor-pointer text-sm font-medium">
          Field and section visibility
        </summary>
        <div className="mt-3 grid gap-3">
          {fields.map((field) => (
            <AccessSelect
              key={field.key}
              label={field.label}
              value={form.field_visibility[field.key] || field.fallback}
              onChange={(value) =>
                update("field_visibility", {
                  ...form.field_visibility,
                  [field.key]: value,
                })
              }
            />
          ))}
        </div>
      </details>
      <div className="rounded-lg border border-ui-border-base p-3">
        <div className="flex items-center justify-between gap-3">
          <Text size="small" weight="plus">Access preview</Text>
          <select
            value={previewAccess}
            onChange={(event) => setPreviewAccess(event.target.value as AccessLevel)}
            className="h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 text-sm"
          >
            {(Object.keys(accessLabels) as AccessLevel[]).map((level) => (
              <option key={level} value={level}>{accessLabels[level]}</option>
            ))}
          </select>
        </div>
        <Text size="small" className="mt-2 text-ui-fg-subtle">
          {previewQuery.isLoading
            ? "Loading exact backend projection…"
            : visibleKeys.length
              ? `Backend returns: ${visibleKeys.join(", ")}`
              : "No protocol fields are visible at this level."}
        </Text>
      </div>
      <div className="grid gap-2">
        <Label>Change reason</Label>
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Why access is changing"
        />
      </div>
      <Button
        size="small"
        isLoading={save.isPending}
        disabled={reason.trim().length < 3}
        onClick={() => save.mutate()}
      >
        Save visibility
      </Button>
      {query.data?.audit_events.length ? (
        <details>
          <summary className="cursor-pointer text-sm">Visibility history</summary>
          <div className="mt-2 grid gap-2">
            {query.data.audit_events.map((event) => (
              <div key={event.id} className="rounded-lg bg-ui-bg-subtle p-2">
                <Text size="small">{event.reason || "Visibility updated"}</Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {new Date(event.occurred_at).toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  )
}
