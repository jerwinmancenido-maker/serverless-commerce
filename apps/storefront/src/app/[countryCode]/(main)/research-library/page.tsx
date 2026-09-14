/**
 * @file    apps/storefront/src/app/[countryCode]/(main)/research-library/page.tsx
 * @module  ResearchLibraryPage
 * @purpose Server component loading articles, comparisons, and protocols for the research library directory.
 * @contracts
 *   Fetches: listResearchProtocols(), listResearchArticles(), listPeptideComparisons()
 *   API:     GET /store/research-protocols, GET /store/research-articles, GET /store/peptide-comparisons
 */

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
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ tab?: string; compounds?: string }>
}

export default async function ResearchLibraryPage({ params, searchParams }: Props) {
  const [{ countryCode }, { tab, compounds }, protocolsData, articles, comparisons] = await Promise.all([
    params,
    searchParams,
    listResearchProtocols({ limit: 250 }),
    listResearchArticles(),
    listPeptideComparisons(),
  ])

  const initialTab =
    tab === "protocols" ||
    tab === "calculator" ||
    tab === "comparisons" ||
    tab === "articles" ||
    tab === "stacks" ||
    tab === "chart" ||
    tab === "coa"
      ? tab
      : undefined

  const protocols = protocolsData?.protocols || []

  return (
    <ResearchLibraryDirectory
      protocols={protocols}
      articles={articles}
      comparisons={comparisons}
      countryCode={countryCode}
      initialTab={initialTab}
      initialCompoundsQuery={compounds}
    />
  )
}

