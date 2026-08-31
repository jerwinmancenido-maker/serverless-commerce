import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

import { bindOrderResearchProtocolsWorkflow } from "../workflows/bind-order-research-protocols"

export default async function bindOrderResearchProtocols({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  await bindOrderResearchProtocolsWorkflow(container).run({ input: { order_id: data.id } })
}

export const config: SubscriberConfig = { event: "order.placed" }
