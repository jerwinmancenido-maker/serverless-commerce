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
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      {icon && <div className="mb-3 text-3xl text-ui-fg-muted">{icon}</div>}
      <Heading level="h3" className="text-sm font-semibold text-ui-fg-base">
        {title}
      </Heading>
      {description && (
        <Text size="small" className="text-ui-fg-subtle mt-1 max-w-sm">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button size="small" variant="secondary" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
