/**
 * @file    apps/backend/src/admin/routes/campaigns-studio/types.ts
 * @module  CampaignsStudioTypes
 * @purpose Type contracts for the dedicated Campaigns Studio split-canvas workspace.
 * @contracts
 *   Route:   /app/campaigns-studio
 *   API:     POST /admin/campaigns · POST /admin/campaigns/:id
 */

export type CampaignBudgetType = "spend" | "usage"

export interface CampaignStudioState {
  id?: string
  name: string
  campaignIdentifier: string
  description: string
  startsAt: string
  endsAt: string
  hasEndDate: boolean
  budgetType: CampaignBudgetType
  budgetLimit: number
  currencyCode: string
  targetChannels: string[]
  promotionalHeadline: string
  estimatedAvgOrderValue: number
}
