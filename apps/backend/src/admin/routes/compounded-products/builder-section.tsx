/**
 * @file    apps/backend/src/admin/routes/compounded-products/builder-section.tsx
 * @module  BuilderSection
 * @purpose Layout wrapper card for product builder wizard steps.
 * @contracts
 *   Service: CompoundedProductModuleService
 */

import { Text } from "@medusajs/ui"
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
  <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs divide-y divide-slate-100 overflow-hidden">
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
      <div className="min-w-0 flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2">
          <Text
            size="xsmall"
            leading="compact"
            weight="plus"
            className="uppercase tracking-wider text-ui-fg-muted font-mono text-[10px]"
          >
            {eyebrow}
          </Text>
          <Text size="small" leading="compact" weight="plus" className="text-slate-900 font-semibold">
            {title}
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-slate-500 text-xs">
          {description}
        </Text>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="p-4">{children}</div>
  </div>
)
