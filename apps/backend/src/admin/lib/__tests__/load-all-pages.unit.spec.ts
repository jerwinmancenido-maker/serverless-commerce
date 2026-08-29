import { loadAllAdminPages } from "../load-all-pages"

describe("loadAllAdminPages", () => {
  it("loads every page without a fixed record cap", async () => {
    const records = Array.from({ length: 205 }, (_, index) => ({ id: index }))
    const loadPage = jest.fn(async (limit: number, offset: number) => ({
      items: records.slice(offset, offset + limit),
      count: records.length,
    }))

    await expect(loadAllAdminPages({ loadPage })).resolves.toEqual(records)
    expect(loadPage).toHaveBeenNthCalledWith(1, 100, 0)
    expect(loadPage).toHaveBeenNthCalledWith(2, 100, 100)
    expect(loadPage).toHaveBeenNthCalledWith(3, 100, 200)
  })

  it("returns an empty collection without requesting a second page", async () => {
    const loadPage = jest.fn(async () => ({ items: [], count: 0 }))

    await expect(loadAllAdminPages({ loadPage })).resolves.toEqual([])
    expect(loadPage).toHaveBeenCalledTimes(1)
  })

  it("rejects a non-progressing response before it can loop forever", async () => {
    const loadPage = jest.fn(async () => ({ items: [], count: 2 }))

    await expect(loadAllAdminPages({ loadPage })).rejects.toThrow(
      "pagination stopped at 0 of 2 records",
    )
  })

  it("rejects invalid page sizes and server counts", async () => {
    const loadPage = jest.fn(async () => ({ items: [], count: -1 }))

    await expect(
      loadAllAdminPages({ pageSize: 0, loadPage }),
    ).rejects.toThrow("page size must be a positive integer")
    await expect(loadAllAdminPages({ loadPage })).rejects.toThrow(
      "count must be a non-negative integer",
    )
  })
})
