/**
 * @file    apps/backend/src/admin/lib/studio-redirect-routes.ts
 * @module  StudioRedirectRoutes
 * @purpose Pure route predicate helpers for Medusa Admin Studio redirects,
 *          supporting path normalization, trailing slash tolerance, and modal bypass query flags.
 * @contracts
 *   Functions:
 *     - shouldRedirectCustomerCreate(pathname, search?)
 *     - shouldRedirectInventoryCreate(pathname, search?)
 *     - shouldRedirectPriceListCreate(pathname, search?)
 *     - shouldRedirectPromotionCreate(pathname, search?)
 *     - shouldRedirectCampaignCreate(pathname, search?)
 */

function matchRoute(
  pattern: RegExp,
  pathname: string,
  search?: string
): boolean {
  if (search && search.includes("view=raw_modal")) {
    return false
  }
  return pattern.test(pathname)
}

export const shouldRedirectCustomerCreate = (
  pathname: string,
  search?: string
): boolean => matchRoute(/\/customers\/create\/?$/, pathname, search)

export const shouldRedirectInventoryCreate = (
  pathname: string,
  search?: string
): boolean => matchRoute(/\/inventory\/create\/?$/, pathname, search)

export const shouldRedirectPriceListCreate = (
  pathname: string,
  search?: string
): boolean => matchRoute(/\/price-lists\/create\/?$/, pathname, search)

export const shouldRedirectPromotionCreate = (
  pathname: string,
  search?: string
): boolean => matchRoute(/\/promotions\/create\/?$/, pathname, search)

export const shouldRedirectCampaignCreate = (
  pathname: string,
  search?: string
): boolean => matchRoute(/\/campaigns\/create\/?$/, pathname, search)
