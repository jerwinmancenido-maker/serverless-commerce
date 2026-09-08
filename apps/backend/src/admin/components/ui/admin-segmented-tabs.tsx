import type { ReactNode } from "react"

export type AdminTabItem<T extends string = string> = {
  id: T
  label: string
  count?: number
  badgeText?: string
  icon?: ReactNode
}

export type AdminSegmentedTabsProps<T extends string = string> = {
  tabs: AdminTabItem<T>[]
  activeTab: T
  onChange: (id: T) => void
  className?: string
}

export const AdminSegmentedTabs = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: AdminSegmentedTabsProps<T>) => {
  return (
    <div className={`border-b border-slate-200/80 bg-white px-2 overflow-x-auto no-scrollbar ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`group flex items-center gap-2 px-3 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer select-none ${
                isActive
                  ? "border-blue-600 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              {tab.icon && (
                <span
                  className={`transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.badgeText && (
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  {tab.badgeText}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
