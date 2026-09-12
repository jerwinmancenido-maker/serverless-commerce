/**
 * @file    apps/backend/src/admin/routes/price-lists-studio/types.ts
 * @module  PriceListsStudioTypes
 * @purpose Type contracts for the dedicated Price Lists Studio split-canvas workspace.
 * @contracts
 *   Route:   /app/price-lists-studio
 *   API:     POST /admin/price-lists · POST /admin/price-lists/:id
 */

export type PriceListType = "sale" | "override"
export type PriceListStatus = "active" | "draft"

export interface PriceOverrideItem {
  productId: string
  productTitle: string
  variantId: string
  variantTitle: string
  sku: string
  defaultPrice: number
  customPrice: number
  estimatedCost: number
}

export interface CustomerGroupOption {
  id: string
  name: string
  customersCount?: number
}

export interface PriceListStudioState {
  id?: string
  type: PriceListType
  title: string
  description: string
  status: PriceListStatus
  customerGroupIds: string[]
  startsAt: string
  endsAt: string
  hasEndDate: boolean
  prices: PriceOverrideItem[]
}
