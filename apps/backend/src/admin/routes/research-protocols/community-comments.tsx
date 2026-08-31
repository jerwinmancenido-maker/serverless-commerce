import { Badge, Button, Input, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { sdk } from "../../lib/sdk"

type CommentStatus = "pending" | "approved" | "rejected" | "hidden"
type CommunityComment = {
  id: string
  author_name_snapshot: string
  kind: "idea" | "recommendation" | "question" | "general"
  body: string
  status: CommentStatus
  submitted_at: string
  moderation_reason: string | null
}

type Response = {
  comments: CommunityComment[]
  count: number
}

const badgeColor = (status: CommentStatus) => {
  if (status === "approved") return "green" as const
  if (status === "pending") return "orange" as const
  return "grey" as const
}

export const CommunityComments = ({ protocolId }: { protocolId: string }) => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<CommentStatus | "all">("pending")
  const [reason, setReason] = useState("")
  const commentsQuery = useQuery({
    queryKey: ["research-protocol-comments", protocolId, status],
    queryFn: () =>
      sdk.client.fetch<Response>(
        `/admin/research-protocols/${protocolId}/comments`,
        {
          query: { status: status === "all" ? undefined : status },
        },
      ),
  })
  const moderation = useMutation({
    mutationFn: ({
      commentId,
      action,
    }: {
      commentId: string
      action: "approve" | "reject" | "hide"
    }) =>
      sdk.client.fetch(
        `/admin/research-protocols/${protocolId}/comments/${commentId}/moderate`,
        {
          method: "POST",
          body: { action, reason: reason.trim() || null },
        },
      ),
    onSuccess: async () => {
      setReason("")
      toast.success("Community comment updated")
      await queryClient.invalidateQueries({
        queryKey: ["research-protocol-comments", protocolId],
      })
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "Community comment could not be updated",
      ),
  })

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-start justify-between gap-x-3">
        <div>
          <Text size="small" weight="plus">Community board</Text>
          <Text size="small" className="text-ui-fg-subtle">
            Customer ideas never modify or publish protocol content.
          </Text>
        </div>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as typeof status)}
        >
          <Select.Trigger className="w-32"><Select.Value /></Select.Trigger>
          <Select.Content>
            <Select.Item value="pending">Pending</Select.Item>
            <Select.Item value="approved">Approved</Select.Item>
            <Select.Item value="rejected">Rejected</Select.Item>
            <Select.Item value="hidden">Hidden</Select.Item>
            <Select.Item value="all">All</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Moderation reason for Reject or Hide"
      />
      {commentsQuery.isLoading ? (
        <Text size="small" className="text-ui-fg-subtle">Loading comments…</Text>
      ) : commentsQuery.isError ? (
        <Text size="small" className="text-ui-fg-error">Comments could not be loaded.</Text>
      ) : commentsQuery.data?.comments.length ? (
        <div className="flex flex-col gap-y-3">
          {commentsQuery.data.comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-ui-border-base p-3">
              <div className="flex items-center justify-between gap-x-3">
                <Text size="small" weight="plus">{comment.author_name_snapshot}</Text>
                <Badge color={badgeColor(comment.status)}>{comment.status}</Badge>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">{comment.kind} · {new Date(comment.submitted_at).toLocaleString()}</Text>
              <Text size="small" className="mt-2 whitespace-pre-wrap">{comment.body}</Text>
              {comment.moderation_reason ? <Text size="xsmall" className="mt-2 text-ui-fg-subtle">Reason: {comment.moderation_reason}</Text> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {comment.status !== "approved" ? <Button size="small" variant="secondary" isLoading={moderation.isPending} onClick={() => moderation.mutate({ commentId: comment.id, action: "approve" })}>Approve</Button> : null}
                {comment.status === "pending" ? <Button size="small" variant="danger" disabled={!reason.trim()} isLoading={moderation.isPending} onClick={() => moderation.mutate({ commentId: comment.id, action: "reject" })}>Reject</Button> : null}
                {comment.status === "approved" ? <Button size="small" variant="danger" disabled={!reason.trim()} isLoading={moderation.isPending} onClick={() => moderation.mutate({ commentId: comment.id, action: "hide" })}>Hide</Button> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Text size="small" className="text-ui-fg-subtle">No {status === "all" ? "" : `${status} `}comments.</Text>
      )}
    </div>
  )
}
