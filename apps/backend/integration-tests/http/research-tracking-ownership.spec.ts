import type { IApiKeyModuleService } from "@medusajs/framework/types"
import {
  ApiKeyType,
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

import { RESEARCH_TRACKING_MODULE } from "../../src/modules/research-tracking"
import type ResearchTrackingModuleService from "../../src/modules/research-tracking/service"

jest.setTimeout(120 * 1000)

const configuredJwtSecret = "rt-2-disposable-http-test-secret"
const consentVersion = "2026-08-25.v1"
const noticeSha256 = "a".repeat(64)
const basePath = "/store/customers/me/research-tracking"
let publishableApiKey = ""
let runtimeJwtSecret = configuredJwtSecret

function customerToken(customerId: string): string {
  return generateJwtToken(
    {
      actor_id: customerId,
      actor_type: "customer",
      auth_identity_id: `auth_${customerId}`,
      app_metadata: { customer_id: customerId },
      user_metadata: {},
    },
    {
      secret: runtimeJwtSecret,
      expiresIn: "1h",
    },
  )
}

function requestConfig(customerId?: string, idempotencyKey?: string) {
  return {
    headers: {
      "x-publishable-api-key": publishableApiKey,
      ...(customerId
        ? { Authorization: `Bearer ${customerToken(customerId)}` }
        : {}),
      ...(idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : {}),
    },
    validateStatus: () => true,
  }
}

function expectPrivateNoStore(response: {
  headers: Record<string, string | undefined>
}) {
  expect(response.headers["cache-control"]).toContain("private")
  expect(response.headers["cache-control"]).toContain("no-store")
}

async function createProfile(
  api: any,
  customerId: string,
  idempotencyKey = `rt2:create:${customerId}`,
) {
  return api.post(
    `${basePath}/profile`,
    {
      timezone: "Asia/Manila",
      locale: "en-PH",
      consent_version: consentVersion,
      accepted: true,
    },
    requestConfig(customerId, idempotencyKey),
  )
}

medusaIntegrationTestRunner({
  moduleName: "research-tracking-http",
  inApp: true,
  env: {
    STORE_CORS: "http://localhost:8000",
    ADMIN_CORS: "http://localhost:9000",
    AUTH_CORS: "http://localhost:8000,http://localhost:9000",
    JWT_SECRET: configuredJwtSecret,
    COOKIE_SECRET: configuredJwtSecret,
    RESEARCH_TRACKING_CUSTOMER_API_ENABLED: "true",
    RESEARCH_TRACKING_CONSENT_VERSION: consentVersion,
    RESEARCH_TRACKING_NOTICE_SHA256: noticeSha256,
    RESEARCH_TRACKING_NOTICE_URL:
      "https://example.test/research-tracking-notice",
  },
  testSuite: ({ api, getContainer }) => {
    describe("RT-2 authenticated ownership Store API", () => {
      beforeAll(async () => {
        const config = getContainer().resolve<{
          projectConfig: { http: { jwtSecret: string } }
        }>(ContainerRegistrationKeys.CONFIG_MODULE)
        const apiKeyService = getContainer().resolve<IApiKeyModuleService>(
          Modules.API_KEY,
        )
        const apiKey = await apiKeyService.createApiKeys({
          title: "RT-2 disposable HTTP key",
          type: ApiKeyType.PUBLISHABLE,
          created_by: "user_rt2_http_test",
        })

        publishableApiKey = apiKey.token
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
      })

      it("rejects logged-out access before RT-2 data access", async () => {
        const service = getContainer().resolve<ResearchTrackingModuleService>(
          RESEARCH_TRACKING_MODULE,
        )
        const listProfiles = jest.spyOn(service, "listResearchProfiles")
        const response = await api.get(
          `${basePath}/profile`,
          requestConfig(),
        )

        expect(response.status).toBe(401)
        expect(response.data).toEqual(
          expect.objectContaining({ message: "Unauthorized" }),
        )
        expect(listProfiles).not.toHaveBeenCalled()
        listProfiles.mockRestore()
      })

      it("creates and exactly replays one private profile projection", async () => {
        const customerId = "cus_rt2_http_create"
        const idempotencyKey = "rt2:create:stable-001"
        const created = await createProfile(api, customerId, idempotencyKey)
        const replayed = await createProfile(api, customerId, idempotencyKey)
        const retrieved = await api.get(
          `${basePath}/profile`,
          requestConfig(customerId),
        )
        const service = getContainer().resolve<ResearchTrackingModuleService>(
          RESEARCH_TRACKING_MODULE,
        )
        const profiles = await service.listResearchProfiles({
          customer_id: customerId,
        })
        const consentEvents = await service.listResearchConsentEvents({
          profile_id: profiles[0].id,
        })

        expect(created.status).toBe(201)
        expect(replayed.status).toBe(200)
        expect(replayed.data).toEqual(created.data)
        expect(retrieved.status).toBe(200)
        expect(retrieved.data).toEqual(created.data)
        expect(profiles).toHaveLength(1)
        expect(consentEvents).toHaveLength(1)
        expect(created.data.research_profile).toEqual(
          expect.objectContaining({
            timezone: "Asia/Manila",
            locale: "en-PH",
            consent_version: consentVersion,
            status: "active",
          }),
        )
        expect(created.data.research_profile).not.toHaveProperty("id")
        expect(created.data.research_profile).not.toHaveProperty("customer_id")
        expect(created.data.research_profile).not.toHaveProperty(
          "notice_sha256",
        )
        expectPrivateNoStore(created)
        expectPrivateNoStore(replayed)
        expectPrivateNoStore(retrieved)
      })

      it("keeps one customer's profile invisible to another customer", async () => {
        const ownerId = "cus_rt2_http_owner"
        const otherId = "cus_rt2_http_other"

        expect((await createProfile(api, ownerId)).status).toBe(201)

        const ownerResponse = await api.get(
          `${basePath}/profile`,
          requestConfig(ownerId),
        )
        const otherResponse = await api.get(
          `${basePath}/profile`,
          requestConfig(otherId),
        )

        expect(ownerResponse.data.research_profile).not.toBeNull()
        expect(otherResponse.status).toBe(200)
        expect(otherResponse.data).toEqual({ research_profile: null })
        expectPrivateNoStore(otherResponse)
      })

      it("durably replays preference updates and rejects conflicting key reuse", async () => {
        const customerId = "cus_rt2_http_preferences"
        const idempotencyKey = "rt2:preferences:stable-001"

        expect((await createProfile(api, customerId)).status).toBe(201)

        const first = await api.post(
          `${basePath}/profile/preferences`,
          { timezone: "Asia/Singapore" },
          requestConfig(customerId, idempotencyKey),
        )
        const replayed = await api.post(
          `${basePath}/profile/preferences`,
          { timezone: "Asia/Singapore" },
          requestConfig(customerId, idempotencyKey),
        )
        const conflicting = await api.post(
          `${basePath}/profile/preferences`,
          { timezone: "Asia/Tokyo" },
          requestConfig(customerId, idempotencyKey),
        )
        const retrieved = await api.get(
          `${basePath}/profile`,
          requestConfig(customerId),
        )
        const service = getContainer().resolve<ResearchTrackingModuleService>(
          RESEARCH_TRACKING_MODULE,
        )
        const [profile] = await service.listResearchProfiles({
          customer_id: customerId,
        })
        const mutations = await service.listResearchPreferenceMutations({
          profile_id: profile.id,
        })

        expect(first.status).toBe(200)
        expect(replayed.status).toBe(200)
        expect(replayed.data).toEqual(first.data)
        expect(conflicting.status).toBe(409)
        expect(retrieved.data.research_profile.timezone).toBe("Asia/Singapore")
        expect(mutations).toHaveLength(1)
        expectPrivateNoStore(first)
        expectPrivateNoStore(replayed)
        expectPrivateNoStore(conflicting)
      })

      it("records and cancels a deletion request without deleting data", async () => {
        const customerId = "cus_rt2_http_privacy"

        expect((await createProfile(api, customerId)).status).toBe(201)

        const requested = await api.post(
          `${basePath}/privacy/deletion-requests`,
          { acknowledge_deletion_request: true },
          requestConfig(customerId, "rt2:deletion:request-001"),
        )
        const current = await api.get(
          `${basePath}/privacy/deletion-requests/current`,
          requestConfig(customerId),
        )
        const cancelled = await api.post(
          `${basePath}/privacy/deletion-requests/cancel`,
          { acknowledge_cancellation: true },
          requestConfig(customerId, "rt2:deletion:cancel-001"),
        )
        const retrieved = await api.get(
          `${basePath}/profile`,
          requestConfig(customerId),
        )

        expect(requested.status).toBe(202)
        expect(requested.data.research_profile.status).toBe(
          "deletion_requested",
        )
        expect(requested.data.privacy_request.status).toBe("requested")
        expect(current.data.privacy_request.status).toBe("requested")
        expect(cancelled.status).toBe(200)
        expect(cancelled.data.privacy_request.status).toBe("cancelled")
        expect(cancelled.data.research_profile.status).toBe("active")
        expect(retrieved.data.research_profile.status).toBe("active")
        expectPrivateNoStore(requested)
        expectPrivateNoStore(current)
        expectPrivateNoStore(cancelled)
      })

      it("keeps validation failures private and non-cacheable", async () => {
        const response = await api.post(
          `${basePath}/profile`,
          {
            timezone: "Not/A-Timezone",
            locale: "en-PH",
            consent_version: consentVersion,
            accepted: true,
          },
          requestConfig("cus_rt2_http_invalid", "rt2:create:invalid-001"),
        )

        expect(response.status).toBe(400)
        expectPrivateNoStore(response)
      })
    })
  },
})
