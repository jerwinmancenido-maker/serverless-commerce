import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

test("order protocol access forwards the customer authorization header", () => {
  const source = readFileSync(
    join(process.cwd(), "src/lib/data/research-protocols.ts"),
    "utf8"
  )

  assert.match(
    source,
    /listOrderResearchProtocols[\s\S]*const headers = await getAuthHeaders\(\)/
  )
  assert.match(
    source,
    /customers\/me\/orders\/\$\{orderId\}\/research-protocols[\s\S]*headers,/
  )
})
