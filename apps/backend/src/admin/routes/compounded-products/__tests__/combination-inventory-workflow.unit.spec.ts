import { readFileSync } from "node:fs"
import { join } from "node:path"

const routeRoot = join(__dirname, "..")

describe("combination inventory workflow", () => {
  it("keeps inventory contents inside the Step 4 combinations table", () => {
    const source = readFileSync(join(routeRoot, "page.tsx"), "utf8")

    expect(source).toContain('eyebrow="Step 4"')
    expect(source).toContain(
      "<Table.HeaderCell>Inventory contents</Table.HeaderCell>",
    )
    expect(source).toContain("<CombinationInventoryDrawer")
    expect(source).not.toContain('title="Inventory recipes"')
    expect(source).not.toContain('eyebrow="Step 5"')
    expect(source).not.toContain(
      "Every product combination needs one finished-product inventory item.",
    )
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
    expect(source).toContain(
      "Stock preview is temporarily unavailable for configured",
    )
    expect(source).not.toContain("configuredAvailabilityQuery.refetch()")
  })
})
