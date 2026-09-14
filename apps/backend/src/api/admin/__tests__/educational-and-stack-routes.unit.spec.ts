/**
 * @file    apps/backend/src/api/admin/__tests__/educational-and-stack-routes.unit.spec.ts
 * @module  EducationalAndStackRoutesUnitSpec
 * @purpose Unit test suite validating public store and admin educational content endpoints,
 *          pharmacodynamic glossary queries, USP storage guidelines, and pairwise stack interaction matrices.
 */

import { GET as getStoreEducationalContent } from "../../store/educational-content/route"
import { GET as getAdminEducationalContent } from "../educational-content/route"
import { GET as getAdminStackInteractions } from "../peptide-stack-interactions/route"

describe("Educational Content & Peptide Stack Routes", () => {
  const createMockRes = () => {
    const res: any = {}
    res.json = jest.fn().mockImplementation((payload) => {
      res.data = payload
      return res
    })
    res.status = jest.fn().mockReturnValue(res)
    return res
  }

  describe("GET /store/educational-content", () => {
    it("returns public glossary, storage guidelines, and FAQ payload", async () => {
      const req: any = { query: {} }
      const res = createMockRes()

      await getStoreEducationalContent(req, res)

      expect(res.json).toHaveBeenCalled()
      const data = res.data
      expect(data).toBeDefined()
      expect(Array.isArray(data.glossary)).toBe(true)
      expect(data.glossary.length).toBeGreaterThan(0)
      expect(Array.isArray(data.faqs)).toBe(true)
      expect(data.storageGuidelines).toBeDefined()
      expect(data.storageGuidelines.tiers).toBeDefined()
      expect(data.storageGuidelines.tiers.refrigerated).toBeDefined()
    })
  })

  describe("GET /admin/educational-content", () => {
    it("returns all glossary terms and faqs without query filters", async () => {
      const req: any = { query: {} }
      const res = createMockRes()

      await getAdminEducationalContent(req, res)

      expect(res.json).toHaveBeenCalled()
      const data = res.data
      expect(data.count.glossary).toBeGreaterThan(0)
      expect(data.count.faqs).toBeGreaterThan(0)
    })

    it("filters glossary terms by category", async () => {
      const req: any = { query: { category: "Pharmacodynamics" } }
      const res = createMockRes()

      await getAdminEducationalContent(req, res)

      const data = res.data
      expect(data.glossary.length).toBeGreaterThan(0)
      for (const item of data.glossary) {
        expect(item.category.toLowerCase()).toBe("pharmacodynamics")
      }
    })

    it("searches glossary terms by query string", async () => {
      const req: any = { query: { query: "Agonist" } }
      const res = createMockRes()

      await getAdminEducationalContent(req, res)

      const data = res.data
      expect(data.glossary.length).toBeGreaterThan(0)
      const matched = data.glossary.some((g: any) => g.term.toLowerCase().includes("agonist"))
      expect(matched).toBe(true)
    })

    it("filters output by type=glossary", async () => {
      const req: any = { query: { type: "glossary" } }
      const res = createMockRes()

      await getAdminEducationalContent(req, res)

      const data = res.data
      expect(data.glossary.length).toBeGreaterThan(0)
      expect(data.faqs).toEqual([])
    })

    it("filters output by type=faq", async () => {
      const req: any = { query: { type: "faq" } }
      const res = createMockRes()

      await getAdminEducationalContent(req, res)

      const data = res.data
      expect(data.glossary).toEqual([])
      expect(data.faqs.length).toBeGreaterThan(0)
    })
  })

  describe("GET /admin/peptide-stack-interactions", () => {
    it("returns pairwise interactions and presets without query filters", async () => {
      const req: any = { query: {} }
      const res = createMockRes()

      await getAdminStackInteractions(req, res)

      expect(res.json).toHaveBeenCalled()
      const data = res.data
      expect(data.pairwise_interactions.length).toBeGreaterThan(0)
      expect(data.presets.length).toBeGreaterThan(0)
      expect(data.count.interactions).toBeGreaterThan(0)
      expect(data.count.presets).toBeGreaterThan(0)
    })

    it("filters pairwise interactions by compound_id=bpc-157", async () => {
      const req: any = { query: { compound_id: "bpc-157" } }
      const res = createMockRes()

      await getAdminStackInteractions(req, res)

      const data = res.data
      expect(data.pairwise_interactions.length).toBeGreaterThan(0)
      for (const rule of data.pairwise_interactions) {
        const containsBpc =
          rule.compound_a.toLowerCase() === "bpc-157" ||
          rule.compound_b.toLowerCase() === "bpc-157"
        expect(containsBpc).toBe(true)
      }
    })

    it("filters pairwise interactions and presets by search keyword", async () => {
      const req: any = { query: { search: "Wolverine" } }
      const res = createMockRes()

      await getAdminStackInteractions(req, res)

      const data = res.data
      const wolverinePreset = data.presets.find((p: any) => p.name.includes("Wolverine"))
      expect(wolverinePreset).toBeDefined()
    })
  })
})
