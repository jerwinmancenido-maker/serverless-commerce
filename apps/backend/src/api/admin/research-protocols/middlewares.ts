import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"
import { PolicyOperation } from "@medusajs/framework/utils"

import {
  AdminArchiveResearchProtocol,
  AdminCreateResearchProtocolBody,
  AdminLinkResearchProtocolProduct,
  AdminCreateResearchProtocolRevision,
  AdminListResearchProtocols,
  AdminPreviewResearchProtocol,
  AdminPublishResearchProtocol,
  AdminUpdateResearchProtocolDraft,
  AdminUpdateResearchProtocolProductLink,
  AdminUnlinkResearchProtocolProduct,
  AdminWithdrawResearchProtocol,
} from "../../../modules/research-content/contracts/research-protocol"
import {
  AdminListResearchProtocolComments,
  AdminModerateResearchProtocolComment,
} from "../../../modules/research-content/contracts/research-protocol-comment"

const protocolPolicy = (
  operation: (typeof PolicyOperation)[keyof typeof PolicyOperation],
) => [{ resource: "research_protocol", operation }]

export const adminResearchProtocolMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/research-protocols",
    methods: ["GET"],
    middlewares: [validateAndTransformQuery(AdminListResearchProtocols, {})],
    policies: protocolPolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/research-protocols",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminCreateResearchProtocolBody)],
    policies: protocolPolicy(PolicyOperation.create),
  },
  {
    matcher: "/admin/products/:id/research-protocols",
    methods: ["GET"],
    middlewares: [validateAndTransformQuery(AdminListResearchProtocols, {})],
    policies: protocolPolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/products/:id/research-protocols",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminCreateResearchProtocolBody)],
    policies: protocolPolicy(PolicyOperation.create),
  },
  {
    matcher: "/admin/research-protocols/:id",
    methods: ["GET"],
    middlewares: [],
    policies: protocolPolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/research-protocols/:id",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminUpdateResearchProtocolDraft)],
    policies: protocolPolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/research-protocols/:id/revisions",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminCreateResearchProtocolRevision),
    ],
    policies: protocolPolicy(PolicyOperation.create),
  },
  {
    matcher: "/admin/research-protocols/:id/publish",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminPublishResearchProtocol)],
    policies: protocolPolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/research-protocols/:id/withdraw",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminWithdrawResearchProtocol)],
    policies: protocolPolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/research-protocols/:id/archive",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminArchiveResearchProtocol)],
    policies: protocolPolicy(PolicyOperation.delete),
  },
  {
    matcher: "/admin/research-protocols/:id/products",
    methods: ["GET"],
    middlewares: [],
    policies: protocolPolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/research-protocols/:id/products",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminLinkResearchProtocolProduct)],
    policies: protocolPolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/research-protocols/:id/products/:linkId",
    methods: ["POST"],
    middlewares: [validateAndTransformBody(AdminUpdateResearchProtocolProductLink)],
    policies: protocolPolicy(PolicyOperation.update),
  },
  {
    matcher: "/admin/research-protocols/:id/products/:linkId",
    methods: ["DELETE"],
    middlewares: [validateAndTransformBody(AdminUnlinkResearchProtocolProduct)],
    policies: protocolPolicy(PolicyOperation.delete),
  },
  {
    matcher: "/admin/research-protocols/:id/preview",
    methods: ["GET"],
    middlewares: [validateAndTransformQuery(AdminPreviewResearchProtocol, {})],
    policies: protocolPolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/research-protocols/:id/comments",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(AdminListResearchProtocolComments, {}),
    ],
    policies: protocolPolicy(PolicyOperation.read),
  },
  {
    matcher: "/admin/research-protocols/:id/comments/:commentId/moderate",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(AdminModerateResearchProtocolComment),
    ],
    policies: protocolPolicy(PolicyOperation.update),
  },
]
