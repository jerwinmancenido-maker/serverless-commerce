import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

test("order receipts tolerate orders without a payment collection", () => {
  const source = readFileSync(
    join(
      process.cwd(),
      "src/modules/order/components/payment-details/index.tsx"
    ),
    "utf8"
  )

  assert.match(
    source,
    /order\.payment_collections\?\.\[0\]\?\.payments\?\.\[0\]/
  )
  assert.doesNotMatch(
    source,
    /order\.payment_collections\?\.\[0\]\.payments\?\.\[0\]/
  )
})
