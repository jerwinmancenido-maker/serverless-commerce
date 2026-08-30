import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { PencilSquare, Spinner } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "react-router-dom"

import { sdk } from "../lib/sdk"
import { ComponentProfileDrawer } from "../routes/bom/component-profile-drawer"
import type {
  BomBaseUnit,
  BomComponentClassification,
  BomSupplierUnit,
  ComponentProfile,
  InventoryItemBomContextResponse,
} from "../routes/bom/types"

type InventoryItemBomContextWidgetProps = {
  data: HttpTypes.AdminInventoryItem
}

const classificationLabels: Record<BomComponentClassification, string> = {
  finished_product: "Finished vial",
  included_supply: "Included supply",
  packaging: "Packaging",
}

const baseUnitLabels: Record<BomBaseUnit, string> = {
  microgram: "mcg",
  microliter: "µL",
  piece: "piece",
}

const supplierUnitLabels: Record<BomSupplierUnit, string> = {
  box: "box",
  pack: "pack",
  roll: "roll",
  piece: "piece",
}

function pluralize(value: number, singular: string) {
  return value === 1 ? singular : `${singular}s`
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 6,
  }).format(value)
}

function supplierConversion(profile: ComponentProfile) {
  const quantity = profile.inventory_units_per_supplier_unit
  const inventoryUnit = baseUnitLabels[profile.base_unit]

  return `1 ${supplierUnitLabels[profile.supplier_unit]} = ${formatQuantity(
    quantity,
  )} ${pluralize(quantity, inventoryUnit)}`
}

const ProfileSummary = ({ profile }: { profile: ComponentProfile }) => {
  const details = [
    ["Classification", classificationLabels[profile.classification]],
    [
      "Inventory unit",
      `${profile.display_unit} (${formatQuantity(
        profile.base_units_per_display_unit,
      )} ${baseUnitLabels[profile.base_unit]})`,
    ],
    ["Receiving conversion", supplierConversion(profile)],
    [
      "Reorder threshold",
      `${formatQuantity(profile.reorder_threshold_base_units)} ${
        baseUnitLabels[profile.base_unit]
      }`,
    ],
    ["Category", profile.category],
    [
      "Tracking",
      [
        profile.lot_tracking_required ? "Lot" : null,
        profile.expiry_tracking_required ? "Expiry" : null,
      ]
        .filter(Boolean)
        .join(" and ") || "Standard",
    ],
  ]

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 px-6 py-4 small:grid-cols-2">
      {details.map(([label, value]) => (
        <div
          className="flex min-w-0 items-start justify-between gap-4"
          key={label}
        >
          <dt>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              {label}
            </Text>
          </dt>
          <dd className="min-w-0 text-right break-words">
            <Text size="small" leading="compact" weight="plus">
              {value}
            </Text>
          </dd>
        </div>
      ))}
    </dl>
  )
}

const InventoryItemBomContextWidget = ({
  data,
}: InventoryItemBomContextWidgetProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const query = useQuery({
    queryKey: ["bom-inventory-item-context", data.id],
    queryFn: () =>
      sdk.client.fetch<InventoryItemBomContextResponse>(
        `/admin/bom/inventory-items/${data.id}`,
      ),
  })

  const profile = query.data?.component_profile
  const usage = query.data?.recipe_usage || []
  const usageCount = query.data?.recipe_usage_count || 0

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h2">Component and receiving</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Classification, units, purchasing conversion, and reorder policy.
            </Text>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setDrawerOpen(true)}
          >
            <PencilSquare />
            {profile ? "Edit component settings" : "Configure component"}
          </Button>
        </div>

        {query.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="animate-spin" />
          </div>
        ) : query.isError ? (
          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <Text size="small" className="text-ui-fg-error">
              Component details could not be loaded.
            </Text>
            <Button
              size="small"
              variant="secondary"
              onClick={() => query.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : profile ? (
          <ProfileSummary profile={profile} />
        ) : (
          <div className="px-6 py-5">
            <Text size="small" className="text-ui-fg-subtle">
              No component profile is configured. Physical stock remains managed
              by Medusa Inventory.
            </Text>
          </div>
        )}

        {!query.isLoading && !query.isError && (
          <div>
            <div className="flex items-start justify-between gap-4 px-6 py-4">
              <div>
                <Heading level="h2">BOM usage</Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  Recipe quantities only. Medusa&apos;s native Associated
                  variants remain unchanged.
                </Text>
              </div>
              <Badge color={usageCount > 0 ? "blue" : "grey"}>
                {usageCount} {pluralize(usageCount, "recipe")}
              </Badge>
            </div>

            {usage.length === 0 ? (
              <div className="border-t px-6 py-5">
                <Text size="small" className="text-ui-fg-subtle">
                  This inventory item is not used by a BOM recipe.
                </Text>
              </div>
            ) : (
              <div className="border-t">
                {usage.map((row) => {
                  const content = (
                    <div className="min-w-0">
                      <Text size="small" leading="compact" weight="plus">
                        {row.product_title} · {row.variant_title}
                      </Text>
                      <Text
                        size="xsmall"
                        leading="compact"
                        className="text-ui-fg-subtle"
                      >
                        {row.variant_sku || "No SKU"}
                        {row.latest_audit_version
                          ? ` · Recipe v${row.latest_audit_version}`
                          : " · No audit snapshot"}
                      </Text>
                    </div>
                  )

                  return (
                    <div
                      className="flex items-center justify-between gap-4 border-b px-6 py-3 last:border-b-0"
                      key={row.variant_id}
                    >
                      {row.product_id ? (
                        <Link
                          className="min-w-0 hover:text-ui-fg-interactive"
                          to={`/products/${row.product_id}/variants/${row.variant_id}`}
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                      <div className="flex shrink-0 items-center gap-3">
                        {row.recipe_status === "missing_variant" && (
                          <Badge color="orange">Needs attention</Badge>
                        )}
                        <Text
                          size="small"
                          weight="plus"
                          className="tabular-nums"
                        >
                          {formatQuantity(row.required_quantity)} required
                        </Text>
                      </div>
                    </div>
                  )
                })}
                {usageCount > usage.length && (
                  <div className="border-t px-6 py-3">
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Showing {usage.length} of {usageCount} recipe uses.
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Container>

      <ComponentProfileDrawer
        inventoryItem={data}
        profile={profile || undefined}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "inventory_item.details",
  id: "pepstack:inventory-item-bom-context",
})

export default InventoryItemBomContextWidget
