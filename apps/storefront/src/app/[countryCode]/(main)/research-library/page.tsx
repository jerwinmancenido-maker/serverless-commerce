import { Metadata } from "next"
import { listResearchProtocols } from "@lib/data/research-protocols"
import { listResearchArticles } from "@lib/data/research-articles"
import { listPeptideComparisons } from "@lib/data/peptide-comparisons"
import ResearchLibraryDirectory from "@modules/research-library/directory"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Research Library | Articles, Peptide Comparisons & Stoichiometry Engine",
  description:
    "Open-access laboratory reference library featuring peer-reviewed peptide monographs, head-to-head compound comparisons, preparation protocols, and precision reconstitution stoichiometry.",
}

export default async function ResearchLibraryPage() {
  const [protocolsData, articles, comparisons] = await Promise.all([
    listResearchProtocols(),
    listResearchArticles(),
    listPeptideComparisons(),
  ])

  const protocols = protocolsData.protocols

  return (
    <ResearchLibraryDirectory
      protocols={protocols}
      articles={articles}
      comparisons={comparisons}
    />
  )
}

