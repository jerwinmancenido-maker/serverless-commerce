import { readFileSync } from "node:fs"
import { join } from "node:path"

const routeRoot = join(__dirname, "..")

describe("Phase 2: Admin Creator Multi-Select & Custom Kit Template Manager", () => {
  it("provides checkbox multi-select with inline quantity steppers and preset pills in the inventory picker", () => {
    const source = readFileSync(
      join(routeRoot, "combination-inventory-drawer.tsx"),
      "utf8",
    )

    // Checkbox presence
    expect(source).toContain("<Checkbox")
    expect(source).toContain("selectedBatch")
    expect(source).toContain("handleToggleBatchItem")
    expect(source).toContain("handleUpdateBatchQty")

    // Quantity presets [1, 5, 10, 20]
    expect(source).toContain("[1, 5, 10, 20]")

    // Sticky batch action bar
    expect(source).toContain("sticky bottom-0")
    expect(source).toContain("Add Selected Items →")
    expect(source).toContain("applySelectedBatch")
  })

  it("provides user-defined custom kit template manager with create, save, and 1-click apply", () => {
    const drawerSource = readFileSync(
      join(routeRoot, "combination-inventory-drawer.tsx"),
      "utf8",
    )
    const modalSource = readFileSync(
      join(routeRoot, "custom-kit-template-modal.tsx"),
      "utf8",
    )

    // Drawer integration
    expect(drawerSource).toContain("Quick Inclusion Templates")
    expect(drawerSource).toContain("+ Create New Kit Template")
    expect(drawerSource).toContain("applyTemplate")
    expect(drawerSource).toContain("saveTemplate")
    expect(drawerSource).toContain("deleteTemplate")
    expect(drawerSource).toContain("CustomKitTemplateModal")
    expect(drawerSource).toContain("pepstack_kit_templates_v1")

    // Modal implementation
    expect(modalSource).toContain("Create Reusable Kit Template")
    expect(modalSource).toContain("Template Name *")
    expect(modalSource).toContain("Save as Reusable Template")
    expect(modalSource).toContain("onSaveTemplate")
  })

  it("auto-matches finished product candidates by dosage net-content", () => {
    const source = readFileSync(
      join(routeRoot, "combination-inventory-drawer.tsx"),
      "utf8",
    )

    expect(source).toContain("netContentMatch")
    expect(source).toContain("sortedInventoryItems")
    expect(source).toContain("⭐ Recommended")
  })
})
