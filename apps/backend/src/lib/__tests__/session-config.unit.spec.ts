import { readFileSync } from "node:fs"
import { join } from "node:path"

import { resolveSessionProjectConfig } from "../session-config"

const backendRoot = join(__dirname, "../../..")

describe("Medusa session configuration", () => {
  it("maps Redis and session environment settings into projectConfig", () => {
    expect(
      resolveSessionProjectConfig({
        REDIS_URL: "redis://localhost:6379",
        REDIS_PREFIX: "pepstack:",
        SESSION_COOKIE_NAME: "pepstack.admin.sid",
        SESSION_TTL_MS: "86400000",
      }),
    ).toEqual({
      redisUrl: "redis://localhost:6379",
      redisPrefix: "pepstack:",
      sessionOptions: {
        name: "pepstack.admin.sid",
        ttl: 86_400_000,
      },
    })
  })

  it("uses Medusa-compatible session defaults when optional values are absent", () => {
    expect(resolveSessionProjectConfig({})).toEqual({
      redisUrl: undefined,
      redisPrefix: undefined,
      sessionOptions: {
        name: "connect.sid",
        ttl: 36_000_000,
      },
    })
  })

  it.each(["0", "-1", "1.5", "not-a-number"])(
    "rejects invalid session TTL %s",
    (SESSION_TTL_MS) => {
      expect(() =>
        resolveSessionProjectConfig({ SESSION_TTL_MS }),
      ).toThrow("SESSION_TTL_MS must be a positive integer")
    },
  )

  it("wires the resolved values into the Medusa project configuration", () => {
    const config = readFileSync(join(backendRoot, "medusa-config.ts"), "utf8")

    expect(config).toContain("...resolveSessionProjectConfig()")
  })
})
