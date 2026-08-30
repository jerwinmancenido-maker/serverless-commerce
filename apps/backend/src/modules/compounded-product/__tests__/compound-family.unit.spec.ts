import {
  AdminArchiveCompoundFamily,
  AdminAssignCompoundFamily,
  AdminCreateCompoundFamily,
  AdminUpdateCompoundFamily,
} from "../contracts/compound-family"
import { AdminCreateCompoundedProductDraft } from "../contracts/product-creation"

describe("compound family contracts", () => {
  it("accepts a stable family identity and mutable display fields", () => {
    expect(
      AdminCreateCompoundFamily.parse({
        key: "semax",
        name: "Semax",
        description: "Shared identity for Semax product formats.",
      }),
    ).toEqual({
      key: "semax",
      name: "Semax",
      description: "Shared identity for Semax product formats.",
    })

    expect(
      AdminUpdateCompoundFamily.parse({
        family_id: "cpfam_01",
        name: "Semax family",
      }),
    ).toEqual({
      family_id: "cpfam_01",
      name: "Semax family",
      description: null,
    })
  })

  it("does not expose the immutable key through the update contract", () => {
    expect(() =>
      AdminUpdateCompoundFamily.parse({
        family_id: "cpfam_01",
        key: "renamed-family",
        name: "Renamed family",
      }),
    ).toThrow()
  })

  it("rejects unstable family keys and permits explicit unassignment", () => {
    expect(() =>
      AdminCreateCompoundFamily.parse({
        key: "Semax Family",
        name: "Semax",
      }),
    ).toThrow()

    expect(
      AdminAssignCompoundFamily.parse({
        product_id: "prod_01",
        family_id: null,
      }),
    ).toEqual({ product_id: "prod_01", family_id: null })

    expect(AdminArchiveCompoundFamily.parse({ family_id: "cpfam_01" })).toEqual(
      { family_id: "cpfam_01" },
    )
  })

  it("keeps family assignment optional on draft creation", () => {
    const parsed = AdminCreateCompoundedProductDraft.safeParse({
      idempotency_key: "family-draft-contract-test",
      presentation_revision_id: "cppr_01",
      expected_configuration_fingerprint: "a".repeat(64),
      product: {
        title: "Semax Nasal",
        shipping_profile_id: "sp_01",
      },
      variants: [
        {
          matrix_row_key: "b".repeat(64),
        },
      ],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.product.compound_family_id).toBeNull()
      expect(parsed.data.product.compound_format_id).toBeNull()
    }
  })
})
