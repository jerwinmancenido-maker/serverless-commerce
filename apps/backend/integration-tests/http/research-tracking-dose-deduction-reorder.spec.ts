import type {
  IApiKeyModuleService,
  ICustomerModuleService,
  IProductModuleService,
  IRegionModuleService,
  ISalesChannelModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ApiKeyType,
  ContainerRegistrationKeys,
  generateJwtToken,
  Modules,
} from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

import { RESEARCH_CONTENT_MODULE } from "../../src/modules/research-content"
import type ResearchContentModuleService from "../../src/modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../src/modules/research-tracking"
import type ResearchTrackingModuleService from "../../src/modules/research-tracking/service"

jest.setTimeout(240 * 1000)

const configuredJwtSecret = "rt-dose-reorder-http-test-secret"
const consentVersion = "2026-08-27.v1"
const noticeSha256 = "6".repeat(64)
const basePath = "/store/customers/me/research-tracking"
const localDate = "2026-09-04"
const disposableDatabaseName =
  process.env.RT_DOSE_REORDER_TEST_DB_NAME ??
  "medusa-rt-dose-reorder-integration-1"

let publishableApiKey = ""
let runtimeJwtSecret = configuredJwtSecret
let sharedSalesChannelId = ""
let sharedRegionId = ""
let sharedVariantId = ""
let sharedProductId = ""

