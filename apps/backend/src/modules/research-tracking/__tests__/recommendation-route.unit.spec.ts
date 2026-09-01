import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("research protocol recommendation route registration", () => {
  it("registers query validation before reading validatedQuery", () => {
    const apiMiddlewares = readFileSync(
      join(process.cwd(), "src/api/middlewares.ts"),
      "utf8",
    )
    const route = readFileSync(
      join(
        process.cwd(),
        "src/api/store/research-protocols/[handle]/recommendations/route.ts",
      ),
      "utf8",
    )

    expect(apiMiddlewares).toContain(
      "storeResearchProtocolRecommendationMiddlewares",
    )
    expect(apiMiddlewares).toContain(
      "...storeResearchProtocolRecommendationMiddlewares",
    )
    expect(route).toContain("req.validatedQuery")
  })
})
