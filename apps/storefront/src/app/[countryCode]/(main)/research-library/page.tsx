import { Metadata } from "next"
import { listResearchProtocols } from "@lib/data/research-protocols"
import { listResearchArticles } from "@lib/data/research-articles"
import { listPeptideComparisons } from "@lib/data/peptide-comparisons"
import ResearchLibraryDirectory from "@modules/research-library/directory"

export const metadata: Metadata = {
  title: "Research Library | Articles, Peptide Comparisons & Product Protocols",
  description:
    "Open-access laboratory reference library featuring peer-reviewed peptide monographs, head-to-head compound comparisons, product protocols, and precision reconstitution stoichiometry.",
}

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function ResearchLibraryPage({ searchParams }: Props) {
  const [{ tab }, protocolsData, articles, comparisons] = await Promise.all([
    searchParams,
    listResearchProtocols(),
    listResearchArticles(),
    listPeptideComparisons(),
  ])

  const initialTab =
    tab === "protocols" ||
    tab === "calculator" ||
    tab === "comparisons" ||
    tab === "articles" ||
    tab === "coa"
      ? tab
      : undefined

  const protocols = protocolsData.protocols

  return (
    <ResearchLibraryDirectory
      protocols={protocols}
      articles={articles}
      comparisons={comparisons}
      initialTab={initialTab}
    />
  )
}

