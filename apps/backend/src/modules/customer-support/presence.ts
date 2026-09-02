/**
 * In-memory presence and typing indicator manager for Customer Support.
 * Ephemeral states with automatic TTL expiration (zero DB overhead).
 */

type TypingState = {
  timestamp: number
  actorId: string
}

const TYPING_TTL_MS = 4500
const STAFF_HEARTBEAT_TTL_MS = 60000

// conversationId -> "customer" | "staff" -> TypingState
const typingMap = new Map<string, { customer?: TypingState; staff?: TypingState }>()

// staffId -> { status: "online" | "busy" | "offline", lastHeartbeat: number }
const staffStatusMap = new Map<string, { status: "online" | "busy" | "offline"; lastHeartbeat: number }>()

export function setTypingState(
  conversationId: string,
  actorType: "customer" | "staff",
  actorId: string,
): void {
  const now = Date.now()
  const current = typingMap.get(conversationId) || {}
  current[actorType] = {
    timestamp: now,
    actorId,
  }
  typingMap.set(conversationId, current)

  // Periodic memory prune if map grows
  if (typingMap.size > 200) {
    for (const [id, state] of typingMap.entries()) {
      const custExpired = !state.customer || now - state.customer.timestamp > TYPING_TTL_MS * 2
      const staffExpired = !state.staff || now - state.staff.timestamp > TYPING_TTL_MS * 2
      if (custExpired && staffExpired) {
        typingMap.delete(id)
      }
    }
  }
}

export function isTyping(
  conversationId: string,
  actorType: "customer" | "staff",
): boolean {
  const current = typingMap.get(conversationId)
  if (!current || !current[actorType]) return false
  const elapsed = Date.now() - current[actorType]!.timestamp
  return elapsed <= TYPING_TTL_MS
}

export function setStaffPresence(
  staffId: string,
  status: "online" | "busy" | "offline",
): void {
  if (status === "offline") {
    staffStatusMap.delete(staffId)
  } else {
    staffStatusMap.set(staffId, {
      status,
      lastHeartbeat: Date.now(),
    })
  }
}

export function getStaffPresence(staffId: string): "online" | "busy" | "offline" {
  const entry = staffStatusMap.get(staffId)
  if (!entry) return "offline"
  if (Date.now() - entry.lastHeartbeat > STAFF_HEARTBEAT_TTL_MS) {
    staffStatusMap.delete(staffId)
    return "offline"
  }
  return entry.status
}

export function getSystemStaffAvailability(): {
  status: "online" | "away" | "offline"
  onlineCount: number
} {
  const now = Date.now()
  let onlineCount = 0
  let busyCount = 0

  for (const [id, entry] of staffStatusMap.entries()) {
    if (now - entry.lastHeartbeat > STAFF_HEARTBEAT_TTL_MS) {
      staffStatusMap.delete(id)
      continue
    }
    if (entry.status === "online") onlineCount++
    if (entry.status === "busy") busyCount++
  }

  if (onlineCount > 0) return { status: "online", onlineCount }
  if (busyCount > 0) return { status: "away", onlineCount: 0 }
  return { status: "offline", onlineCount: 0 }
}
