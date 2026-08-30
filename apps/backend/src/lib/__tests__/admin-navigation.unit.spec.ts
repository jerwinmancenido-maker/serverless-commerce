import {
  ROUTINE_HIDDEN_ADMIN_PATHS,
  routineAdminNavigationCss,
  routineAdminNavigationPlugin,
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
})
