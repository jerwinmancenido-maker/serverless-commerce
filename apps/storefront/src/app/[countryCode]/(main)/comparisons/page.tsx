import { Metadata } from "next"
import { listResearchProtocols } from "@lib/data/research-protocols"
import { listResearchArticles } from "@lib/data/research-articles"
import { listPeptideComparisons } from "@lib/data/peptide-comparisons"
import ResearchLibraryDirectory from "@modules/research-library/directory"

export const metadata: Metadata = {
  title: "Head-to-Head Peptide Comparisons | Pharmacodynamics & Receptors",
  description:
    "Rigorous head-to-head clinical and analytical evaluations comparing synergistic, competing, or analogue peptide compounds across molecular mass, half-life, and cellular targets.",
}

export default async function ComparisonsPage() {
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
      initialTab="comparisons"
    />
  )
}
