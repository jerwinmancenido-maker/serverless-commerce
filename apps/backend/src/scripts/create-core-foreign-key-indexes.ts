/**
 * @file    apps/backend/src/scripts/create-core-foreign-key-indexes.ts
 * @module  CreateCoreForeignKeyIndexes (Database Optimization)
 * @purpose Idempotently create supporting indexes on core foreign keys in fulfillment and order_line_item tables.
 * @contracts
 *   Database: PostgreSQL
 *   Tables:   fulfillment · order_line_item
 */

import { Client } from "pg"
import { loadEnv, MedusaError } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export const INDEX_DEFINITIONS = [
  {
    table: "fulfillment",
    column: "delivery_address_id",
    indexName: "IDX_fulfillment_delivery_address_id",
  },
  {
    table: "fulfillment",
    column: "provider_id",
    indexName: "IDX_fulfillment_provider_id",
  },
  {
    table: "order_line_item",
    column: "totals_id",
    indexName: "IDX_order_line_item_totals_id",
  },
]

export async function createCoreForeignKeyIndexes(databaseUrl?: string): Promise<{ created: string[]; existing: string[] }> {
  const connString = databaseUrl || process.env.DATABASE_URL
  if (!connString) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "DATABASE_URL environment variable is required to create core foreign key indexes"
    )
  }

  const client = new Client({ connectionString: connString })
  await client.connect()

  const created: string[] = []
  const existing: string[] = []

  try {
    for (const def of INDEX_DEFINITIONS) {
      // Check if index already exists
      const checkResult = await client.query(
        `SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = $1`,
        [def.indexName],
      )

      if (checkResult.rowCount && checkResult.rowCount > 0) {
        existing.push(def.indexName)
      } else {
        await client.query(
          `CREATE INDEX IF NOT EXISTS "${def.indexName}" ON "${def.table}" ("${def.column}");`,
        )
        created.push(def.indexName)
      }
    }
  } finally {
    await client.end()
  }

  return { created, existing }
}

export default async function runScript({ container }: { container?: any } = {}) {
  const result = await createCoreForeignKeyIndexes()
  console.log("Core foreign key indexes checked:")
  console.log("  Created:", result.created.length ? result.created.join(", ") : "none")
  console.log("  Existing:", result.existing.length ? result.existing.join(", ") : "none")
}

// Allow direct execution via tsx / node
if (require.main === module) {
  runScript()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to create core foreign key indexes:", err)
      process.exit(1)
    })
}
