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
import { inspect } from "node:util"

import { RESEARCH_TRACKING_MODULE } from "../../src/modules/research-tracking"
import {
  RESEARCH_JOURNAL_NOTE_MAX_LENGTH,
} from "../../src/modules/research-tracking/contracts/journal"
import type ResearchTrackingModuleService from "../../src/modules/research-tracking/service"

jest.setTimeout(300 * 1000)

const configuredJwtSecret = "rt-6-disposable-http-test-secret"
const consentVersion = "2026-08-29.v1"
const noticeSha256 = "6".repeat(64)
const journalConsentVersion = "2026-08-29.v2"
const journalNoticeSha256 = "7".repeat(64)
const basePath = "/store/customers/me/research-tracking"
const journalPath = `${basePath}/journal`
const privateRecordsPath = `${basePath}/private-records`
const disposableDatabaseName =
  process.env.RT6_HTTP_TEST_DB_NAME ??
  "medusa-rt6-journal-integration-1"
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

function journalBody(note: string, relations: Record<string, string> = {}) {
  return {
    title: "Private observation",
    note,
    local_date: "2026-08-29",
    local_time: "09:15",
    timezone: "Asia/Manila",
    ...relations,
    confirmed: true,
  }
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
    requestConfig(customerId, `rt6:profile:${customerId}`),
  )

  expect([200, 201]).toContain(response.status)
  expectPrivateNoStore(response)
  return response
}

async function recordJournalConsent(
  api: ApiClient,
  customerId: string,
  accepted: boolean,
  key: string,
) {
  const response = await api.post(
    `${privateRecordsPath}/consents`,
    {
      scope: "journal",
      consent_version: journalConsentVersion,
      accepted,
    },
    requestConfig(customerId, key),
  )

  expect([200, 201]).toContain(response.status)
  expectPrivateNoStore(response)
  return response
}

async function prepareCustomer(api: ApiClient, customerId: string) {
  await ensureProfile(api, customerId)
  await recordJournalConsent(
    api,
    customerId,
    true,
    `rt6:journal-consent:${customerId}`,
  )
}

async function createJournalEntry(input: {
  api: ApiClient
  customerId: string
  key: string
  note: string
  relations?: Record<string, string>
}) {
  return input.api.post(
    journalPath,
    journalBody(input.note, input.relations),
    requestConfig(input.customerId, input.key),
  )
}

async function createVoidedJournalEntry(input: {
  api: ApiClient
  customerId: string
  suffix: string
}) {
  const created = await createJournalEntry({
    api: input.api,
    customerId: input.customerId,
    key: `rt6:journal:${input.suffix}:restorable-create`,
    note: "voided before the profile becomes read-only",
  })
  expect(created.status).toBe(201)
  expectPrivateNoStore(created)

  const voided = await input.api.post(
    `${journalPath}/${created.data.journal_entry_id}/void`,
    { expected_revision_id: created.data.revision_id, confirmed: true },
    requestConfig(
      input.customerId,
      `rt6:journal:${input.suffix}:restorable-void`,
    ),
  )
  expect(voided.status).toBe(200)
  expect(voided.data.status).toBe("voided")
  expectPrivateNoStore(voided)

  return {
    journalEntryId: created.data.journal_entry_id,
    revisionId: created.data.revision_id,
  }
}

