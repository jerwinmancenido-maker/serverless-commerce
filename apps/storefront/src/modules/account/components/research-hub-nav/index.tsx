"use client"

import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

const items = [
  ["overview", "Overview"],
  ["today", "Today"],
  ["calendar", "Calendar"],
  ["protocols", "My Protocols"],
  ["routines", "Routines"],
  ["calculator", "Calculator"],
  ["progress", "Progress"],
  ["journal", "Journal"],
  ["timeline", "Timeline"],
  ["rewards", "Rewards"],
] as const

export default function ResearchHubNav() {
  const search = useSearchParams()
  const active = search.get("section") || "overview"

  return (
    <nav
      aria-label="Research Hub"
      className="mb-8 border-b border-ui-border-base small:overflow-x-auto"
    >
      <ul className="flex flex-wrap gap-x-4 gap-y-0 small:min-w-max small:flex-nowrap small:gap-6">
        {items.map(([key, label]) => (
          <li key={key}>
            <LocalizedClientLink
              href={key === "overview" ? "/account/research-hub" : `/account/research-hub?section=${key}`}
              className={clx("block border-b-2 border-transparent py-3 text-sm text-ui-fg-subtle", {
                "border-ui-fg-base font-semibold text-ui-fg-base": active === key,
              })}
            >
              {label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
