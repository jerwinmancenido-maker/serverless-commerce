import {
  validateAndTransformBody,
  validateAndTransformQuery,
  type MiddlewareRoute,
} from "@medusajs/framework/http"

import {
  StoreListResearchProtocolRecommendations,
  StoreRecordResearchProtocolRecommendationEvent,
} from "../../../../../modules/research-content/contracts/research-protocol-merchandising"

export const storeResearchProtocolRecommendationMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/research-protocols/:handle/recommendations",
    methods: ["GET"],
    middlewares: [
      validateAndTransformQuery(StoreListResearchProtocolRecommendations, {}),
    ],
  },
  {
    matcher: "/store/research-protocols/:handle/recommendations/events",
    methods: ["POST"],
    middlewares: [
      validateAndTransformBody(StoreRecordResearchProtocolRecommendationEvent),
    ],
  },
]
