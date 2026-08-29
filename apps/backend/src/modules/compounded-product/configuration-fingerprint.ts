import { createHash } from "node:crypto"

import { MedusaError } from "@medusajs/framework/utils"

import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"

function invalidFingerprintValue(message: string): never {
  throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
}

function canonicalizeValue(value: unknown, ancestors: Set<object>): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      invalidFingerprintValue(
        "Compounded product fingerprint payload contains a non-finite number",
      )
    }

    return Object.is(value, -0) ? 0 : value
  }

  if (
    typeof value === "undefined" ||
    typeof value === "bigint" ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    invalidFingerprintValue(
      `Compounded product fingerprint payload contains unsupported ${typeof value}`,
    )
  }

  if (ancestors.has(value)) {
    invalidFingerprintValue(
      "Compounded product fingerprint payload contains a circular reference",
    )
  }

  ancestors.add(value)

  if (Array.isArray(value)) {
    const canonical = value.map((item) => canonicalizeValue(item, ancestors))
    ancestors.delete(value)
    return canonical
  }

  const prototype = Object.getPrototypeOf(value)

  if (prototype !== Object.prototype && prototype !== null) {
    invalidFingerprintValue(
      "Compounded product fingerprint payload must contain plain JSON objects",
    )
  }

  const canonical = Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) =>
          left < right ? -1 : left > right ? 1 : 0,
        )
        .map(([key, nestedValue]) => [
          key,
          canonicalizeValue(nestedValue, ancestors),
        ]),
  )

  ancestors.delete(value)
  return canonical
}

export function canonicalizeCompoundedProductValue(value: unknown): unknown {
  return canonicalizeValue(value, new Set())
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
