/**
 * @file    apps/backend/src/lib/db-pool-config.ts
 * @module  DbPoolConfig (Database Infrastructure)
 * @purpose Resolve PostgreSQL connection pool limits and timeouts with safe defaults and environment validation.
 * @contracts
 *   Config: databaseDriverOptions in medusa-config.ts
 */

import { MedusaError } from "@medusajs/framework/utils"

export const DEFAULT_DB_POOL_MIN = 2
export const DEFAULT_DB_POOL_MAX = 20
export const DEFAULT_DB_POOL_IDLE_TIMEOUT = 30000
export const DEFAULT_DB_POOL_CONN_TIMEOUT = 5000

export type DbPoolEnvironment = Partial<
  Record<
    | "DB_POOL_MIN"
    | "DB_POOL_MAX"
    | "DB_POOL_IDLE_TIMEOUT"
    | "DB_POOL_CONN_TIMEOUT"
    | "DATABASE_SSL",
    string
  >
>

const resolvePositiveInteger = (
  value: string | undefined,
  fallback: number,
  varName: string,
): number => {
  const normalized = value?.trim()
  if (!normalized) {
    return fallback
  }

  const parsed = Number(normalized)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${varName} must be a positive integer`,
    )
  }

  return parsed
}

export const resolveDatabaseDriverOptions = (
  env: DbPoolEnvironment = process.env,
) => {
  const min = resolvePositiveInteger(
    env.DB_POOL_MIN,
    DEFAULT_DB_POOL_MIN,
    "DB_POOL_MIN",
  )
  const max = resolvePositiveInteger(
    env.DB_POOL_MAX,
    DEFAULT_DB_POOL_MAX,
    "DB_POOL_MAX",
  )

  if (min > max) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "DB_POOL_MIN cannot exceed DB_POOL_MAX",
    )
  }

  const idleTimeoutMillis = resolvePositiveInteger(
    env.DB_POOL_IDLE_TIMEOUT,
    DEFAULT_DB_POOL_IDLE_TIMEOUT,
    "DB_POOL_IDLE_TIMEOUT",
  )
  const connectionTimeoutMillis = resolvePositiveInteger(
    env.DB_POOL_CONN_TIMEOUT,
    DEFAULT_DB_POOL_CONN_TIMEOUT,
    "DB_POOL_CONN_TIMEOUT",
  )

  const ssl =
    env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: false }
      : false

  return {
    connection: {
      ssl,
    },
    pool: {
      min,
      max,
      idleTimeoutMillis,
      connectionTimeoutMillis,
    },
  }
}
