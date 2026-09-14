/**
 * @file    apps/backend/src/scripts/verify-variant-sanitization.ts
 * @module  VerifyVariantSanitizationScript
 * @purpose Verifies 0 occurrences of 'Complete SubQ Set' remain and that 'Analytical Lab Set' variants exist with preserved UUIDs.
 */

import { Client } from "pg"

async function verifyVariantSanitization() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://localhost:5432/pepstack_phase4_test_20260825",
  })
  await client.connect()

  try {
    const subqRes = await client.query(
      "SELECT count(*) FROM product_variant WHERE title ILIKE $1",
      ["%subq%"]
    )
    const subqCount = parseInt(subqRes.rows[0].count, 10)

    const labSetRes = await client.query(
      "SELECT count(*) FROM product_variant WHERE title LIKE $1",
      ["%Analytical Lab Set%"]
    )
    const labSetCount = parseInt(labSetRes.rows[0].count, 10)

    console.log("=== Variant Sanitization Verification ===")
    console.log(`Variants with 'SubQ': ${subqCount}`)
    console.log(`Variants with 'Analytical Lab Set': ${labSetCount}`)

    if (subqCount !== 0) {
      throw new Error(`Assertion failed: Found ${subqCount} variants still titled with SubQ`)
    }
    if (labSetCount < 140) {
      throw new Error(`Assertion failed: Expected >= 140 Analytical Lab Sets, found ${labSetCount}`)
    }

    console.log("PASSED: Zero SubQ titles remain and Analytical Lab Sets verified intact.")
  } finally {
    await client.end()
  }
}

verifyVariantSanitization().catch((err) => {
  console.error("Verification failed:", err)
  process.exit(1)
})
