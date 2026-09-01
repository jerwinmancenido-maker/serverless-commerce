"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useMemo, useState } from "react"

import type { StoreResearchProtocol } from "@lib/data/research-protocols"

type Props = {
  protocols: StoreResearchProtocol[]
}

const normalize = (value: string | null | undefined) =>
  (value || "").trim().toLocaleLowerCase()

export default function ResearchProtocolDirectory({ protocols }: Props) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [format, setFormat] = useState("all")

  const categories = useMemo(
    () =>
      Array.from(
        new Set(protocols.map((item) => item.content.category).filter(Boolean)),
      ).sort() as string[],
    [protocols],
  )
  const formats = useMemo(
    () =>
      Array.from(
        new Set(
          protocols.map((item) => item.content.product_format).filter(Boolean),
        ),
      ).sort() as string[],
    [protocols],
  )
  const visibleProtocols = useMemo(() => {
    const normalizedQuery = normalize(query)

    return protocols.filter((protocol) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          protocol.title,
          protocol.summary,
          protocol.content.compound_name,
          protocol.content.short_introduction,
          protocol.content.category,
          protocol.content.product_format,
        ].some((value) => normalize(value).includes(normalizedQuery))
      const matchesCategory =
        category === "all" || protocol.content.category === category
      const matchesFormat =
        format === "all" || protocol.content.product_format === format

      return matchesQuery && matchesCategory && matchesFormat
    })
  }, [category, format, protocols, query])

  return (
    <section className="mt-10">
      <div className="grid gap-3 rounded-rounded border border-ui-border-base bg-ui-bg-base p-4 small:grid-cols-3">
        <label className="flex flex-col gap-2 text-small-semi text-ui-fg-base">
          Search protocols
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Compound, category, or research area"
            className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular outline-none focus:border-ui-border-interactive"
          />
        </label>
        <label className="flex flex-col gap-2 text-small-semi text-ui-fg-base">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular outline-none focus:border-ui-border-interactive"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-small-semi text-ui-fg-base">
          Product format
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular outline-none focus:border-ui-border-interactive"
          >
            <option value="all">All formats</option>
            {formats.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-small-regular text-ui-fg-subtle" aria-live="polite">
        {visibleProtocols.length} {visibleProtocols.length === 1 ? "protocol" : "protocols"}
      </p>
      {visibleProtocols.length ? (
        <div className="mt-4 grid gap-4 small:grid-cols-2 large:grid-cols-3">
          {visibleProtocols.map((protocol) => (
            <LocalizedClientLink
              key={protocol.handle}
              href={`/research-protocols/${protocol.handle}`}
              className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-6 transition-colors hover:bg-ui-bg-subtle"
            >
              <div className="flex flex-wrap gap-2">
                {protocol.content.product_format ? <span className="rounded-full bg-ui-bg-subtle px-3 py-1 text-small-semi">{protocol.content.product_format}</span> : null}
                {protocol.content.category ? <span className="rounded-full bg-ui-bg-subtle px-3 py-1 text-small-regular text-ui-fg-subtle">{protocol.content.category}</span> : null}
              </div>
              <h2 className="mt-4 text-xl-semi text-ui-fg-base">{protocol.content.compound_name || protocol.title}</h2>
              <p className="mt-2 text-small-regular text-ui-fg-subtle">{protocol.content.short_introduction || protocol.summary || "View the public research protocol preview."}</p>
              <p className="mt-5 text-small-semi text-ui-fg-interactive">View preview</p>
            </LocalizedClientLink>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-8 text-center">
          <p className="text-base-semi text-ui-fg-base">No matching protocols</p>
          <p className="mt-2 text-small-regular text-ui-fg-subtle">Try a different search, category, or product format.</p>
        </div>
      )}
    </section>
  )
}
