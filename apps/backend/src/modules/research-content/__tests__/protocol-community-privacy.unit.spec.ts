import { readFileSync } from "node:fs"
import { join } from "node:path"

const src = (path: string) => readFileSync(join(process.cwd(), "src", path), "utf8")

describe("protocol access, community, and support source boundaries", () => {
  it("projects public protocol responses instead of returning stored content", () => {
    for (const path of [
      "api/store/research-protocols/route.ts",
      "api/store/research-protocols/[handle]/route.ts",
    ]) {
      const route = src(path)
      expect(route).toContain("buildPublicResearchProtocolContent")
      expect(route).not.toMatch(/content:\s*ResearchProtocolContent\.parse/)
    }
  })

  it("does not expose public comments or customer identity fields", () => {
    const publicComments = src("api/store/research-protocols/[handle]/comments/route.ts")
    const view = src("modules/research-content/community-view.ts")
    expect(publicComments).toContain("comments: []")
    expect(view).not.toContain("customer_id:")
    expect(view).not.toContain("order_id:")
    expect(view).not.toContain("email:")
  })

  it("keeps support and community in separate modules and policy resources", () => {
    const config = src("../medusa-config.ts")
    const supportMiddleware = src("api/admin/customer-support/middlewares.ts")
    const protocolMiddleware = src("api/admin/research-protocols/middlewares.ts")
    expect(config).toContain('resolve: "./src/modules/customer-support"')
    expect(supportMiddleware).toContain('resource: "customer_support"')
    expect(protocolMiddleware).toContain('resource: "research_community"')
  })

  it("never returns internal support notes through the customer detail API", () => {
    const route = src("api/store/customers/me/support/[conversationId]/route.ts")
    expect(route).not.toContain("listSupportInternalNotes")
    expect(route).not.toContain("internal_notes")
  })

  it("keeps saved replies and customer attachments behind support permissions", () => {
    const middleware = src("api/admin/customer-support/middlewares.ts")
    const customerAttachment = src(
      "api/store/customers/me/support/attachments/[attachmentId]/file/route.ts",
    )
    const savedResponses = src("api/admin/support-saved-responses/route.ts")
    expect(middleware).toContain('matcher: "/admin/support-saved-responses"')
    expect(middleware).toContain("PolicyOperation.read")
    expect(savedResponses).not.toContain("/store/")
    expect(customerAttachment).toContain("customer_id: req.auth_context.actor_id")
    expect(customerAttachment).toContain('"private, no-store"')
  })

  it("uses separate private preferences for community and support notifications", () => {
    const preference = src(
      "modules/research-tracking/models/research-reminder-preference.ts",
    )
    const helper = src(
      "modules/research-tracking/customer-notifications.ts",
    )
    const delivery = src(
      "workflows/steps/manage-customer-notifications.ts",
    )
    expect(preference).toContain("community_reply_notifications")
    expect(preference).toContain("community_moderation_notifications")
    expect(preference).toContain("support_reply_notifications")
    expect(delivery).toContain('channel: "in_app"')
    expect(helper).not.toContain('channel: "email"')
    expect(delivery).not.toContain('channel: "email"')
  })
})
