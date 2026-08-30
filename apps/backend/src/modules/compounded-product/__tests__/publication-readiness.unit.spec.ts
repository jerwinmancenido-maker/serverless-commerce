import { evaluateCompoundedProductPublicationReadiness } from "../publication-readiness"

const readyInput = {
  registration_exists: true,
  compound_family_assigned: true,
  compound_family_active: true,
  compound_format_assigned: true,
  compound_format_active: true,
  configuration_revision_active: true,
  variant_count: 2,
  prices_ready: true,
  sales_channels_ready: true,
  managed_inventory_requires_bom: true,
  bom_recipes_ready: true,
  structured_measurements_valid: true,
  audit_available: true,
  policy: {
    schema_version: "1" as const,
    require_price: true,
    require_sales_channel: true,
    require_bom_for_managed_inventory: true,
    require_valid_structured_measurements: true,
    require_governance_audit: true,
  },
}

describe("compounded product publication readiness", () => {
  it("passes a governed product only when every pinned policy check passes", () => {
    expect(evaluateCompoundedProductPublicationReadiness(readyInput)).toEqual({
      ready: true,
      blockers: [],
    })
  })

  it("reports every applicable blocker without hiding later failures", () => {
    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        registration_exists: false,
        compound_family_assigned: false,
        compound_family_active: false,
        compound_format_assigned: false,
        compound_format_active: false,
        configuration_revision_active: false,
        variant_count: 0,
        prices_ready: false,
        sales_channels_ready: false,
        bom_recipes_ready: false,
        structured_measurements_valid: false,
        audit_available: false,
      }),
    ).toEqual({
      ready: false,
      blockers: [
        "registration_missing",
        "compound_family_missing",
        "compound_format_missing",
        "configuration_revision_inactive",
        "variant_matrix_empty",
        "price_missing",
        "sales_channel_missing",
        "bom_recipe_missing",
        "structured_measurement_invalid",
        "audit_unavailable",
      ],
    })
  })

  it("requires an active product presentation independently of optional policy checks", () => {
    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        compound_format_assigned: false,
        compound_format_active: false,
      }),
    ).toEqual({ ready: false, blockers: ["compound_format_missing"] })

    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        compound_format_active: false,
      }),
    ).toEqual({ ready: false, blockers: ["compound_format_inactive"] })
  })

  it("requires an active compound family independently of optional policy checks", () => {
    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        compound_family_assigned: false,
        compound_family_active: false,
      }),
    ).toEqual({ ready: false, blockers: ["compound_family_missing"] })

    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        compound_family_active: false,
      }),
    ).toEqual({ ready: false, blockers: ["compound_family_inactive"] })
  })

  it("uses the pinned policy rather than hardcoding optional operations", () => {
    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        prices_ready: false,
        sales_channels_ready: false,
        managed_inventory_requires_bom: false,
        bom_recipes_ready: false,
        structured_measurements_valid: false,
        audit_available: false,
        policy: {
          ...readyInput.policy,
          require_price: false,
          require_sales_channel: false,
          require_bom_for_managed_inventory: false,
          require_valid_structured_measurements: false,
          require_governance_audit: false,
        },
      }),
    ).toEqual({ ready: true, blockers: [] })
  })

  it("requires BOM readiness only for managed inventory under that policy", () => {
    expect(
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        managed_inventory_requires_bom: false,
        bom_recipes_ready: false,
      }),
    ).toEqual({ ready: true, blockers: [] })
  })

  it("rejects malformed readiness input before evaluation", () => {
    expect(() =>
      evaluateCompoundedProductPublicationReadiness({
        ...readyInput,
        variant_count: -1,
      }),
    ).toThrow()
  })
})
