import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Input, Select, Text } from "@medusajs/ui"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { sdk } from "../../lib/sdk"

type Conversation = {
  id: string
  subject: string
  category: string
  status: string
  priority: string
  assigned_to_actor_id: string | null
  last_activity_at: string
  latest_message_preview: string
  unread_count: number
  waiting_since: string | null
  customer: { id: string; name: string; email: string } | null
}

const queues = [
  ["all", "All"],
  ["new", "New"],
  ["unread", "Unread"],
  ["unassigned", "Unassigned"],
  ["assigned_to_me", "Assigned to me"],
  ["waiting_for_customer", "Waiting for customer"],
  ["high_priority", "High priority"],
  ["resolved", "Resolved"],
  ["closed", "Closed"],
] as const

const formatWaitingSince = (waitingSince: string | null) => {
  if (!waitingSince) return null
  const diffMs = Date.now() - new Date(waitingSince).getTime()
  if (diffMs < 0) return null

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) {
    return {
      text: `${minutes}m`,
      color: minutes > 30 ? ("orange" as const) : ("grey" as const),
    }
  }
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return {
    text: `${hours}h ${remainingMins}m`,
    color: hours >= 2 ? ("red" as const) : ("orange" as const),
  }
}

const CustomerSupportPage = () => {
  const navigate = useNavigate()
  const [queue, setQueue] = useState("all")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [priority, setPriority] = useState("all")
  const [chimeEnabled, setChimeEnabled] = useState(() => {
    return window.localStorage.getItem("pepstack:admin-chime") === "true"
  })

  const presenceQuery = useQuery({
    queryKey: ["customer-support-presence"],
    queryFn: () =>
      sdk.client.fetch<{ my_status: "online" | "busy" | "offline"; system: { status: string; onlineCount: number } }>(
        "/admin/customer-support/presence",
      ),
    refetchInterval: 15000,
  })

  const presenceMutation = useMutation({
    mutationFn: (status: "online" | "busy" | "offline") =>
      sdk.client.fetch("/admin/customer-support/presence", {
        method: "POST",
        body: { status },
      }),
    onSuccess: () => {
      presenceQuery.refetch()
    },
  })

  const myStatus = presenceQuery.data?.my_status || "online"

  const query = useQuery({
    queryKey: ["customer-support", queue, search, category, priority],
    queryFn: () =>
      sdk.client.fetch<{ conversations: Conversation[]; count: number }>(
        "/admin/customer-support",
        {
          query: {
            queue: queue === "all" ? undefined : queue,
            q: search || undefined,
            category: category === "all" ? undefined : category,
            priority: priority === "all" ? undefined : priority,
            limit: 50,
            offset: 0,
          },
        }
      ),
    refetchInterval: 5000,
  })

  const totalUnread = query.data?.conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) || 0

  // Update browser tab title with unread badge
  useEffect(() => {
    const defaultTitle = "Customer Support · PepStack Admin"
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) 📩 Support · PepStack Admin`
    } else {
      document.title = defaultTitle
    }
    return () => {
      document.title = defaultTitle
    }
  }, [totalUnread])

  const toggleChime = () => {
    const next = !chimeEnabled
    setChimeEnabled(next)
    window.localStorage.setItem("pepstack:admin-chime", String(next))
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between px-6 py-4">
        <div>
          <div className="flex items-center gap-3">
            <Heading>Customer support</Heading>
            {totalUnread > 0 && (
              <Badge color="red" className="animate-pulse">
                {totalUnread} unread
              </Badge>
            )}
          </div>
          <Text size="small" leading="compact" className="text-ui-fg-subtle mt-1">
            Real-time customer conversation stream with auto-refresh and priority routing.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {/* Agent Status Selector */}
          <div className="w-36">
            <Select
              value={myStatus}
              onValueChange={(val: any) => presenceMutation.mutate(val)}
            >
              <Select.Trigger className="text-xs">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="online">🟢 Available</Select.Item>
                <Select.Item value="busy">🟡 Busy</Select.Item>
                <Select.Item value="offline">⚫ Offline</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <Button
            size="small"
            variant="secondary"
            onClick={toggleChime}
            className="flex items-center gap-1.5"
            title="Toggle notification chime on incoming messages"
          >
            <span>{chimeEnabled ? "🔔 Chime: On" : "🔕 Chime: Off"}</span>
          </Button>
          <Link to="/customer-support/settings">
            <Button size="small" variant="secondary">
              Support settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-6 py-4">
        {queues.map(([value, label]) => (
          <Button
            key={value}
            size="small"
            variant={queue === value ? "primary" : "secondary"}
            onClick={() => setQueue(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 px-6 py-4 md:grid-cols-[minmax(260px,1fr)_220px_180px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by customer name, email, or subject"
        />
        <Select value={category} onValueChange={setCategory}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All categories</Select.Item>
            {[
              "order",
              "payment",
              "shipping",
              "product",
              "protocol_access",
              "account",
              "rewards",
              "technical",
              "other",
            ].map((value) => (
              <Select.Item key={value} value={value}>
                {value.replaceAll("_", " ")}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All priorities</Select.Item>
            {["low", "normal", "high", "urgent"].map((value) => (
              <Select.Item key={value} value={value}>
                {value}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <div className="divide-y">
        {query.data?.conversations.map((item) => {
          const waiting = formatWaitingSince(item.waiting_since)

          return (
            <button
              key={item.id}
              onClick={() => navigate(`/customer-support/${item.id}`)}
              className="grid w-full gap-4 px-6 py-4 text-left hover:bg-ui-bg-subtle transition-colors md:grid-cols-[minmax(0,1fr)_190px_160px]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Text size="small" leading="compact" weight="plus">
                    {item.subject}
                  </Text>
                  {item.unread_count ? (
                    <Badge color="red">{item.unread_count} unread</Badge>
                  ) : null}
                  {waiting && (
                    <Badge color={waiting.color}>
                      ⏱ {waiting.text}
                    </Badge>
                  )}
                </div>
                <Text size="small" leading="compact" className="text-ui-fg-subtle mt-0.5">
                  {item.customer ? `${item.customer.name} (${item.customer.email})` : "Customer"} ·{" "}
                  {item.category.replaceAll("_", " ")}
                </Text>
                <Text size="xsmall" className="mt-1 line-clamp-1 text-ui-fg-muted">
                  {item.latest_message_preview || "No message preview"}
                </Text>
              </div>

              <div>
                <Badge
                  color={
                    item.priority === "urgent"
                      ? "red"
                      : item.priority === "high"
                      ? "orange"
                      : "grey"
                  }
                >
                  {item.priority}
                </Badge>
                <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
                  {item.assigned_to_actor_id ? "Assigned" : "Unassigned"}
                </Text>
              </div>

              <div className="text-right">
                <Badge
                  color={
                    item.status === "new"
                      ? "orange"
                      : item.status === "resolved"
                      ? "green"
                      : "grey"
                  }
                >
                  {item.status.replaceAll("_", " ")}
                </Badge>
                <Text size="xsmall" className="mt-1 text-ui-fg-subtle">
                  {new Date(item.last_activity_at).toLocaleString("en-PH")}
                </Text>
              </div>
            </button>
          )
        })}

        {!query.isLoading && !query.data?.conversations.length ? (
          <Text size="small" leading="compact" className="px-6 py-10 text-ui-fg-subtle text-center">
            No support conversations match this filter.
          </Text>
        ) : null}

        {query.isError ? (
          <Text size="small" className="px-6 py-10 text-ui-fg-error text-center">
            Support conversations could not be loaded. Check your Support role.
          </Text>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Customer Support", icon: ChatBubbleLeftRight })
export default CustomerSupportPage
