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
      <div className="rounded-xl border border-ui-border-base bg-white p-5 shadow-xs">
        <div className="grid gap-4 small:grid-cols-3">
          {/* Search */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-ui-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search protocols
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Compound, category, or research area"
              className="h-10 rounded-lg border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base outline-none transition-colors focus:border-emerald-500"
            />
          </label>

          {/* Category */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
            <span className="flex items-center gap-1.5">
              Category
              {category !== "all" ? (
                <span
                  className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                  aria-label="filter active"
                />
              ) : null}
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-lg border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base outline-none transition-colors focus:border-emerald-500"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          {/* Product format */}
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
            <span className="flex items-center gap-1.5">
              Product format
              {format !== "all" ? (
                <span
                  className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                  aria-label="filter active"
                />
              ) : null}
            </span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="h-10 rounded-lg border border-ui-border-base bg-ui-bg-field px-3 text-sm text-ui-fg-base outline-none transition-colors focus:border-emerald-500"
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
        <p className="text-xs text-ui-fg-subtle" aria-live="polite">
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
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* ── Protocol cards ── */}
      {visibleProtocols.length ? (
        <div className="mt-4 grid gap-5 small:grid-cols-2 large:grid-cols-3">
          {visibleProtocols.map((protocol) => {
            const compoundName = protocol.content.compound_name || protocol.title
            const calcParams = new URLSearchParams()
            if (protocol.handle === "bpc-157-protocol") {
              calcParams.set("preset", "bpc-157")
            } else {
              calcParams.set("name", compoundName)
              calcParams.set("preset", "custom")
            }
            const calcHref = `#calculator?${calcParams.toString()}`

            return (
              <div
                key={protocol.handle}
                className="group flex flex-col justify-between rounded-xl border border-ui-border-base bg-white p-6 shadow-xs transition-all hover:border-slate-400 hover:shadow-md"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {protocol.content.product_format ? (
                      <span className="rounded-full border border-ui-border-base bg-ui-bg-subtle px-2.5 py-0.5 text-[11px] font-semibold text-ui-fg-subtle">
                        {protocol.content.product_format}
                      </span>
                    ) : null}
                    {protocol.content.category ? (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                        {protocol.content.category}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-ui-fg-base group-hover:text-emerald-700 transition-colors">
                    {compoundName}
                  </h3>

                  <p className="mt-2.5 text-xs text-ui-fg-subtle leading-relaxed line-clamp-3">
                    {protocol.content.short_introduction ||
                      protocol.summary ||
                      "View the public research protocol preview and verified preparation standards."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-2 border-t border-ui-border-base pt-4">
                  <a
                    href={calcHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Load in Calculator
                    <span aria-hidden="true">↑</span>
                  </a>

                  <LocalizedClientLink
                    href={`/research-protocols/${protocol.handle}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ui-fg-base hover:text-emerald-600"
                  >
                    View Dossier
                    <span
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </LocalizedClientLink>
                </div>
              </div>
            )
          })}
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
