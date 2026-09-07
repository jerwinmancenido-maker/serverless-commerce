import QRCode from "qrcode"

export function cleanCompoundTitle(title: string | null | undefined, fallback?: string): string {
  if (!title && !fallback) return "Compound"
  let clean = (title || fallback || "").trim()
  // Strip trailing parentheticals e.g. (10mg Vial)
  clean = clean.replace(/\s*\([^)]*\)\s*$/g, "").trim()
  // Strip trailing protocol suffixes
  clean = clean.replace(/\s*(?:Laboratory\s+(?:Reconstitution\s+&\s+)?Handling\s+Standard|Product\s+Protocol|Protocol)\s*$/i, "").trim()
  // Strip again if parenthetical was preceding
  clean = clean.replace(/\s*\([^)]*\)\s*$/g, "").trim()
  return clean || (title || fallback || "Compound").trim()
}

export type ProtocolSharePayload = {
  title: string
  text: string
  url: string
}

export function buildProtocolShareData(params: {
  title: string
  compoundName?: string | null
  summary?: string | null
  url: string
}): ProtocolSharePayload {
  const cleanTitle = cleanCompoundTitle(params.compoundName || params.title)
  const summary = params.summary || "Verified in-vitro laboratory reconstitution and analytical standards."
  return {
    title: `${cleanTitle} - Research Protocol`,
    text: `${cleanTitle} Laboratory Research Protocol & Reconstitution Standard: ${summary}`,
    url: params.url,
  }
}

export type ProtocolEmailParams = {
  compoundName: string
  category?: string | null
  productFormat?: string | null
  purityStandard?: string | null
  solvent?: string | null
  diluentRatio?: string | null
  storage?: string | null
  summary?: string | null
  protocolUrl: string
  purchaseUrl?: string | null
}

export function buildProtocolMailtoUrl(params: ProtocolEmailParams): string {
  const cleanTitle = cleanCompoundTitle(params.compoundName)
  const subject = `Research Protocol: ${cleanTitle} - Laboratory Reference Standard`

  const bodyParts = [
    `Compound: ${cleanTitle}${params.productFormat ? ` (${params.productFormat})` : ""}`,
    params.category ? `Category: ${params.category}` : null,
    params.purityStandard ? `HPLC Purity Standard: ${params.purityStandard}` : null,
    `Canonical Protocol: ${params.protocolUrl}`,
    "",
    "QUICK RECONSTITUTION REFERENCE:",
    params.solvent ? `• Target Solvent: ${params.solvent}` : null,
    params.diluentRatio ? `• Diluent Ratio: ${params.diluentRatio}` : null,
    params.storage ? `• Storage: ${params.storage}` : null,
    "",
    params.summary ? `SUMMARY:\n${params.summary}\n` : null,
    params.purchaseUrl
      ? `ORDER REFERENCE MATERIAL (DIRECT CATALOG PURCHASE):\n${params.purchaseUrl}\n`
      : null,
    `ACCESS VERIFIED PROTOCOL & CALCULATOR:\n${params.protocolUrl}\n`,
    "--",
    "Notice: In-vitro laboratory research reference standard only. Not for human, veterinary, or clinical use.",
  ].filter((item): item is string => item !== null)

  const body = bodyParts.join("\n")

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function generateProtocolQrCode(
  targetUrl: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  try {
    return await QRCode.toDataURL(targetUrl, {
      width: options?.width || 200,
      margin: options?.margin ?? 1,
      errorCorrectionLevel: "M",
    })
  } catch {
    return ""
  }
}
