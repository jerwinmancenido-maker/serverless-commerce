/**
 * @file    apps/backend/src/admin/routes/promotions-studio/types.ts
 * @module  PromotionsStudioTypes
 * @purpose Types, interfaces, and validation schemas for the Two-Column Split-Canvas Promotion Studio.
 * @contracts
 *   API:     POST /admin/promotions · GET /admin/promotions/:id
 *   Studio:  PromotionStudioState · ClinicalPreset · CartSimulatorState
 */

export type PromotionType = "percentage" | "fixed" | "buy_get"

export type AllocationType = "across" | "each"

export interface PromotionRuleCondition {
  attribute: "product_category_id" | "product_id" | "customer_group_id" | "order_subtotal"
  operator: "in" | "eq" | "gte"
  values: string[]
}

export interface PromotionStudioState {
  id?: string
  type: PromotionType
  code: string
  title: string
  description: string
  value: number
  currencyCode: "PHP" | "USD"
  allocation: AllocationType
  minOrderValue: number
  targetCategories: string[]
  customerGroups: string[]
  startDate: string
  endDate: string
  hasEndDate: boolean
  maxRedemptions: number | null
  maxPerCustomer: number | null
}

export interface ClinicalPreset {
  id: string
  label: string
  tagline: string
  state: Partial<PromotionStudioState>
}

export interface CartSimulatorItem {
  id: string
  name: string
  category: "peptides" | "supplies" | "solutions"
  unitPrice: number
  quantity: number
  baseCost: number
}

export interface CartSimulationResult {
  subtotal: number
  discountAmount: number
  netTotal: number
  totalCost: number
  grossMarginPct: number
  isMarginSafe: boolean
}
