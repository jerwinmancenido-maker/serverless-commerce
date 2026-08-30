import {
  ROUTINE_HIDDEN_ADMIN_PATHS,
  routineAdminNavigationCss,
  routineAdminNavigationPlugin,
  routineAdminViteConfig,
} from "../admin-navigation"

describe("routine Admin navigation", () => {
  it("hides only nonessential routine merchant links", () => {
    expect(ROUTINE_HIDDEN_ADMIN_PATHS).toEqual([
      "/app/collections",
      "/app/product-options",
      "/app/reservations",
      "/app/customer-groups",
    ])
    expect(routineAdminNavigationCss).not.toContain("/app/categories")
    expect(routineAdminNavigationCss).not.toContain('a[href="/app/inventory"]')
  })

  it("injects scoped presentation rules into the Admin head", () => {
    const plugin = routineAdminNavigationPlugin()

    expect(plugin.name).toBe("pepstack-routine-admin-navigation")
    expect(plugin.transformIndexHtml).toMatchObject({ order: "post" })
  })

  it("returns only project Vite additions without copying Medusa plugins", () => {
    const config = routineAdminViteConfig()

    expect(config.plugins.map((plugin) => plugin.name)).toEqual([
      "pepstack-routine-admin-navigation",
    ])
    expect(config.resolve.dedupe).toEqual(["react", "react-dom"])
  })
})
