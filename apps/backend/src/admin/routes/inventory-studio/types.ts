/**
 * @file    apps/backend/src/admin/routes/inventory-studio/types.ts
 * @module  InventoryStudioTypes
 * @purpose Type contracts for the dedicated Inventory Item Studio split-canvas workspace.
 * @contracts
 *   Route:   /app/inventory-studio
 *   API:     POST /admin/inventory-items · POST /admin/inventory-items/:id
 */

export type StorageCondition = "cryo_minus_20" | "refrigerated_2_8" | "controlled_room"

export interface InventoryStudioState {
  id?: string
  title: string
  sku: string
  description: string
  requiresShipping: boolean
  width?: number
  length?: number
  height?: number
  weight?: number
  midCode?: string
  hsCode?: string
  countryOfOrigin?: string
  material?: string
  storageCondition: StorageCondition
  purityPercentage: number
  casNumber?: string
  locationId?: string
  stockedQuantity: number
}

export interface StockLocationOption {
  id: string
  name: string
}
