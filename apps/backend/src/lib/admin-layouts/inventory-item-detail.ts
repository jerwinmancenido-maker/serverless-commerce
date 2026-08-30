import type { LayoutConfigurationData } from "@medusajs/framework/types"

export const INVENTORY_ITEM_BOM_WIDGET_ID =
  "widget:pepstack:inventory-item-bom-context"

export const INVENTORY_ITEM_DETAIL_LAYOUT_CONFIGURATION = {
  widgets: {
    "core:InventoryItemGeneralSection": { section: "main", order: 0 },
    "core:InventoryItemLocationLevelsSection": { section: "main", order: 1 },
    "core:InventoryItemReservationsSection": { section: "main", order: 2 },
    [INVENTORY_ITEM_BOM_WIDGET_ID]: { section: "main", order: 3 },
    "core:MetadataSection": { section: "main", order: 4 },
    "core:JsonViewSection": { section: "main", order: 5 },
    "core:RequiredPermissionsSection": { section: "main", order: 6 },
    "core:InventoryItemVariantsSection": { section: "side", order: 0 },
    "core:InventoryItemAttributeSection": { section: "side", order: 1 },
  },
} satisfies LayoutConfigurationData
