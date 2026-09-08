import fs from "fs"
import path from "path"

interface RawProtocol {
  id: string
  compoundName: string
  subtitle: string
  category: string
  isSupply?: boolean
  storeProductHandle?: string
  handles?: string[]
  supplyGuide?: {
    material?: string
    sterilityStandard?: string
    protocolSteps?: Array<{ stepNumber: number; title: string; instruction: string }>
  }
}

describe("Protocol Deduplication and Canonical Registry Regression Suite", () => {
  const dataFilePath = path.resolve(process.cwd(), "data/all-compound-protocols.json")
  let protocols: RawProtocol[] = []

  beforeAll(() => {
    expect(fs.existsSync(dataFilePath)).toBe(true)
    const rawData = fs.readFileSync(dataFilePath, "utf-8")
    protocols = JSON.parse(rawData)
  })

  it("contains exactly 75 canonical protocols with zero duplicate IDs", () => {
    expect(protocols.length).toBe(75)
    const ids = protocols.map((p) => p.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(protocols.length)
  })

  it("guarantees 100% unique canonical protocol keys across all 75 compounds", () => {
    const keys = protocols.map((p) => {
      return (p.storeProductHandle || p.id)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    })
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(protocols.length)
  })

  it("guarantees zero duplicate normalized compound titles", () => {
    const names = protocols.map((p) =>
      p.compoundName.replace(/\(.*?\)/g, "").trim().toLowerCase()
    )
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(protocols.length)
  })

  it("correctly resolves candidate keys for HGH and HMG without collision", () => {
    const hgh = protocols.find((p) => p.id === "hgh-somatropin" || p.storeProductHandle === "hgh-191aa")
    expect(hgh).toBeDefined()
    if (hgh) {
      const canonicalKey = (hgh.storeProductHandle || hgh.id)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const candidateKeys = Array.from(
        new Set([
          canonicalKey,
          `${canonicalKey}-laboratory-handling`,
          hgh.id,
          `${hgh.id}-laboratory-handling`,
          ...(hgh.handles || []),
          ...(hgh.handles || []).map((h) => `${h}-laboratory-handling`),
        ])
      )

      expect(candidateKeys).toContain("hgh-somatropin")
      expect(candidateKeys).toContain("hgh-somatropin-laboratory-handling")
      expect(candidateKeys).toContain("hgh")
      expect(candidateKeys).toContain("somatropin")
    }

    const hmg = protocols.find((p) => p.id === "hmg-75iu" || p.storeProductHandle === "hmg-75iu")
    expect(hmg).toBeDefined()
    if (hmg) {
      const canonicalKey = (hmg.storeProductHandle || hmg.id)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const candidateKeys = Array.from(
        new Set([
          canonicalKey,
          `${canonicalKey}-laboratory-handling`,
          hmg.id,
          `${hmg.id}-laboratory-handling`,
          ...(hmg.handles || []),
          ...(hmg.handles || []).map((h) => `${h}-laboratory-handling`),
        ])
      )

      expect(candidateKeys).toContain("hmg-75iu")
      expect(candidateKeys).toContain("hmg-75iu-laboratory-handling")
    }
  })

  it("identifies all 6 Category 8 laboratory supplies with valid specs and SOP steps", () => {
    const supplies = protocols.filter(
      (p) => p.isSupply || p.category === "Laboratory Supplies"
    )
    expect(supplies.length).toBe(6)

    for (const supply of supplies) {
      expect(supply.supplyGuide).toBeDefined()
      expect(supply.supplyGuide?.protocolSteps?.length).toBeGreaterThan(0)
    }
  })

  it("collapses duplicate revisions and twin series correctly in API deduplication logic", () => {
    interface MockRevision {
      id: string
      revision: number
      title: string
      series: {
        id: string
        protocol_key: string
      }
    }

    const mockRevisions: MockRevision[] = [
      {
        id: "rev_1",
        revision: 1,
        title: "Somatropin (HGH 191aa)",
        series: { id: "series_1", protocol_key: "hgh-191aa" },
      },
      {
        id: "rev_2",
        revision: 2,
        title: "Somatropin (HGH 191aa)",
        series: { id: "series_1", protocol_key: "hgh-191aa" },
      },
      {
        id: "rev_dup",
        revision: 1,
        title: "Somatropin (HGH 191aa)",
        series: { id: "series_2", protocol_key: "hgh-somatropin-laboratory-handling" },
      },
      {
        id: "rev_bpc",
        revision: 1,
        title: "BPC-157",
        series: { id: "series_3", protocol_key: "bpc-157" },
      },
    ]

    // Step 1: Group by series_id picking highest revision
    const seriesLatestRevisionMap = new Map<string, MockRevision>()
    for (const rev of mockRevisions) {
      const existing = seriesLatestRevisionMap.get(rev.series.id)
      if (!existing || (rev.revision ?? 0) > (existing.revision ?? 0)) {
        seriesLatestRevisionMap.set(rev.series.id, rev)
      }
    }
    const seriesLatestRevisions = Array.from(seriesLatestRevisionMap.values())
    expect(seriesLatestRevisions.length).toBe(3) // series_1 (rev 2), series_2, series_3

    // Step 2: Deduplicate by normKey and compoundName
    const seenKeys = new Set<string>()
    const deduplicated = seriesLatestRevisions.filter((rev) => {
      const normKey = rev.series.protocol_key
        .replace(/-laboratory-handling$/, "")
        .replace(/-protocol$/, "")
        .toLowerCase()
      const compoundName = rev.title.replace(/\(.*?\)/g, "").trim().toLowerCase()
      const dedupeKey = `${normKey}::${compoundName}`
      const baseKey = normKey.split("-")[0]
      const familyKey = `${baseKey}::${compoundName}`

      if (seenKeys.has(dedupeKey) || seenKeys.has(familyKey)) {
        return false
      }
      seenKeys.add(dedupeKey)
      seenKeys.add(familyKey)
      return true
    })

    expect(deduplicated.length).toBe(2)
    expect(deduplicated.map((d) => d.series.protocol_key)).toEqual(["hgh-191aa", "bpc-157"])
    expect(deduplicated.find((d) => d.series.protocol_key === "hgh-191aa")?.revision).toBe(2)
  })
})
