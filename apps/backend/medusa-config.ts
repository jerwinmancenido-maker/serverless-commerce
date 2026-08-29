import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  admin: {
    maxUploadFileSize: 10 * 1024 * 1024,
    vite: (config) => ({
      resolve: {
        dedupe: [
          ...new Set([...(config.resolve?.dedupe ?? []), "react", "react-dom"]),
        ],
      },
    }),
  },
  modules: [
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-postgres",
            id: "locking-postgres",
            is_default: true,
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/manual-qr-payment",
            id: "manual-qr",
            options: {
              displayName: process.env.MANUAL_QR_DISPLAY_NAME,
              instructions: process.env.MANUAL_QR_INSTRUCTIONS,
              qrImageUrl: process.env.MANUAL_QR_IMAGE_URL,
              expiresInMinutes: process.env.MANUAL_QR_EXPIRES_IN_MINUTES
                ? Number(process.env.MANUAL_QR_EXPIRES_IN_MINUTES)
                : undefined,
            },
          },
        ],
      },
    },
    {
      resolve: "./src/modules/bom",
    },
    {
      resolve: "./src/modules/manual-payment",
    },
    {
      resolve: "./src/modules/research-content",
    },
    {
      resolve: "./src/modules/research-tracking",
    },
  ],
})
