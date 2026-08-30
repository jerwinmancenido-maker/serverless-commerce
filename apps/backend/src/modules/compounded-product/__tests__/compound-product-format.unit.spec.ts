import {
  AdminArchiveCompoundProductFormat,
  AdminAssignCompoundProductFormat,
  AdminCreateCompoundProductFormat,
  AdminUpdateCompoundProductFormat,
} from "../contracts/compound-product-format"
import { AdminCreateCompoundedProductDraft } from "../contracts/product-creation"

describe("compound product presentation contracts", () => {
  it("accepts a stable key and mutable merchant-facing fields", () => {
    expect(
      AdminCreateCompoundProductFormat.parse({
        key: "nasal",
        name: "Nasal",
        description: "Products supplied in a nasal presentation.",
      }),
    ).toEqual({
      key: "nasal",
      name: "Nasal",
      description: "Products supplied in a nasal presentation.",
    })

    expect(
      AdminUpdateCompoundProductFormat.parse({
        format_id: "cpfmt_01",
        name: "Nasal spray",
      }),
    ).toEqual({
      format_id: "cpfmt_01",
      name: "Nasal spray",
      description: null,
    })
  })

  it("keeps keys immutable and supports archive and unassignment", () => {
    expect(() =>
      AdminUpdateCompoundProductFormat.parse({
        format_id: "cpfmt_01",
        key: "injectable",
        name: "Injectable",
      }),
    ).toThrow()
    expect(
      AdminArchiveCompoundProductFormat.parse({ format_id: "cpfmt_01" }),
    ).toEqual({ format_id: "cpfmt_01" })
    expect(
      AdminAssignCompoundProductFormat.parse({
        product_id: "prod_01",
        format_id: null,
      }),
    ).toEqual({ product_id: "prod_01", format_id: null })
  })

  it("keeps product presentation optional for a draft", () => {
    const parsed = AdminCreateCompoundedProductDraft.parse({
      idempotency_key: "format-draft-contract-test",
      presentation_revision_id: "cppr_01",
      expected_configuration_fingerprint: "a".repeat(64),
      product: {
        title: "Semax Nasal",
        shipping_profile_id: "sp_01",
      },
      variants: [{ matrix_row_key: "b".repeat(64) }],
    })

    expect(parsed.product.compound_format_id).toBeNull()
  })
})
