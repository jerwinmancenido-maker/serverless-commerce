import { model } from "@medusajs/framework/utils"

import ResearchProfile from "./research-profile"

const ResearchPersonalGoal = model
  .define("research_personal_goal", {
    id: model.id().primaryKey(),
    profile: model.belongsTo(() => ResearchProfile, { mappedBy: "personal_goals" }),
    goal_type: model.enum(["routine_completions", "journal_days", "measurements", "routine_streak"]),
    title: model.text(),
    target_count: model.number(),
    period: model.enum(["weekly", "monthly", "ongoing"]),
    routine_id: model.text().nullable(),
    starts_on: model.dateTime(),
    ends_on: model.dateTime().nullable(),
    status: model.enum(["active", "completed", "archived"]).default("active"),
    completed_at: model.dateTime().nullable(),
  })
  .indexes([{ on: ["profile_id", "status", "starts_on"] }])

export default ResearchPersonalGoal
