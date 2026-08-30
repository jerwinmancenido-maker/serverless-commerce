import { createPresentationKey } from "../presentation-key"

describe("presentation key", () => {
  it("creates a stable lowercase key from a merchant-facing name", () => {
    expect(createPresentationKey("Nasal Spray")).toBe("nasal-spray")
    expect(createPresentationKey("Topical / Cream")).toBe("topical-cream")
  })

  it("removes accents and surrounding separators", () => {
    expect(createPresentationKey("  Cápsule (Oral)  ")).toBe("capsule-oral")
  })
})
