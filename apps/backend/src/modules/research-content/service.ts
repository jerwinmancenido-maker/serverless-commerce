import { MedusaService } from "@medusajs/framework/utils"

import CalculatorMaterialProfile from "./models/calculator-material-profile"
import ResearchProtocol from "./models/research-protocol"
import ResearchProtocolAuditEvent from "./models/research-protocol-audit-event"
import ResearchProtocolComment from "./models/research-protocol-comment"
import ResearchProtocolProductLink from "./models/research-protocol-product-link"
import ResearchProtocolOrderAccess from "./models/research-protocol-order-access"
import ResearchProtocolSeries from "./models/research-protocol-series"
import ResearchProtocolVariantTarget from "./models/research-protocol-variant-target"
import ResearchProtocolMerchandisingLink from "./models/research-protocol-merchandising-link"
import ResearchProtocolRecommendationEvent from "./models/research-protocol-recommendation-event"
import ResearchProtocolVisibilityPolicy from "./models/research-protocol-visibility-policy"
import ResearchCommunityIdentity from "./models/research-community-identity"
import ResearchProtocolThread from "./models/research-protocol-thread"
import ResearchProtocolCommentEdit from "./models/research-protocol-comment-edit"
import ResearchProtocolReaction from "./models/research-protocol-reaction"
import ResearchProtocolReport from "./models/research-protocol-report"
import ResearchProtocolSubscription from "./models/research-protocol-subscription"
import ResearchProtocolModerationEvent from "./models/research-protocol-moderation-event"

class ResearchContentModuleService extends MedusaService({
  CalculatorMaterialProfile,
  ResearchProtocol,
  ResearchProtocolAuditEvent,
  ResearchProtocolComment,
  ResearchProtocolProductLink,
  ResearchProtocolOrderAccess,
  ResearchProtocolSeries,
  ResearchProtocolVariantTarget,
  ResearchProtocolMerchandisingLink,
  ResearchProtocolRecommendationEvent,
  ResearchProtocolVisibilityPolicy,
  ResearchCommunityIdentity,
  ResearchProtocolThread,
  ResearchProtocolCommentEdit,
  ResearchProtocolReaction,
  ResearchProtocolReport,
  ResearchProtocolSubscription,
  ResearchProtocolModerationEvent,
}) {}

export default ResearchContentModuleService
