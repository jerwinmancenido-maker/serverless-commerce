import { readFileSync } from "node:fs"
import { join } from "node:path"

const adminRoot = join(__dirname, "..", "..")

describe("admin compounded product edit and telemetry overhaul", () => {
  it("provides native product edit drawer with format, title, categories, and description controls", () => {
    const editDrawerSource = readFileSync(
      join(adminRoot, "compounded-products/[id]/compounded-product-edit-drawer.tsx"),
      "utf8",
    )

    expect(editDrawerSource).toContain("Edit Compounded Product")
    expect(editDrawerSource).toContain("Product name *")
    expect(editDrawerSource).toContain("Product format")
    expect(editDrawerSource).toContain("Categories")
    expect(editDrawerSource).toContain("ProductDescriptionEditor")
    expect(editDrawerSource).toContain("sdk.admin.product.update")
    expect(editDrawerSource).toContain("/admin/compounded-product/products/${product.id}/format")
  })

  it("integrates edit drawer, status toggle, inline price editing, and bottleneck restock button into product details", () => {
    const pageSource = readFileSync(
      join(adminRoot, "compounded-products/[id]/page.tsx"),
      "utf8",
    )

    // Edit Product triggers
    expect(pageSource).toContain("CompoundedProductEditDrawer")
    expect(pageSource).toContain("Edit Product")
    expect(pageSource).toContain("Edit Overview")

    // Publication toggle dropdown
    expect(pageSource).toContain("publicationMutation")
    expect(pageSource).toContain("/admin/compounded-product/products/${id}/publication")

    // Inline price editor
    expect(pageSource).toContain("editingPriceVariantId")
    expect(pageSource).toContain("handleSavePrice")
    expect(pageSource).toContain("sdk.admin.product.updateVariant")

    // Telemetry and restock button
    expect(pageSource).toContain("Sellable Capacity")
    expect(pageSource).toContain("Base Price")
    expect(pageSource).toContain("Restock in Inventory →")
  })
})
