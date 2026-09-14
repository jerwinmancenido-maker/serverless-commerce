/**
 * @file    apps/backend/src/admin/routes/research-agreements/agreement-form.tsx
 * @module  ResearchAgreementForm
 * @purpose Form component for authoring and editing research terms and compliance agreements.
 * @contracts
 *   Service: ResearchTrackingModuleService
 */

import { Button, Input, Label, Text } from "@medusajs/ui"

import type { ResearchAgreementFormValue } from "./types"

const fields: Array<{
  key: keyof ResearchAgreementFormValue
  label: string
  placeholder?: string
  type?: string
}> = [
  { key: "public_version", label: "Public agreement version", placeholder: "2026-09" },
  { key: "locale", label: "Locale", placeholder: "en-PH" },
  { key: "effective_at", label: "Effective date and time", type: "datetime-local" },
  { key: "terms_version", label: "Terms version" },
  { key: "terms_url", label: "Terms URL", placeholder: "https://..." },
  { key: "terms_digest", label: "Terms SHA-256 digest" },
  { key: "privacy_version", label: "Privacy version" },
  { key: "privacy_url", label: "Privacy URL", placeholder: "https://..." },
  { key: "privacy_digest", label: "Privacy SHA-256 digest" },
  { key: "research_hub_version", label: "Research Hub agreement version" },
  { key: "research_hub_url", label: "Research Hub agreement URL", placeholder: "https://..." },
  { key: "research_hub_digest", label: "Research Hub SHA-256 digest" },
]

export function ResearchAgreementForm({
  value,
  onChange,
  onSave,
  saving,
}: {
  value: ResearchAgreementFormValue
  onChange: (value: ResearchAgreementFormValue) => void
  onSave: () => void
  saving: boolean
}) {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type={field.type || "text"}
              value={String(value[field.key] || "")}
              placeholder={field.placeholder}
              onChange={(event) =>
                onChange({ ...value, [field.key]: event.target.value })
              }
            />
            {field.key.endsWith("digest") ? (
              <Text size="xsmall" className="text-ui-fg-subtle">
                The digest locks the exact published document content.
              </Text>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button size="small" isLoading={saving} onClick={onSave}>
          Save draft
        </Button>
      </div>
    </div>
  )
}
