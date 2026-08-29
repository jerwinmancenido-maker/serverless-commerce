import { createHash } from "node:crypto"

import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, canonicalize(nestedValue)]),
    )
  }

  return value
}

export function fingerprintCompoundedProductConfiguration(
  snapshot: CompoundedProductPresentationSnapshot,
): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(snapshot)))
    .digest("hex")
}
