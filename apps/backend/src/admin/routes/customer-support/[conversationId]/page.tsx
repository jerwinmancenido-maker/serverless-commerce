/**
 * @file    apps/backend/src/admin/routes/customer-support/[conversationId]/page.tsx
 * @module  CustomerSupportConversationDetailPage
 * @purpose Admin support conversation detail route with deep-linked conversation ID.
 * @contracts
 *   API:     GET /admin/customer-support/:conversationId
 *   Service: CustomerSupportModuleService
 */

import { useParams } from "react-router-dom"

import CustomerSupportMessenger from "../../../components/customer-support-messenger"
import GlobalSupportDock from "../../../widgets/global-support-dock"

const CustomerSupportDetailPage = () => {
  const { conversationId } = useParams()

  return (
    <>
      <CustomerSupportMessenger initialConversationId={conversationId} />
      <GlobalSupportDock />
    </>
  )
}

export default CustomerSupportDetailPage
