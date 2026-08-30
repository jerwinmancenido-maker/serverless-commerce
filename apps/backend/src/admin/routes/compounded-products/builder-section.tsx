import { Container, Text } from "@medusajs/ui"
import type { ReactNode } from "react"

export const BuilderSection = ({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) => (
  <Container className="divide-y p-0">
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <Text
            size="xsmall"
            leading="compact"
            weight="plus"
            className="uppercase tracking-wider text-ui-fg-muted"
          >
            {eyebrow}
          </Text>
          <Text size="small" leading="compact" weight="plus">
            {title}
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          {description}
        </Text>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="p-4">{children}</div>
  </Container>
)
