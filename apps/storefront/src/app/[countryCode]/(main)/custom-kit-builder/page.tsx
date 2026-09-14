/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/custom-kit-builder/page.tsx
 * @module  CustomKitBuilderPage (Storefront Custom Kit Builder Route)
 * @purpose Server Component route for custom multi-vial peptide kit configurator and live stoichiometry studio.
 * @contracts
 *   Fetches: listProducts() · listResearchProtocols()
 *   Mounts:  CustomKitStudio
 */

import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { listResearchProtocols } from "@lib/data/research-protocols"
import CustomKitStudio from "@modules/custom-kit-builder/components/custom-kit-studio"

export const metadata: Metadata = {
  title: "Custom Multi-Vial Peptide Kit Configurator & Protocol Studio | PepStack Labs",
  description:
    "Design and calibrate custom research peptide bundles with live volumetric stoichiometry, dynamic U-100 syringe visualizers, cycle supply planning, and 1-click batch cart fulfillment.",
  openGraph: {
    title: "Custom Multi-Vial Peptide Kit Configurator | PepStack Labs",
    description:
      "Interactive custom research configuration studio with stoichiometric dilution calculation, U-100 syringe visualizer, and commercial multi-vial tier savings.",
    type: "website",
  },
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function CustomKitBuilderPage({ params }: Props) {
  const { countryCode } = await params

  const [productsData, protocolsData] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: { limit: 100 },
    }).catch(() => ({ response: { products: [], count: 0 } })),
    listResearchProtocols().catch(() => ({ protocols: [] })),
  ])

  return (
    <div className="min-h-screen bg-slate-50/50 py-4">
      <CustomKitStudio
        products={productsData.response.products}
        protocols={protocolsData.protocols}
        countryCode={countryCode}
      />
    </div>
  )
}
