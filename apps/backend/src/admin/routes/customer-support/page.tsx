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
  label: "Customer Support",
  icon: ChatBubbleLeftRight,
  rank: 35,
})

export default CustomerSupportPage
