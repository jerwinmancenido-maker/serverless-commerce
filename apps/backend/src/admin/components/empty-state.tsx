import { Button, Heading, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

export type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200/90 py-10 px-6 text-center ${className}`}>
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-2xs mb-3.5">
          {icon}
        </div>
      )}
      <Heading level="h3" className="text-sm font-bold text-slate-900">
        {title}
      </Heading>
      {description && (
        <Text size="small" className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          size="small"
          onClick={onAction}
          className="mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 shadow-xs transition-colors"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
