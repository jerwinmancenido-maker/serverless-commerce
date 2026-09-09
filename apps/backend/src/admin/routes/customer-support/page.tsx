/**
 * @file    apps/backend/src/admin/routes/customer-support/page.tsx
 * @module  CustomerSupportAdminRoute (Customer Support Module)
 * @purpose Admin customer support messenger and conversation management console.
 * @contracts
 *   API:     GET /admin/customer-support
 *   Service: CustomerSupportModuleService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"

import CustomerSupportMessenger from "../../components/customer-support-messenger"
import GlobalSupportDock from "../../widgets/global-support-dock"

const CustomerSupportPage = () => {
  return (
    <>
      <CustomerSupportMessenger />
      <GlobalSupportDock />
    </>
  )
}

export const config = defineRouteConfig({
  label: "Chats",
  icon: ChatBubbleLeftRight,
  rank: 14,
})

export default CustomerSupportPage
