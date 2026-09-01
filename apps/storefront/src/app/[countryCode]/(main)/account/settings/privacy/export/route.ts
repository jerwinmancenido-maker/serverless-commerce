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
    ])
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
