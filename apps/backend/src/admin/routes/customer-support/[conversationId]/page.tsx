import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { sdk } from "../../../lib/sdk"

type Attachment = {
  id: string
  message_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  scan_status: string
}

type SavedResponse = {
  id: string
  title: string
  body: string
  category: string | null
}

type Detail = {
  conversation: {
    id: string
    customer_id: string
    subject: string
    category: string
    status: string
    priority: string
    order_id: string | null
    protocol_series_id: string | null
    assigned_to_actor_id: string | null
  }
  messages: Array<{
    id: string
    sender_type: string
    sender_id: string
    body: string
    sent_at: string
  }>
  attachments: Attachment[]
  internal_notes: Array<{
    id: string
    actor_id: string
    body: string
    created_at: string
  }>
  status_events: Array<{
    id: string
    from_status: string | null
    to_status: string
    reason: string | null
    occurred_at: string
  }>
}

type SupportStaff = { id: string; name: string; email: string; roles: string[] }

const CustomerSupportDetailPage = () => {
  const { conversationId } = useParams()
  const client = useQueryClient()
  const [reply, setReply] = useState("")
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null)

  const query = useQuery({
    queryKey: ["customer-support", conversationId],
    queryFn: () =>
      sdk.client.fetch<Detail>(`/admin/customer-support/${conversationId}`),
    enabled: Boolean(conversationId),
  })
  const savedResponseQuery = useQuery({
    queryKey: ["support-saved-responses"],
    queryFn: () =>
      sdk.client.fetch<{ responses: SavedResponse[] }>(
        "/admin/support-saved-responses",
      ),
  })
  const permissionQuery = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: () => sdk.client.fetch<{ permissions: string[] }>("/admin/rbac/me/permissions"),
  })
  const canAssign = Boolean(permissionQuery.data?.permissions.includes("customer_support_assign:update"))
  const staffQuery = useQuery({
    queryKey: ["customer-support-staff"],
    queryFn: () => sdk.client.fetch<{ staff: SupportStaff[] }>("/admin/customer-support/staff"),
    enabled: canAssign,
  })
  const invalidate = () =>
    client.invalidateQueries({
      queryKey: ["customer-support", conversationId],
    })
  const messageMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ message: { id: string } }>(`/admin/customer-support/${conversationId}/messages`, {
        method: "POST",
        body: { body: reply },
      }),
    onSuccess: async (result) => {
      if (replyAttachment) {
        const body = new FormData()
        body.set("attachment", replyAttachment, replyAttachment.name)
        await sdk.client.fetch(`/admin/customer-support/${conversationId}/messages/${result.message.id}/attachments`, {
          method: "POST",
          headers: { "content-type": null },
          body,
        })
      }
      setReply("")
      setReplyAttachment(null)
      await invalidate()
      toast.success("Reply sent")
    },
  })
  const noteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/customer-support/${conversationId}/notes`, {
        method: "POST",
        body: { body: note },
      }),
    onSuccess: async () => {
      setNote("")
      await invalidate()
      toast.success("Internal note saved")
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ endpoint = "", body }: { endpoint?: string; body: Record<string, unknown> }) =>
      sdk.client.fetch(`/admin/customer-support/${conversationId}${endpoint}`, {
        method: "POST",
        body: { ...body, reason: reason || null },
      }),
    onSuccess: invalidate,
  })
  const openAttachment = async (attachment: Attachment) => {
    if (attachment.scan_status === "blocked") {
      toast.error("This attachment was blocked")
      return
    }
    const response = await sdk.client.fetch<{ url: string }>(
      `/admin/customer-support/${conversationId}/attachments/${attachment.id}/file`,
    )
    window.open(response.url, "_blank", "noopener,noreferrer")
  }

  const data = query.data
  useEffect(() => {
    if (!data || !conversationId) return
    sdk.client.fetch(`/admin/customer-support/${conversationId}/read`, { method: "POST" }).catch(() => undefined)
  }, [conversationId, data])
  if (!data) {
    return (
      <Container>
        <Text>Loading support conversation…</Text>
      </Container>
    )
  }
  const conversation = data.conversation
  return (
    <div className="flex flex-col gap-4">
      <Container>
        <Link
          to="/customer-support"
          className="text-sm text-ui-fg-interactive"
        >
          ← Support inbox
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <Heading>{conversation.subject}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {conversation.category.replaceAll("_", " ")} · Customer{" "}
              {conversation.customer_id}
            </Text>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="grid gap-2 text-sm">
            Status
            <Select
              value={conversation.status}
              onValueChange={(status) => updateMutation.mutate({ body: { status } })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {["new", "open", "waiting_for_customer", "resolved", "closed"].map(
                  (value) => (
                    <Select.Item key={value} value={value}>
                      {value.replaceAll("_", " ")}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select>
          </label>
          {canAssign ? <label className="grid gap-2 text-sm">
            Priority
            <Select
              value={conversation.priority}
              onValueChange={(priority) => updateMutation.mutate({ endpoint: "/priority", body: { priority } })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {["low", "normal", "high", "urgent"].map((value) => (
                  <Select.Item key={value} value={value}>
                    {value}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </label> : null}
          {canAssign ? <label className="grid gap-2 text-sm">
            Assigned support staff
            <Select value={conversation.assigned_to_actor_id || "unassigned"} onValueChange={(assigned_to_actor_id) => updateMutation.mutate({ endpoint: "/assignment", body: { assigned_to_actor_id: assigned_to_actor_id === "unassigned" ? null : assigned_to_actor_id } })}>
              <Select.Trigger><Select.Value placeholder="Unassigned" /></Select.Trigger>
              <Select.Content><Select.Item value="unassigned">Unassigned</Select.Item>{staffQuery.data?.staff.map((staff) => <Select.Item key={staff.id} value={staff.id}>{staff.name} · {staff.roles.join(", ")}</Select.Item>)}</Select.Content>
            </Select>
          </label> : null}
        </div>
        <Label className="mt-4 block">Change reason</Label>
        <Input
          className="mt-2"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Optional audit reason"
        />
      </Container>

      <Container>
        <Heading level="h2">Conversation</Heading>
        <div className="mt-4 space-y-3">
          {data.messages.map((message) => {
            const attachments = data.attachments.filter(
              (attachment) => attachment.message_id === message.id,
            )
            return (
              <div
                key={message.id}
                className={`rounded-lg p-4 ${
                  message.sender_type === "staff"
                    ? "ml-12 bg-blue-50"
                    : "mr-12 bg-ui-bg-subtle"
                }`}
              >
                <Text size="small" weight="plus">
                  {message.sender_type === "staff"
                    ? "Support"
                    : message.sender_type === "system"
                      ? "Automatic confirmation"
                      : "Customer"}
                </Text>
                <Text size="small" className="mt-2 whitespace-pre-wrap">
                  {message.body}
                </Text>
                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={() => openAttachment(attachment)}
                      >
                        Open {attachment.file_name}
                      </Button>
                    ))}
                  </div>
                )}
                <Text size="xsmall" className="mt-2 text-ui-fg-subtle">
                  {new Date(message.sent_at).toLocaleString()}
                </Text>
              </div>
            )
          })}
        </div>
        <div className="mt-5 grid gap-2">
          <Label>Customer-visible reply</Label>
          <Select
            onValueChange={(responseId) => {
              const saved = savedResponseQuery.data?.responses.find(
                (item) => item.id === responseId,
              )
              if (saved) setReply(saved.body)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Insert a saved response" />
            </Select.Trigger>
            <Select.Content>
              {savedResponseQuery.data?.responses
                .filter(
                  (response) =>
                    !response.category ||
                    response.category === conversation.category,
                )
                .map((response) => (
                  <Select.Item key={response.id} value={response.id}>
                    {response.title}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select>
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
          />
          <div>
            <Label>Optional attachment</Label>
            <Input type="file" accept="image/png,image/jpeg,application/pdf" onChange={(event) => setReplyAttachment(event.target.files?.[0] || null)} />
            <Text size="xsmall" className="text-ui-fg-subtle">Private PDF, PNG, or JPEG. The configured server limit is enforced.</Text>
          </div>
          <Button
            size="small"
            disabled={reply.trim().length < 3}
            isLoading={messageMutation.isPending}
            onClick={() => messageMutation.mutate()}
          >
            Send reply
          </Button>
        </div>
      </Container>

      <Container>
        <Heading level="h2">Internal notes</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Never returned to the customer.
        </Text>
        <div className="mt-3 space-y-2">
          {data.internal_notes.map((item) => (
            <div key={item.id} className="rounded-lg bg-ui-bg-subtle p-3">
              <Text size="small">{item.body}</Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </div>
          ))}
        </div>
        <Textarea
          className="mt-4"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <Button
          className="mt-2"
          variant="secondary"
          size="small"
          disabled={note.trim().length < 3}
          isLoading={noteMutation.isPending}
          onClick={() => noteMutation.mutate()}
        >
          Add internal note
        </Button>
      </Container>
    </div>
  )
}

export default CustomerSupportDetailPage
