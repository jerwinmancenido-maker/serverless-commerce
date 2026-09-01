import { MedusaService } from "@medusajs/framework/utils"
import SupportAssignment from "./models/support-assignment"
import SupportAttachment from "./models/support-attachment"
import SupportConversation from "./models/support-conversation"
import SupportInternalNote from "./models/support-internal-note"
import SupportMessage from "./models/support-message"
import SupportParticipant from "./models/support-participant"
import SupportStatusEvent from "./models/support-status-event"
import SupportSavedResponse from "./models/support-saved-response"
import SupportCategory from "./models/support-category"
import SupportSetting from "./models/support-setting"

class CustomerSupportModuleService extends MedusaService({
  SupportAssignment,
  SupportAttachment,
  SupportConversation,
  SupportInternalNote,
  SupportMessage,
  SupportParticipant,
  SupportStatusEvent,
  SupportSavedResponse,
  SupportCategory,
  SupportSetting,
}) {}

export default CustomerSupportModuleService
