import { Container, Heading, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

export type AdminCardProps = {
  title?: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  headerAction?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  footer?: ReactNode
}

export const AdminCard = ({
  title,
  subtitle,
  badge,
  headerAction,
  children,
  className = "",
  contentClassName = "p-4",
  headerClassName = "px-4 py-3 bg-ui-bg-subtle/30",
  footer,
}: AdminCardProps) => {
  const hasHeader = title || subtitle || badge || headerAction

  return (
    <Container className={`divide-y p-0 shadow-elevation-card-rest border-ui-border-base bg-ui-bg-base ${className}`}>
      {hasHeader && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex flex-col gap-y-0.5">
            <div className="flex items-center gap-2">
              {typeof title === "string" ? (
                <Heading level="h2" className="text-sm font-semibold text-ui-fg-base">
                  {title}
                </Heading>
              ) : (
                title
              )}
              {badge}
            </div>
            {subtitle && typeof subtitle === "string" ? (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </div>
          {headerAction && <div className="shrink-0 flex items-center gap-2">{headerAction}</div>}
        </div>
      )}

      <div className={contentClassName}>{children}</div>

      {footer && <div className="px-4 py-2.5 bg-ui-bg-subtle/30">{footer}</div>}
    </Container>
  )
}

export default AdminCard
