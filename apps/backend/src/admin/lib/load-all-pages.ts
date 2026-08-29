export type AdminPage<T> = {
  items: T[]
  count: number
}

type LoadAllAdminPagesInput<T> = {
  pageSize?: number
  loadPage: (limit: number, offset: number) => Promise<AdminPage<T>>
}

const DEFAULT_PAGE_SIZE = 100

export const loadAllAdminPages = async <T>({
  pageSize = DEFAULT_PAGE_SIZE,
  loadPage,
}: LoadAllAdminPagesInput<T>): Promise<T[]> => {
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0) {
    throw new Error("Admin reference-data page size must be a positive integer")
  }

  const items: T[] = []
  let offset = 0
  let expectedCount: number | null = null

  do {
    const page = await loadPage(pageSize, offset)

    if (!Number.isSafeInteger(page.count) || page.count < 0) {
      throw new Error("Admin reference-data count must be a non-negative integer")
    }

    expectedCount = page.count

    if (!page.items.length) {
      if (offset < expectedCount) {
        throw new Error(
          `Admin reference-data pagination stopped at ${offset} of ${expectedCount} records`,
        )
      }

      break
    }

    items.push(...page.items)
    offset += page.items.length
  } while (expectedCount !== null && offset < expectedCount)

  return items
}