async function blockedJournalMutations(input: {
  api: ApiClient
  customerId: string
  journalEntryId: string
  revisionId: string
  restoreJournalEntryId: string
  restoreRevisionId: string
  suffix: string
}) {
  const create = await createJournalEntry({
    api: input.api,
    customerId: input.customerId,
    key: `rt6:journal:${input.suffix}:blocked-create`,
    note: "must not be written",
  })
  const revise = await input.api.post(
    `${journalPath}/${input.journalEntryId}/revise`,
    {
      ...journalBody("must not revise"),
      expected_revision_id: input.revisionId,
    },
    requestConfig(
      input.customerId,
      `rt6:journal:${input.suffix}:blocked-revise`,
    ),
  )
  const voided = await input.api.post(
    `${journalPath}/${input.journalEntryId}/void`,
    { expected_revision_id: input.revisionId, confirmed: true },
    requestConfig(
      input.customerId,
      `rt6:journal:${input.suffix}:blocked-void`,
    ),
  )
  const restored = await input.api.post(
    `${journalPath}/${input.restoreJournalEntryId}/restore`,
    { expected_revision_id: input.restoreRevisionId, confirmed: true },
    requestConfig(
      input.customerId,
      `rt6:journal:${input.suffix}:blocked-restore`,
    ),
  )

  return [create, revise, voided, restored]
}

async function journalWriteCounts(container: MedusaContainer) {
  const trackingService = service(container)
  const [entries, revisions, transitions, mutations] = await Promise.all([
    trackingService.listResearchJournalEntries({}),
    trackingService.listResearchJournalEntryRevisions({}),
    trackingService.listResearchJournalStateTransitions({}),
    trackingService.listResearchJournalMutations({}),
  ])

  return {
    entries: entries.length,
    revisions: revisions.length,
    transitions: transitions.length,
    mutations: mutations.length,
  }
}

async function createRoutineRelationFixture(input: {
  trackingService: ResearchTrackingModuleService
  profileId: string
  materialId: string
  supplyId: string
  suffix: string
  logStatus?: "confirmed" | "voided"
}) {
  const localDate = new Date("2026-08-29T00:00:00.000Z")
  const routine = await input.trackingService.createResearchRoutines({
    profile_id: input.profileId,
    tracked_material_id: input.materialId,
    status: "active",
    current_revision_id: null,
    archived_at: null,
  })
  const routineRevision =
    await input.trackingService.createResearchRoutineRevisions({
      routine_id: routine.id,
      label: `RT-6 relation routine ${input.suffix}`,
      planned_quantity_base_units: 100,
      base_unit: "microgram",
      timezone: "Asia/Manila",
      recurrence_type: "daily",
      daily_interval: 1,
      weekly_interval: null,
      weekdays: null,
      local_time: "09:15",
      start_date: localDate,
      end_date: null,
      effective_from_date: localDate,
      superseded_revision_id: null,
    })
  await input.trackingService.updateResearchRoutines({
    id: routine.id,
    current_revision_id: routineRevision.id,
  })
  const log = await input.trackingService.createResearchRoutineLogs({
    occurrence_id: `rt6-relation-${input.suffix}`,
    status: input.logStatus ?? "confirmed",
    current_revision_id: null,
    profile_id: input.profileId,
    routine_id: routine.id,
  })
  const logRevision =
    await input.trackingService.createResearchRoutineLogRevisions({
      occurrence_id: `rt6-relation-${input.suffix}`,
      local_date: localDate,
      local_time: "09:15",
      timezone: "Asia/Manila",
      confirmed_quantity_base_units: 100,
      base_unit: "microgram",
      operation: input.logStatus === "voided" ? "void" : "confirm",
      prior_revision_id: null,
      profile_id: input.profileId,
      routine_id: routine.id,
      log_id: log.id,
      routine_revision_id: routineRevision.id,
      supply_id: input.supplyId,
    })
  await input.trackingService.updateResearchRoutineLogs({
    id: log.id,
    current_revision_id: logRevision.id,
  })

  return { routineId: routine.id, logId: log.id }
}

