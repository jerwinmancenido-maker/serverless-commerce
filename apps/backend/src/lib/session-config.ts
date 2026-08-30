import { MedusaError } from "@medusajs/framework/utils"

const DEFAULT_SESSION_COOKIE_NAME = "connect.sid"
const DEFAULT_SESSION_TTL_MS = 10 * 60 * 60 * 1000

type SessionEnvironment = Partial<
  Record<
    | "REDIS_URL"
    | "REDIS_PREFIX"
    | "SESSION_COOKIE_NAME"
    | "SESSION_TTL_MS",
    string
  >
>

const optionalValue = (value: string | undefined) => {
  const normalized = value?.trim()

  return normalized || undefined
}

const resolveSessionTtl = (value: string | undefined) => {
  const normalized = optionalValue(value)

  if (!normalized) {
    return DEFAULT_SESSION_TTL_MS
  }

  const ttl = Number(normalized)

  if (!Number.isSafeInteger(ttl) || ttl <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "SESSION_TTL_MS must be a positive integer",
    )
  }

  return ttl
}

export const resolveSessionProjectConfig = (
  env: SessionEnvironment = process.env,
) => ({
  redisUrl: optionalValue(env.REDIS_URL),
  redisPrefix: optionalValue(env.REDIS_PREFIX),
  sessionOptions: {
    name:
      optionalValue(env.SESSION_COOKIE_NAME) ?? DEFAULT_SESSION_COOKIE_NAME,
    ttl: resolveSessionTtl(env.SESSION_TTL_MS),
  },
})
