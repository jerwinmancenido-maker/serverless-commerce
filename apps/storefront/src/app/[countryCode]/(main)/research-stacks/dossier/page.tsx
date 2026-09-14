/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-stacks/dossier/page.tsx
 * @module  ResearchStacksDossierPage
 * @purpose Dedicated standalone laboratory protocol document route for multi-compound stack regimens.
 *          Provides pure A4 vector paged media presentation and PDF export.
 * @contracts
 *   Route: /[countryCode]/research-stacks/dossier?compounds=bpc-157,tb-500&autoprint=true
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getPeptideStackCatalog,
  evaluateMultiCompoundStack,
  type StackCompoundProfile,
} from "@lib/data/stack-interactions"
import { getCompoundProtocol } from "@lib/data/compound-protocols"
import type { ResearchBundleVial } from "@modules/research-protocols/types"
import StackDossierViewClient from "@modules/research-protocols/components/stack-dossier-view-client"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ compounds?: string; autoprint?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { compounds } = await searchParams
  const names = compounds ? compounds.split(",").join(" + ") : "Multi-Peptide Stack"

  return {
    title: `${names} · GLP Multi-Compound Protocol Dossier (RUO Reference Standard) | PepStack Labs`,
    description: `Official laboratory Standard Operating Procedure (SOP), multi-vial reconstitution stoichiometry, syringe calibration, and co-administration timetable for ${names}.`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function ResearchStacksDossierPage({
  params,
  searchParams,
}: Props) {
  const { countryCode } = await params
  const { compounds = "bpc-157,tb-500", autoprint = "false" } = await searchParams

  const compoundIds = compounds
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean)

  if (compoundIds.length === 0) {
    notFound()
  }

  const catalog = await getPeptideStackCatalog()
  const selectedProfiles: StackCompoundProfile[] = []

  for (const id of compoundIds) {
    const found = catalog.compounds.find(
      (c) => c.id.toLowerCase() === id || c.shortName.toLowerCase() === id
    )
    if (found) {
      selectedProfiles.push(found)
    } else {
      // Fallback from analytical protocol
      const analytical = getCompoundProtocol(id)
      if (analytical) {
        selectedProfiles.push({
          id: analytical.id,
          name: analytical.compoundName,
          shortName: analytical.compoundName,
          category: analytical.category,
          targetReceptor: "Cellular target",
          primaryPathway: analytical.subtitle || "Target pathway",
          adminRoute: analytical.deliveryRoutes?.[0] || "subq",
          optimalTiming: "Fasted state",
          halfLife: "Compound dependent",
        })
      }
    }
  }

  if (selectedProfiles.length === 0) {
    notFound()
  }

  // Evaluate multi-compound stack
  const stackEvaluation = evaluateMultiCompoundStack(
    selectedProfiles.map((p) => p.id),
    catalog.compounds,
    catalog.pairwise_interactions
  )

  // Construct default bundle vials
  const bundleVials: ResearchBundleVial[] = selectedProfiles.map((profile) => {
    const analytical = getCompoundProtocol(profile.id)
    const netMg = analytical?.reconstitution?.defaultVialNetMg ?? 5
    const diluentMl = analytical?.reconstitution?.defaultDiluentMl ?? 2.0
    const concMgMl = Number((netMg / diluentMl).toFixed(2))
    const doseStr = analytical?.dosing?.standardDoseDisplay ?? "250 mcg"
    const unitsStr =
      analytical?.syringeGuide?.graduations?.[0]?.tickLabel ??
      `${Math.max(5, Math.round(((analytical?.dosing?.standardDoseMcg ?? 250) / 1000 / concMgMl) * 100))} units`

    return {
      compoundName: profile.shortName,
      vialNetMass: `${netMg} mg`,
      netMg,
      diluentMl,
      concMgMl,
      solvent: analytical?.reconstitution?.solvent ?? "USP Bacteriostatic Water (0.9% Benzyl Alcohol)",
      reconstitutionInstructions:
        analytical?.reconstitution?.dissolutionMethod ??
        "Inject diluent slowly down inner glass wall. Allow spontaneous dissolution; do not agitate.",
      targetDose: doseStr,
      targetDoseMcg: analytical?.dosing?.standardDoseMcg ?? 250,
      cadence: analytical?.dosing?.routeLabel ?? "Subcutaneous Administration",
      syringeUnits: unitsStr,
    }
  })

  return (
    <StackDossierViewClient
      stackEvaluation={stackEvaluation}
      selectedProfiles={selectedProfiles}
      bundleVials={bundleVials}
      countryCode={countryCode}
      autoprint={autoprint === "true"}
    />
  )
}
