/**
 * @file    apps/backend/src/scripts/sanitize-subq-variants.ts
 * @module  SanitizeSubqVariantsScript
 * @purpose Sanitizes legacy SubQ titles in product variants into Analytical Lab Set.
 */

import { MedusaError } from "@medusajs/framework/utils"
import { Client } from "pg"

async function sanitizeSubqVariants() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://localhost:5432/pepstack_phase4_test_20260825",
  })
  await client.connect()

  try {
    // 1. Snapshot IDs and count before migration
    const beforeCheck = await client.query(
      "SELECT id, title FROM product_variant WHERE title ILIKE $1",
      ["%subq%"]
    )
    console.log(`Found ${beforeCheck.rowCount} variants with 'SubQ'.`)

    if (beforeCheck.rowCount && beforeCheck.rowCount > 0) {
      // 2. Perform in-place update (preserving variant ID, product_id, created_at)
      const updateResult = await client.query(
        `UPDATE product_variant 
         SET title = REPLACE(
           REPLACE(
             REPLACE(
               REPLACE(title, 'Complete SubQ Set', 'Analytical Lab Set'),
               'SubQ Complete Set', 'Analytical Lab Set'
             ),
             'Complete SubQ', 'Analytical Lab Set'
           ),
           'SubQ Set', 'Analytical Lab Set'
         ),
         updated_at = NOW()
         WHERE title ILIKE '%subq%'`
      )
      console.log(`Successfully updated ${updateResult.rowCount} variant titles.`)
    }

    // 3. Verify zero remaining SubQ variant titles
    const remainingCheck = await client.query(
      "SELECT count(*) FROM product_variant WHERE title ILIKE $1",
      ["%subq%"]
    )
    console.log(`Remaining 'SubQ' variant count: ${remainingCheck.rows[0].count}`)

    // 4. Verify Analytical Lab Set count
    const labSetCheck = await client.query(
      "SELECT count(*) FROM product_variant WHERE title LIKE $1",
      ["%Analytical Lab Set%"]
    )
    console.log(`Total 'Analytical Lab Set' count: ${labSetCheck.rows[0].count}`)

    if (parseInt(remainingCheck.rows[0].count, 10) !== 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant sanitization failed: records still contain 'SubQ'"
      )
    }
  } finally {
    await client.end()
  }
}

sanitizeSubqVariants().catch((err) => {
  console.error("Sanitization error:", err)
  process.exit(1)
})
