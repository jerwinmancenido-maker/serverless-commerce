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
