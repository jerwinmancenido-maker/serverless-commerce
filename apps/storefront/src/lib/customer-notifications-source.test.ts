import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const source = (relative: string) => readFileSync(join(process.cwd(), "src", relative), "utf8")

test("signed-in navigation owns a compact notification bell", () => {
  const layout = source("app/[countryCode]/(main)/layout.tsx")
  const nav = source("modules/layout/templates/nav/index.tsx")
  const bell = source("modules/layout/components/notification-bell/index.tsx")
  assert.match(layout, /<Nav signedIn=\{Boolean\(customer\)\}/)
  assert.match(nav, /signedIn \? <NotificationBell/)
  assert.match(bell, /99\+/)
  assert.match(bell, /BroadcastChannel/)
  assert.match(bell, /60_000/)
  assert.match(bell, /small:absolute/)
})

test("full center and settings expose account-wide controls", () => {
  const center = source("modules/account/components/notification-center/index.tsx")
  const preferences = source("modules/account/components/notification-preferences/index.tsx")
  const researchInbox = source("modules/account/components/research-tracking/notification-inbox.tsx")
  assert.match(center, /Mark all as read/)
  assert.match(center, /Snooze 1 day/)
  assert.match(center, /Archive/)
  assert.match(center, /Reminders/)
  assert.match(preferences, /Required account or service update/)
  assert.match(preferences, /Coming later/)
  assert.match(researchInbox, /listCustomerNotifications\(\{ category: "research"/)
  assert.match(researchInbox, /mutateCustomerNotification/)
  assert.doesNotMatch(researchInbox, /legacyNotifications\.map/)
})

test("storefront uses semantic country-aware targets without arbitrary URLs", () => {
  const bell = source("modules/layout/components/notification-bell/index.tsx")
  assert.match(bell, /resolveNotificationHref/)
  assert.match(bell, /support_conversation/)
  assert.match(bell, /community_thread/)
  assert.match(bell, /research_hub_section/)
  assert.doesNotMatch(bell, /target\.url/)
})
