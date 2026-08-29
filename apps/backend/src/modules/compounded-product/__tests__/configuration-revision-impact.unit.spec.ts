import {
  compareCompoundedProductConfigurationRevisions,
  validateCompoundedProductRevisionDecision,
} from "../configuration-revision-impact"
import type { CompoundedProductPresentationSnapshot } from "../contracts/configuration"
import { fingerprintCompoundedProductConfiguration } from "../configuration-fingerprint"

const snapshot: CompoundedProductPresentationSnapshot = {
  schema_version: "1",
  label: "Vial",
  description: null,
  fields: [],
  variation_axes: [],
  sku_suggestion_policy: null,
  readiness_policy: {
    schema_version: "1",
    require_price: true,
    require_sales_channel: true,
    require_bom_for_managed_inventory: true,
    require_valid_structured_measurements: true,
    require_governance_audit: true,
  },
  variant_warning_threshold: 100,
}

const revision = (
  id: string,
  number: number,
  status: "active" | "superseded" | "blocked",
  value: CompoundedProductPresentationSnapshot = snapshot,
) => ({
  id,
  revision: number,
  status,
  snapshot: value,
  fingerprint: fingerprintCompoundedProductConfiguration(value),
  presentation_id: "presentation_1",
})
describe("configuration revision impact", () => {
  it("creates a deterministic comparison and permits an explicit eligible retain", () => {
    const previous = revision("revision_1", 1, "superseded")
    const current = revision("revision_2", 2, "active", {
      ...snapshot,
      fields: [
        {
          key: "net_content",
          label: "Net content",
          help_text: null,
          position: 0,
          requirement: "draft",
          metadata_target: null,
          kind: "measurement",
          dimension: "mass",
          allowed_display_units: ["mcg", "mg", "g"],
          allow_product_specific_iu: false,
        },
      ],
    })
    const impact = compareCompoundedProductConfigurationRevisions({
      from: previous,
      to: current,
    })

    expect(impact.changed_fields).toEqual([
      { key: "net_content", change: "added" },
    ])
    expect(impact.retain_eligible).toBe(true)
    expect(impact.impact_fingerprint).toMatch(/^[a-f0-9]{64}$/)
    expect(
      validateCompoundedProductRevisionDecision({
        requestedRevision: previous,
        currentRevision: current,
        resolution: {
          action: "retain",
          from_revision_id: previous.id,
          to_revision_id: current.id,
          impact_fingerprint: impact.impact_fingerprint,
          reason: "Finish the reviewed draft on its pinned meaning",
        },
      }),
    ).toMatchObject({ action: "retain" })
  })

  it("requires a fresh decision and refuses retention of blocked revisions", () => {
    const blocked = revision("revision_1", 1, "blocked")
    const current = revision("revision_2", 2, "active")
    const impact = compareCompoundedProductConfigurationRevisions({
      from: blocked,
      to: current,
    })

    expect(() =>
      validateCompoundedProductRevisionDecision({
        requestedRevision: blocked,
        currentRevision: current,
        resolution: null,
      }),
    ).toThrow("configuration_revision_decision_required")
    expect(() =>
      validateCompoundedProductRevisionDecision({
        requestedRevision: blocked,
        currentRevision: current,
        resolution: {
          action: "retain",
          from_revision_id: blocked.id,
          to_revision_id: current.id,
          impact_fingerprint: impact.impact_fingerprint,
          reason: "Attempt to keep blocked configuration",
        },
      }),
    ).toThrow("configuration_revision_cannot_be_retained")
  })

  it("validates migration from the exact compared revision", () => {
    const previous = revision("revision_1", 1, "superseded")
    const current = revision("revision_2", 2, "active")
    const impact = compareCompoundedProductConfigurationRevisions({
      from: previous,
      to: current,
    })

    expect(
      validateCompoundedProductRevisionDecision({
        requestedRevision: current,
        currentRevision: current,
        decisionFromRevision: previous,
        resolution: {
          action: "migrate",
          from_revision_id: previous.id,
          to_revision_id: current.id,
          impact_fingerprint: impact.impact_fingerprint,
          reason: "Move the unfinished draft to the active revision",
        },
      }),
    ).toMatchObject({ action: "migrate" })
  })

  it("detects a deactivated value without rewriting the prior revision", () => {
    const activeValueSnapshot: CompoundedProductPresentationSnapshot = {
      ...snapshot,
      variation_axes: [
        {
          key: "net_content",
          semantic_name: "Net Content",
          help_text: null,
          position: 0,
          values: [
            {
              key: "one_milligram",
              label: "1 mg",
              position: 0,
              active: true,
              measurement: {
                amount: "1",
                display_unit: "mg",
                material_profile_id: null,
              },
            },
          ],
        },
      ],
    }
    const inactiveValueSnapshot: CompoundedProductPresentationSnapshot = {
      ...activeValueSnapshot,
      variation_axes: [
        {
          ...activeValueSnapshot.variation_axes[0],
          values: [
            {
              ...activeValueSnapshot.variation_axes[0].values[0],
              active: false,
            },
          ],
        },
      ],
    }
    const previous = revision(
      "revision_active_value",
      1,
      "superseded",
      activeValueSnapshot,
    )
    const current = revision(
      "revision_inactive_value",
      2,
      "active",
      inactiveValueSnapshot,
    )
    const impact = compareCompoundedProductConfigurationRevisions({
      from: previous,
      to: current,
    })

    expect(impact.changed_variation_axes).toEqual([
      { key: "net_content", change: "changed" },
    ])
    expect(
      (previous.snapshot as CompoundedProductPresentationSnapshot)
        .variation_axes[0].values[0].active,
    ).toBe(true)
    expect(
      (current.snapshot as CompoundedProductPresentationSnapshot)
        .variation_axes[0].values[0].active,
    ).toBe(false)
  })
})
