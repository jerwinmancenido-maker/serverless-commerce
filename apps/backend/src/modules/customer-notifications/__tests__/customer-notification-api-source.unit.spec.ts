import { readFileSync } from "node:fs"
import { join } from "node:path"

const root = join(process.cwd(), "src/api/store/customers/me")

describe("customer notification API source boundary", () => {
  it.each([
    "notifications/route.ts",
    "notifications/unread-count/route.ts",
    "notifications/export/route.ts",
    "notifications/[id]/action/route.ts",
    "notifications/actions/route.ts",
    "notification-preferences/route.ts",
  ])("keeps %s authenticated, customer-scoped, and private", (relative) => {
    const source = readFileSync(join(root, relative), "utf8")
    expect(source).toContain("AuthenticatedMedusaRequest")
    expect(source).toContain("req.auth_context.actor_id")
    expect(source).toContain("private, no-store")
  })

  it("validates all customer mutations", () => {
    const source = readFileSync(join(root, "notifications/middlewares.ts"), "utf8")
    expect(source).toContain("StoreMutateCustomerNotification")
    expect(source).toContain("StoreBulkCustomerNotificationAction")
    expect(source).toContain("StoreUpdateCustomerNotificationPreferences")
  })

  it("keeps notification errors private", () => {
    const source = readFileSync(join(process.cwd(), "src/api/middlewares.ts"), "utf8")
    expect(source).toContain("isPrivateCustomerNotificationRequest")
    expect(source).toContain('res.setHeader("Cache-Control", "private, no-store")')
  })

  it("fans protocol revisions out asynchronously in bounded idempotent batches", () => {
    const workflow = readFileSync(
      join(process.cwd(), "src/workflows/manage-research-protocol.ts"),
      "utf8",
    )
    const fanout = readFileSync(
      join(
        process.cwd(),
        "src/workflows/steps/emit-protocol-notifications.ts",
      ),
      "utf8",
    )
    const subscriber = readFileSync(
      join(
        process.cwd(),
        "src/subscribers/notify-protocol-revision-customers.ts",
      ),
      "utf8",
    )
    expect(workflow).toContain("emitEventStep")
    expect(workflow).toContain("customer-notifications.protocol-revision")
    expect(fanout).toContain("ACCESS_BATCH_SIZE = 250")
    expect(fanout).toContain("RECIPIENT_BATCH_SIZE = 25")
    expect(fanout).toContain("skip: offset")
    expect(fanout).not.toContain("take: 10_000")
    expect(fanout).toContain(
      "source_id: `${input.operation}:${revision.id}:${customerId}`",
    )
    expect(subscriber).toContain(
      'event: "customer-notifications.protocol-revision"',
    )
  })
})
