import { PEPTIDE_CATEGORY_TAXONOMY } from "../peptide-category-taxonomy"

describe("peptide category taxonomy", () => {
  it("uses stable unique handles and ranks", () => {
    const handles = PEPTIDE_CATEGORY_TAXONOMY.map(({ handle }) => handle)
    const ranks = PEPTIDE_CATEGORY_TAXONOMY.map(({ rank }) => rank)

    expect(new Set(handles).size).toBe(handles.length)
    expect(new Set(ranks).size).toBe(ranks.length)
    expect(
      handles.every((handle) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)),
    ).toBe(true)
  })

  it("keeps category copy research-focused and configurable as data", () => {
    expect(PEPTIDE_CATEGORY_TAXONOMY).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          handle: "healing-tissue-repair-peptides",
        }),
        expect.objectContaining({
          handle: "cognitive-neuroprotective-peptides",
        }),
        expect.objectContaining({
          handle: "research-supplies-accessories",
        }),
      ]),
    )
    expect(
      PEPTIDE_CATEGORY_TAXONOMY.every(
        ({ description }) => description.length > 0,
      ),
    ).toBe(true)
  })
})
