"use client"

import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"

interface TabItem {
  id: string
  label: string
  href: string
  matches: string[]
  icon: (props: { className?: string }) => React.JSX.Element
}

function OverviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ScheduleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="12" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
    </svg>
  )
}



function RecordsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  )
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

const tabs: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/account/research-hub",
    matches: ["overview", "protocols"],
    icon: OverviewIcon,
  },
  {
    id: "schedule",
    label: "Schedule & Supplies",
    href: "/account/research-hub?section=schedule",
    matches: ["schedule", "routines", "today", "calendar", "supplies"],
    icon: ScheduleIcon,
  },
  {
    id: "records",
    label: "Records",
    href: "/account/research-hub?section=progress",
    matches: ["progress", "journal"],
    icon: RecordsIcon,
  },
  {
    id: "more",
    label: "Tools & Goals",
    href: "/account/research-hub?section=calculator",
    matches: ["calculator", "timeline", "rewards"],
    icon: MoreIcon,
  },
]

export default function ResearchHubNav() {
  const search = useSearchParams()
  const activeSection = search.get("section") || "overview"

  return (
    <nav
      aria-label="Research Hub"
      className="mb-8 overflow-x-auto pb-1"
    >
      <ul className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-ui-border-base bg-ui-bg-subtle/80 p-1.5 backdrop-blur-xs small:flex-nowrap small:min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.matches.includes(activeSection)
          const Icon = tab.icon

          return (
            <li key={tab.id}>
              <LocalizedClientLink
                href={tab.href}
                className={clx(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                  {
                    "bg-ui-fg-base text-ui-bg-base shadow-xs": isActive,
                    "text-ui-fg-subtle hover:bg-white hover:text-ui-fg-base hover:shadow-2xs": !isActive,
                  }
                )}
              >
                <Icon className={clx("transition-opacity", isActive ? "opacity-100" : "opacity-60")} />
                <span>{tab.label}</span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
