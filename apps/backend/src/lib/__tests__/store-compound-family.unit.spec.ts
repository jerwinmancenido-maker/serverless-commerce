import { retrieveStoreCompoundFamilyByKey } from "../store-compound-family"

const family = {
  id: "cpfam_01",
  key: "semax",
  name: "Semax",
  description: "Semax presentation family",
  status: "active" as const,
}

const registration = (index: number) => ({
  product_id: `prod_${String(index).padStart(3, "0")}`,
  compound_format: {
    id: `cpfmt_${index}`,
    key: index % 2 ? "nasal" : "injectable",
    name: index % 2 ? "Nasal" : "Injectable",
    description: null,
    status: "active" as const,
  },
})

describe("store compound family retrieval", () => {
  it("returns every published active presentation without a 100-member cap", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) =>
      registration(index),
    )
    const lastPage = [registration(100)]
    const graph = jest
      .fn()
      .mockResolvedValueOnce({ data: [family] })
      .mockResolvedValueOnce({ data: firstPage })
      .mockResolvedValueOnce({ data: lastPage })
    const scope = {
      resolve: jest.fn(() => ({ graph })),
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
    expect(graph).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        filters: {
          state: "published",
          compound_family: { id: family.id },
          compound_format: { status: "active" },
        },
        pagination: expect.objectContaining({ take: 100, skip: 0 }),
      }),
    )
    expect(graph).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        pagination: expect.objectContaining({ take: 100, skip: 100 }),
      }),
    )
  })

  it("does not expose a family that has no published active presentations", async () => {
    const graph = jest
      .fn()
      .mockResolvedValueOnce({ data: [family] })
      .mockResolvedValueOnce({ data: [] })
    const scope = {
      resolve: jest.fn(() => ({ graph })),
    }

    await expect(
      retrieveStoreCompoundFamilyByKey(scope as never, "semax"),
    ).rejects.toThrow("Compound family was not found")
  })
})
