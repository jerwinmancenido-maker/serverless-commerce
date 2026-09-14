import { Metadata } from "next"
import { listResearchProtocols } from "@lib/data/research-protocols"
import { listResearchArticles } from "@lib/data/research-articles"
import { listPeptideComparisons } from "@lib/data/peptide-comparisons"
import { listProducts } from "@lib/data/products"
import ResearchLibraryDirectory from "@modules/research-library/directory"

export const metadata: Metadata = {
  title: "Peptide Stacks & Interactive Multi-Vial Regimen Studio | PepStack Labs",
  description:
    "Precision multi-peptide research cycles with separate lyophilized vials, stoichiometric diluent recalculation, interactive U-100 syringe visualizers, synchronized 7-day administration schedules, and 1-click complete kit fulfillment.",
  openGraph: {
    title: "Peptide Stacks & Interactive Multi-Vial Regimen Studio | PepStack Labs",
    description:
      "Precision multi-peptide research cycles with separate lyophilized vials, stoichiometric diluent recalculation, interactive U-100 syringe visualizers, and 1-click complete kit fulfillment.",
    type: "website",
  },
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function ResearchStacksPage({ params }: Props) {
  const { countryCode } = await params
  const [protocolsData, articles, comparisons, productsData] = await Promise.all([
    listResearchProtocols(),
    listResearchArticles(),
    listPeptideComparisons(),
    listProducts({
      countryCode,
      queryParams: { limit: 100 },
    }).catch(() => ({ response: { products: [], count: 0 } })),
  ])

  return (
    <ResearchLibraryDirectory
      protocols={protocolsData.protocols}
      articles={articles}
      comparisons={comparisons}
      products={productsData.response.products}
      countryCode={countryCode}
      initialTab="stacks"
    />
  )
}
