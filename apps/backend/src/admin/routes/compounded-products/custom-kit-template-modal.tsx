/**
 * @file    apps/backend/src/admin/routes/compounded-products/custom-kit-template-modal.tsx
 * @module  CustomKitTemplateModal
 * @purpose Reusable inventory kit template creator drawer for compounded products.
 * @contracts
 *   Service: InventoryModuleService
 */

import type { HttpTypes } from "@medusajs/types"
import {
  Button,
  Checkbox,
  Drawer,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import { useState } from "react"

export type CustomKitTemplate = {
  id: string
  name: string
  description?: string
  items: {
    inventory_item_id: string
    title: string
    sku: string
    quantity: number
  }[]
}

type CustomKitTemplateModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventoryItems: HttpTypes.AdminInventoryItem[]
  onSaveTemplate: (template: CustomKitTemplate) => void
}

export const CustomKitTemplateModal = ({
  open,
  onOpenChange,
  inventoryItems,
  onSaveTemplate,
}: CustomKitTemplateModalProps) => {
  const [templateName, setTemplateName] = useState("")
  const [search, setSearch] = useState("")
  const [selectedItems, setSelectedItems] = useState<
    Map<string, { item: HttpTypes.AdminInventoryItem; quantity: number }>
  >(new Map())

  const handleToggleItem = (
    item: HttpTypes.AdminInventoryItem,
    checked: boolean,
  ) => {
    const next = new Map(selectedItems)
    if (checked) {
      next.set(item.id, { item, quantity: 1 })
    } else {
      next.delete(item.id)
    }
    setSelectedItems(next)
  }

  const handleUpdateQty = (itemId: string, quantity: number) => {
    const next = new Map(selectedItems)
    const existing = next.get(itemId)
    if (existing) {
      next.set(itemId, { ...existing, quantity: Math.max(1, quantity) })
      setSelectedItems(next)
    }
  }

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name")
      return
    }
    if (selectedItems.size === 0) {
      toast.error("Select at least one inventory item for the template")
      return
    }

    const template: CustomKitTemplate = {
      id: `tmpl_${Date.now()}`,
      name: templateName.trim(),
      items: Array.from(selectedItems.values()).map(({ item, quantity }) => ({
        inventory_item_id: item.id,
        title: item.title || "Item",
        sku: item.sku || "",
        quantity,
      })),
    }

    onSaveTemplate(template)
    toast.success(`Template "${template.name}" created successfully`)
    setTemplateName("")
    setSelectedItems(new Map())
    onOpenChange(false)
  }

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-xl overflow-y-auto">
        <Drawer.Header>
          <Drawer.Title asChild>
            <h2 className="text-base font-bold text-slate-900">Create Reusable Kit Template</h2>
          </Drawer.Title>
          <Drawer.Description asChild>
            <p className="text-xs text-slate-500">
              Save a custom bundle of accessories & supplies. You can apply it to
              any product combination with 1 click.
            </p>
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col gap-y-5 px-6 py-4">
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g. Standard 10-Dose SubQ Bundle"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>Choose Items & Quantities</Label>
            <Input
              placeholder="Search supplies (BAC water, syringe, alcohol pad)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="mt-2 flex flex-col divide-y divide-ui-border-base rounded-lg border border-ui-border-base max-h-72 overflow-y-auto bg-ui-bg-base">
              {filteredItems.map((item) => {
                const entry = selectedItems.get(item.id)
                const isSelected = Boolean(entry)
                const qty = entry?.quantity || 1

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 p-3 transition-colors ${
                      isSelected ? "bg-ui-bg-subtle" : "hover:bg-ui-bg-base-hover"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleToggleItem(item, Boolean(checked))
                        }
                      />
                      <div className="min-w-0">
                        <Text size="small" weight="plus" className="truncate">
                          {item.title || "Untitled item"}
                        </Text>
                        <Text size="xsmall" className="text-ui-fg-subtle font-mono">
                          {item.sku || "No SKU"}
                        </Text>
                      </div>
                    </label>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={qty <= 1}
                          onClick={() => handleUpdateQty(item.id, qty - 1)}
                          className="size-6 flex items-center justify-center rounded border border-ui-border-base bg-white text-xs hover:bg-ui-bg-subtle disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, qty + 1)}
                          className="size-6 flex items-center justify-center rounded border border-ui-border-base bg-white text-xs hover:bg-ui-bg-subtle"
                        >
                          +
                        </button>
                        <div className="flex items-center gap-1 ml-1">
                          {[1, 5, 10, 20].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateQty(item.id, preset)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                qty === preset
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {!filteredItems.length && (
                <Text size="small" className="p-4 text-ui-fg-subtle text-center">
                  No inventory items match "{search}".
                </Text>
              )}
            </div>
          </div>
        </Drawer.Body>

        <Drawer.Footer className="flex items-center justify-between border-t border-ui-border-base px-6 py-4">
          <Text size="xsmall" className="text-ui-fg-subtle">
            {selectedItems.size} item{selectedItems.size === 1 ? "" : "s"} in template
          </Text>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="small" onClick={handleSave}>
              Save as Reusable Template
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}
