import { readFileSync } from "node:fs"
import { join } from "node:path"

const adminRoot = join(__dirname, "..", "..")

describe("presentation-only product creation", () => {
  it("shows product format inside Add Product without compound-family controls", () => {
    const source = readFileSync(join(adminRoot, "compounded-products/page.tsx"), "utf8")

    expect(source).toContain("<Label>Product format</Label>")
    expect(source).toContain("Add product format")
    expect(source).toContain("Product format is optional for a draft")
    expect(source).not.toContain("<Label>Presentation</Label>")
    expect(source).not.toContain("Add presentation")
    expect(source).toContain("compound_family_id: null")
    expect(source).not.toContain("<Label>Compound family</Label>")
    expect(source).not.toContain("navigate(\"/compound-catalog\")")
  })

  it("retires the standalone Compound Catalog navigation route", () => {
    const source = readFileSync(join(adminRoot, "compound-catalog/page.tsx"), "utf8")

    expect(source).toContain("<Navigate to=\"/compounded-products\" replace />")
    expect(source).not.toContain("defineRouteConfig")
  })
})
