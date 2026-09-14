/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-protocols/[handle]/dossier/page.tsx
 * @module  ResearchProtocolDossierPage
 * @purpose Dedicated standalone laboratory protocol document route for single-compound GLP protocols.
 *          Stripped of storefront chrome in print mode, with pure A4 vector paged media styling.
 * @contracts
 *   Route: /[countryCode]/research-protocols/[handle]/dossier?preset=full|bench_sop|schedule_bom&autoprint=true
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  retrieveResearchProtocol,
  type StoreResearchProtocol,
} from "@lib/data/research-protocols"
import { getCompoundProtocol } from "@lib/data/compound-protocols"
import { cleanCompoundTitle, generateProtocolQrCode } from "@lib/protocol-sharing"
import DossierViewClient from "@modules/research-protocols/components/dossier-view-client"
import type { PrintPreset } from "@modules/research-protocols/components/clinical-protocol-print-dossier"

export const dynamic = "force-dynamic"

import { adaptCompoundToStoreProtocol } from "@lib/protocol-adapter"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ preset?: string; autoprint?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const analytical = getCompoundProtocol(handle)
  const cleanTitle = cleanCompoundTitle(analytical?.compoundName || handle)

  return {
    title: `${cleanTitle} · GLP Analytical Protocol Dossier (RUO Reference Standard) | PepStack Labs`,
    description: `Official laboratory research protocol monograph and standard operating procedure for ${cleanTitle}. Includes molecular identity, volumetric reconstitution stoichiometry, storage kinetics, and titration benchmarks.`,
  }
}

export default async function ResearchProtocolDossierPage({
  params,
  searchParams,
}: Props) {
  const { countryCode, handle } = await params
  const { preset = "full", autoprint = "false" } = await searchParams

  let protocol: StoreResearchProtocol | null = null

  // 1. Try remote database fetch
  try {
    const response = await retrieveResearchProtocol(handle)
    protocol = response?.protocol || null
  } catch {
    protocol = null
  }

  // 2. Fallback to analytical protocol registry
  if (!protocol) {
    const analytical = getCompoundProtocol(handle)
    if (analytical) {
      protocol = adaptCompoundToStoreProtocol(analytical, handle)
    }
  }

  if (!protocol) {
    notFound()
  }

  const validPreset: PrintPreset =
    preset === "bench_sop" || preset === "schedule_bom" ? preset : "full"
  const shouldAutoPrint = autoprint === "true"

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pepstacklabs.com"
  const canonicalUrl = `${baseUrl}/${countryCode}/research-protocols/${handle}`
  const qrCodeDataUrl = await generateProtocolQrCode(canonicalUrl, { width: 140, margin: 1 })

  return (
    <DossierViewClient
      protocol={protocol}
      countryCode={countryCode}
      initialPreset={validPreset}
      autoprint={shouldAutoPrint}
      qrCodeDataUrl={qrCodeDataUrl}
      canonicalUrl={canonicalUrl}
    />
  )
}
