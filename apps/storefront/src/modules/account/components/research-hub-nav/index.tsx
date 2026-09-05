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



function ProtocolsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31a2 2 0 0 1-.37 1.17l-5.26 7.89A2 2 0 0 0 6 21.5h12a2 2 0 0 0 1.63-3.13l-5.26-7.89A2 2 0 0 1 14 9.31V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  )
}

function VialsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
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

const tabs: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/account/research-hub",
    matches: ["overview"],
    icon: OverviewIcon,
  },
  {
    id: "protocols",
    label: "My Protocols",
    href: "/account/research-hub?section=protocols",
    matches: ["protocols"],
    icon: ProtocolsIcon,
  },
  {
    id: "schedule",
    label: "Schedule",
    href: "/account/research-hub?section=schedule",
    matches: ["schedule", "routines", "today", "calendar"],
    icon: ScheduleIcon,
  },
  {
    id: "supplies",
    label: "Vials & Stability",
    href: "/account/research-hub?section=supplies",
    matches: ["supplies"],
    icon: VialsIcon,
  },
  {
    id: "records",
    label: "Records & Tools",
    href: "/account/research-hub?section=progress",
    matches: ["progress", "journal", "calculator", "timeline"],
    icon: RecordsIcon,
  },
]

export default function ResearchHubNav() {
  const search = useSearchParams()
  const activeSection = search.get("section") || "overview"

  return (
    <nav aria-label="Research Hub" className="mb-6 w-full">
      <ul className="flex flex-wrap small:flex-nowrap items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar w-full">
        {tabs.map((tab) => {
          const isActive = tab.matches.includes(activeSection)
          const Icon = tab.icon

          return (
            <li key={tab.id} className="shrink-0">
              <LocalizedClientLink
                href={tab.href}
                className={clx(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer",
                  {
                    "bg-white text-slate-900 shadow-xs border border-slate-200/60 font-bold": isActive,
                    "text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent": !isActive,
                  }
                )}
              >
                <Icon className={clx("h-4 w-4 transition-colors", isActive ? "text-emerald-600" : "text-slate-400")} />
                <span>{tab.label}</span>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
