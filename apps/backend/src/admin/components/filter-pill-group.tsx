import { Badge } from "@medusajs/ui"
import type { ReactNode } from "react"

export type FilterPillItem<T extends string = string> = {
  id: T
  label: string
  count?: number
  icon?: ReactNode
  badgeColor?: "green" | "grey" | "red" | "blue" | "orange" | "purple"
}

export type FilterPillGroupProps<T extends string = string> = {
  items: FilterPillItem<T>[]
  selectedId: T
  onSelect: (id: T) => void
  className?: string
}

export function FilterPillGroup<T extends string = string>({
  items,
  selectedId,
  onSelect,
  className = "",
}: FilterPillGroupProps<T>) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {items.map((item) => {
        const isSelected = item.id === selectedId

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              isSelected
                ? "bg-zinc-900 text-white shadow-2xs dark:bg-white dark:text-zinc-900"
                : "bg-ui-bg-subtle text-ui-fg-subtle hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base border border-ui-border-base"
            }`}
          >
            {item.icon && <span className="text-xs">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <Badge
                color={
                  item.badgeColor
                    ? item.badgeColor
                    : isSelected
                      ? "grey"
                      : "grey"
                }
                className={`text-[10px] px-1.5 py-0 font-mono tabular-nums ${
                  isSelected ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-900" : ""
                }`}
              >
                {item.count}
              </Badge>
            )}
          </button>
        )
      })}
    </div>
  )
}
export default FilterPillGroup
