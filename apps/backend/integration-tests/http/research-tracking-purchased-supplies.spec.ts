import type {
  IApiKeyModuleService,
  IOrderModuleService,
  IProductModuleService,
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

import { RESEARCH_CONTENT_MODULE } from "../../src/modules/research-content"
import type ResearchContentModuleService from "../../src/modules/research-content/service"
import { RESEARCH_TRACKING_MODULE } from "../../src/modules/research-tracking"
import type ResearchTrackingModuleService from "../../src/modules/research-tracking/service"

jest.setTimeout(180 * 1000)

const configuredJwtSecret = "rt-4-disposable-http-test-secret"
const consentVersion = "2026-08-26.v1"
const noticeSha256 = "4".repeat(64)
const basePath = "/store/customers/me/research-tracking"
const disposableDatabaseName =
  process.env.RT4_HTTP_TEST_DB_NAME ??
  "medusa-rt4-purchased-supplies-integration-1"
let eligibleSalesChannelId = ""
let publishableApiKey = ""
let runtimeJwtSecret = configuredJwtSecret

type ApiClient = {
  get: (path: string, config?: Record<string, unknown>) => Promise<any>
  post: (
    path: string,
    body: Record<string, unknown>,
    config?: Record<string, unknown>,
  ) => Promise<any>
}

type PurchasedItemFixture = {
  customerId: string
  orderId: string
  lineItemId: string
  productId: string
  variantId: string
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

async function ensureProfile(api: ApiClient, customerId: string) {
  const response = await api.post(
    `${basePath}/profile`,
    {
      timezone: "Asia/Manila",
      locale: "en-PH",
      consent_version: consentVersion,
      accepted: true,
    },
    requestConfig(customerId, `rt4:profile:${customerId}`),
  )

  expect([200, 201]).toContain(response.status)
  return response
}

async function createEligiblePurchasedItem(input: {
  api: ApiClient
  container: MedusaContainer
  customerId: string
  suffix: string
  quantity?: number
}): Promise<PurchasedItemFixture> {
  const quantity = input.quantity ?? 2
  await ensureProfile(input.api, input.customerId)

  const productService = input.container.resolve<IProductModuleService>(
    Modules.PRODUCT,
  )
  const orderService = input.container.resolve<IOrderModuleService>(
    Modules.ORDER,
  )
  const contentService =
    input.container.resolve<ResearchContentModuleService>(
      RESEARCH_CONTENT_MODULE,
    )
  const product = await productService.createProducts({
    title: `RT-4 HTTP Product ${input.suffix}`,
    variants: [
      {
        title: `RT-4 HTTP Variant ${input.suffix}`,
        sku: `RT4-${input.suffix}`,
        manage_inventory: false,
        allow_backorder: true,
      },
    ],
  })
  const variant = product.variants[0]
  const effectiveAt = new Date(Date.now() - 60_000)

  await contentService.createCalculatorMaterialProfiles({
    profile_key: `rt4-http-${input.suffix}`,
    revision: 1,
    product_variant_id: variant.id,
    material_quantity_base_units: 1_000,
    material_base_unit: "microgram",
    display_unit: "mg",
    base_units_per_display_unit: 1_000,
    display_precision: 2,
    status: "published",
    evidence_scope: "sku",
    effective_at: effectiveAt,
    published_at: effectiveAt,
    withdrawn_at: null,
    created_by_actor_id: "user_rt4_http_test",
  })

  const createdOrder = await orderService.createOrders({
    currency_code: "php",
    customer_id: input.customerId,
    email: `${input.customerId}@example.test`,
    sales_channel_id: eligibleSalesChannelId,
    items: [
      {
        title: `RT-4 HTTP Purchased Item ${input.suffix}`,
        quantity,
        unit_price: 100,
        variant_id: variant.id,
      },
    ],
  })
  const order = await orderService.retrieveOrder(createdOrder.id, {
    relations: ["items", "items.detail"],
  })
  const lineItem = order.items?.[0]

  if (!lineItem?.detail?.id) {
    throw new Error("RT-4 fixture order item detail was not created")
  }

  await orderService.updateOrderItem(lineItem.detail.id, {
    fulfilled_quantity: quantity,
  })

  return {
    customerId: input.customerId,
    orderId: order.id,
    lineItemId: lineItem.id,
    productId: product.id,
    variantId: variant.id,
  }
}

async function activatePurchasedItem(
  api: ApiClient,
  fixture: PurchasedItemFixture,
  idempotencyKey: string,
  customerId = fixture.customerId,
) {
  return api.post(
    `${basePath}/purchased-items/activate`,
    {
      order_id: fixture.orderId,
      line_item_id: fixture.lineItemId,
    },
    requestConfig(customerId, idempotencyKey),
  )
}

async function researchWriteCounts(container: MedusaContainer) {
  const service = container.resolve<ResearchTrackingModuleService>(
    RESEARCH_TRACKING_MODULE,
  )
  const [materials, supplies, activations, requests] = await Promise.all([
    service.listTrackedMaterials({}),
    service.listResearchSupplies({}),
    service.listResearchSupplyActivations({}),
    service.listResearchSupplyActivationRequests({}),
  ])

  return {
    materials: materials.length,
    supplies: supplies.length,
    activations: activations.length,
    requests: requests.length,
  }
}

async function commerceFingerprint(dbConnection: any) {
  const fixedTables = [
    "order",
    "order_line_item",
    "order_item",
    "product",
    "product_variant",
    "inventory_item",
    "inventory_level",
    "payment",
    "payment_collection",
    "fulfillment",
  ]
  const marketplaceTables = await dbConnection.raw(
    `select table_name
     from information_schema.tables
     where table_schema = 'public'
       and table_name like '%marketplace%'
     order by table_name`,
  )
  const tableNames = Array.from(
    new Set([
      ...fixedTables,
      ...marketplaceTables.rows.map(
        (row: { table_name: string }) => row.table_name,
      ),
    ]),
  )
  const fingerprint: Record<string, string[]> = {}

  for (const tableName of tableNames) {
    const exists = await dbConnection.raw(
      "select to_regclass(?) is not null as present",
      [`public.${tableName}`],
    )

    if (!exists.rows[0].present) {
      continue
    }

    if (!/^[a-z0-9_]+$/.test(tableName)) {
      throw new Error("unsafe commerce table identifier")
    }

    const rows = await dbConnection.raw(
      `select row_to_json(record)::text as value
       from (select * from "${tableName}" order by id) record`,
    )
    fingerprint[tableName] = rows.rows.map(
      (row: { value: string }) => row.value,
    )
  }

  return fingerprint
}

medusaIntegrationTestRunner({
  moduleName: "research-tracking-purchased-supplies-http",
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
    RESEARCH_TRACKING_ELIGIBLE_SALES_CHANNEL_IDS: "sc_rt4_http_pending",
  },
  testSuite: ({ api, getContainer, dbConnection }) => {
    describe("RT-4 purchased supplies authenticated Store API", () => {
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
        const apiKey = await apiKeyService.createApiKeys({
          title: "RT-4 disposable HTTP key",
          type: ApiKeyType.PUBLISHABLE,
          created_by: "user_rt4_http_test",
        })
        const salesChannel = await salesChannelService.createSalesChannels({
          name: "RT-4 Disposable HTTP Channel",
        })

        publishableApiKey = apiKey.token
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
        eligibleSalesChannelId = salesChannel.id
        process.env.RESEARCH_TRACKING_ELIGIBLE_SALES_CHANNEL_IDS =
          salesChannel.id
      })

      it("rejects unauthenticated list and activation requests before private access", async () => {
        const listResponse = await api.get(
          `${basePath}/purchased-items`,
          requestConfig(),
        )
        const activationResponse = await api.post(
          `${basePath}/purchased-items/activate`,
          { order_id: "order_missing", line_item_id: "ordli_missing" },
          requestConfig(undefined, "rt4:logged-out:activation"),
        )

        expect(listResponse.status).toBe(401)
        expect(activationResponse.status).toBe(401)
        expect(await researchWriteCounts(getContainer())).toEqual({
          materials: 0,
          supplies: 0,
          activations: 0,
          requests: 0,
        })
      })

      it("lists only owned items and rejects a cross-customer activation probe", async () => {
        const container = getContainer()
        const ownerId = "cus_rt4_http_owner"
        const otherId = "cus_rt4_http_other"
        const ownerItem = await createEligiblePurchasedItem({
          api,
          container,
          customerId: ownerId,
          suffix: "ownership-owner",
        })
        const otherItem = await createEligiblePurchasedItem({
          api,
          container,
          customerId: otherId,
          suffix: "ownership-other",
        })

        const ownerList = await api.get(
          `${basePath}/purchased-items`,
          requestConfig(ownerId),
        )
        const otherList = await api.get(
          `${basePath}/purchased-items`,
          requestConfig(otherId),
        )
        const crossCustomer = await activatePurchasedItem(
          api,
          ownerItem,
          "rt4:cross-customer:activation",
          otherId,
        )

        expect(ownerList.status).toBe(200)
        expect(ownerList.data.purchased_items).toEqual([
          expect.objectContaining({ line_item_id: ownerItem.lineItemId }),
        ])
        expect(otherList.data.purchased_items).toEqual([
          expect.objectContaining({ line_item_id: otherItem.lineItemId }),
        ])
        expect(crossCustomer.status).toBe(404)
        expect(await researchWriteCounts(container)).toEqual({
          materials: 0,
          supplies: 0,
          activations: 0,
          requests: 0,
        })
        expectPrivateNoStore(ownerList)
        expectPrivateNoStore(otherList)
        expectPrivateNoStore(crossCustomer)
      })

      it("creates and exactly replays one private activation projection", async () => {
        const container = getContainer()
        const fixture = await createEligiblePurchasedItem({
          api,
          container,
          customerId: "cus_rt4_http_replay",
          suffix: "replay",
          quantity: 3,
        })
        const idempotencyKey = "rt4:activation:replay-001"
        const created = await activatePurchasedItem(
          api,
          fixture,
          idempotencyKey,
        )
        const replayed = await activatePurchasedItem(
          api,
          fixture,
          idempotencyKey,
        )
        const candidates = await api.get(
          `${basePath}/purchased-items`,
          requestConfig(fixture.customerId),
        )
        const materials = await api.get(
          `${basePath}/materials`,
          requestConfig(fixture.customerId),
        )

        expect(created.status).toBe(201)
        expect(replayed.status).toBe(200)
        expect(replayed.data).toEqual(created.data)
        expect(created.data.activation).toEqual(
          expect.objectContaining({
            source_order_id: fixture.orderId,
            source_order_line_item_id: fixture.lineItemId,
            eligible_commerce_quantity: 3,
            initial_quantity_base_units: 3_000,
            remaining_quantity_base_units: 3_000,
            base_unit: "microgram",
          }),
        )
        expect(created.data.activation).not.toHaveProperty("profile_id")
        expect(created.data.activation).not.toHaveProperty("customer_id")
        expect(created.data.activation).not.toHaveProperty("idempotency_key")
        expect(created.data.activation).not.toHaveProperty(
          "request_fingerprint_sha256",
        )
        expect(candidates.data.purchased_items[0]).toEqual(
          expect.objectContaining({
            line_item_id: fixture.lineItemId,
            eligibility: "already_tracked",
          }),
        )
        expect(materials.data.materials).toHaveLength(1)
        expect(materials.data.materials[0].supplies).toHaveLength(1)
        expect(await researchWriteCounts(container)).toEqual({
          materials: 1,
          supplies: 1,
          activations: 1,
          requests: 1,
        })
        expectPrivateNoStore(created)
        expectPrivateNoStore(replayed)
        expectPrivateNoStore(candidates)
        expectPrivateNoStore(materials)
      })

      it("rejects conflicting idempotency-key reuse without tracking the second item", async () => {
        const container = getContainer()
        const customerId = "cus_rt4_http_conflict"
        const firstItem = await createEligiblePurchasedItem({
          api,
          container,
          customerId,
          suffix: "conflict-first",
        })
        const secondItem = await createEligiblePurchasedItem({
          api,
          container,
          customerId,
          suffix: "conflict-second",
        })
        const key = "rt4:activation:conflict-001"
        const first = await activatePurchasedItem(api, firstItem, key)
        const conflicting = await activatePurchasedItem(api, secondItem, key)

        expect(first.status).toBe(201)
        expect(conflicting.status).toBe(409)
        expect(conflicting.data).toEqual(
          expect.objectContaining({
            type: "conflict",
            code: "invalid_state_error",
          }),
        )
        expect(await researchWriteCounts(container)).toEqual({
          materials: 1,
          supplies: 1,
          activations: 1,
          requests: 1,
        })
        expectPrivateNoStore(first)
        expectPrivateNoStore(conflicting)
      })

      it("serializes concurrent activation requests to one durable supply", async () => {
        const container = getContainer()
        const fixture = await createEligiblePurchasedItem({
          api,
          container,
          customerId: "cus_rt4_http_concurrent",
          suffix: "concurrent",
        })
        const responses = await Promise.all([
          activatePurchasedItem(
            api,
            fixture,
            "rt4:activation:concurrent-001",
          ),
          activatePurchasedItem(
            api,
            fixture,
            "rt4:activation:concurrent-002",
          ),
        ])

        expect(responses.map((response) => response.status).sort()).toEqual([
          200, 201,
        ])
        expect(responses[0].data.activation).toEqual(
          responses[1].data.activation,
        )
        expect(await researchWriteCounts(container)).toEqual({
          materials: 1,
          supplies: 1,
          activations: 1,
          requests: 2,
        })
        responses.forEach((response) => expectPrivateNoStore(response))
      })

      it("compensates a new material when persistence fails", async () => {
        const container = getContainer()
        const fixture = await createEligiblePurchasedItem({
          api,
          container,
          customerId: "cus_rt4_http_compensation",
          suffix: "compensation",
        })
        const service = container.resolve<ResearchTrackingModuleService>(
          RESEARCH_TRACKING_MODULE,
        )
        const persistence = jest
          .spyOn(service, "createPurchasedSupplyActivation")
          .mockRejectedValueOnce(new Error("injected RT-4 persistence failure"))

        try {
          const failed = await activatePurchasedItem(
            api,
            fixture,
            "rt4:activation:compensation-001",
          )

          expect(failed.status).toBe(500)
          expectPrivateNoStore(failed)
        } finally {
          persistence.mockRestore()
        }

        expect(await researchWriteCounts(container)).toEqual({
          materials: 0,
          supplies: 0,
          activations: 0,
          requests: 0,
        })
      })

      it("leaves commerce, inventory, payment, fulfillment, and marketplace rows unchanged", async () => {
        const container = getContainer()
        const fixture = await createEligiblePurchasedItem({
          api,
          container,
          customerId: "cus_rt4_http_commerce",
          suffix: "commerce-non-mutation",
        })
        const before = await commerceFingerprint(dbConnection)
        const activated = await activatePurchasedItem(
          api,
          fixture,
          "rt4:activation:commerce-001",
        )
        const after = await commerceFingerprint(dbConnection)

        expect(activated.status).toBe(201)
        expect(after).toEqual(before)
        expect(await researchWriteCounts(container)).toEqual({
          materials: 1,
          supplies: 1,
          activations: 1,
          requests: 1,
        })
        expectPrivateNoStore(activated)
      })
    })
  },
})