type ApiClient = {
  get: (path: string, config?: Record<string, unknown>) => Promise<any>
  post: (
    path: string,
    body: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<any>
}

type RoutineFixture = {
  routineId: string
  revisionId: string
  materialId: string
  supplyId: string
  customerId: string
}

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
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
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

function trackingService(
  container: MedusaContainer,
): ResearchTrackingModuleService {
  return container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
}

async function ensureProfile(api: ApiClient, customerId: string) {
  const response = await api.post(
    `${basePath}/profile`,
    {
      timezone: "Asia/Manila",
      locale: "en-PH",
      consent_version: consentVersion,
      accepted: true,
    },
    requestConfig(customerId, `e2e:profile:${customerId}`),
  )

  expect([200, 201]).toContain(response.status)
  expectPrivateNoStore(response)
  return response
}

async function createCustomerWithSupplyAndRoutine(input: {
  api: ApiClient
  container: MedusaContainer
  customerId: string
  suffix: string
  initialQuantityMcg?: number
  plannedDailyDoseMcg?: number
}): Promise<RoutineFixture> {
  const initialQuantity = input.initialQuantityMcg ?? 50_000 // 50 mg
  const plannedDailyDose = input.plannedDailyDoseMcg ?? 2_500 // 2.5 mg

  const customerService = input.container.resolve<ICustomerModuleService>(
    Modules.CUSTOMER,
  )
  try {
    await customerService.createCustomers({
      id: input.customerId,
      email: `${input.customerId}@example.test`,
      first_name: "E2E",
      last_name: "Researcher",
    })
  } catch {
    // Already created
  }

  await ensureProfile(input.api, input.customerId)

  const service = trackingService(input.container)
  const [profile] = await service.listResearchProfiles(
    { customer_id: input.customerId },
    { take: 1 },
  )

  const material = await service.createTrackedMaterials({
    profile_id: profile.id,
    product_variant_id: sharedVariantId,
    label: `Phase 8 GHK-Cu Acceptance ${input.suffix}`,
    source: "purchased",
    status: "active",
    activated_at: new Date(),
  })

  const supply = await service.createResearchSupplies({
    tracked_material_id: material.id,
    source_order_line_item_id: null,
    initial_quantity_base_units: initialQuantity,
    remaining_quantity_base_units: initialQuantity,
    base_unit: "microgram",
    acquired_at: new Date(),
    status: "active",
  })

  const routineResponse = await input.api.post(
    `${basePath}/routines`,
    {
      tracked_material_id: material.id,
      label: `Daily GHK-Cu Protocol ${input.suffix}`,
      planned_quantity_base_units: plannedDailyDose,
      base_unit: "microgram",
      recurrence_type: "daily",
      daily_interval: 1,
      weekly_interval: null,
      weekdays: [],
      local_time: "09:00",
      start_date: localDate,
      end_date: null,
      effective_from_date: localDate,
    },
    requestConfig(input.customerId, `e2e:routine:${input.suffix}`),
  )

  expect(routineResponse.status).toBe(201)
  expectPrivateNoStore(routineResponse)

  return {
    routineId: routineResponse.data.routine_id,
    revisionId: routineResponse.data.revision_id,
    materialId: material.id,
    supplyId: supply.id,
    customerId: input.customerId,
  }
}

async function occurrenceFor(input: {
  api: ApiClient
  customerId: string
  routineId: string
}) {
  const response = await input.api.get(
    `${basePath}/occurrences?from=${localDate}&to=${localDate}`,
    requestConfig(input.customerId),
  )

  expect(response.status).toBe(200)
  expectPrivateNoStore(response)

  const occurrence = response.data.occurrences.find(
    (item: { routine_id: string }) => item.routine_id === input.routineId,
  )
  expect(occurrence).toBeDefined()
  return occurrence
}

medusaIntegrationTestRunner({
  moduleName: "research-tracking-dose-deduction-reorder-http",
  dbName: disposableDatabaseName,
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
    describe("Complete Closed Loop: Dose Log -> Supply Ledger Deduction -> Replenishment Urgency -> Reorder Bridge", () => {
      beforeAll(async () => {
        const container = getContainer()
        const config = container.resolve<{
          projectConfig: { http: { jwtSecret: string } }
        }>(ContainerRegistrationKeys.CONFIG_MODULE)

        const apiKeyService = container.resolve<IApiKeyModuleService>(
          Modules.API_KEY,
        )
        const salesChannelService =
          container.resolve<ISalesChannelModuleService>(Modules.SALES_CHANNEL)
        const regionService = container.resolve<IRegionModuleService>(
          Modules.REGION,
        )
        const productService = container.resolve<IProductModuleService>(
          Modules.PRODUCT,
        )
        const contentService = container.resolve<ResearchContentModuleService>(
          RESEARCH_CONTENT_MODULE,
        )

        // 1. Create API key
        const apiKey = await apiKeyService.createApiKeys({
          title: "E2E Loop Disposable Key",
          type: ApiKeyType.PUBLISHABLE,
          created_by: "user_e2e_test",
        })

        // 2. Create Sales Channel
        const salesChannel = await salesChannelService.createSalesChannels({
          name: "E2E Closed Loop Sales Channel",
        })

        // 3. Create Philippine Region
        const region = await regionService.createRegions({
          name: "Philippines",
          currency_code: "php",
          countries: ["ph"],
        })

        // 4. Create Product with priced variant using core workflow
        const { result: createdProducts } = await createProductsWorkflow(
          container,
        ).run({
          input: {
            products: [
              {
                title: "Phase 8 GHK-Cu Acceptance 50mg",
                status: "published",
                sales_channels: [{ id: salesChannel.id }],
                options: [
                  {
                    title: "Format",
                    values: ["50mg Vial"],
                  },
                ],
                variants: [
                  {
                    title: "50mg Vial",
                    sku: "GHKCU-50MG-E2E",
                    manage_inventory: false,
                    allow_backorder: true,
                    options: {
                      Format: "50mg Vial",
                    },
                    prices: [{ currency_code: "php", amount: 1000 }],
                  },
                ],
              },
            ],
          },
        })
        const product = createdProducts[0]
        const variant = product.variants[0]

        // 5. Create published Calculator Material Profile
        const effectiveAt = new Date(Date.now() - 60_000)
        await contentService.createCalculatorMaterialProfiles({
          profile_key: "ghk-cu-50mg-e2e",
          revision: 1,
          product_variant_id: variant.id,
          material_quantity_base_units: 50_000,
          material_base_unit: "microgram",
          display_unit: "mg",
          base_units_per_display_unit: 1_000,
          display_precision: 1,
          status: "published",
          evidence_scope: "sku",
          effective_at: effectiveAt,
          published_at: effectiveAt,
          withdrawn_at: null,
          created_by_actor_id: "user_e2e_test",
        })

        publishableApiKey = apiKey.token
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
        sharedSalesChannelId = salesChannel.id
        sharedRegionId = region.id
        sharedProductId = product.id
        sharedVariantId = variant.id
        process.env.RESEARCH_TRACKING_ELIGIBLE_SALES_CHANNEL_IDS =
          salesChannel.id
      })

      it("executes dose confirmation and verifies atomic ledger deduction in ResearchSupplies", async () => {
        const container = getContainer()
        const customerId = "cus_e2e_dose_deduction"
        const fixture = await createCustomerWithSupplyAndRoutine({
          api,
          container,
          customerId,
          suffix: "atomic-deduction",
          initialQuantityMcg: 50_000, // 50 mg
          plannedDailyDoseMcg: 2_500, // 2.5 mg
        })

        // 1. Fetch scheduled occurrence for today
        const occurrence = await occurrenceFor({
          api,
          customerId,
          routineId: fixture.routineId,
        })
        expect(occurrence.status).toBe("scheduled")

        // 2. Request confirmation preview token
        const previewResponse = await api.post(
          `${basePath}/logs/preview`,
          {
            routine_id: fixture.routineId,
            routine_revision_id: fixture.revisionId,
            occurrence_id: occurrence.occurrence_id,
            local_date: occurrence.local_date,
            supply_id: fixture.supplyId,
            confirmed_quantity_base_units: 2_500,
            base_unit: "microgram",
          },
          requestConfig(customerId),
        )

        expect(previewResponse.status).toBe(200)
        expectPrivateNoStore(previewResponse)
        const preview = previewResponse.data.preview
        expect(preview.preview_token).toBeDefined()
        expect(preview.confirmed_quantity_base_units).toBe(2_500)

        // 3. Confirm dose log via confirmResearchRoutineLogWorkflow
        const idempotencyKey = `e2e:confirm:${customerId}:${Date.now()}`
        const confirmResponse = await api.post(
          `${basePath}/logs`,
          {
            routine_id: fixture.routineId,
            routine_revision_id: fixture.revisionId,
            occurrence_id: preview.occurrence_id,
            local_date: preview.local_date,
            supply_id: fixture.supplyId,
            confirmed_quantity_base_units: preview.confirmed_quantity_base_units,
            base_unit: "microgram",
            preview_token: preview.preview_token,
          },
          requestConfig(customerId, idempotencyKey),
        )

        expect(confirmResponse.status).toBe(201)
        expectPrivateNoStore(confirmResponse)

        // 4. Verify database persistence: supply ledger decremented exactly by 2,500 mcg
        const service = trackingService(container)
        const updatedSupply = await service.retrieveResearchSupply(
          fixture.supplyId,
        )
        expect(updatedSupply.initial_quantity_base_units).toBe(50_000)
        expect(updatedSupply.remaining_quantity_base_units).toBe(47_500)

        // 5. Verify occurrence status is confirmed
        const updatedOccurrence = await occurrenceFor({
          api,
          customerId,
          routineId: fixture.routineId,
        })
        expect(updatedOccurrence.status).toBe("confirmed")
      })

      it("replays idempotency without double deduction and rejects invalid preview token", async () => {
        const container = getContainer()
        const customerId = "cus_e2e_idempotent_replay"
        const fixture = await createCustomerWithSupplyAndRoutine({
          api,
          container,
          customerId,
          suffix: "idempotency-replay",
          initialQuantityMcg: 50_000,
          plannedDailyDoseMcg: 2_500,
        })

        const occurrence = await occurrenceFor({
          api,
          customerId,
          routineId: fixture.routineId,
        })

        const previewResponse = await api.post(
          `${basePath}/logs/preview`,
          {
            routine_id: fixture.routineId,
            routine_revision_id: fixture.revisionId,
            occurrence_id: occurrence.occurrence_id,
            local_date: occurrence.local_date,
            supply_id: fixture.supplyId,
            confirmed_quantity_base_units: 2_500,
            base_unit: "microgram",
          },
          requestConfig(customerId),
        )
        const preview = previewResponse.data.preview

        const stableKey = `e2e:replay:${customerId}`
        const initialConfirm = await api.post(
          `${basePath}/logs`,
          {
            routine_id: fixture.routineId,
            routine_revision_id: fixture.revisionId,
            occurrence_id: preview.occurrence_id,
            local_date: preview.local_date,
            supply_id: fixture.supplyId,
            confirmed_quantity_base_units: 2_500,
            base_unit: "microgram",
            preview_token: preview.preview_token,
          },
          requestConfig(customerId, stableKey),
        )
        expect(initialConfirm.status).toBe(201)

        // Replay with identical idempotency key
        const replayedConfirm = await api.post(
          `${basePath}/logs`,
          {
            routine_id: fixture.routineId,
            routine_revision_id: fixture.revisionId,
            occurrence_id: preview.occurrence_id,
            local_date: preview.local_date,
            supply_id: fixture.supplyId,
            confirmed_quantity_base_units: 2_500,
            base_unit: "microgram",
            preview_token: preview.preview_token,
          },
          requestConfig(customerId, stableKey),
        )
        expect([200, 201]).toContain(replayedConfirm.status)

        // Assert supply was decremented ONCE only (47,500 mcg)
        const service = trackingService(container)
        const supplyAfterReplay = await service.retrieveResearchSupply(
          fixture.supplyId,
        )
        expect(supplyAfterReplay.remaining_quantity_base_units).toBe(47_500)

        // Assert tampered preview token is rejected with 400
        const tamperedResponse = await api.post(
          `${basePath}/logs`,
          {
            routine_id: fixture.routineId,
            routine_revision_id: fixture.revisionId,
            occurrence_id: preview.occurrence_id,
            local_date: preview.local_date,
            supply_id: fixture.supplyId,
            confirmed_quantity_base_units: 2_500,
            base_unit: "microgram",
            preview_token: "invalid_tampered_token",
          },
          requestConfig(customerId, `e2e:tampered:${Date.now()}`),
        )
        expect(tamperedResponse.status).toBe(400)
      })

      it("transitions replenishment projection urgency to reorder_now upon supply depletion", async () => {
        const container = getContainer()
        const customerId = "cus_e2e_replenishment_urgency"
        const fixture = await createCustomerWithSupplyAndRoutine({
          api,
          container,
          customerId,
          suffix: "replenishment-urgency",
          initialQuantityMcg: 50_000,
          plannedDailyDoseMcg: 2_500,
        })

        // Simulate supply depletion down to 5,000 mcg (2 doses left <= 10 days threshold)
        const service = trackingService(container)
        await service.updateResearchSupplies({
          id: fixture.supplyId,
          remaining_quantity_base_units: 5_000,
        })

        // Query replenishment projections
        const replenishmentResponse = await api.get(
          `${basePath}/replenishment`,
          requestConfig(customerId),
        )

        expect(replenishmentResponse.status).toBe(200)
        expectPrivateNoStore(replenishmentResponse)

        const projections = replenishmentResponse.data.projections
        expect(projections.length).toBeGreaterThan(0)

        const routineProjection = projections.find(
          (p: { routine_id: string }) => p.routine_id === fixture.routineId,
        )
        expect(routineProjection).toBeDefined()
        expect(routineProjection.remaining_quantity_base_units).toBe(5_000)
        expect(routineProjection.urgency).toBe("reorder_now")
        expect(routineProjection.estimated_days_remaining).toBe(2)
        expect(routineProjection.product_variant_id).toBe(sharedVariantId)
      })

      it("bridges replenishment from Research Hub into active Medusa commerce cart", async () => {
        const container = getContainer()
        const customerId = "cus_e2e_reorder_bridge"
        const fixture = await createCustomerWithSupplyAndRoutine({
          api,
          container,
          customerId,
          suffix: "reorder-bridge",
          initialQuantityMcg: 5_000, // Low initial balance
          plannedDailyDoseMcg: 2_500,
        })

        // 1. Verify low supply triggers replenishment recommendation with product variant
        const replenishmentResponse = await api.get(
          `${basePath}/replenishment`,
          requestConfig(customerId),
        )
        expect(replenishmentResponse.status).toBe(200)
        const projection = replenishmentResponse.data.projections.find(
          (p: { routine_id: string }) => p.routine_id === fixture.routineId,
        )
        expect(projection).toBeDefined()
        expect(projection.urgency).toBe("reorder_now")
        expect(projection.product_variant_id).toBe(sharedVariantId)

        // 2. Create customer commerce cart
        const cartResponse = await api.post(
          "/store/carts",
          {
            region_id: sharedRegionId,
            sales_channel_id: sharedSalesChannelId,
          },
          requestConfig(customerId),
        )
        expect([200, 201]).toContain(cartResponse.status)
        const cartId = cartResponse.data.cart.id
        expect(cartId).toBeDefined()

        // 3. Add replenishment product variant to cart
        const lineItemResponse = await api.post(
          `/store/carts/${cartId}/line-items`,
          {
            variant_id: sharedVariantId,
            quantity: 1,
            metadata: {
              source: "research_replenishment",
              routine_id: fixture.routineId,
            },
          },
          requestConfig(customerId),
        )
        expect([200, 201]).toContain(lineItemResponse.status)

        // 4. Retrieve cart and verify line item details
        const getCartResponse = await api.get(
          `/store/carts/${cartId}`,
          requestConfig(customerId),
        )
        expect(getCartResponse.status).toBe(200)

        const cart = getCartResponse.data.cart
        expect(cart.items).toBeDefined()
        expect(cart.items.length).toBe(1)

        const item = cart.items[0]
        expect(item.variant_id).toBe(sharedVariantId)
        expect(item.quantity).toBe(1)
        expect(item.unit_price).toBe(1000)
        expect(item.metadata?.source).toBe("research_replenishment")
        expect(item.metadata?.routine_id).toBe(fixture.routineId)
      })
    })
  },
})
