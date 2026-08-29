import { createHash } from "node:crypto"

import type { CompoundedProductPresentationSnapshot } from "./contracts/configuration"
import type { CompoundedProductVariantMatrix } from "./variant-matrix"

type MatrixRow = CompoundedProductVariantMatrix["rows"][number]

const DEFAULT_SEPARATOR = "-"
const MAX_SKU_LENGTH = 255
const UNIQUE_SUFFIX_LENGTH = 16

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function resolveSeparator(
  policy: CompoundedProductPresentationSnapshot["sku_suggestion_policy"],
): string {
  return policy?.separator || DEFAULT_SEPARATOR
}

function normalizeSkuPart(value: string, separator: string): string {
  const escapedSeparator = escapeRegExp(separator)

  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, () => separator)
    .replace(new RegExp(`(?:${escapedSeparator}){2,}`, "g"), separator)
    .replace(
      new RegExp(`^(?:${escapedSeparator})|(?:${escapedSeparator})$`, "g"),
      "",
    )
}

function applyNormalization(
  value: string,
  normalization: "uppercase" | "lowercase" | "preserve" | undefined,
): string {
  if (normalization === "lowercase") {
    return value.toLocaleLowerCase("en-US")
  }

  if (normalization === "preserve") {
    return value
  }

  return value.toLocaleUpperCase("en-US")
}

function createStableUniqueSuffix(input: {
  idempotencyKey: string
  matrixRowKey: string
}): string {
  return createHash("sha256")
    .update(`${input.idempotencyKey}:${input.matrixRowKey}`)
    .digest("hex")
    .slice(0, UNIQUE_SUFFIX_LENGTH)
    .toLocaleUpperCase("en-US")
}

export function generateCompoundedProductSku(input: {
  explicitSku?: string | null
  productTitle: string
  productHandle?: string | null
  presentationLabel: string
  row: MatrixRow
  idempotencyKey: string
  policy: CompoundedProductPresentationSnapshot["sku_suggestion_policy"]
}): string {
  const explicitSku = input.explicitSku?.trim()

  if (explicitSku) {
    return explicitSku
  }

  const separator = resolveSeparator(input.policy)
  const template =
    input.policy?.template ||
    "{product}{separator}{presentation}{separator}{options}"
  const tokens = {
    product: input.productHandle || input.productTitle,
    presentation: input.presentationLabel,
    options: input.row.options
      .map((option) => option.valueLabel)
      .join(separator),
    variant: input.row.title,
    separator,
  }
  let base = template.replace(
    /\{(product|presentation|options|variant|separator)\}/g,
    (_match, token: keyof typeof tokens) => tokens[token],
  )

  base = normalizeSkuPart(base, separator)

  if (!base) {
    base = "PRODUCT"
  }

  const uniqueSuffix = createStableUniqueSuffix({
    idempotencyKey: input.idempotencyKey,
    matrixRowKey: input.row.key,
  })
  const suffix = `${separator}${uniqueSuffix}`
  const maximumBaseLength = MAX_SKU_LENGTH - suffix.length
  const truncatedBase = base
    .slice(0, maximumBaseLength)
    .replace(new RegExp(`(?:${escapeRegExp(separator)})$`), "")

  return applyNormalization(
    `${truncatedBase}${suffix}`,
    input.policy?.normalization,
  )
}
