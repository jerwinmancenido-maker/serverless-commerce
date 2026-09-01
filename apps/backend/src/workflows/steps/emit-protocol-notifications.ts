import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEARCH_CONTENT_MODULE } from "../../modules/research-content"
import type ResearchContentModuleService from "../../modules/research-content/service"
import { emitCustomerNotificationWorkflow } from "../manage-customer-notifications"

export type ProtocolRevisionNotificationEvent = {
  series_id: string
  revision_id: string
  operation: "published" | "withdrawn"
}

const ACCESS_BATCH_SIZE = 250
const RECIPIENT_BATCH_SIZE = 25

const chunks = <T>(values: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size))
  }
  return result
}

export async function emitProtocolRevisionNotificationsInBatches(
  container: MedusaContainer,
  input: ProtocolRevisionNotificationEvent,
) {
  const service = container.resolve<ResearchContentModuleService>(
    RESEARCH_CONTENT_MODULE,
  )
  const [series] = await service.listResearchProtocolSeries(
    { id: input.series_id },
    { take: 1 },
  )
  const [revision] = await service.listResearchProtocols(
    { id: input.revision_id, series_id: input.series_id },
    { take: 1 },
  )
  if (!series || !revision) return { notified_count: 0, batch_count: 0 }

  const revisions = await service.listResearchProtocols({
    series_id: input.series_id,
  })
  const revisionIds = revisions.map((item) => item.id)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationIds = new Set<string>()
  let offset = 0
  let batchCount = 0

  while (true) {
    const accesses = await service.listResearchProtocolOrderAccesses(
      { revision_id: revisionIds, revoked_at: null },
      { take: ACCESS_BATCH_SIZE, skip: offset, order: { id: "ASC" } },
    )
    if (!accesses.length) break
    batchCount += 1
    offset += accesses.length
    const orderIds = [...new Set(accesses.map((item) => item.order_id))]
    const { data: orders } = orderIds.length
      ? await query.graph({
          entity: "order",
          fields: ["id", "customer_id"],
          filters: { id: orderIds },
        })
      : { data: [] }
    const customerIds = [
      ...new Set(
        (orders as Array<{ customer_id?: string | null }>)
          .map((item) => item.customer_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ]

    for (const recipients of chunks(customerIds, RECIPIENT_BATCH_SIZE)) {
      const results = await Promise.all(
        recipients.map((customerId) =>
          emitCustomerNotificationWorkflow(container).run({
            input: {
              customer_id: customerId,
              event_key:
                input.operation === "published"
                  ? "protocol.revision_published"
                  : "protocol.current_revision_withdrawn",
              source_id: `${input.operation}:${revision.id}:${customerId}`,
              variables: { protocol_title: revision.title },
              target_kind: "protocol",
              target_id: series.protocol_key,
              secondary_target_id: revision.id,
              metadata: {},
            },
          }),
        ),
      )
      for (const { result } of results) {
        if (result?.id) notificationIds.add(result.id)
      }
    }

    if (accesses.length < ACCESS_BATCH_SIZE) break
  }

  return {
    notified_count: notificationIds.size,
    batch_count: batchCount,
  }
}
