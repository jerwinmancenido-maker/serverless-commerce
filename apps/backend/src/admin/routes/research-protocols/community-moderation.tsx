import { Badge, Button, Container, Heading, Input, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { sdk } from "../../lib/sdk"

type CommunityThread = {
  id: string
  title: string
  kind: string
  status: "pending" | "approved" | "rejected" | "hidden"
  is_pinned: boolean
  is_locked: boolean
  is_answered: boolean
  submitted_at: string
  report_count: number
  identity: { id: string; alias: string; status: "active" | "suspended" } | null
  comments: Array<{
    id: string
    body: string
    status: "pending" | "approved" | "rejected" | "hidden"
    submitted_at: string
  }>
}

type CommunityResponse = {
  threads: CommunityThread[]
  reports: Array<{
    id: string
    thread_id: string | null
    comment_id: string | null
    reason: string
    details: string | null
    status: "open" | "resolved" | "dismissed"
    reported_at: string
  }>
  count: number
}

const statusColor = (status: string) =>
  status === "approved" || status === "resolved"
    ? "green"
    : status === "pending" || status === "open"
      ? "orange"
      : "grey"

export const CommunityModeration = ({
  protocolId,
  compact = false,
}: {
  protocolId: string
  compact?: boolean
}) => {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState("all")
  const [search, setSearch] = useState("")
  const [reason, setReason] = useState("")
  const [selectedThreads, setSelectedThreads] = useState<string[]>([])
  const [selectedComments, setSelectedComments] = useState<string[]>([])
  const query = useQuery({
    queryKey: ["research-protocol-community-admin", protocolId, status, search],
    queryFn: () =>
      sdk.client.fetch<CommunityResponse>(
        `/admin/research-protocols/${protocolId}/community`,
        {
          query: {
            ...(status !== "all" ? { status } : {}),
            ...(search.trim() ? { q: search.trim() } : {}),
            limit: 100,
            offset: 0,
          },
        },
      ),
  })
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ["research-protocol-community-admin", protocolId],
    })
  const moderate = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch(`/admin/research-protocols/${protocolId}/community`, {
        method: "POST",
        body,
      }),
    onSuccess: async () => {
      toast.success("Community moderation saved")
      setReason("")
      await refresh()
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Moderation failed"),
  })
  const bulk = useMutation({
    mutationFn: (action: "approve" | "reject" | "hide" | "restore") =>
      sdk.client.fetch(
        `/admin/research-protocols/${protocolId}/community/bulk`,
        {
          method: "POST",
          body: {
            action,
            thread_ids: selectedThreads,
            comment_ids: selectedComments,
            reason: reason.trim() || null,
          },
        },
      ),
    onSuccess: async () => {
      setSelectedThreads([])
      setSelectedComments([])
      setReason("")
      toast.success("Selected community content updated")
      await refresh()
    },
  })
  const identityMutation = useMutation({
    mutationFn: ({ identityId, action }: { identityId: string; action: "suspend" | "restore" }) => {
      if (reason.trim().length < 3) throw new Error("Enter a moderation reason")
      return sdk.client.fetch(
        `/admin/research-protocols/${protocolId}/community/identities/${identityId}`,
        { method: "POST", body: { action, reason: reason.trim() } },
      )
    },
    onSuccess: async () => { setReason(""); await refresh() },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Identity status could not be changed"),
  })
  const reportMutation = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: "resolve" | "dismiss" }) => {
      if (reason.trim().length < 3) throw new Error("Enter a moderation reason")
      return sdk.client.fetch(
        `/admin/research-protocols/${protocolId}/community/reports/${reportId}`,
        { method: "POST", body: { action, reason: reason.trim() } },
      )
    },
    onSuccess: async () => { setReason(""); await refresh() },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Report could not be updated"),
  })
  const pendingCount = useMemo(
    () =>
      (query.data?.threads || []).filter((thread) => thread.status === "pending").length +
      (query.data?.threads || []).flatMap((thread) => thread.comments).filter((comment) => comment.status === "pending").length,
    [query.data?.threads],
  )

  if (compact) {
    return (
      <div className="flex flex-col gap-y-3">
        <div>
          <Text size="small" weight="plus">Protected community</Text>
          <Text size="small" className="text-ui-fg-subtle">
            {query.isLoading ? "Loading moderation queue…" : `${pendingCount} pending item${pendingCount === 1 ? "" : "s"}`}
          </Text>
        </div>
        <Button asChild size="small" variant="secondary">
          <Link to={`/research-protocols/${protocolId}/community`}>
            Manage community
          </Link>
        </Button>
      </div>
    )
  }

  const act = (
    action: string,
    target: { thread_id?: string; comment_id?: string },
  ) =>
    moderate.mutate({
      action,
      thread_id: target.thread_id || null,
      comment_id: target.comment_id || null,
      reason: reason.trim() || null,
    })

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading>Protocol community moderation</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Community discussion is separate from the official protocol.
          </Text>
        </div>
        <Button asChild size="small" variant="secondary">
          <Link to={`/research-protocols/${protocolId}`}>Back to protocol</Link>
        </Button>
      </Container>
      <Container className="grid gap-4 px-6 py-4">
        <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border border-ui-border-base bg-ui-bg-field px-3 text-sm">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
            <option value="rejected">Rejected</option>
          </select>
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, alias, or content" />
        </div>
        <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Moderation reason for reject, hide, reports, or suspension" />
        {(selectedThreads.length || selectedComments.length) ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-ui-bg-subtle p-3">
            <Text size="small">{selectedThreads.length + selectedComments.length} selected</Text>
            {(["approve", "hide", "restore", "reject"] as const).map((action) => (
              <Button key={action} size="small" variant="secondary" onClick={() => bulk.mutate(action)}>{action}</Button>
            ))}
          </div>
        ) : null}
      </Container>
      <div className="grid gap-4">
        {(query.data?.threads || []).map((thread) => (
          <Container key={thread.id} className="grid gap-4 px-6 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selectedThreads.includes(thread.id)} onChange={(event) => setSelectedThreads((current) => event.target.checked ? [...current, thread.id] : current.filter((id) => id !== thread.id))} />
                <div>
                  <div className="flex flex-wrap gap-2"><Text weight="plus">{thread.title}</Text><Badge color={statusColor(thread.status)}>{thread.status}</Badge>{thread.is_pinned ? <Badge>pinned</Badge> : null}{thread.is_locked ? <Badge>locked</Badge> : null}{thread.is_answered ? <Badge color="green">answered</Badge> : null}</div>
                  <Text size="small" className="text-ui-fg-subtle">{thread.identity?.alias || "Community member"} · {thread.kind} · {new Date(thread.submitted_at).toLocaleString()}</Text>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {thread.status !== "approved" ? <Button size="small" onClick={() => act("approve", { thread_id: thread.id })}>Approve</Button> : null}
                {thread.status === "approved" ? <Button size="small" variant="secondary" onClick={() => act(thread.is_pinned ? "unpin" : "pin", { thread_id: thread.id })}>{thread.is_pinned ? "Unpin" : "Pin"}</Button> : null}
                {thread.status === "approved" ? <Button size="small" variant="secondary" onClick={() => act(thread.is_locked ? "unlock" : "lock", { thread_id: thread.id })}>{thread.is_locked ? "Unlock" : "Lock"}</Button> : null}
                {thread.kind === "question" ? <Button size="small" variant="secondary" onClick={() => act(thread.is_answered ? "unmark_answered" : "mark_answered", { thread_id: thread.id })}>{thread.is_answered ? "Unmark answered" : "Mark answered"}</Button> : null}
                <Button size="small" variant="danger" onClick={() => act("hide", { thread_id: thread.id })}>Hide</Button>
              </div>
            </div>
            {thread.identity ? (
              <div className="flex items-center justify-between rounded-lg bg-ui-bg-subtle p-3">
                <Text size="small">Alias status: {thread.identity.status}</Text>
                <Button size="small" variant="secondary" onClick={() => identityMutation.mutate({ identityId: thread.identity!.id, action: thread.identity!.status === "active" ? "suspend" : "restore" })}>{thread.identity.status === "active" ? "Suspend alias" : "Restore alias"}</Button>
              </div>
            ) : null}
            <div className="grid gap-2">
              {thread.comments.map((comment) => (
                <div key={comment.id} className="flex items-start justify-between gap-3 rounded-lg border border-ui-border-base p-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <input type="checkbox" checked={selectedComments.includes(comment.id)} onChange={(event) => setSelectedComments((current) => event.target.checked ? [...current, comment.id] : current.filter((id) => id !== comment.id))} />
                    <div><Text size="small" className="whitespace-pre-wrap">{comment.body}</Text><Badge color={statusColor(comment.status)}>{comment.status}</Badge></div>
                  </div>
                  <div className="flex gap-2">{comment.status !== "approved" ? <Button size="small" onClick={() => act("approve", { comment_id: comment.id })}>Approve</Button> : null}<Button size="small" variant="danger" onClick={() => act("hide", { comment_id: comment.id })}>Hide</Button></div>
                </div>
              ))}
            </div>
          </Container>
        ))}
      </div>
      {(query.data?.reports || []).filter((report) => report.status === "open").length ? (
        <Container className="grid gap-3 px-6 py-4">
          <Heading level="h2">Open reports</Heading>
          {query.data!.reports.filter((report) => report.status === "open").map((report) => (
            <div key={report.id} className="flex items-start justify-between gap-3 rounded-lg border border-ui-border-base p-3">
              <div><Text size="small" weight="plus">{report.reason}</Text>{report.details ? <Text size="small" className="text-ui-fg-subtle">{report.details}</Text> : null}</div>
              <div className="flex gap-2"><Button size="small" onClick={() => reportMutation.mutate({ reportId: report.id, action: "resolve" })}>Resolve</Button><Button size="small" variant="secondary" onClick={() => reportMutation.mutate({ reportId: report.id, action: "dismiss" })}>Dismiss</Button></div>
            </div>
          ))}
        </Container>
      ) : null}
    </div>
  )
}
