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

  const hasActiveFilters = query !== "" || category !== "all" || format !== "all"

  const clearFilters = () => {
    setQuery("")
    setCategory("all")
    setFormat("all")
  }

  return (
    <section className="mt-10">
      {/* ── Filter bar ── */}
      <div className="rounded-rounded border border-ui-border-base bg-ui-bg-base p-4">
        <div className="grid gap-3 small:grid-cols-3">

          {/* Search */}
          <label className="flex flex-col gap-1.5 text-small-semi text-ui-fg-base">
            <span className="flex items-center gap-1.5">
              🔍 Search protocols
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Compound, category, or research area"
              className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular outline-none transition-colors focus:border-ui-border-interactive"
            />
          </label>

          {/* Category */}
          <label className="flex flex-col gap-1.5 text-small-semi text-ui-fg-base">
            <span className="flex items-center gap-1.5">
              Category
              {category !== "all" ? (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgb(99 102 241)" }}
                  aria-label="filter active"
                />
              ) : null}
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular outline-none transition-colors focus:border-ui-border-interactive"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          {/* Product format */}
          <label className="flex flex-col gap-1.5 text-small-semi text-ui-fg-base">
            <span className="flex items-center gap-1.5">
              Product format
              {format !== "all" ? (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: "rgb(99 102 241)" }}
                  aria-label="filter active"
                />
              ) : null}
            </span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="h-10 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-small-regular outline-none transition-colors focus:border-ui-border-interactive"
            >
              <option value="all">All formats</option>
              {formats.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* ── Result count + clear filters ── */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-small-regular text-ui-fg-subtle" aria-live="polite">
          Showing{" "}
          <span className="font-semibold text-ui-fg-base">
            {visibleProtocols.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-ui-fg-base">{protocols.length}</span>{" "}
          {protocols.length === 1 ? "protocol" : "protocols"}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-small-semi text-ui-fg-interactive hover:underline"
          >
            × Clear filters
          </button>
        ) : null}
      </div>

      {/* ── Protocol cards ── */}
      {visibleProtocols.length ? (
        <div className="mt-4 grid gap-4 small:grid-cols-2 large:grid-cols-3">
          {visibleProtocols.map((protocol) => (
            <LocalizedClientLink
              key={protocol.handle}
              href={`/research-protocols/${protocol.handle}`}
              className="group flex flex-col rounded-rounded border border-ui-border-base bg-ui-bg-base p-6 transition-all hover:border-ui-border-interactive hover:shadow-md"
            >
              {/* Format + category badges below title */}
              <div>
                <h2 className="text-xl-semi text-ui-fg-base group-hover:text-ui-fg-interactive">
                  {protocol.content.compound_name || protocol.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {protocol.content.product_format ? (
                    <span className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-2.5 py-0.5 text-xsmall-semi text-ui-fg-subtle">
                      {protocol.content.product_format}
                    </span>
                  ) : null}
                  {protocol.content.category ? (
                    <span className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-2.5 py-0.5 text-xsmall-regular text-ui-fg-subtle">
                      {protocol.content.category}
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 flex-1 text-small-regular text-ui-fg-subtle leading-relaxed">
                {protocol.content.short_introduction || protocol.summary || "View the public research protocol preview."}
              </p>

              <div className="mt-5 flex items-center gap-1.5 text-small-semi text-ui-fg-interactive">
                View protocol
                <span
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-rounded border border-ui-border-base bg-ui-bg-subtle p-8 text-center">
          <p className="text-base-semi text-ui-fg-base">No matching protocols</p>
          <p className="mt-2 text-small-regular text-ui-fg-subtle">
            Try a different search, category, or product format.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-small-semi text-ui-fg-interactive hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      )}
    </section>
  )
}
