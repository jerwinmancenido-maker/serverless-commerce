/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-protocols/[handle]/dossier/page.tsx
 * @module  ResearchProtocolDossierPage
 * @purpose Dedicated standalone cleanroom document route for single-compound GLP protocols.
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
import { cleanCompoundTitle } from "@lib/protocol-sharing"
import DossierViewClient from "@modules/research-protocols/components/dossier-view-client"
import type { PrintPreset } from "@modules/research-protocols/components/clinical-protocol-print-dossier"

export const dynamic = "force-dynamic"

import { adaptCompoundToStoreProtocol } from "../page"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ preset?: string; autoprint?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  let protocolTitle = handle
  const analytical = getCompoundProtocol(handle)
  if (analytical) {
    protocolTitle = analytical.compoundName
  }

  const cleanTitle = cleanCompoundTitle(protocolTitle)

  return {
    title: `${cleanTitle} · GLP Analytical Protocol Dossier (ISO 9001) | PepStack Labs`,
    description: `Official laboratory Standard Operating Procedure (SOP), reconstitution stoichiometry, U-100 syringe graduation scale, and clinical titration schedule for ${cleanTitle}.`,
    robots: {
      index: false, // Cleanroom document route: exclude from search engine clutter
      follow: false,
    },
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

  return (
    <DossierViewClient
      protocol={protocol}
      countryCode={countryCode}
      initialPreset={validPreset}
      autoprint={shouldAutoPrint}
    />
  )
}
