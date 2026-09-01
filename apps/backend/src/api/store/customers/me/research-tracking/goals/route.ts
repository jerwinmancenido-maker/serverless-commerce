import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { RESEARCH_TRACKING_MODULE } from "../../../../../../modules/research-tracking"
import type ResearchTrackingModuleService from "../../../../../../modules/research-tracking/service"
import type { StoreCreatePersonalGoalType } from "../../../../../../modules/research-tracking/contracts/goals"
import { researchGoalProgress } from "../../../../../../modules/research-tracking/queries/goals"
import { createResearchPersonalGoalWorkflow } from "../../../../../../workflows/manage-research-personal-goals"
import { setResearchPrivateNoStore } from "../utils"

const localToday = (timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const service = req.scope.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
  const [profile] = await service.listResearchProfiles({ customer_id: req.auth_context.actor_id }, { take: 1 })
  if (!profile) return res.json({ goals: [], streaks: { routine: 0 } })
  const { progress, routineStreak } = await researchGoalProgress(service, profile.id, localToday(profile.timezone))
  res.json({
    goals: progress.map((item) => ({
      id: item.goal.id,
      title: item.goal.title,
      goal_type: item.goal.goal_type,
      target_count: item.target,
      current_count: item.current,
      progress_percent: item.progress_percent,
      period: item.goal.period,
      routine_id: item.goal.routine_id,
      starts_on: item.goal.starts_on,
      ends_on: item.goal.ends_on,
      status: item.goal.status,
      achieved: item.achieved,
    })),
    streaks: {
      routine: routineStreak,
    },
  })
}

export async function POST(req: AuthenticatedMedusaRequest<StoreCreatePersonalGoalType>, res: MedusaResponse) {
  setResearchPrivateNoStore(res)
  const { result } = await createResearchPersonalGoalWorkflow(req.scope).run({ input: { customerId: req.auth_context.actor_id, goal: req.validatedBody } })
  res.status(201).json({ goal: result })
}
