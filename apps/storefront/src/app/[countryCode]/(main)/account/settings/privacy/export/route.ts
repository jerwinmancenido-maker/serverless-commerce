import { NextResponse } from "next/server"

import { retrieveResearchAgreementStatus } from "@lib/data/research-agreement"
import {
  retrieveResearchJournalEntries,
  retrieveResearchMeasurements,
  retrieveResearchProtocolAccesses,
  retrieveResearchReplenishmentProjections,
  retrieveResearchRoutineLogs,
  retrieveResearchRoutines,
  retrieveResearchTimeline,
  retrieveTrackedResearchMaterials,
  retrieveResearchProfile,
} from "@lib/data/research-tracking"
import {
  listResearchCommunityThreads,
  retrieveResearchCommunityIdentity,
} from "@lib/data/research-protocols"
import {
  listSupportConversations,
  retrieveSupportConversation,
} from "@lib/data/customer-support"
import {
  retrieveCustomerNotificationExport,
} from "@lib/data/customer-notifications"

export async function GET() {
  try {
    const [
      agreement,
      profile,
      protocols,
      materials,
      routines,
      routineLogs,
      measurements,
      journal,
      timeline,
      replenishment,
      customerNotifications,
    ] = await Promise.all([
      retrieveResearchAgreementStatus(),
      retrieveResearchProfile(),
      retrieveResearchProtocolAccesses(),
      retrieveTrackedResearchMaterials(),
      retrieveResearchRoutines(),
      retrieveResearchRoutineLogs(),
      retrieveResearchMeasurements(),
      retrieveResearchJournalEntries({ limit: 10_000, offset: 0 }),
      retrieveResearchTimeline(),
      retrieveResearchReplenishmentProjections(),
      retrieveCustomerNotificationExport(),
    ])
    const [communityIdentity, community, supportList] = await Promise.all([
      retrieveResearchCommunityIdentity().catch(() => ({ identity: null })),
      Promise.all(
        Array.from(new Set(protocols.map((item) => item.protocol_handle))).map(
          async (handle) => ({
            protocol_handle: handle,
            ...(await listResearchCommunityThreads(handle).catch(() => ({ threads: [], count: 0 }))),
          }),
        ),
      ),
      listSupportConversations().catch(() => ({ conversations: [] })),
    ])
    const support = await Promise.all(
      supportList.conversations.map((conversation) =>
        retrieveSupportConversation(conversation.id)
          .then((result) => result.conversation)
          .catch(() => conversation),
      ),
    )
    const body = JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        agreement,
        profile,
        protocols,
        materials,
        routines,
        routine_logs: routineLogs,
        measurements,
        journal,
        timeline,
        replenishment,
        community_identity: communityIdentity.identity,
        community,
        customer_support: support,
        notifications: customerNotifications.notifications,
        notification_preferences: customerNotifications.preferences,
      },
      null,
      2,
    )

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="research-hub-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  } catch {
    return NextResponse.json(
      { message: "Your private records could not be exported." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    )
  }
}
