import { readFileSync } from "node:fs"
import { join } from "node:path"

const routesRoot = join(__dirname, "..", "..")
const srcRoot = join(__dirname, "..", "..", "..", "..")

describe("merchant product details", () => {
  it("keeps routine product review compact and moves advanced operations to drawers", () => {
    const source = readFileSync(
      join(routesRoot, "compounded-products/[id]/page.tsx"),
      "utf8",
    )

    expect(source).toContain("expandedRecipeIds")
    expect(source).toContain("<Copy")
    expect(source).toContain("Publication readiness")
    expect(source).toContain("Advanced operations")
    expect(source).toContain("Governance and classification")
    expect(source).toContain("Governance audit history")
    expect(source).toContain("<Drawer")
    expect(source).toContain("Historical events can reference")
    expect(source).toContain("no longer part of current product creation")
  })

  it("does not emit a family-assignment event during presentation-only creation", () => {
    const creationPage = readFileSync(
      join(routesRoot, "compounded-products/page.tsx"),
      "utf8",
    )
    const creationWorkflow = readFileSync(
      join(srcRoot, "workflows/create-compounded-product-draft.ts"),
      "utf8",
    )
    const familyWorkflow = readFileSync(
      join(srcRoot, "workflows/manage-compound-family.ts"),
      "utf8",
    )

    expect(creationPage).toContain("compound_family_id: null")
    expect(creationWorkflow).not.toContain('"compound_family_assigned"')

    // The event remains supported for immutable historical records and the
    // explicit legacy family-management workflow.
    expect(familyWorkflow).toContain('"compound_family_assigned"')
  })
})
