import { readFileSync } from "node:fs"
import { join } from "node:path"

import { hasExpectedSupportAttachmentSignature } from "../../../workflows/steps/manage-support-attachment"
import { supportUnreadCount } from "../unread"
import {
  SUPPORT_AGENT_RESOURCES,
  SUPPORT_MANAGER_RESOURCES,
  planSupportRolePolicySync,
} from "../role-configuration"
import {
  StoreCreateSupportConversation,
  parseStoreCreateSupportConversationPayload,
  parseStoreCreateSupportReplyPayload,
  parseStoreMutateSupportConversationPayload,
} from "../contracts"

const source = (path: string) => readFileSync(join(process.cwd(), "src", path), "utf8")

describe("customer support boundaries", () => {
  it("registers separate agent and manager policy resources", () => {
    const policies = source("policies/customer-support.ts")
    const middleware = source("api/admin/customer-support/middlewares.ts")
    expect(policies).toContain('resource: "customer_support_reply"')
    expect(policies).toContain('resource: "customer_support_assign"')
    expect(policies).toContain('resource: "customer_support_settings"')
    expect(middleware).toContain('resource: "customer_support_reply"')
    expect(middleware).toContain('resource: "customer_support_assign"')
  })

  it("keeps customer and staff attachments behind distinct ownership and permission checks", () => {
    const customer = source("api/store/customers/me/support/[conversationId]/messages/[messageId]/attachments/route.ts")
    const staff = source("api/admin/customer-support/[conversationId]/messages/[messageId]/attachments/route.ts")
    const middleware = source("api/admin/customer-support/middlewares.ts")
    expect(customer).toContain('actorType: "customer"')
    expect(staff).toContain('actorType: "staff"')
    expect(middleware).toContain('resource: "customer_support_attachment"')
  })

  it("recognizes only the supported file signatures", () => {
    expect(hasExpectedSupportAttachmentSignature(Buffer.from([0xff, 0xd8, 0xff, 0x00]), "image/jpeg")).toBe(true)
    expect(hasExpectedSupportAttachmentSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png")).toBe(true)
    expect(hasExpectedSupportAttachmentSignature(Buffer.from("%PDF-1.7"), "application/pdf")).toBe(true)
    expect(hasExpectedSupportAttachmentSignature(Buffer.from("<script>"), "application/pdf")).toBe(false)
  })

  it("keeps Research Hub records out of support context and storefront persistence", () => {
    const contract = source("modules/customer-support/contracts.ts")
    const panel = readFileSync(
      join(process.cwd(), "../storefront/src/modules/layout/components/support-panel/index.tsx"),
      "utf8",
    )
    expect(contract).not.toContain("journal_id")
    expect(contract).not.toContain("measurement_id")
    expect(contract).not.toContain("routine_id")
    expect(panel).not.toContain("JSON.stringify(conversation)")
  })

  it("counts customer and system messages for the correct recipient only", async () => {
    const sentAt = new Date("2026-09-01T08:00:00.000Z")
    const service = {
      listSupportParticipants: jest.fn().mockResolvedValue([{ last_read_at: new Date("2026-09-01T07:00:00.000Z") }]),
      listSupportMessages: jest.fn().mockResolvedValue([
        { sender_type: "customer", sent_at: sentAt },
        { sender_type: "staff", sent_at: sentAt },
        { sender_type: "system", sent_at: sentAt },
      ]),
    }

    await expect(supportUnreadCount(service as any, "conversation_1", "customer", "customer_1")).resolves.toBe(2)
    await expect(supportUnreadCount(service as any, "conversation_1", "staff", "user_1")).resolves.toBe(1)
  })

  it("creates a distinctly labeled automatic acknowledgement only when enabled", () => {
    const workflow = source("workflows/steps/manage-customer-support.ts")
    const customerRoute = source("api/store/customers/me/support/[conversationId]/route.ts")
    expect(workflow).toContain("settings.auto_acknowledgement_enabled")
    expect(workflow).toContain('sender_type: "system"')
    expect(customerRoute).toContain('"Automatic confirmation"')
  })

  it("validates public support fields without treating authenticated workflow context as request data", () => {
    const conversation = parseStoreCreateSupportConversationPayload({
      subject: "Local acceptance conversation",
      category: "technical",
      body: "Please help with this local acceptance issue.",
      order_id: null,
      protocol_series_id: null,
      client_request_id: "request-12345678",
      customer_id: "customer_1",
    } as any)
    const reply = parseStoreCreateSupportReplyPayload({
      body: "Here is a customer follow-up.",
      client_request_id: "reply-12345678",
      customer_id: "customer_1",
      conversation_id: "conversation_1",
    } as any)
    const mutation = parseStoreMutateSupportConversationPayload({
      action: "close",
      customer_id: "customer_1",
      conversation_id: "conversation_1",
    } as any)

    expect(conversation).not.toHaveProperty("customer_id")
    expect(reply).not.toHaveProperty("customer_id")
    expect(reply).not.toHaveProperty("conversation_id")
    expect(mutation).toEqual({ action: "close" })
    expect(() =>
      StoreCreateSupportConversation.parse({
        ...conversation,
        customer_id: "customer_from_request_body",
      }),
    ).toThrow(/Unrecognized key/)
  })

  it("keeps Support role configuration idempotent and removes obsolete links", () => {
    expect(
      planSupportRolePolicySync(
        [
          { id: "link_read", policy_id: "policy_read" },
          { id: "link_obsolete", policy_id: "policy_obsolete" },
        ],
        ["policy_read", "policy_reply"],
      ),
    ).toEqual({
      createPolicyIds: ["policy_reply"],
      deleteRolePolicyIds: ["link_obsolete"],
    })
    expect(
      planSupportRolePolicySync(
        [{ id: "link_read", policy_id: "policy_read" }],
        ["policy_read"],
      ),
    ).toEqual({ createPolicyIds: [], deleteRolePolicyIds: [] })
  })

  it("keeps assignment, settings, and reporting permissions manager-only", () => {
    expect(SUPPORT_AGENT_RESOURCES).not.toContain("customer_support_assign")
    expect(SUPPORT_AGENT_RESOURCES).not.toContain("customer_support_settings")
    expect(SUPPORT_AGENT_RESOURCES).not.toContain("customer_support_reporting")
    expect(SUPPORT_MANAGER_RESOURCES).toEqual(
      expect.arrayContaining([
        "customer_support_assign",
        "customer_support_settings",
        "customer_support_reporting",
      ]),
    )
  })
})
