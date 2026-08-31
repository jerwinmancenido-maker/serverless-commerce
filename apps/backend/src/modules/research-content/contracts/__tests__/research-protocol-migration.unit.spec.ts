import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("research protocol series migration", () => {
  const migration = readFileSync(
    join(
      __dirname,
      "..",
      "..",
      "migrations",
      "Migration20260831041552.ts",
    ),
    "utf8",
  )

  it("backfills legacy protocol series before enforcing the relation", () => {
    expect(migration).toContain("Legacy variant-linked protocol series backfilled")
    expect(migration).toContain("'selected_variants'")
    expect(migration).toContain("row_number() over")
    expect(migration).toContain("update \"research_protocol\" rp")
    expect(migration).toContain("alter column \"series_id\" set not null")
    expect(migration.indexOf("update \"research_protocol\" rp")).toBeLessThan(
      migration.indexOf("alter column \"series_id\" set not null"),
    )
  })

  it("rejects ambiguous or orphaned legacy data instead of guessing", () => {
    expect(migration).toContain("a legacy product variant is missing")
    expect(migration).toContain("spans multiple products")
    expect(migration).toContain("backfill did not resolve every revision")
  })

  it("preserves exact variant applicability and records migration provenance", () => {
    expect(migration).toContain("research_protocol_variant_target")
    expect(migration).toContain("rp.\"product_variant_id\"")
    expect(migration).toContain("system:migration:20260831041552")
    expect(migration).toContain("legacy_research_protocol")
  })

  describe("standalone and multi-product migration", () => {
    const productLinkMigration = readFileSync(
      join(__dirname, "..", "..", "migrations", "Migration20260831052732.ts"),
      "utf8",
    )

    it("backfills product links before removing legacy series fields", () => {
      expect(productLinkMigration).toContain("research_protocol_product_link")
      expect(productLinkMigration).toContain("rppl_legacy_")
      expect(productLinkMigration).toContain('add column if not exists "product_link_id"')
      expect(productLinkMigration).toContain("variant does not belong to its linked product")
      expect(productLinkMigration.indexOf('insert into "research_protocol_product_link"')).toBeLessThan(
        productLinkMigration.indexOf('drop column if exists "product_id"'),
      )
    })

    it("enforces one active primary guide per product", () => {
      expect(productLinkMigration).toContain("IDX_research_protocol_product_link_one_active_primary")
      expect(productLinkMigration).toContain("archived_at IS NULL AND is_primary = true")
    })
  })
})
