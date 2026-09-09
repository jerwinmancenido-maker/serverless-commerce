import { Metadata } from "next"
import { listResearchProtocols } from "@lib/data/research-protocols"
import { listResearchArticles } from "@lib/data/research-articles"
import { listPeptideComparisons } from "@lib/data/peptide-comparisons"
import ResearchLibraryDirectory from "@modules/research-library/directory"

export const metadata: Metadata = {
  title: "Clinical Research Monographs | Journal of Peptide Pharmacology",
  description:
    "Open-access compendium of publication-grade peptide research monographs, preclinical mechanisms of action, receptor affinities, and PubMed citations.",
}

export default async function MonographsPage() {
  const [protocolsData, articles, comparisons] = await Promise.all([
    listResearchProtocols(),
    listResearchArticles(),
    listPeptideComparisons(),
  ])

  return (
    <ResearchLibraryDirectory
      protocols={protocolsData.protocols}
      articles={articles}
      comparisons={comparisons}
      initialTab="articles"
    />
  )
}