async function tableFingerprint(dbConnection: any, tableNames: string[]) {
  const fingerprint: Record<string, string[]> = {}

  for (const tableName of tableNames) {
    if (!/^[a-z0-9_]+$/.test(tableName)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "unsafe table identifier",
      )
    }

    const exists = await dbConnection.raw(
      "select to_regclass(?) is not null as present",
      [`public.${tableName}`],
    )

    if (!exists.rows[0].present) {
      continue
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

async function rt5Fingerprint(dbConnection: any) {
  return await tableFingerprint(dbConnection, [
    "tracked_material",
    "research_supply",
    "research_supply_activation",
    "research_supply_activation_request",
    "research_supply_adjustment",
    "research_routine",
    "research_routine_revision",
    "research_routine_state_transition",
    "research_routine_log",
    "research_routine_log_revision",
    "research_routine_mutation",
  ])
}

async function commerceFingerprint(dbConnection: any) {
  const discovered = await dbConnection.raw(
    `select table_name
     from information_schema.tables
     where table_schema = 'public'
       and (
         table_name like '%marketplace%'
         or table_name like '%voucher%'
         or table_name like '%promotion%'
         or table_name like '%campaign%'
         or table_name like '%recipe%'
         or table_name like '%bom%'
         or table_name = 'component_profile'
         or table_name like '%manual_payment%'
       )
     order by table_name`,
  )
  const tableNames = Array.from(
    new Set([
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
      ...discovered.rows.map(
        (row: { table_name: string }) => row.table_name,
      ),
    ]),
  )
  return await tableFingerprint(dbConnection, tableNames)
}

medusaIntegrationTestRunner({
  moduleName: "research-tracking-journal-http",
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
    RESEARCH_TRACKING_JOURNAL_ENABLED: "true",
    RESEARCH_TRACKING_JOURNAL_CONSENT_VERSION: journalConsentVersion,
    RESEARCH_TRACKING_JOURNAL_NOTICE_SHA256: journalNoticeSha256,
    RESEARCH_TRACKING_JOURNAL_NOTICE_URL:
      "https://example.test/research-journal-notice",
    RESEARCH_TRACKING_JOURNAL_EFFECTIVE_AT: "2026-08-01T00:00:00.000Z",
  },
  testSuite: ({ api, getContainer, dbConnection }) => {
    describe("RT-6 Journal authenticated Store API", () => {
      beforeAll(async () => {
        const container = getContainer()
        const config = container.resolve<{
          projectConfig: { http: { jwtSecret: string } }
        }>(ContainerRegistrationKeys.CONFIG_MODULE)
        const apiKeyService = container.resolve<IApiKeyModuleService>(
          Modules.API_KEY,
        )
        const apiKey = await apiKeyService.createApiKeys({
          title: "RT-6 disposable HTTP key",
          type: ApiKeyType.PUBLISHABLE,
          created_by: "user_rt6_http_test",
        })

        publishableApiKey = apiKey.token
        runtimeJwtSecret = config.projectConfig.http.jwtSecret
      })

      it("enforces authentication and ownership without disclosing Journal content", async () => {
        const ownerId = "cus_rt6_http_owner"
        const otherId = "cus_rt6_http_other"
        await prepareCustomer(api, ownerId)
        await prepareCustomer(api, otherId)
        const created = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:ownership",
          note: "owner-only-observation-marker",
        })
        const entryId = created.data.journal_entry_id
        const unauthenticated = await api.get(
          `${journalPath}/${entryId}`,
          requestConfig(),
        )
        const crossCustomer = await api.get(
          `${journalPath}/${entryId}`,
          requestConfig(otherId),
        )
        const ownerList = await api.get(journalPath, requestConfig(ownerId))
        const otherList = await api.get(journalPath, requestConfig(otherId))

        expect(created.status).toBe(201)
        expect(unauthenticated.status).toBe(401)
        expect(crossCustomer.status).toBe(404)
        expect(JSON.stringify(crossCustomer.data)).not.toContain(
          "owner-only-observation-marker",
        )
        expect(ownerList.data.count).toBe(1)
        expect(otherList.data).toEqual({ journal_entries: [], count: 0 })
        ;[created, unauthenticated, crossCustomer, ownerList, otherList].forEach(
          expectPrivateNoStore,
        )
      })

      it("reports current Journal consent and keeps Measurements unavailable with zero records", async () => {
        const customerId = "cus_rt6_http_configuration"
        await ensureProfile(api, customerId)
        const before = await api.get(
          `${privateRecordsPath}/configuration`,
          requestConfig(customerId),
        )
        await recordJournalConsent(
          api,
          customerId,
          true,
          "rt6:journal-consent:configuration",
        )
        const after = await api.get(
          `${privateRecordsPath}/configuration`,
          requestConfig(customerId),
        )
        const measurementTables = await dbConnection.raw(
          `select table_name
           from information_schema.tables
           where table_schema = 'public'
             and table_name like 'research_measurement%'`,
        )

        expect(before.status).toBe(200)
        expect(before.data.private_records.journal.current_consent).toBeNull()
        expect(after.data.private_records.journal).toEqual(
          expect.objectContaining({
            available: true,
            consent_version: journalConsentVersion,
            current_consent: expect.objectContaining({
              event_type: "accepted",
              consent_version: journalConsentVersion,
              is_current: true,
            }),
          }),
        )
        expect(after.data.private_records.measurements).toEqual({
          available: false,
          allowlist_version: null,
        })
        expect(measurementTables.rows).toEqual([])
        ;[before, after].forEach(expectPrivateNoStore)
      })

      it("preserves read-only Journal access for withdrawn, outdated, closed, and deletion-requested profiles", async () => {
        const withdrawnId = "cus_rt6_http_withdrawn"
        await prepareCustomer(api, withdrawnId)
        const withdrawnEntry = await createJournalEntry({
          api,
          customerId: withdrawnId,
          key: "rt6:journal:withdrawn:create",
          note: "visible after withdrawal",
        })
        const withdrawnRestorable = await createVoidedJournalEntry({
          api,
          customerId: withdrawnId,
          suffix: "withdrawn",
        })
        await recordJournalConsent(
          api,
          withdrawnId,
          false,
          "rt6:journal-consent:withdraw",
        )
        const withdrawnRead = await api.get(
          `${journalPath}/${withdrawnEntry.data.journal_entry_id}`,
          requestConfig(withdrawnId),
        )
        const withdrawnWrites = await blockedJournalMutations({
          api,
          customerId: withdrawnId,
          journalEntryId: withdrawnEntry.data.journal_entry_id,
          revisionId: withdrawnEntry.data.revision_id,
          restoreJournalEntryId: withdrawnRestorable.journalEntryId,
          restoreRevisionId: withdrawnRestorable.revisionId,
          suffix: "withdrawn",
        })

        const outdatedId = "cus_rt6_http_outdated"
        await prepareCustomer(api, outdatedId)
        const outdatedEntry = await createJournalEntry({
          api,
          customerId: outdatedId,
          key: "rt6:journal:outdated:create",
          note: "visible with outdated consent",
        })
        const outdatedRestorable = await createVoidedJournalEntry({
          api,
          customerId: outdatedId,
          suffix: "outdated",
        })
        const originalVersion = process.env.RESEARCH_TRACKING_JOURNAL_CONSENT_VERSION
        process.env.RESEARCH_TRACKING_JOURNAL_CONSENT_VERSION =
          "2026-08-29.v3"
        let outdatedRead: any
        let outdatedWrites: any[]
        try {
          outdatedRead = await api.get(
            `${journalPath}/${outdatedEntry.data.journal_entry_id}`,
            requestConfig(outdatedId),
          )
          outdatedWrites = await blockedJournalMutations({
            api,
            customerId: outdatedId,
            journalEntryId: outdatedEntry.data.journal_entry_id,
            revisionId: outdatedEntry.data.revision_id,
            restoreJournalEntryId: outdatedRestorable.journalEntryId,
            restoreRevisionId: outdatedRestorable.revisionId,
            suffix: "outdated",
          })
        } finally {
          process.env.RESEARCH_TRACKING_JOURNAL_CONSENT_VERSION = originalVersion
        }

        const closedId = "cus_rt6_http_closed"
        await prepareCustomer(api, closedId)
        const closedEntry = await createJournalEntry({
          api,
          customerId: closedId,
          key: "rt6:journal:closed:create",
          note: "visible after closure",
        })
        const closedRestorable = await createVoidedJournalEntry({
          api,
          customerId: closedId,
          suffix: "closed",
        })
        await api.post(
          `${basePath}/profile/closure`,
          { acknowledge_closure: true },
          requestConfig(closedId, "rt6:profile:close"),
        )
        const closedRead = await api.get(
          `${journalPath}/${closedEntry.data.journal_entry_id}`,
          requestConfig(closedId),
        )
        const closedWrites = await blockedJournalMutations({
          api,
          customerId: closedId,
          journalEntryId: closedEntry.data.journal_entry_id,
          revisionId: closedEntry.data.revision_id,
          restoreJournalEntryId: closedRestorable.journalEntryId,
          restoreRevisionId: closedRestorable.revisionId,
          suffix: "closed",
        })

        const deletionId = "cus_rt6_http_deletion"
        await prepareCustomer(api, deletionId)
        const deletionEntry = await createJournalEntry({
          api,
          customerId: deletionId,
          key: "rt6:journal:deletion:create",
          note: "visible after deletion request",
        })
        const deletionRestorable = await createVoidedJournalEntry({
          api,
          customerId: deletionId,
          suffix: "deletion",
        })
        await api.post(
          `${basePath}/privacy/deletion-requests`,
          { acknowledge_deletion_request: true },
          requestConfig(deletionId, "rt6:privacy:deletion"),
        )
        const deletionRead = await api.get(
          `${journalPath}/${deletionEntry.data.journal_entry_id}`,
          requestConfig(deletionId),
        )
        const deletionWrites = await blockedJournalMutations({
          api,
          customerId: deletionId,
          journalEntryId: deletionEntry.data.journal_entry_id,
          revisionId: deletionEntry.data.revision_id,
          restoreJournalEntryId: deletionRestorable.journalEntryId,
          restoreRevisionId: deletionRestorable.revisionId,
          suffix: "deletion",
        })

        expect(withdrawnRead.status).toBe(200)
        expect(outdatedRead.status).toBe(200)
        expect(closedRead.status).toBe(200)
        expect(deletionRead.status).toBe(200)
        const blockedWrites = [
          ...withdrawnWrites,
          ...outdatedWrites,
          ...closedWrites,
          ...deletionWrites,
        ]
        blockedWrites.forEach(
          (response) => expect([403, 409]).toContain(response.status),
        )
        ;[
          withdrawnRead,
          outdatedRead,
          closedRead,
          deletionRead,
          ...blockedWrites,
        ].forEach(expectPrivateNoStore)
      })

      it("replays identical keys, rejects conflicting keys, and creates once under concurrency", async () => {
        const customerId = "cus_rt6_http_idempotency"
        await prepareCustomer(api, customerId)
        const sameKey = "rt6:journal:idempotent"
        const first = await createJournalEntry({
          api,
          customerId,
          key: sameKey,
          note: "identical request",
        })
        const replay = await createJournalEntry({
          api,
          customerId,
          key: sameKey,
          note: "identical request",
        })
        const conflict = await createJournalEntry({
          api,
          customerId,
          key: sameKey,
          note: "different request",
        })
        const concurrentKey = "rt6:journal:concurrent-create"
        const concurrent = await Promise.all([
          createJournalEntry({
            api,
            customerId,
            key: concurrentKey,
            note: "one concurrent observation",
          }),
          createJournalEntry({
            api,
            customerId,
            key: concurrentKey,
            note: "one concurrent observation",
          }),
        ])
        const entries = await service(getContainer()).listResearchJournalEntries(
          {},
        )
        const matching = entries.filter((entry) =>
          [first.data.journal_entry_id, concurrent[0].data.journal_entry_id].includes(
            entry.id,
          ),
        )

        expect(first.status).toBe(201)
        expect(replay.status).toBe(201)
        expect(replay.data).toEqual(first.data)
        expect(conflict.status).toBe(409)
        expect(concurrent.map((response) => response.status)).toEqual([
          201, 201,
        ])
        expect(concurrent[0].data).toEqual(concurrent[1].data)
        expect(matching).toHaveLength(2)
        ;[first, replay, conflict, ...concurrent].forEach(expectPrivateNoStore)
      })

      it("serializes concurrent revisions and supports revise, void, restore, and pagination", async () => {
        const customerId = "cus_rt6_http_lifecycle"
        await prepareCustomer(api, customerId)
        const created = await createJournalEntry({
          api,
          customerId,
          key: "rt6:journal:lifecycle:create",
          note: "revision one",
        })
        const entryId = created.data.journal_entry_id
        const expectedRevisionId = created.data.revision_id
        const concurrentRevisions = await Promise.all([
          api.post(
            `${journalPath}/${entryId}/revise`,
            {
              ...journalBody("revision two A"),
              expected_revision_id: expectedRevisionId,
            },
            requestConfig(customerId, "rt6:journal:revise:a"),
          ),
          api.post(
            `${journalPath}/${entryId}/revise`,
            {
              ...journalBody("revision two B"),
              expected_revision_id: expectedRevisionId,
            },
            requestConfig(customerId, "rt6:journal:revise:b"),
          ),
        ])
        const successfulRevision = concurrentRevisions.find(
          (response) => response.status === 200,
        )
        expect(successfulRevision).toBeDefined()
        expect(concurrentRevisions.map((response) => response.status).sort()).toEqual(
          [200, 409],
        )

        const voided = await api.post(
          `${journalPath}/${entryId}/void`,
          {
            expected_revision_id: successfulRevision.data.revision_id,
            confirmed: true,
          },
          requestConfig(customerId, "rt6:journal:void"),
        )
        const restored = await api.post(
          `${journalPath}/${entryId}/restore`,
          {
            expected_revision_id: successfulRevision.data.revision_id,
            confirmed: true,
          },
          requestConfig(customerId, "rt6:journal:restore"),
        )
        await createJournalEntry({
          api,
          customerId,
          key: "rt6:journal:lifecycle:second",
          note: "pagination second",
        })
        await createJournalEntry({
          api,
          customerId,
          key: "rt6:journal:lifecycle:third",
          note: "pagination third",
        })
        const pageOne = await api.get(
          `${journalPath}?limit=1&offset=0&include_voided=true`,
          requestConfig(customerId),
        )
        const pageTwo = await api.get(
          `${journalPath}?limit=1&offset=1&include_voided=true`,
          requestConfig(customerId),
        )
        const revisions = await service(
          getContainer(),
        ).listResearchJournalEntryRevisions({ journal_entry_id: entryId })

        expect(voided.data.status).toBe("voided")
        expect(restored.data.status).toBe("active")
        expect(revisions).toHaveLength(2)
        expect(pageOne.data.count).toBe(3)
        expect(pageTwo.data.count).toBe(3)
        expect(pageOne.data.journal_entries).toHaveLength(1)
        expect(pageTwo.data.journal_entries).toHaveLength(1)
        expect(pageOne.data.journal_entries[0].journal_entry_id).not.toBe(
          pageTwo.data.journal_entries[0].journal_entry_id,
        )
        ;[
          ...concurrentRevisions,
          voided,
          restored,
          pageOne,
          pageTwo,
        ].forEach(expectPrivateNoStore)
      })

      it("validates optional relation ownership and never echoes rejected private content", async () => {
        const container = getContainer()
        const ownerId = "cus_rt6_http_rel_owner"
        const otherId = "cus_rt6_http_rel_other"
        await prepareCustomer(api, ownerId)
        await prepareCustomer(api, otherId)
        const trackingService = service(container)
        const [ownerProfile] = await trackingService.listResearchProfiles(
          { customer_id: ownerId },
          { take: 1 },
        )
        const [otherProfile] = await trackingService.listResearchProfiles(
          { customer_id: otherId },
          { take: 1 },
        )
        const ownerMaterial = await trackingService.createTrackedMaterials({
          profile_id: ownerProfile.id,
          product_variant_id: null,
          label: "RT-6 owned material",
          source: "manual",
          status: "active",
          activated_at: new Date(),
        })
        const ownerSupply = await trackingService.createResearchSupplies({
          tracked_material_id: ownerMaterial.id,
          source_order_line_item_id: null,
          initial_quantity_base_units: 10_000,
          remaining_quantity_base_units: 10_000,
          base_unit: "microgram",
          acquired_at: new Date(),
          lot_number: null,
          batch_number: null,
          expires_at: null,
          storage_note: null,
          status: "active",
        })
        const otherMaterial = await trackingService.createTrackedMaterials({
          profile_id: otherProfile.id,
          product_variant_id: null,
          label: "RT-6 foreign material",
          source: "manual",
          status: "active",
          activated_at: new Date(),
        })
        const otherSupply = await trackingService.createResearchSupplies({
          tracked_material_id: otherMaterial.id,
          source_order_line_item_id: null,
          initial_quantity_base_units: 10_000,
          remaining_quantity_base_units: 10_000,
          base_unit: "microgram",
          acquired_at: new Date(),
          lot_number: null,
          batch_number: null,
          expires_at: null,
          storage_note: null,
          status: "active",
        })
        const ownerRelations = await createRoutineRelationFixture({
          trackingService,
          profileId: ownerProfile.id,
          materialId: ownerMaterial.id,
          supplyId: ownerSupply.id,
          suffix: "owner",
        })
        const otherRelations = await createRoutineRelationFixture({
          trackingService,
          profileId: otherProfile.id,
          materialId: otherMaterial.id,
          supplyId: otherSupply.id,
          suffix: "other",
        })
        const ineligibleRelations = await createRoutineRelationFixture({
          trackingService,
          profileId: ownerProfile.id,
          materialId: ownerMaterial.id,
          supplyId: ownerSupply.id,
          suffix: "voided",
          logStatus: "voided",
        })
        const owned = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:owned-relations",
          note: "owned relation",
          relations: {
            tracked_material_id: ownerMaterial.id,
            supply_id: ownerSupply.id,
            routine_id: ownerRelations.routineId,
            confirmed_log_id: ownerRelations.logId,
          },
        })
        const foreignMaterial = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:foreign-material",
          note: "must not persist",
          relations: { tracked_material_id: otherMaterial.id },
        })
        const foreignSupply = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:foreign-supply",
          note: "must not persist",
          relations: { supply_id: otherSupply.id },
        })
        const foreignRoutine = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:foreign-routine",
          note: "must not persist",
          relations: { routine_id: otherRelations.routineId },
        })
        const foreignLog = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:foreign-log",
          note: "must not persist",
          relations: { confirmed_log_id: otherRelations.logId },
        })
        const ineligibleLog = await createJournalEntry({
          api,
          customerId: ownerId,
          key: "rt6:journal:ineligible-log",
          note: "must not persist",
          relations: { confirmed_log_id: ineligibleRelations.logId },
        })
        const privateMarker = "rt6-private-validation-marker"
        const logger = container.resolve<{
          debug: (...args: unknown[]) => unknown
          info: (...args: unknown[]) => unknown
          warn: (...args: unknown[]) => unknown
          error: (...args: unknown[]) => unknown
        }>(ContainerRegistrationKeys.LOGGER)
        const loggerSpies = [
          jest.spyOn(logger, "debug"),
          jest.spyOn(logger, "info"),
          jest.spyOn(logger, "warn"),
          jest.spyOn(logger, "error"),
        ]
        let invalid: any
        let telemetryOutput = ""
        try {
          invalid = await api.post(
            journalPath,
            journalBody(
              `${privateMarker}${"x".repeat(RESEARCH_JOURNAL_NOTE_MAX_LENGTH)}`,
            ),
            requestConfig(ownerId, "rt6:journal:invalid"),
          )
          telemetryOutput = loggerSpies
            .flatMap((spy) => spy.mock.calls)
            .map((call) => inspect(call, { depth: 8 }))
            .join("\n")
        } finally {
          loggerSpies.forEach((spy) => spy.mockRestore())
        }

        expect(owned.status).toBe(201)
        ;[
          foreignMaterial,
          foreignSupply,
          foreignRoutine,
          foreignLog,
        ].forEach((response) => expect(response.status).toBe(404))
        expect(ineligibleLog.status).toBe(409)
        expect(invalid.status).toBe(400)
        expect(JSON.stringify(invalid.data)).not.toContain(privateMarker)
        expect(telemetryOutput).not.toContain(privateMarker)
        ;[
          owned,
          foreignMaterial,
          foreignSupply,
          foreignRoutine,
          foreignLog,
          ineligibleLog,
          invalid,
        ].forEach(expectPrivateNoStore)
      })

      it("rolls back partial Journal writes when revision persistence fails", async () => {
        const container = getContainer()
        const customerId = "cus_rt6_http_compensation"
        await prepareCustomer(api, customerId)
        const trackingService = service(container)
        const before = await journalWriteCounts(container)
        const revisionWrite = jest
          .spyOn(trackingService, "createResearchJournalEntryRevisions")
          .mockRejectedValueOnce(new Error("injected RT-6 revision failure"))

        let failed: any
        try {
          failed = await createJournalEntry({
            api,
            customerId,
            key: "rt6:journal:compensation",
            note: "must roll back",
          })
        } finally {
          revisionWrite.mockRestore()
        }

        const after = await journalWriteCounts(container)
        expect(failed.status).toBe(500)
        expectPrivateNoStore(failed)
        expect(after.entries).toBe(before.entries)
        expect(after.revisions).toBe(before.revisions)
        expect(after.transitions).toBe(before.transitions)
        expect(after.mutations).toBe(before.mutations + 1)
        const mutations = await trackingService.listResearchJournalMutations({
          idempotency_key: "rt6:journal:compensation",
        })
        expect(mutations).toEqual([
          expect.objectContaining({ status: "failed" }),
        ])
      })

      it("leaves RT-5 tracking and Medusa commerce records unchanged", async () => {
        const customerId = "cus_rt6_http_isolation"
        await prepareCustomer(api, customerId)
        const beforeRt5 = await rt5Fingerprint(dbConnection)
        const beforeCommerce = await commerceFingerprint(dbConnection)
        const created = await createJournalEntry({
          api,
          customerId,
          key: "rt6:journal:isolation:create",
          note: "isolated observation",
        })
        const voided = await api.post(
          `${journalPath}/${created.data.journal_entry_id}/void`,
          {
            expected_revision_id: created.data.revision_id,
            confirmed: true,
          },
          requestConfig(customerId, "rt6:journal:isolation:void"),
        )
        const afterRt5 = await rt5Fingerprint(dbConnection)
        const afterCommerce = await commerceFingerprint(dbConnection)

        expect(voided.status).toBe(200)
        expect(afterRt5).toEqual(beforeRt5)
        expect(afterCommerce).toEqual(beforeCommerce)
        ;[created, voided].forEach(expectPrivateNoStore)
      })
    })
  },
})
