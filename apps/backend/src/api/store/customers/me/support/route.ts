import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CUSTOMER_SUPPORT_MODULE } from "../../../../../modules/customer-support"
import type { StoreCreateSupportConversation } from "../../../../../modules/customer-support/contracts"
import type CustomerSupportModuleService from "../../../../../modules/customer-support/service"
import { createSupportConversationWorkflow } from "../../../../../workflows/manage-customer-support"

const view = (item: any) => ({ id: item.id, subject: item.subject, category: item.category, status: item.status, priority: item.priority, order_id: item.order_id, protocol_series_id: item.protocol_series_id, opened_at: item.opened_at, last_activity_at: item.last_activity_at })
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) { const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE); const conversations = await service.listSupportConversations({ customer_id: req.auth_context.actor_id }, { order: { last_activity_at: "DESC" }, take: 100 }); res.setHeader("Cache-Control", "private, no-store"); res.json({ conversations: conversations.map(view) }) }
export async function POST(req: AuthenticatedMedusaRequest<StoreCreateSupportConversation>, res: MedusaResponse) { const { result } = await createSupportConversationWorkflow(req.scope).run({ input: { ...req.validatedBody, customer_id: req.auth_context.actor_id } }); res.setHeader("Cache-Control", "private, no-store"); res.status(201).json({ conversation: view(result.conversation), message_id: result.message?.id }) }
