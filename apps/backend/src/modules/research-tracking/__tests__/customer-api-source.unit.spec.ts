import { readFileSync } from "node:fs"
import { join } from "node:path"

const apiRoot = join(
  process.cwd(),
  "src/api/store/customers/me/research-tracking",
)

const routePaths = [
  "configuration/route.ts",
  "profile/route.ts",
  "profile/preferences/route.ts",
  "profile/consents/route.ts",
  "profile/closure/route.ts",
  "privacy/deletion-requests/route.ts",
  "privacy/deletion-requests/current/route.ts",
  "privacy/deletion-requests/cancel/route.ts",
] as const

const mutationRoutePaths = routePaths.filter((path) =>
  [
    "profile/route.ts",
    "profile/preferences/route.ts",
    "profile/consents/route.ts",
    "profile/closure/route.ts",
    "privacy/deletion-requests/route.ts",
    "privacy/deletion-requests/cancel/route.ts",
  ].includes(path),
)

function readRoute(path: (typeof routePaths)[number]): string {
  return readFileSync(join(apiRoot, path), "utf8")
}

describe("research tracking customer API source boundary", () => {
  it.each(routePaths)("keeps %s authenticated and private", (path) => {
    const source = readRoute(path)

    expect(source).toContain("AuthenticatedMedusaRequest")
    expect(source).toContain("setResearchPrivateNoStore(res)")
  })

  it.each(mutationRoutePaths)(
    "derives customer ownership from authentication in %s",
    (path) => {
      const source = readRoute(path)

      expect(source).toContain("req.auth_context.actor_id")
      expect(source).not.toMatch(/validatedBody\.(customer|profile)_id/)
      expect(source).toMatch(/Workflow[\s\S]*\.run\(/)
      expect(source).not.toMatch(/service\.(create|update|delete)Research/)
    },
  )

  it("persists and checks preference replay fingerprints", () => {
    const stepSource = readFileSync(
      join(process.cwd(), "src/workflows/steps/research-tracking-ownership.ts"),
      "utf8",
    )

    expect(stepSource).toContain("findPreferenceMutationByIdempotencyKey")
    expect(stepSource).toContain("assertMatchingResearchFingerprint")
    expect(stepSource).toContain("createResearchPreferenceMutations")
  })

  it("sets private no-store headers in the global API error path", () => {
    const middlewareSource = readFileSync(
      join(process.cwd(), "src/api/middlewares.ts"),
      "utf8",
    )

    expect(middlewareSource).toContain(
      "errorHandler: privateResearchTrackingErrorHandler",
    )
    expect(middlewareSource).toContain(
      'res.setHeader("Cache-Control", "private, no-store")',
    )
  })
})
