import type {
  IApiKeyModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ApiKeyType,
  ContainerRegistrationKeys,
  generateJwtToken,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

import { RESEARCH_TRACKING_MODULE } from "../../src/modules/research-tracking"
import type ResearchTrackingModuleService from "../../src/modules/research-tracking/service"

jest.setTimeout(240 * 1000)

const configuredJwtSecret = "rt-5-disposable-http-test-secret"
const consentVersion = "2026-08-27.v1"
const noticeSha256 = "5".repeat(64)
const basePath = "/store/customers/me/research-tracking"
const localDate = "2026-08-27"
const disposableDatabaseName =
  process.env.RT5_HTTP_TEST_DB_NAME ??
  "medusa-rt5-personal-routines-integration-1"
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

type PrivateSupplyFixture = {
  customerId: string
  profileId: string
  materialId: string
  supplyId: string
  initialQuantity: number
}

type RoutineFixture = {
  routineId: string
  revisionId: string
}

type ConfirmationFixture = RoutineFixture & {
  occurrenceId: string
  logId: string
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

function service(container: MedusaContainer): ResearchTrackingModuleService {
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
    requestConfig(customerId, `rt5:profile:${customerId}`),
  )

  expect([200, 201]).toContain(response.status)
  expectPrivateNoStore(response)
  return response
}

async function createPrivateSupply(input: {
  api: ApiClient
  container: MedusaContainer
  customerId: string
  suffix: string
  quantity?: number
}): Promise<PrivateSupplyFixture> {
  const initialQuantity = input.quantity ?? 1_000
  await ensureProfile(input.api, input.customerId)
  const trackingService = service(input.container)
  const [profile] = await trackingService.listResearchProfiles(
    { customer_id: input.customerId },
    { take: 1 },
  )
  const material = await trackingService.createTrackedMaterials({
    profile_id: profile.id,
    product_variant_id: null,
    label: `RT-5 Material ${input.suffix}`,
    source: "manual",
    status: "active",
    activated_at: new Date(),
  })
  const supply = await trackingService.createResearchSupplies({
    tracked_material_id: material.id,
    source_order_line_item_id: null,
    initial_quantity_base_units: initialQuantity,
    remaining_quantity_base_units: initialQuantity,
    base_unit: "microgram",
    acquired_at: new Date(),
    lot_number: null,
    batch_number: null,
    expires_at: null,
    storage_note: null,
    status: "active",
  })

  return {
    customerId: input.customerId,
    profileId: profile.id,
    materialId: material.id,
    supplyId: supply.id,
    initialQuantity,
  }
}

function routineBody(materialId: string, quantity: number) {
  return {
    tracked_material_id: materialId,
    label: "Private research routine",
    planned_quantity_base_units: quantity,
    base_unit: "microgram",
    recurrence_type: "daily",
    daily_interval: 1,
    weekly_interval: null,
    weekdays: [],
    local_time: "08:30",
    start_date: localDate,
    end_date: null,
    effective_from_date: localDate,
  }
}

function routineUpdateBody(quantity: number) {
  const { tracked_material_id: _trackedMaterialId, ...body } = routineBody(
    "not-used-for-updates",
    quantity,
  )

  return body
}

async function createRoutine(input: {
  api: ApiClient
  fixture: PrivateSupplyFixture
  key: string
  quantity?: number
}): Promise<RoutineFixture> {
  const response = await input.api.post(
    `${basePath}/routines`,
    routineBody(input.fixture.materialId, input.quantity ?? 200),
    requestConfig(input.fixture.customerId, input.key),
  )

  expect(response.status).toBe(201)
  expectPrivateNoStore(response)
  return {
    routineId: response.data.routine_id,
    revisionId: response.data.revision_id,
  }
}

async function transitionRoutine(input: {
  api: ApiClient
  customerId: string
  routineId: string
  operation: "archive" | "resume"
  key: string
}) {
  return input.api.post(
    `${basePath}/routines/${input.routineId}/${input.operation}`,
    { effective_from_date: localDate },
    requestConfig(input.customerId, input.key),
  )
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

async function previewConfirmation(input: {
  api: ApiClient
  fixture: PrivateSupplyFixture
  routine: RoutineFixture
  quantity?: number
}) {
  const occurrence = await occurrenceFor({
    api: input.api,
    customerId: input.fixture.customerId,
    routineId: input.routine.routineId,
  })
  const response = await input.api.post(
    `${basePath}/logs/preview`,
    {
      routine_id: input.routine.routineId,
      routine_revision_id: input.routine.revisionId,
      occurrence_id: occurrence.occurrence_id,
      local_date: occurrence.local_date,
      supply_id: input.fixture.supplyId,
      confirmed_quantity_base_units: input.quantity ?? 200,
      base_unit: "microgram",
    },
    requestConfig(input.fixture.customerId),
  )

  expect(response.status).toBe(200)
  expectPrivateNoStore(response)
  return response.data.preview
}

async function confirmLog(input: {
  api: ApiClient
  fixture: PrivateSupplyFixture
  routine: RoutineFixture
  preview: Record<string, any>
  key: string
}) {
  return input.api.post(
    `${basePath}/logs`,
    {
      routine_id: input.routine.routineId,
      routine_revision_id: input.routine.revisionId,
      occurrence_id: input.preview.occurrence_id,
      local_date: input.preview.local_date,
      supply_id: input.fixture.supplyId,
      confirmed_quantity_base_units:
        input.preview.confirmed_quantity_base_units,
      base_unit: "microgram",
      preview_token: input.preview.preview_token,
    },
    requestConfig(input.fixture.customerId, input.key),
  )
}

async function createConfirmedLog(input: {
  api: ApiClient
  fixture: PrivateSupplyFixture
  suffix: string
  quantity?: number
}): Promise<ConfirmationFixture> {
  const routine = await createRoutine({
    api: input.api,
    fixture: input.fixture,
    key: `rt5:routine:${input.suffix}`,
    quantity: input.quantity,
  })
  const preview = await previewConfirmation({
    api: input.api,
    fixture: input.fixture,
    routine,
    quantity: input.quantity,
  })
  const confirmed = await confirmLog({
    api: input.api,
    fixture: input.fixture,
    routine,
    preview,
    key: `rt5:confirm:${input.suffix}`,
  })

  expect(confirmed.status).toBe(201)
  expectPrivateNoStore(confirmed)
  return {
    ...routine,
    occurrenceId: preview.occurrence_id,
    logId: confirmed.data.log_id,
  }
}

async function mutationPreview(input: {
  api: ApiClient
  fixture: PrivateSupplyFixture
  logId: string
  operation: "revise" | "void" | "restore"
  quantity?: number
}) {
  const response = await input.api.post(
    `${basePath}/logs/${input.logId}/preview`,
    {
      operation: input.operation,
      ...(input.operation === "void"
        ? {}
        : {
            supply_id: input.fixture.supplyId,
            confirmed_quantity_base_units: input.quantity,
            base_unit: "microgram",
          }),
    },
    requestConfig(input.fixture.customerId),
  )

  expect(response.status).toBe(200)
  expectPrivateNoStore(response)
  return response.data.preview
}

async function mutateLog(input: {
  api: ApiClient
  fixture: PrivateSupplyFixture
  logId: string
  operation: "revise" | "void" | "restore"
  preview: Record<string, any>
  key: string
  quantity?: number
}) {
  return input.api.post(
    `${basePath}/logs/${input.logId}/${input.operation}`,
    {
      preview_token: input.preview.preview_token,
      ...(input.operation === "void"
        ? {}
        : {
            supply_id: input.fixture.supplyId,
            confirmed_quantity_base_units: input.quantity,
            base_unit: "microgram",
          }),
    },
    requestConfig(input.fixture.customerId, input.key),
  )
}

async function routineWriteCounts(container: MedusaContainer) {
  const trackingService = service(container)
  const [
    routines,
    routineRevisions,
    logs,
    logRevisions,
    adjustments,
    mutations,
  ] = await Promise.all([
    trackingService.listResearchRoutines({}),
    trackingService.listResearchRoutineRevisions({}),
    trackingService.listResearchRoutineLogs({}),
    trackingService.listResearchRoutineLogRevisions({}),
    trackingService.listResearchSupplyAdjustments({}),
    trackingService.listResearchRoutineMutations({}),
  ])

  return {
    routines: routines.length,
    routineRevisions: routineRevisions.length,
    logs: logs.length,
    logRevisions: logRevisions.length,
    adjustments: adjustments.length,
    mutations: mutations.length,
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
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "unsafe commerce table identifier",
      )
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
  moduleName: "research-tracking-personal-routines-http",
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
  testSuite: ({ api, getContainer, dbConnection }) => {
    describe("RT-5 personal routines authenticated Store API", () => {
      beforeAll(async () => {
        const container = getContainer()
        const config = container.resolve<{
          projectConfig: { http: { jwtSecret: string } }
        }>(ContainerRegistrationKeys.CONFIG_MODULE)
        const apiKeyService = container.resolve<IApiKeyModuleService>(
          Modules.API_KEY,
        )
        const apiKey = await apiKeyService.createApiKeys({
          title: "RT-5 disposable HTTP key",
          type: ApiKeyType.PUBLISHABLE,
          created_by: "user_rt5_http_test",
        })

        publishableApiKey = apiKey.token
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
      })

      it("enforces authentication and customer ownership without private disclosure", async () => {
        const container = getContainer()
        const owner = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_owner",
          suffix: "ownership-owner",
        })
        const other = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_other",
          suffix: "ownership-other",
        })
        const routine = await createRoutine({
          api,
          fixture: owner,
          key: "rt5:routine:ownership-owner",
        })
        const loggedOut = await api.get(
          `${basePath}/routines`,
          requestConfig(),
        )
        const ownerList = await api.get(
          `${basePath}/routines`,
          requestConfig(owner.customerId),
        )
        const otherList = await api.get(
          `${basePath}/routines`,
          requestConfig(other.customerId),
        )
        const crossCustomer = await api.post(
          `${basePath}/routines/${routine.routineId}`,
          routineUpdateBody(250),
          requestConfig(other.customerId, "rt5:routine:cross-customer"),
        )

        expect(loggedOut.status).toBe(401)
        expect(ownerList.status).toBe(200)
        expect(ownerList.data.routines).toHaveLength(1)
        expect(otherList.status).toBe(200)
        expect(otherList.data.routines).toHaveLength(0)
        expect(crossCustomer.status).toBe(404)
        expectPrivateNoStore(loggedOut)
        expectPrivateNoStore(ownerList)
        expectPrivateNoStore(otherList)
        expectPrivateNoStore(crossCustomer)
      })

      it("keeps routines and logs readable but disables mutations for closed and outdated-consent profiles", async () => {
        const container = getContainer()

        for (const state of ["closed", "outdated"] as const) {
          const fixture = await createPrivateSupply({
            api,
            container,
            customerId: `cus_rt5_http_readonly_${state}`,
            suffix: `readonly-${state}`,
          })
          const editableRoutine = await createRoutine({
            api,
            fixture,
            key: `rt5:routine:readonly-editable-${state}`,
          })
          const archivedRoutine = await createRoutine({
            api,
            fixture,
            key: `rt5:routine:readonly-archived-${state}`,
          })
          const archived = await transitionRoutine({
            api,
            customerId: fixture.customerId,
            routineId: archivedRoutine.routineId,
            operation: "archive",
            key: `rt5:routine:readonly-prearchive-${state}`,
          })
          expect(archived.status).toBe(200)

          const confirmRoutine = await createRoutine({
            api,
            fixture,
            key: `rt5:routine:readonly-confirm-${state}`,
          })
          const confirmationPreview = await previewConfirmation({
            api,
            fixture,
            routine: confirmRoutine,
          })
          const confirmed = await createConfirmedLog({
            api,
            fixture,
            suffix: `readonly-confirmed-${state}`,
          })
          const [revisePreview, voidPreview] = await Promise.all([
            mutationPreview({
              api,
              fixture,
              logId: confirmed.logId,
              operation: "revise",
              quantity: 250,
            }),
            mutationPreview({
              api,
              fixture,
              logId: confirmed.logId,
              operation: "void",
            }),
          ])
          const restoreCandidate = await createConfirmedLog({
            api,
            fixture,
            suffix: `readonly-restore-${state}`,
          })
          const restoreCandidateVoidPreview = await mutationPreview({
            api,
            fixture,
            logId: restoreCandidate.logId,
            operation: "void",
          })
          const restoreCandidateVoid = await mutateLog({
            api,
            fixture,
            logId: restoreCandidate.logId,
            operation: "void",
            preview: restoreCandidateVoidPreview,
            key: `rt5:log:readonly-prevoid-${state}`,
          })
          expect(restoreCandidateVoid.status).toBe(200)
          const restorePreview = await mutationPreview({
            api,
            fixture,
            logId: restoreCandidate.logId,
            operation: "restore",
            quantity: 200,
          })
          const writesBeforeBlock = await routineWriteCounts(container)
          const supplyBeforeBlock = await service(
            container,
          ).retrieveResearchSupply(fixture.supplyId)

          if (state === "closed") {
            const closed = await api.post(
              `${basePath}/profile/closure`,
              { acknowledge_closure: true },
              requestConfig(
                fixture.customerId,
                "rt5:profile:close-readonly",
              ),
            )
            expect(closed.status).toBe(200)
          } else {
            await service(container).updateResearchProfiles({
              id: fixture.profileId,
              consent_version: "2026-08-26.outdated",
            })
          }

          const routines = await api.get(
            `${basePath}/routines`,
            requestConfig(fixture.customerId),
          )
          const logs = await api.get(
            `${basePath}/logs`,
            requestConfig(fixture.customerId),
          )
          const blockedMutations = await Promise.all([
            api.post(
              `${basePath}/routines`,
              routineBody(fixture.materialId, 100),
              requestConfig(
                fixture.customerId,
                `rt5:routine:blocked-create-${state}`,
              ),
            ),
            api.post(
              `${basePath}/routines/${editableRoutine.routineId}`,
              routineUpdateBody(250),
              requestConfig(
                fixture.customerId,
                `rt5:routine:blocked-update-${state}`,
              ),
            ),
            transitionRoutine({
              api,
              customerId: fixture.customerId,
              routineId: editableRoutine.routineId,
              operation: "archive",
              key: `rt5:routine:blocked-archive-${state}`,
            }),
            transitionRoutine({
              api,
              customerId: fixture.customerId,
              routineId: archivedRoutine.routineId,
              operation: "resume",
              key: `rt5:routine:blocked-resume-${state}`,
            }),
            confirmLog({
              api,
              fixture,
              routine: confirmRoutine,
              preview: confirmationPreview,
              key: `rt5:confirm:blocked-${state}`,
            }),
            mutateLog({
              api,
              fixture,
              logId: confirmed.logId,
              operation: "revise",
              preview: revisePreview,
              key: `rt5:log:blocked-revise-${state}`,
              quantity: 250,
            }),
            mutateLog({
              api,
              fixture,
              logId: confirmed.logId,
              operation: "void",
              preview: voidPreview,
              key: `rt5:log:blocked-void-${state}`,
            }),
            mutateLog({
              api,
              fixture,
              logId: restoreCandidate.logId,
              operation: "restore",
              preview: restorePreview,
              key: `rt5:log:blocked-restore-${state}`,
              quantity: 200,
            }),
          ])
          const writesAfterBlock = await routineWriteCounts(container)
          const supplyAfterBlock = await service(
            container,
          ).retrieveResearchSupply(fixture.supplyId)

          expect(routines.status).toBe(200)
          expect(routines.data.routines).toHaveLength(5)
          expect(logs.status).toBe(200)
          expect(logs.data.logs).toHaveLength(2)
          blockedMutations.forEach((response) => {
            expect(response.status).toBe(403)
            expect(response.data.message).toContain(
              "research_profile_action_required",
            )
            expectPrivateNoStore(response)
          })
          expect(writesAfterBlock).toEqual(writesBeforeBlock)
          expect(supplyAfterBlock.remaining_quantity_base_units).toBe(
            supplyBeforeBlock.remaining_quantity_base_units,
          )
          ;[routines, logs].forEach(expectPrivateNoStore)
        }
      })

      it("exactly replays confirmation and rejects conflicting idempotency-key reuse", async () => {
        const container = getContainer()
        const fixture = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_replay",
          suffix: "replay",
        })
        const routine = await createRoutine({
          api,
          fixture,
          key: "rt5:routine:replay",
        })
        const preview = await previewConfirmation({ api, fixture, routine })
        const key = "rt5:confirm:replay-001"
        const created = await confirmLog({ api, fixture, routine, preview, key })
        const replayed = await confirmLog({
          api,
          fixture,
          routine,
          preview,
          key,
        })
        const conflicting = await confirmLog({
          api,
          fixture,
          routine,
          preview: {
            ...preview,
            confirmed_quantity_base_units: 250,
          },
          key,
        })
        const supply = await service(container).retrieveResearchSupply(
          fixture.supplyId,
        )

        expect(created.status).toBe(201)
        expect(replayed.status).toBe(201)
        expect(replayed.data).toEqual(created.data)
        expect(conflicting.status).toBe(409)
        expect(supply.remaining_quantity_base_units).toBe(800)
        expect(await routineWriteCounts(container)).toEqual({
          routines: 1,
          routineRevisions: 1,
          logs: 1,
          logRevisions: 1,
          adjustments: 1,
          mutations: 2,
        })
        ;[created, replayed, conflicting].forEach(expectPrivateNoStore)
      })

      it("serializes concurrent confirmation of one occurrence", async () => {
        const container = getContainer()
        const fixture = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_same_occurrence",
          suffix: "same-occurrence",
        })
        const routine = await createRoutine({
          api,
          fixture,
          key: "rt5:routine:same-occurrence",
        })
        const preview = await previewConfirmation({ api, fixture, routine })
        const responses = await Promise.all([
          confirmLog({
            api,
            fixture,
            routine,
            preview,
            key: "rt5:confirm:same-occurrence-a",
          }),
          confirmLog({
            api,
            fixture,
            routine,
            preview,
            key: "rt5:confirm:same-occurrence-b",
          }),
        ])
        const supply = await service(container).retrieveResearchSupply(
          fixture.supplyId,
        )

        expect(responses.map((response) => response.status).sort()).toEqual([
          201, 409,
        ])
        expect(supply.remaining_quantity_base_units).toBe(800)
        expect((await service(container).listResearchRoutineLogs({}))).toHaveLength(1)
        expect(
          await service(container).listResearchSupplyAdjustments({}),
        ).toHaveLength(1)
        responses.forEach(expectPrivateNoStore)
      })

      it("serializes concurrent confirmations so a supply cannot be overspent", async () => {
        const container = getContainer()
        const fixture = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_overspend",
          suffix: "overspend",
          quantity: 100,
        })
        const firstRoutine = await createRoutine({
          api,
          fixture,
          key: "rt5:routine:overspend-a",
          quantity: 80,
        })
        const secondRoutine = await createRoutine({
          api,
          fixture,
          key: "rt5:routine:overspend-b",
          quantity: 80,
        })
        const [firstPreview, secondPreview] = await Promise.all([
          previewConfirmation({
            api,
            fixture,
            routine: firstRoutine,
            quantity: 80,
          }),
          previewConfirmation({
            api,
            fixture,
            routine: secondRoutine,
            quantity: 80,
          }),
        ])
        const responses = await Promise.all([
          confirmLog({
            api,
            fixture,
            routine: firstRoutine,
            preview: firstPreview,
            key: "rt5:confirm:overspend-a",
          }),
          confirmLog({
            api,
            fixture,
            routine: secondRoutine,
            preview: secondPreview,
            key: "rt5:confirm:overspend-b",
          }),
        ])
        const supply = await service(container).retrieveResearchSupply(
          fixture.supplyId,
        )

        expect(responses.map((response) => response.status).sort()).toEqual([
          201, 409,
        ])
        expect(supply.remaining_quantity_base_units).toBe(20)
        expect((await service(container).listResearchRoutineLogs({}))).toHaveLength(1)
        expect(
          await service(container).listResearchSupplyAdjustments({}),
        ).toHaveLength(1)
        responses.forEach(expectPrivateNoStore)
      })

      it("revises, voids, and restores one log with append-only balance adjustments", async () => {
        const container = getContainer()
        const fixture = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_lifecycle",
          suffix: "lifecycle",
        })
        const confirmed = await createConfirmedLog({
          api,
          fixture,
          suffix: "lifecycle",
          quantity: 200,
        })
        const revisedPreview = await mutationPreview({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "revise",
          quantity: 300,
        })
        const revised = await mutateLog({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "revise",
          preview: revisedPreview,
          key: "rt5:log:revise-lifecycle",
          quantity: 300,
        })
        const voidPreview = await mutationPreview({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "void",
        })
        const voided = await mutateLog({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "void",
          preview: voidPreview,
          key: "rt5:log:void-lifecycle",
        })
        const restorePreview = await mutationPreview({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "restore",
          quantity: 250,
        })
        const restored = await mutateLog({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "restore",
          preview: restorePreview,
          key: "rt5:log:restore-lifecycle",
          quantity: 250,
        })
        const logs = await api.get(
          `${basePath}/logs`,
          requestConfig(fixture.customerId),
        )
        const supply = await service(container).retrieveResearchSupply(
          fixture.supplyId,
        )
        const revisions = await service(
          container,
        ).listResearchRoutineLogRevisions({ log_id: confirmed.logId })
        const adjustments = await service(
          container,
        ).listResearchSupplyAdjustments({ log_id: confirmed.logId })

        expect(revised.status).toBe(200)
        expect(voided.status).toBe(200)
        expect(restored.status).toBe(200)
        expect(logs.data.logs).toEqual([
          expect.objectContaining({
            log_id: confirmed.logId,
            status: "confirmed",
            operation: "restore",
            confirmed_quantity_base_units: 250,
          }),
        ])
        expect(supply.remaining_quantity_base_units).toBe(750)
        expect(revisions).toHaveLength(4)
        expect(adjustments).toHaveLength(5)
        ;[revised, voided, restored, logs].forEach(expectPrivateNoStore)
      })

      it("rolls back partial log writes when a supply update fails", async () => {
        const container = getContainer()
        const fixture = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_compensation",
          suffix: "compensation",
        })
        const routine = await createRoutine({
          api,
          fixture,
          key: "rt5:routine:compensation",
        })
        const preview = await previewConfirmation({ api, fixture, routine })
        const trackingService = service(container)
        const supplyWrite = jest
          .spyOn(trackingService, "updateResearchSupplies")
          .mockRejectedValueOnce(new Error("injected RT-5 supply failure"))

        let failed: any
        try {
          failed = await confirmLog({
            api,
            fixture,
            routine,
            preview,
            key: "rt5:confirm:compensation",
          })
        } finally {
          supplyWrite.mockRestore()
        }

        const supply = await trackingService.retrieveResearchSupply(
          fixture.supplyId,
        )
        const mutations = await trackingService.listResearchRoutineMutations({
          operation: "confirm-research-routine-log",
        })

        expect(failed.status).toBe(500)
        expectPrivateNoStore(failed)
        expect(supply.remaining_quantity_base_units).toBe(
          fixture.initialQuantity,
        )
        expect(await trackingService.listResearchRoutineLogs({})).toHaveLength(0)
        expect(
          await trackingService.listResearchRoutineLogRevisions({}),
        ).toHaveLength(0)
        expect(
          await trackingService.listResearchSupplyAdjustments({}),
        ).toHaveLength(0)
        expect(mutations).toEqual([
          expect.objectContaining({ status: "failed" }),
        ])
      })

      it("leaves commerce, inventory, payment, fulfillment, and marketplace records unchanged", async () => {
        const container = getContainer()
        const fixture = await createPrivateSupply({
          api,
          container,
          customerId: "cus_rt5_http_commerce",
          suffix: "commerce-isolation",
        })
        const before = await commerceFingerprint(dbConnection)
        const confirmed = await createConfirmedLog({
          api,
          fixture,
          suffix: "commerce-isolation",
        })
        const voidPreview = await mutationPreview({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "void",
        })
        const voided = await mutateLog({
          api,
          fixture,
          logId: confirmed.logId,
          operation: "void",
          preview: voidPreview,
          key: "rt5:log:void-commerce",
        })
        const after = await commerceFingerprint(dbConnection)

        expect(voided.status).toBe(200)
        expect(after).toEqual(before)
        expectPrivateNoStore(voided)
      })
    })
  },
})
