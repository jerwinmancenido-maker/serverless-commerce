import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { CUSTOMER_SUPPORT_MODULE } from "../../../../../modules/customer-support"
import { analyzeSentimentAndUrgency, generateSmartReplies } from "../../../../../modules/customer-support/ai-assistant"
import type CustomerSupportModuleService from "../../../../../modules/customer-support/service"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE)
  const [conversation] = await service.listSupportConversations(
    { id: req.params.conversationId },
    { take: 1 }
  )

  if (!conversation) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Support conversation was not found")
  }

  const rawMessages = await service.listSupportMessages(
    { conversation_id: conversation.id },
    { order: { sent_at: "DESC" }, take: 10 }
  )
  const messages = rawMessages.reverse()

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "first_name", "last_name", "email"],
    filters: { id: conversation.customer_id },
    pagination: { take: 1 },
  })

  const rawCustomer = customers?.[0]
  const customerName = rawCustomer
    ? [rawCustomer.first_name, rawCustomer.last_name].filter(Boolean).join(" ") || rawCustomer.email
    : undefined

  const latestCustomerMsg =
    [...messages].reverse().find((m) => m.sender_type === "customer")?.body || ""
  const sentimentAnalysis = analyzeSentimentAndUrgency(latestCustomerMsg)

  const smartReplies = await generateSmartReplies({
    subject: conversation.subject,
    category: conversation.category,
    customerName,
    messages: messages.map((m) => ({ sender_type: m.sender_type, body: m.body })),
  })

  res.setHeader("Cache-Control", "private, no-store")
  res.json({
    smart_replies: smartReplies,
    sentiment: sentimentAnalysis,
  })
}
