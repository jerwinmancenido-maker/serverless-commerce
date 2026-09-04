import { readFileSync } from "node:fs"
import { join } from "node:path"

const routeRoot = join(__dirname, "..")

describe("combination inventory workflow", () => {
  it("streamlines Step 4 combinations table by focusing on pricing, photos, and SKUs", () => {
    const source = readFileSync(join(routeRoot, "page.tsx"), "utf8")

    expect(source).toContain('eyebrow="Step 4"')
    expect(source).toContain("<Table.HeaderCell>Price</Table.HeaderCell>")
    expect(source).toContain("<Table.HeaderCell>SKU</Table.HeaderCell>")
    expect(source).not.toContain('title="Inventory recipes"')
    expect(source).not.toContain('eyebrow="Step 5"')
    expect(source).not.toContain(
      "Every product combination needs one finished-product inventory item.",
    )
    expect(source).not.toContain("Finished product required")
  })

  it("uses merchant language and an inline inventory picker", () => {
    const source = readFileSync(
      join(routeRoot, "combination-inventory-drawer.tsx"),
      "utf8",
    )

    expect(source).toContain("Inventory contents —")
    expect(source).toContain("Finished product")
    expect(source).toContain("Included items")
    expect(source).toContain("Used by")
    expect(source).toContain("axisLabel")
    expect(source).toContain("valueLabel")
    expect(source).not.toContain("Affects")
    expect(source).toContain("Advanced inventory mapping")
    expect(source).toContain("Apply contents")
    expect(source).toContain("A finished product still needs to be selected.")
    expect(source).not.toContain("Copy contents from another combination")
    expect(source).not.toContain("copyCombinationComponents")
    expect(source).not.toContain("Finished product shared by")
    expect(source).not.toContain("Included supplies shared by")
    expect(source).not.toContain("Apply packaging to all")
    expect(source).not.toContain("FocusModal")
    expect(source).not.toContain("Save inventory contents")
  })

  it("does not preview incomplete recipes or expose backend identifiers", () => {
    const source = readFileSync(join(routeRoot, "page.tsx"), "utf8")

    expect(source).toContain("completeRowsForAvailability")
    expect(source).toContain("matrix_rows: completeAvailabilityRows.map")
    expect(source).not.toContain("configuredAvailabilityQuery.refetch()")
  })
})
