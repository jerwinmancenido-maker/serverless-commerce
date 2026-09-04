import { CheckCircle, Clock, ExclamationCircle, ShieldCheck } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { AdminCard } from "../../../components/admin-card"
import type { ProductReadinessResponse } from "../types"

type ProductOpsSidebarProps = {
  product: HttpTypes.AdminProduct
  readiness: ProductReadinessResponse
  bottleneckAnalysis: {
    lowestStock: number
    limitingComponent: string
    highestStock: number
  } | null
  sellableCapacity: string
  basePriceFormatted: string
  onOpenPublicationDrawer: () => void
  onOpenClassificationDrawer: () => void
  onOpenAuditDrawer: () => void
}

export const ProductOpsSidebar = ({
  product,
  readiness,
  bottleneckAnalysis,
  sellableCapacity,
  basePriceFormatted,
  onOpenPublicationDrawer,
  onOpenClassificationDrawer,
  onOpenAuditDrawer,
}: ProductOpsSidebarProps) => {
  return (
    <div className="flex flex-col gap-y-3">
      {/* 1. Product Overview (Consolidated KPIs) */}
      <AdminCard
        title={
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
            <span>📊</span> Product Overview
          </div>
        }
        contentClassName="p-3 flex flex-col gap-y-3 text-xs"
      >
        <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-ui-border-base">
          <div className="flex flex-col gap-y-0.5">
            <Text size="xsmall" className="text-ui-fg-subtle text-[11px]">
              Sellable Capacity
            </Text>
            <Text size="base" weight="plus" className="text-ui-fg-base font-semibold leading-tight">
              {sellableCapacity}
            </Text>
          </div>
          <div className="flex flex-col gap-y-0.5">
            <Text size="xsmall" className="text-ui-fg-subtle text-[11px]">
              Base Price
            </Text>
            <Text size="base" weight="plus" className="text-ui-fg-base font-semibold leading-tight">
              {basePriceFormatted}
            </Text>
          </div>
        </div>

        {/* Bottleneck Status Row */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <Text size="xsmall" className="text-ui-fg-subtle text-[11px]">
              Stock Bottleneck
            </Text>
            <Badge color={bottleneckAnalysis ? "orange" : "green"} size="small">
              {bottleneckAnalysis ? "Constrained" : "Balanced"}
            </Badge>
          </div>
          {bottleneckAnalysis ? (
            <div className="flex flex-col gap-y-1.5 mt-0.5">
              <div className="flex items-start gap-1.5 bg-amber-500/10 text-amber-900 dark:text-amber-300 p-2 rounded border border-amber-500/20 text-[11px] leading-snug">
                <ExclamationCircle className="size-3.5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-semibold">{bottleneckAnalysis.limitingComponent}</span> limits capacity to{" "}
                  <span className="font-bold underline">{bottleneckAnalysis.lowestStock} units</span>.
                </div>
              </div>
              <Button asChild size="small" variant="secondary" className="w-full justify-center h-6 text-[11px]">
                <Link to={`/inventory?q=${encodeURIComponent(bottleneckAnalysis.limitingComponent)}`}>
                  Restock in Inventory →
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-[11px]">
              <CheckCircle className="size-3 shrink-0 text-emerald-500" />
              <span>All supply bins balanced.</span>
            </div>
          )}
        </div>
      </AdminCard>

      {/* 2. Publication Readiness Card */}
      <AdminCard
        title={
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
            <ShieldCheck className="size-3.5 text-ui-fg-subtle" />
            <span>Publication Readiness</span>
          </div>
        }
        badge={
          <Badge color={readiness.ready ? "green" : "orange"} size="small">
            {readiness.ready ? "Ready" : `${readiness.blockers.length} Check(s)`}
          </Badge>
        }
        contentClassName="p-3 flex flex-col gap-y-2.5 text-xs"
      >
        <Text size="xsmall" className="text-ui-fg-subtle leading-normal">
          {readiness.ready
            ? "All configured commerce and laboratory checks pass."
            : `${readiness.blockers.length} check(s) must be resolved before publication.`}
        </Text>

        <Button
          size="small"
          variant="secondary"
          onClick={onOpenPublicationDrawer}
          className="w-full justify-center h-7 text-xs"
        >
          Review Readiness Checks
        </Button>
      </AdminCard>

      {/* 3. Compliance & Audit Actions */}
      <AdminCard
        title={
          <div className="text-xs font-semibold uppercase tracking-wider text-ui-fg-base">
            Compliance & Audit
          </div>
        }
        contentClassName="p-3 flex flex-col gap-y-1.5 text-xs"
      >
        <Button
          size="small"
          variant="secondary"
          onClick={onOpenClassificationDrawer}
          className="w-full justify-center h-7 text-xs"
        >
          Product Classification
        </Button>
        <Button
          size="small"
          variant="transparent"
          onClick={onOpenAuditDrawer}
          className="w-full justify-center h-7 text-xs text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <Clock className="size-3.5 mr-1" />
          Activity & Audit Log
        </Button>
      </AdminCard>
    </div>
  )
}

export default ProductOpsSidebar
