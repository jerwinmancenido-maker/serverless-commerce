import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Drawer,
  Heading,
  Skeleton,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"

import { sdk } from "../../lib/sdk"
import type { RecipeHistoryResponse } from "./types"

type RecipeHistoryDrawerProps = {
  variant: HttpTypes.AdminProductVariant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatComponentQuantity(
  quantity: number,
  baseUnitsPerDisplayUnit: number,
  displayPrecision: number,
  displayUnit: string,
) {
  const displayQuantity = quantity / baseUnitsPerDisplayUnit

  return `${displayQuantity.toFixed(displayPrecision)} ${displayUnit}`
}

export function RecipeHistoryDrawer({
  variant,
  open,
  onOpenChange,
}: RecipeHistoryDrawerProps) {
  const historyQuery = useQuery({
    queryKey: ["bom-recipe-history", variant?.id],
    queryFn: () =>
      sdk.client.fetch<RecipeHistoryResponse>(
        `/admin/bom/recipe-history/${variant?.id}`,
      ),
    enabled: open && Boolean(variant?.id),
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title asChild>
            <Heading>Recipe history</Heading>
          </Drawer.Title>
          <Drawer.Description>
            {variant?.title || "Product variant"}
            {variant?.sku ? ` (${variant.sku})` : ""}
          </Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          {historyQuery.isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : historyQuery.isError ? (
            <Text className="text-ui-fg-error">
              {historyQuery.error instanceof Error
                ? historyQuery.error.message
                : "Unable to load recipe history"}
            </Text>
          ) : historyQuery.data?.recipe_history.length ? (
            historyQuery.data.recipe_history.map((snapshot) => (
              <div
                className="border-ui-border-base rounded-lg border"
                key={snapshot.id}
              >
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Heading level="h3">Version {snapshot.version}</Heading>
                      <Badge>{snapshot.components.length} components</Badge>
                    </div>
                    <Text className="text-ui-fg-subtle" size="small">
                      {snapshot.note || "No change note"}
                    </Text>
                  </div>
                  <Text className="font-mono" size="xsmall">
                    {snapshot.recipe_hash.slice(0, 12)}
                  </Text>
                </div>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Inventory item</Table.HeaderCell>
                      <Table.HeaderCell>Required</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {snapshot.components.map((component) => (
                      <Table.Row key={component.inventoryItemId}>
                        <Table.Cell>
                          <Text className="font-mono" size="small">
                            {component.inventoryItemId}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {formatComponentQuantity(
                            component.requiredQuantity,
                            component.baseUnitsPerDisplayUnit,
                            component.displayPrecision,
                            component.displayUnit,
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
                <div className="border-ui-border-base border-t px-4 py-2">
                  <Text className="text-ui-fg-subtle" size="xsmall">
                    Actor: {snapshot.actor_id || "system"}
                  </Text>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center gap-1 py-12 text-center">
              <Heading level="h3">No recipe history</Heading>
              <Text className="text-ui-fg-subtle" size="small">
                A snapshot appears after the variant recipe changes.
              </Text>
            </div>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  )
}
