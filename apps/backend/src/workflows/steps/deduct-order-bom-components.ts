/**
 * @file    apps/backend/src/workflows/steps/deduct-order-bom-components.ts
 * @module  DeductOrderBomComponentsStep (BOM Module)
 * @purpose Decrement physical inventory quantities for multi-component kits upon order fulfillment with strict idempotency guards.
 * @contracts
 *   Step:    deductOrderBomComponentsStep
 *   Service: InventoryModuleService · OrderModuleService · Query
 */

import type { IInventoryService, IOrderModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

export type DeductOrderBomComponentsInput = {
  order_id?: string
  fulfillment_id?: string
}

export type BomDeductionRecord = {
  inventory_item_id: string
  title: string
  quantity_deducted: number
  previous_stocked?: number
  new_stocked?: number
}

type StepOutput = {
  success: boolean
  already_deducted: boolean
  deductions: BomDeductionRecord[]
}

type StepCompensation = {
  location_id: string
  deductions: Array<{
    inventory_item_id: string
    quantity: number
  }>
}

export const deductOrderBomComponentsStep = createStep(
  "deduct-order-bom-components",
  async (input: DeductOrderBomComponentsInput, { container }): Promise<StepResponse<StepOutput, StepCompensation>> => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const inventoryService = container.resolve<IInventoryService>(Modules.INVENTORY)
    const orderService = container.resolve<IOrderModuleService>(Modules.ORDER)

    const targetOrderId = input.order_id
    const targetFulfillmentId = input.fulfillment_id

    if (!targetOrderId && !targetFulfillmentId) {
      return new StepResponse(
        { success: true, already_deducted: false, deductions: [] },
        { location_id: "", deductions: [] },
      )
    }

    // 1. Resolve order details including items and metadata
    let order: {
      id: string
      metadata?: Record<string, unknown> | null
      items?: Array<{
        id: string
        variant_id?: string | null
        quantity: number
      }>
      fulfillments?: Array<{
        id: string
        location_id?: string | null
        metadata?: Record<string, unknown> | null
      }>
    } | null = null

    if (targetOrderId) {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "metadata",
          "items.id",
          "items.variant_id",
          "items.quantity",
          "fulfillments.id",
          "fulfillments.location_id",
          "fulfillments.metadata",
        ],
        filters: { id: targetOrderId },
        pagination: { take: 1 },
      })
      order = (orders[0] as unknown as typeof order) ?? null
    } else if (targetFulfillmentId) {
      const { data: fulfillments } = await query.graph({
        entity: "fulfillment",
        fields: [
          "id",
          "location_id",
          "metadata",
          "order.id",
          "order.metadata",
          "order.items.id",
          "order.items.variant_id",
          "order.items.quantity",
        ],
        filters: { id: targetFulfillmentId },
        pagination: { take: 1 },
      })

      const f = fulfillments[0] as {
        id: string
        location_id?: string | null
        metadata?: Record<string, unknown> | null
        order?: {
          id: string
          metadata?: Record<string, unknown> | null
          items?: Array<{
            id: string
            variant_id?: string | null
            quantity: number
          }>
        }
      } | undefined

      if (f?.order) {
        order = {
          ...f.order,
          fulfillments: [f],
        }
      }
    }

    if (!order || !order.items || order.items.length === 0) {
      return new StepResponse(
        { success: true, already_deducted: false, deductions: [] },
        { location_id: "", deductions: [] },
      )
    }

    // 2. Strict Idempotency Check
    const orderMetadata = (order.metadata || {}) as Record<string, unknown>
    const matchingFulfillment = targetFulfillmentId
      ? order.fulfillments?.find((f) => f.id === targetFulfillmentId)
      : order.fulfillments?.[0]

    const fulfillmentMeta = (matchingFulfillment?.metadata || {}) as Record<string, unknown>

    if (fulfillmentMeta.bom_deducted === true || orderMetadata.bom_deducted === true) {
      return new StepResponse(
        { success: true, already_deducted: true, deductions: [] },
        { location_id: "", deductions: [] },
      )
    }

    // 3. Resolve target stock location
    let targetLocationId = matchingFulfillment?.location_id || null

    if (!targetLocationId) {
      const { data: locations } = await query.graph({
        entity: "stock_location",
        fields: ["id", "name"],
        pagination: { take: 1 },
      })
      targetLocationId = (locations[0] as { id: string } | undefined)?.id || null
    }

    if (!targetLocationId) {
      return new StepResponse(
        { success: false, already_deducted: false, deductions: [] },
        { location_id: "", deductions: [] },
      )
    }

    // 4. Resolve BOM recipe links for all variants in the order
    const variantIds = Array.from(
      new Set(
        order.items
          .map((item) => item.variant_id)
          .filter((id): id is string => Boolean(id)),
      ),
    )

    if (variantIds.length === 0) {
      return new StepResponse(
        { success: true, already_deducted: false, deductions: [] },
        { location_id: targetLocationId, deductions: [] },
      )
    }

    const { data: rawLinks } = await query.graph({
      entity: "product_variant_inventory_item",
      fields: [
        "variant_id",
        "inventory_item_id",
        "required_quantity",
        "inventory_item.title",
        "inventory_item.sku",
      ],
      filters: { variant_id: variantIds },
    })

    type RecipeLink = {
      variant_id: string
      inventory_item_id: string
      required_quantity: number
      inventory_item?: {
        title?: string
        sku?: string | null
      }
    }
    const links = (rawLinks || []) as RecipeLink[]

    if (links.length === 0) {
      // Products in order do not have BOM recipe links
      return new StepResponse(
        { success: true, already_deducted: false, deductions: [] },
        { location_id: targetLocationId, deductions: [] },
      )
    }

    // Map: inventory_item_id -> total deduction quantity & title
    const deductionsMap = new Map<string, { title: string; quantity: number }>()

    for (const item of order.items) {
      if (!item.variant_id) continue
      const itemQty = item.quantity || 1

      const matchingLinks = links.filter((l) => l.variant_id === item.variant_id)
      for (const link of matchingLinks) {
        const componentId = link.inventory_item_id
        const requiredPerUnit = link.required_quantity || 1
        const totalToDeduct = itemQty * requiredPerUnit
        const componentTitle = link.inventory_item?.title || "Constituent Supply"

        const existing = deductionsMap.get(componentId)
        if (existing) {
          existing.quantity += totalToDeduct
        } else {
          deductionsMap.set(componentId, {
            title: componentTitle,
            quantity: totalToDeduct,
          })
        }
      }
    }

    // 5. Decrement inventory levels at target location
    const deductions: BomDeductionRecord[] = []
    const compensationDeductions: Array<{ inventory_item_id: string; quantity: number }> = []

    for (const [inventoryItemId, { title, quantity }] of deductionsMap.entries()) {
      const [level] = await inventoryService.listInventoryLevels({
        inventory_item_id: inventoryItemId,
        location_id: targetLocationId,
      })

      if (level) {
        const currentStock = Number(level.stocked_quantity ?? 0)
        const newStock = Math.max(0, currentStock - quantity)

        await inventoryService.updateInventoryLevels([
          {
            id: level.id,
            inventory_item_id: level.inventory_item_id,
            location_id: level.location_id,
            stocked_quantity: newStock,
          },
        ])

        deductions.push({
          inventory_item_id: inventoryItemId,
          title,
          quantity_deducted: quantity,
          previous_stocked: currentStock,
          new_stocked: newStock,
        })
        compensationDeductions.push({
          inventory_item_id: inventoryItemId,
          quantity,
        })
      }
    }

    // 6. Record metadata audit trail on the order
    await orderService.updateOrders([
      {
        id: order.id,
        metadata: {
          ...orderMetadata,
          bom_deducted: true,
          bom_deducted_at: new Date().toISOString(),
          bom_deductions: deductions.map((d) => ({
            item_id: d.inventory_item_id,
            title: d.title,
            qty: d.quantity_deducted,
          })),
        },
      },
    ])

    return new StepResponse(
      {
        success: true,
        already_deducted: false,
        deductions,
      },
      {
        location_id: targetLocationId,
        deductions: compensationDeductions,
      },
    )
  },
  async (compensation, { container }) => {
    if (!compensation || !compensation.location_id || compensation.deductions.length === 0) {
      return
    }

    const inventoryService = container.resolve<IInventoryService>(Modules.INVENTORY)

    for (const item of compensation.deductions) {
      const [level] = await inventoryService.listInventoryLevels({
        inventory_item_id: item.inventory_item_id,
        location_id: compensation.location_id,
      })

      if (level) {
        const currentStock = Number(level.stocked_quantity ?? 0)
        await inventoryService.updateInventoryLevels([
          {
            id: level.id,
            inventory_item_id: level.inventory_item_id,
            location_id: level.location_id,
            stocked_quantity: currentStock + item.quantity,
          },
        ])
      }
    }
  },
)
