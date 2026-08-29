import { createHash } from "node:crypto"

import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"

export function canonicalizeCompoundedProductValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeCompoundedProductValue)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [
          key,
          canonicalizeCompoundedProductValue(nestedValue),
        ]),
    )
  }

  return value
}

export function fingerprintCompoundedProductValue(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalizeCompoundedProductValue(value)))
    .digest("hex")
}

export function fingerprintCompoundedProductConfiguration(
  snapshot: CompoundedProductPresentationSnapshot,
): string {
  return fingerprintCompoundedProductValue(snapshot)
}
