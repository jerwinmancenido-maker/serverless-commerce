import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IFileModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { CUSTOMER_SUPPORT_MODULE } from "../../../../../../../modules/customer-support"
import type CustomerSupportModuleService from "../../../../../../../modules/customer-support/service"
import { supportAttachmentDownloadAllowed } from "../../../../../../../workflows/steps/manage-support-attachment"
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) { const service = req.scope.resolve<CustomerSupportModuleService>(CUSTOMER_SUPPORT_MODULE); const [attachment] = await service.listSupportAttachments({ id: req.params.attachmentId, conversation_id: req.params.conversationId, status: "active" }, { take: 1 }); if (!attachment || !supportAttachmentDownloadAllowed(attachment.scan_status)) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Attachment was not found"); const file = await req.scope.resolve<IFileModuleService>(Modules.FILE).retrieveFile(attachment.file_id); res.setHeader("Cache-Control", "private, no-store"); res.json({ url: file.url }) }
