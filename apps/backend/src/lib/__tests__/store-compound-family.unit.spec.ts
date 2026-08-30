import {
  retrieveStoreCompoundFamilyByKey,
  retrieveStoreCompoundFamilyByProductId,
} from "../store-compound-family"

const family = {
  id: "cpfam_01",
  key: "semax",
  name: "Semax",
  description: "Semax presentation family",
  status: "active" as const,
}

const registration = (index: number) => ({
  product_id: `prod_${String(index).padStart(3, "0")}`,
  compound_family_id: family.id,
  compound_format_id: `cpfmt_${index}`,
})

const format = (index: number) => ({
  id: `cpfmt_${index}`,
  key: index % 2 ? "nasal" : "injectable",
  name: index % 2 ? "Nasal" : "Injectable",
  description: null,
  status: "active" as const,
})

describe("store compound family retrieval", () => {
  it("returns every published active presentation without a 100-member cap", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      registration(index),
    )
    const lastPage = [registration(100)]
    const listCompoundFamilies = jest.fn().mockResolvedValue([family])
    const listGovernedProductRegistrations = jest
      .fn()
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(lastPage)
    const listCompoundProductFormats = jest
      .fn()
      .mockResolvedValue(Array.from({ length: 101 }, (_, index) => format(index)))
    const scope = {
      resolve: jest.fn(() => ({
        listCompoundFamilies,
        listGovernedProductRegistrations,
        listCompoundProductFormats,
      })),
    }

    const result = await retrieveStoreCompoundFamilyByKey(
      scope as never,
      "semax",
    )

    expect(result.members).toHaveLength(101)
    expect(result.members[0]).toEqual({
      product_id: "prod_000",
      presentation: {
        id: "cpfmt_0",
        key: "injectable",
        name: "Injectable",
        description: null,
      },
    })
    expect(listCompoundFamilies).toHaveBeenCalledWith(
      { key: "semax", status: "active" },
      { take: 1, skip: 0 },
    )
    expect(listGovernedProductRegistrations).toHaveBeenNthCalledWith(
      1,
      { state: "published", compound_family_id: family.id },
      expect.objectContaining({ take: 100, skip: 0 }),
    )
    expect(listGovernedProductRegistrations).toHaveBeenNthCalledWith(
      2,
      { state: "published", compound_family_id: family.id },
      expect.objectContaining({ take: 100, skip: 100 }),
    )
  })

  it("does not expose a family that has no published active presentations", async () => {
    const service = {
      listCompoundFamilies: jest.fn().mockResolvedValue([family]),
      listGovernedProductRegistrations: jest.fn().mockResolvedValue([]),
      listCompoundProductFormats: jest.fn(),
    }
    const scope = {
      resolve: jest.fn(() => service),
    }

    await expect(
      retrieveStoreCompoundFamilyByKey(scope as never, "semax"),
    ).rejects.toThrow("Compound family was not found")
  })

  it("uses the governed registration service entity for product lookup", async () => {
    const listCompoundFamilies = jest.fn().mockResolvedValue([family])
    const listGovernedProductRegistrations = jest
      .fn()
      .mockResolvedValueOnce([registration(1)])
      .mockResolvedValueOnce([registration(1)])
    const listCompoundProductFormats = jest
      .fn()
      .mockResolvedValue([format(1)])
    const scope = {
      resolve: jest.fn(() => ({
        listCompoundFamilies,
        listGovernedProductRegistrations,
        listCompoundProductFormats,
      })),
    }

    const result = await retrieveStoreCompoundFamilyByProductId(
      scope as never,
      "prod_001",
    )

    expect(result.key).toBe("semax")
    expect(listGovernedProductRegistrations).toHaveBeenNthCalledWith(
      1,
      { product_id: "prod_001", state: "published" },
      { take: 1, skip: 0 },
    )
    expect(listCompoundFamilies).toHaveBeenCalledWith(
      { id: family.id, status: "active" },
      { take: 1, skip: 0 },
    )
  })
})
