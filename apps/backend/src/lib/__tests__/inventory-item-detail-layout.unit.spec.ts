import {
  INVENTORY_ITEM_BOM_WIDGET_ID,
  INVENTORY_ITEM_DETAIL_LAYOUT_CONFIGURATION,
} from "../admin-layouts/inventory-item-detail"

describe("inventory item detail layout", () => {
  it("places peptide inventory context before Metadata and JSON", () => {
    const widgets = INVENTORY_ITEM_DETAIL_LAYOUT_CONFIGURATION.widgets

    expect(widgets[INVENTORY_ITEM_BOM_WIDGET_ID]).toEqual({
      section: "main",
      order: 3,
    })
    expect(widgets["core:MetadataSection"].order).toBeGreaterThan(
      widgets[INVENTORY_ITEM_BOM_WIDGET_ID].order,
    )
    expect(widgets["core:JsonViewSection"].order).toBeGreaterThan(
      widgets[INVENTORY_ITEM_BOM_WIDGET_ID].order,
    )
  })

  it("preserves Medusa's stock and reservation sections above BOM context", () => {
    const widgets = INVENTORY_ITEM_DETAIL_LAYOUT_CONFIGURATION.widgets

    expect(widgets["core:InventoryItemGeneralSection"].order).toBe(0)
    expect(widgets["core:InventoryItemLocationLevelsSection"].order).toBe(1)
    expect(widgets["core:InventoryItemReservationsSection"].order).toBe(2)
  })
})
