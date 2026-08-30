export const ROUTINE_HIDDEN_ADMIN_PATHS = [
  "/app/collections",
  "/app/product-options",
  "/app/reservations",
  "/app/customer-groups",
] as const

export const routineAdminNavigationCss = ROUTINE_HIDDEN_ADMIN_PATHS.map(
  (path) => `a[href="${path}"] { display: none !important; }`,
).join("\n")

export const routineAdminNavigationPlugin = () => ({
  name: "pepstack-routine-admin-navigation",
  transformIndexHtml: {
    order: "post" as const,
    handler: () => [
      {
        tag: "style",
        attrs: {
          "data-pepstack-admin-navigation": "routine",
        },
        children: routineAdminNavigationCss,
        injectTo: "head" as const,
      },
    ],
  },
})

/**
 * Return only the project-specific Vite additions. Medusa combines this result
 * with its own Admin Vite configuration, so copying the incoming plugin array
 * would register Medusa's React Refresh plugin a second time.
 */
export const routineAdminViteConfig = () => ({
  plugins: [routineAdminNavigationPlugin()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
})
