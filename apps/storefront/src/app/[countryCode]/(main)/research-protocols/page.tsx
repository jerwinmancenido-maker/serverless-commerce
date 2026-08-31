import { listResearchProtocols } from "@lib/data/research-protocols"
import ResearchProtocolDirectory from "@modules/research-protocols/directory"
import { Metadata } from "next"

export const metadata: Metadata = { title: "Research Protocols", description: "Browse published product and compound research protocols." }

export default async function ResearchProtocolsPage() {
  const { protocols } = await listResearchProtocols()
  return <div className="content-container py-12 small:py-20">
    <div className="max-w-3xl"><p className="text-small-semi uppercase tracking-wider text-ui-fg-interactive">Research use only</p><h1 className="mt-3 text-3xl-semi text-ui-fg-base">Research Protocols</h1><p className="mt-3 text-base-regular text-ui-fg-subtle">Published reference pages for compounds and product formats, including preparation, protocol levels, calculators, supporting information, and references.</p></div>
    {protocols.length ? <ResearchProtocolDirectory protocols={protocols} /> : <p className="mt-10 text-base-regular text-ui-fg-subtle">No published protocols are available yet.</p>}
  </div>
}
