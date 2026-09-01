import { readFileSync } from "node:fs"
import { join } from "node:path"

import {
  NOTIFICATION_EVENT_CATALOG,
  NOTIFICATION_EVENT_KEYS,
  NOTIFICATION_TARGET_KINDS,
  renderNotificationTemplate,
  sanitizeNotificationMetadata,
  validateNotificationTemplate,
} from "../catalog"
import { projectCustomerNotification } from "../projection"
import { customerNotificationIdempotencyKey } from "../../../workflows/steps/manage-customer-notifications"

describe("customer notification contract", () => {
  it("registers each event exactly once with valid plain-text templates", () => {
    expect(Object.keys(NOTIFICATION_EVENT_CATALOG).sort()).toEqual([...NOTIFICATION_EVENT_KEYS].sort())
    for (const event of Object.values(NOTIFICATION_EVENT_CATALOG)) {
      expect(() => validateNotificationTemplate({
        title: event.title_template,
        body: event.body_template,
        allowed: event.allowed_variables,
      })).not.toThrow()
    }
  })

  it("rejects unknown variables and HTML", () => {
    expect(() => validateNotificationTemplate({ title: "Hello {{unknown}}", body: "Update", allowed: [] })).toThrow("Unknown template variables")
    expect(() => validateNotificationTemplate({ title: "Hello", body: "<b>Update</b>", allowed: [] })).toThrow("HTML is not allowed")
    expect(renderNotificationTemplate("You earned {{points}} points", { points: 12 })).toBe("You earned 12 points")
  })

  it("keeps operational notifications mandatory and prompts snoozable", () => {
    expect(NOTIFICATION_EVENT_CATALOG["support.reply_received"].customer_can_disable).toBe(false)
    expect(NOTIFICATION_EVENT_CATALOG["reward.points_reversed"].customer_can_disable).toBe(false)
    expect(NOTIFICATION_EVENT_CATALOG["protocol.access_changed"].customer_can_disable).toBe(false)
    expect(NOTIFICATION_EVENT_CATALOG["community.moderation_completed"].customer_can_disable).toBe(false)
    expect(NOTIFICATION_EVENT_CATALOG["research.routine_reminder"].snoozable).toBe(true)
    expect(NOTIFICATION_EVENT_CATALOG["reward.points_earned"].snoozable).toBe(false)
  })

  it("uses deterministic customer, event, and source idempotency", () => {
    const value = customerNotificationIdempotencyKey({ customerId: "cus_1", eventKey: "support.reply_received", sourceId: "msg_1" })
    expect(value).toBe(customerNotificationIdempotencyKey({ customerId: "cus_1", eventKey: "support.reply_received", sourceId: "msg_1" }))
    expect(value).not.toBe(customerNotificationIdempotencyKey({ customerId: "cus_2", eventKey: "support.reply_received", sourceId: "msg_1" }))
  })

  it("projects only customer-safe fields and semantic targets", () => {
    const projection = projectCustomerNotification({
      id: "noti_1",
      customer_id: "cus_private",
      event_key: "support.reply_received",
      category: "support",
      priority: "high",
      title: "Support replied",
      body: "There is a new reply.",
      status: "unread",
      action_label: "Open conversation",
      target_kind: "support_conversation",
      target_id: "support_1",
      secondary_target_id: null,
      available_at: new Date(),
      read_at: null,
      snoozed_until: null,
      created_at: new Date(),
      metadata: { private: "must not leave" },
      idempotency_key: "secret",
      template_revision_id: "revision_1",
    })
    expect(NOTIFICATION_TARGET_KINDS).toContain(projection.target.kind)
    expect(projection).not.toHaveProperty("customer_id")
    expect(projection).not.toHaveProperty("metadata")
    expect(projection).not.toHaveProperty("idempotency_key")
    expect(projection).not.toHaveProperty("template_revision_id")
  })

  it("drops unregistered metadata", () => {
    expect(sanitizeNotificationMetadata({ occurrence_id: "occ_1", weight: 70, journal_text: "private" })).toEqual({ occurrence_id: "occ_1" })
  })

  it("keeps Support and Community compatibility independent of Research Profiles", () => {
    const source = readFileSync(join(process.cwd(), "src/modules/research-tracking/customer-notifications.ts"), "utf8")
    expect(source).toContain("emitCustomerNotificationWorkflow")
    expect(source).not.toContain("listResearchProfiles")
    expect(source).not.toContain("createResearchNotifications")
  })
})
