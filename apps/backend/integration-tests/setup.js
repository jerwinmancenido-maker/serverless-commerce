const { MetadataStorage } = require("@medusajs/framework/mikro-orm/core")

MetadataStorage.clear()

if (!process.env.DB_USERNAME && process.env.USER) {
  process.env.DB_USERNAME = process.env.USER
}
