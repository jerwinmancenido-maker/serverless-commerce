/**
 * @file    apps/backend/src/admin/routes/customers-studio/types.ts
 * @module  CustomerStudioTypes
 * @purpose Type contracts for the Customer Intelligence Studio split-canvas workspace.
 * @contracts
 *   Route:   /app/customers-studio
 *   API:     POST /admin/customers · POST /admin/customers/:id
 */

export type CustomerArchetype = "clinical_physician" | "research_lab" | "direct_client"

export interface CustomerStudioState {
  archetype: CustomerArchetype
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  prcLicenseNumber?: string
  facilityRegistrationId?: string
  customerGroupIds: string[]
  shippingAddress: {
    address1: string
    address2: string
    city: string
    province: string
    postalCode: string
    countryCode: string
  }
}

export interface CustomerGroupOption {
  id: string
  name: string
}
