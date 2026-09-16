/**
 * @file    apps/backend/src/lib/__tests__/db-pool-config.unit.spec.ts
 * @module  DbPoolConfigUnitSpec
 * @purpose Unit tests validating PostgreSQL connection pool limits, timeouts, SSL resolution, and error guards.
 */

import { MedusaError } from "@medusajs/framework/utils"

import {
  DEFAULT_DB_POOL_CONN_TIMEOUT,
  DEFAULT_DB_POOL_IDLE_TIMEOUT,
  DEFAULT_DB_POOL_MAX,
  DEFAULT_DB_POOL_MIN,
  resolveDatabaseDriverOptions,
} from "../db-pool-config"

describe("Database Pool & Driver Options Configuration", () => {
  it("resolves default connection pool limits and timeouts when environment is empty", () => {
    const options = resolveDatabaseDriverOptions({})

    expect(options).toEqual({
      connection: {
        ssl: false,
      },
      pool: {
        min: DEFAULT_DB_POOL_MIN,
        max: DEFAULT_DB_POOL_MAX,
        idleTimeoutMillis: DEFAULT_DB_POOL_IDLE_TIMEOUT,
        connectionTimeoutMillis: DEFAULT_DB_POOL_CONN_TIMEOUT,
      },
    })
  })

  it("parses and applies custom environment variables with whitespace trimming", () => {
    const options = resolveDatabaseDriverOptions({
      DB_POOL_MIN: " 5 ",
      DB_POOL_MAX: " 50 ",
      DB_POOL_IDLE_TIMEOUT: " 45000 ",
      DB_POOL_CONN_TIMEOUT: " 8000 ",
      DATABASE_SSL: "true",
    })

    expect(options).toEqual({
      connection: {
        ssl: { rejectUnauthorized: false },
      },
      pool: {
        min: 5,
        max: 50,
        idleTimeoutMillis: 45000,
        connectionTimeoutMillis: 8000,
      },
    })
  })

  it("throws MedusaError if DB_POOL_MIN exceeds DB_POOL_MAX", () => {
    expect(() =>
      resolveDatabaseDriverOptions({
        DB_POOL_MIN: "25",
        DB_POOL_MAX: "10",
      })
    ).toThrow(MedusaError)

    try {
      resolveDatabaseDriverOptions({
        DB_POOL_MIN: "25",
        DB_POOL_MAX: "10",
      })
    } catch (err: any) {
      expect(err.type).toBe(MedusaError.Types.INVALID_DATA)
      expect(err.message).toContain("DB_POOL_MIN cannot exceed DB_POOL_MAX")
    }
  })

  it("throws MedusaError when pool limits are zero or negative", () => {
    expect(() =>
      resolveDatabaseDriverOptions({ DB_POOL_MIN: "0" })
    ).toThrow(MedusaError)

    expect(() =>
      resolveDatabaseDriverOptions({ DB_POOL_MAX: "-5" })
    ).toThrow(MedusaError)

    expect(() =>
      resolveDatabaseDriverOptions({ DB_POOL_IDLE_TIMEOUT: "not-a-number" })
    ).toThrow(MedusaError)
  })
})
