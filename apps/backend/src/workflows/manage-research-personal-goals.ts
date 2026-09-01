import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"

import { RESEARCH_TRACKING_MODULE } from "../modules/research-tracking"
import type ResearchTrackingModuleService from "../modules/research-tracking/service"
import type { StoreCreatePersonalGoalType, StoreMutatePersonalGoalType } from "../modules/research-tracking/contracts/goals"
import { researchGoalProgress } from "../modules/research-tracking/queries/goals"

async function profile(service: ResearchTrackingModuleService, customerId: string) {
  const [record] = await service.listResearchProfiles({ customer_id: customerId, status: "active" }, { take: 1 })
  if (!record) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "research_profile_action_required")
  return record
}

const createGoalStep = createStep(
  "create-goal",
  async (input: { customerId: string; goal: StoreCreatePersonalGoalType }, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const owner = await profile(service, input.customerId)
    if (input.goal.routine_id) {
      const [routine] = await service.listResearchRoutines({ id: input.goal.routine_id, profile_id: owner.id }, { take: 1 })
      if (!routine) throw new MedusaError(MedusaError.Types.NOT_FOUND, "routine_not_found")
    }
    const startsOn = new Date(`${input.goal.starts_on}T00:00:00.000Z`)
    const endsOn = input.goal.ends_on ? new Date(`${input.goal.ends_on}T23:59:59.999Z`) : null
    if (endsOn && endsOn < startsOn) throw new MedusaError(MedusaError.Types.INVALID_DATA, "goal_date_range_invalid")
    const goal = await service.createResearchPersonalGoals({
      profile_id: owner.id,
      goal_type: input.goal.goal_type,
      title: input.goal.title,
      target_count: input.goal.target_count,
      period: input.goal.period,
      routine_id: input.goal.routine_id,
      starts_on: startsOn,
      ends_on: endsOn,
      status: "active",
      completed_at: null,
    })
    return new StepResponse(goal, goal.id)
  },
  async (id, { container }) => {
    if (id) await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).deleteResearchPersonalGoals(id)
  },
)

const mutateGoalStep = createStep(
  "mutate-goal",
  async (input: { customerId: string; goalId: string; mutation: StoreMutatePersonalGoalType }, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const owner = await profile(service, input.customerId)
    const [goal] = await service.listResearchPersonalGoals({ id: input.goalId, profile_id: owner.id }, { take: 1 })
    if (!goal) throw new MedusaError(MedusaError.Types.NOT_FOUND, "goal_not_found")
    const prior = { id: goal.id, status: goal.status, completed_at: goal.completed_at }
    const updated = await service.updateResearchPersonalGoals({ id: goal.id, status: input.mutation.action === "archive" ? "archived" : "active", completed_at: input.mutation.action === "restore" ? null : goal.completed_at })
    return new StepResponse(updated, prior)
  },
  async (prior, { container }) => {
    if (prior) await container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE).updateResearchPersonalGoals(prior)
  },
)

const evaluateGoalsStep = createStep(
  "evaluate-goals",
  async (input: { customerId: string; today: string }, { container }) => {
    const service = container.resolve<ResearchTrackingModuleService>(RESEARCH_TRACKING_MODULE)
    const owner = await profile(service, input.customerId)
    const { progress } = await researchGoalProgress(service, owner.id, input.today)
    const completed: string[] = []
    for (const item of progress) {
      if (item.goal.status === "active" && item.achieved) {
        await service.updateResearchPersonalGoals({ id: item.goal.id, status: "completed", completed_at: new Date() })
        completed.push(item.goal.id)
      }
    }
    return new StepResponse({ completed })
  },
)

export const createResearchPersonalGoalWorkflow = createWorkflow(
  "create-research-personal-goal",
  (input: { customerId: string; goal: StoreCreatePersonalGoalType }) => new WorkflowResponse(createGoalStep(input)),
)

export const mutateResearchPersonalGoalWorkflow = createWorkflow(
  "mutate-research-personal-goal",
  (input: { customerId: string; goalId: string; mutation: StoreMutatePersonalGoalType }) => new WorkflowResponse(mutateGoalStep(input)),
)

export const evaluateResearchPersonalGoalsWorkflow = createWorkflow(
  "evaluate-research-personal-goals",
  (input: { customerId: string; today: string }) => new WorkflowResponse(evaluateGoalsStep(input)),
)
