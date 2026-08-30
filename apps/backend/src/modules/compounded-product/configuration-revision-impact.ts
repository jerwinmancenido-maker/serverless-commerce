import { MedusaError } from "@medusajs/framework/utils"

import {
  CompoundedProductPresentationSnapshot,
  type CompoundedProductPresentationSnapshot as PresentationSnapshot,
} from "./contracts/configuration"
import { fingerprintCompoundedProductValue } from "./configuration-fingerprint"

type RevisionStatus =
  | "draft"
  | "active"
  | "superseded"
  | "blocked"
  | "archived"

export type ConfigurationRevisionForImpact = {
  id: string
  revision: number
  status: RevisionStatus
  fingerprint: string
  snapshot: unknown
  presentation_id: string
}

type ChangedItem = {
  key: string
  change: "added" | "removed" | "changed"
}

function changedItems(
  from: Array<{ key: string }>,
  to: Array<{ key: string }>,
): ChangedItem[] {
  const fromByKey = new Map(from.map((item) => [item.key, item]))
  const toByKey = new Map(to.map((item) => [item.key, item]))
  const keys = Array.from(new Set([...fromByKey.keys(), ...toByKey.keys()]))

  const changes: ChangedItem[] = []

  for (const key of keys.sort()) {
    const before = fromByKey.get(key)
    const after = toByKey.get(key)

    if (!before) {
      changes.push({ key, change: "added" })
      continue
    }
    if (!after) {
      changes.push({ key, change: "removed" })
      continue
    }
    if (
      fingerprintCompoundedProductValue(before) !==
      fingerprintCompoundedProductValue(after)
    ) {
      changes.push({ key, change: "changed" })
    }
  }

  return changes
}

function parsedSnapshot(revision: ConfigurationRevisionForImpact) {
  const snapshot = CompoundedProductPresentationSnapshot.safeParse(
    revision.snapshot,
  )

  if (!snapshot.success) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Configuration revision ${revision.id} has an invalid snapshot`,
    )
  }

  return snapshot.data
}

export function compareCompoundedProductConfigurationRevisions(input: {
  from: ConfigurationRevisionForImpact
  to: ConfigurationRevisionForImpact
}) {
  if (input.from.presentation_id !== input.to.presentation_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Configuration revision impact can only compare one presentation",
    )
  }

  const fromSnapshot = parsedSnapshot(input.from)
  const toSnapshot = parsedSnapshot(input.to)
  const changed_fields = changedItems(fromSnapshot.fields, toSnapshot.fields)
  const changed_variation_axes = changedItems(
    fromSnapshot.variation_axes,
    toSnapshot.variation_axes,
  )
  const changed_recipe_rules = changedItems(
    fromSnapshot.recipe_rules,
    toSnapshot.recipe_rules,
  )
  const sku_policy_changed =
    fingerprintCompoundedProductValue(fromSnapshot.sku_suggestion_policy) !==
    fingerprintCompoundedProductValue(toSnapshot.sku_suggestion_policy)
  const readiness_policy_changed =
    fingerprintCompoundedProductValue(fromSnapshot.readiness_policy) !==
    fingerprintCompoundedProductValue(toSnapshot.readiness_policy)
  const retain_eligible = ["active", "superseded"].includes(
    input.from.status,
  )
  const comparison = {
    presentation_id: input.from.presentation_id,
    from_revision: {
      id: input.from.id,
      revision: input.from.revision,
      status: input.from.status,
      fingerprint: input.from.fingerprint,
      label: fromSnapshot.label,
    },
    to_revision: {
      id: input.to.id,
      revision: input.to.revision,
      status: input.to.status,
      fingerprint: input.to.fingerprint,
      label: toSnapshot.label,
    },
    retain_eligible,
    label_changed: fromSnapshot.label !== toSnapshot.label,
    description_changed:
      fromSnapshot.description !== toSnapshot.description,
    changed_fields,
    changed_variation_axes,
    changed_recipe_rules,
    sku_policy_changed,
    readiness_policy_changed,
    variant_policy_changed:
      fromSnapshot.variant_warning_threshold !==
      toSnapshot.variant_warning_threshold,
  }

  return {
    ...comparison,
    impact_fingerprint: fingerprintCompoundedProductValue(comparison),
  }
}

export type CompoundedProductConfigurationRevisionImpact = ReturnType<
  typeof compareCompoundedProductConfigurationRevisions
>

export function validateCompoundedProductRevisionDecision(input: {
  requestedRevision: ConfigurationRevisionForImpact
  currentRevision: ConfigurationRevisionForImpact
  decisionFromRevision?: ConfigurationRevisionForImpact | null
  resolution:
    | {
        action: "retain" | "migrate"
        from_revision_id: string
        to_revision_id: string
        impact_fingerprint: string
        reason: string
      }
    | null
}) {
  const { requestedRevision, currentRevision, resolution } = input

  if (requestedRevision.presentation_id !== currentRevision.presentation_id) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "configuration_revision_presentation_changed",
    )
  }

  if (requestedRevision.id === currentRevision.id) {
    if (!resolution) return null
    if (
      resolution.action !== "migrate" ||
      resolution.to_revision_id !== currentRevision.id ||
      !input.decisionFromRevision ||
      resolution.from_revision_id !== input.decisionFromRevision.id
    ) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "configuration_revision_decision_changed",
      )
    }

    const impact = compareCompoundedProductConfigurationRevisions({
      from: input.decisionFromRevision,
      to: currentRevision,
    })

    if (resolution.impact_fingerprint !== impact.impact_fingerprint) {
      throw new MedusaError(
        MedusaError.Types.CONFLICT,
        "configuration_revision_decision_changed",
      )
    }

    return resolution
  }

  const impact = compareCompoundedProductConfigurationRevisions({
    from: requestedRevision,
    to: currentRevision,
  })

  if (
    !resolution ||
    resolution.action !== "retain" ||
    resolution.from_revision_id !== requestedRevision.id ||
    resolution.to_revision_id !== currentRevision.id ||
    resolution.impact_fingerprint !== impact.impact_fingerprint
  ) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "configuration_revision_decision_required",
    )
  }

  if (!impact.retain_eligible) {
    throw new MedusaError(
      MedusaError.Types.CONFLICT,
      "configuration_revision_cannot_be_retained",
    )
  }

  return resolution
}
