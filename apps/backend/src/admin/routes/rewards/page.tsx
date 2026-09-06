import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import { Button, Container, Heading, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { sdk } from "../../lib/sdk"

type Program = {
  id: string
  name: string
  status: "draft" | "active" | "paused"
  currency_code: string
  purchase_amount_per_point: number
  peso_value_per_point: number
  minimum_redemption_points: number
  maximum_redemption_points: number | null
  points_expire_after_days: number | null
  pending_period_days: number
  referral_enabled: boolean
  referral_minimum_order_amount: number
  referral_waiting_period_days: number
  referral_maximum_per_customer: number | null
  referral_refund_reversal_enabled: boolean
  referral_eligible_product_ids: { values?: string[] } | string[] | null
  referral_starts_at: string | null
  referral_ends_at: string | null
  updated_at?: string
}

type Rule = {
  id: string
  name: string
  event_type: string
  award_type: "fixed" | "purchase_rate"
  point_value: number | null
  purchase_amount_per_point: number | null
  daily_cap: number | null
  weekly_cap: number | null
  lifetime_cap: number | null
  starts_at: string | null
  ends_at: string | null
  status: "active" | "inactive"
  show_as_badge: boolean
  badge_name: string | null
  badge_icon: string | null
  streak_target: number | null
  skip_policy: "ignore" | "break"
  updated_at?: string
}

type Response = { program: Program | null; rules: Rule[] }

const defaultProgram: Omit<Program, "id"> = {
  name: "PepStack Rewards",
  status: "active",
  currency_code: "PHP",
  purchase_amount_per_point: 100,
  peso_value_per_point: 1,
  minimum_redemption_points: 100,
  maximum_redemption_points: null,
  points_expire_after_days: null,
  pending_period_days: 0,
  referral_enabled: false,
  referral_minimum_order_amount: 0,
  referral_waiting_period_days: 0,
  referral_maximum_per_customer: null,
  referral_refund_reversal_enabled: true,
  referral_eligible_product_ids: [],
  referral_starts_at: null,
  referral_ends_at: null,
}

const numberOrNull = (value: string) => value.trim() ? Number(value) : null

function RuleEditor({ rule }: { rule: Rule }) {
  const client = useQueryClient()
  const [value, setValue] = useState(rule)
  useEffect(() => setValue(rule), [rule.id, rule.updated_at])
  const mutation = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/rewards/rules/${rule.id}`, {
      method: "POST",
      body: {
        name: value.name,
        point_value: value.point_value,
        purchase_amount_per_point: value.purchase_amount_per_point,
        daily_cap: value.daily_cap,
        weekly_cap: value.weekly_cap,
        lifetime_cap: value.lifetime_cap,
        starts_at: value.starts_at,
        ends_at: value.ends_at,
      status: value.status,
      show_as_badge: value.show_as_badge,
      badge_name: value.badge_name,
      badge_icon: value.badge_icon,
      streak_target: value.streak_target,
      skip_policy: value.skip_policy,
      },
    }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["rewards-program"] }); toast.success("Reward rule saved") },
    onError: (error) => toast.error(error.message || "Reward rule could not be saved"),
  })
  return (
    <div className="rounded-lg border border-ui-border-base p-4">
      <div className="flex items-start justify-between gap-4">
        <div><Text weight="plus">{rule.name}</Text><Text size="xsmall" className="mt-1 text-ui-fg-subtle">{rule.event_type.replaceAll("_", " ")}</Text></div>
        <Select value={value.status} onValueChange={(status) => setValue({ ...value, status: status as Rule["status"] })}><Select.Trigger className="w-28"><Select.Value /></Select.Trigger><Select.Content><Select.Item value="active">Active</Select.Item><Select.Item value="inactive">Inactive</Select.Item></Select.Content></Select>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div><Label>{rule.award_type === "fixed" ? "Points" : "₱ per point"}</Label><Input type="number" min="1" value={rule.award_type === "fixed" ? value.point_value || "" : value.purchase_amount_per_point || ""} onChange={(event) => rule.award_type === "fixed" ? setValue({ ...value, point_value: numberOrNull(event.target.value) }) : setValue({ ...value, purchase_amount_per_point: numberOrNull(event.target.value) })} /></div>
        <div><Label>Daily cap</Label><Input type="number" min="1" value={value.daily_cap || ""} onChange={(event) => setValue({ ...value, daily_cap: numberOrNull(event.target.value) })} /></div>
        <div><Label>Weekly cap</Label><Input type="number" min="1" value={value.weekly_cap || ""} onChange={(event) => setValue({ ...value, weekly_cap: numberOrNull(event.target.value) })} /></div>
        <div><Label>Lifetime cap</Label><Input type="number" min="1" value={value.lifetime_cap || ""} onChange={(event) => setValue({ ...value, lifetime_cap: numberOrNull(event.target.value) })} /></div>
        <div className="flex items-end"><Button size="small" variant="secondary" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Save rule</Button></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.show_as_badge} onChange={(event) => setValue({ ...value, show_as_badge: event.target.checked })} />Show as badge</label>
        <div><Label>Badge name</Label><Input value={value.badge_name || ""} onChange={(event) => setValue({ ...value, badge_name: event.target.value || null })} /></div>
        <div><Label>Badge icon key</Label><Input value={value.badge_icon || ""} onChange={(event) => setValue({ ...value, badge_icon: event.target.value || null })} /></div>
        <div><Label>Streak target</Label><Input type="number" min="1" value={value.streak_target || ""} onChange={(event) => setValue({ ...value, streak_target: numberOrNull(event.target.value) })} /></div>
        <div><Label>Skipped activity</Label><Select value={value.skip_policy} onValueChange={(skip_policy) => setValue({ ...value, skip_policy: skip_policy as Rule["skip_policy"] })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="ignore">Does not break</Select.Item><Select.Item value="break">Breaks streak</Select.Item></Select.Content></Select></div>
      </div>
    </div>
  )
}

const RewardsAdminPage = () => {
  const client = useQueryClient()
  const query = useQuery({ queryKey: ["rewards-program"], queryFn: () => sdk.client.fetch<Response>("/admin/rewards/program") })
  const [program, setProgram] = useState<Omit<Program, "id"> & { id?: string }>(defaultProgram)
  useEffect(() => { if (query.data?.program) setProgram(query.data.program) }, [query.data?.program?.id, query.data?.program?.updated_at])
  const mutation = useMutation({
    mutationFn: () => sdk.client.fetch("/admin/rewards/program", { method: "POST", body: {
      program_id: program.id,
      name: program.name,
      status: program.status,
      currency_code: program.currency_code,
      purchase_amount_per_point: Number(program.purchase_amount_per_point),
      peso_value_per_point: Number(program.peso_value_per_point),
      minimum_redemption_points: Number(program.minimum_redemption_points),
      maximum_redemption_points: program.maximum_redemption_points,
      points_expire_after_days: program.points_expire_after_days,
      pending_period_days: Number(program.pending_period_days),
      referral_enabled: program.referral_enabled,
      referral_minimum_order_amount: Number(program.referral_minimum_order_amount),
      referral_waiting_period_days: Number(program.referral_waiting_period_days),
      referral_maximum_per_customer: program.referral_maximum_per_customer,
      referral_refund_reversal_enabled: program.referral_refund_reversal_enabled,
      referral_eligible_product_ids: Array.isArray(program.referral_eligible_product_ids)
        ? program.referral_eligible_product_ids
        : program.referral_eligible_product_ids?.values ?? [],
      referral_starts_at: program.referral_starts_at,
      referral_ends_at: program.referral_ends_at,
    } }),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["rewards-program"] }); toast.success("Rewards program saved") },
    onError: (error) => toast.error(error.message || "Rewards program could not be saved"),
  })
  const setNumber = (key: keyof typeof program, raw: string) => setProgram({ ...program, [key]: Number(raw) })
  return (
    <div className="flex flex-col gap-4">
      <Container className="px-6 py-4"><Heading>Rewards</Heading><Text size="small" className="mt-1 text-ui-fg-subtle">Configure purchase points, redemption value and editable onboarding or engagement rules. No private Journal text or measurement values are used.</Text></Container>
      <Container className="px-6 py-4">
        <Heading level="h2">Program settings</Heading>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div><Label>Name</Label><Input value={program.name} onChange={(event) => setProgram({ ...program, name: event.target.value })} /></div>
          <div><Label>Status</Label><Select value={program.status} onValueChange={(status) => setProgram({ ...program, status: status as Program["status"] })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="draft">Draft</Select.Item><Select.Item value="active">Active</Select.Item><Select.Item value="paused">Paused</Select.Item></Select.Content></Select></div>
          <div><Label>Purchase amount per point</Label><Input type="number" min="1" value={program.purchase_amount_per_point} onChange={(event) => setNumber("purchase_amount_per_point", event.target.value)} /></div>
          <div><Label>Peso value per point</Label><Input type="number" min="0.01" step="0.01" value={program.peso_value_per_point} onChange={(event) => setNumber("peso_value_per_point", event.target.value)} /></div>
          <div><Label>Minimum redemption</Label><Input type="number" min="0" value={program.minimum_redemption_points} onChange={(event) => setNumber("minimum_redemption_points", event.target.value)} /></div>
          <div><Label>Maximum redemption</Label><Input type="number" min="1" value={program.maximum_redemption_points || ""} onChange={(event) => setProgram({ ...program, maximum_redemption_points: numberOrNull(event.target.value) })} /></div>
          <div><Label>Pending days</Label><Input type="number" min="0" value={program.pending_period_days} onChange={(event) => setNumber("pending_period_days", event.target.value)} /></div>
          <div><Label>Expiration days</Label><Input type="number" min="1" value={program.points_expire_after_days || ""} onChange={(event) => setProgram({ ...program, points_expire_after_days: numberOrNull(event.target.value) })} /></div>
        </div>
        <div className="mt-4 flex justify-end"><Button size="small" isLoading={mutation.isPending} onClick={() => mutation.mutate()}>Save program</Button></div>
      </Container>
      <Container className="px-6 py-4">
        <Heading level="h2">Referral program</Heading>
        <Text size="small" className="mt-1 text-ui-fg-subtle">
          Referral awards remain disabled until this switch and both referral
          earning rules below are active. Self-referrals and duplicate referred
          accounts are always rejected.
        </Text>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div><Label>Status</Label><Select value={program.referral_enabled ? "enabled" : "disabled"} onValueChange={(value) => setProgram({ ...program, referral_enabled: value === "enabled" })}><Select.Trigger><Select.Value /></Select.Trigger><Select.Content><Select.Item value="disabled">Disabled</Select.Item><Select.Item value="enabled">Enabled</Select.Item></Select.Content></Select></div>
          <div><Label>Minimum qualifying order (₱)</Label><Input type="number" min="0" value={program.referral_minimum_order_amount} onChange={(event) => setNumber("referral_minimum_order_amount", event.target.value)} /></div>
          <div><Label>Waiting period (days)</Label><Input type="number" min="0" max="365" value={program.referral_waiting_period_days} onChange={(event) => setNumber("referral_waiting_period_days", event.target.value)} /></div>
          <div><Label>Maximum qualified referrals</Label><Input type="number" min="1" value={program.referral_maximum_per_customer || ""} onChange={(event) => setProgram({ ...program, referral_maximum_per_customer: numberOrNull(event.target.value) })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={program.referral_refund_reversal_enabled} onChange={(event) => setProgram({ ...program, referral_refund_reversal_enabled: event.target.checked })} />Reverse awards after qualifying refund</label>
          <div className="col-span-2"><Label>Eligible product IDs (optional, comma-separated)</Label><Input value={(Array.isArray(program.referral_eligible_product_ids) ? program.referral_eligible_product_ids : program.referral_eligible_product_ids?.values ?? []).join(", ")} onChange={(event) => setProgram({ ...program, referral_eligible_product_ids: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} /></div>
          <div><Label>Campaign starts (optional)</Label><Input type="datetime-local" value={program.referral_starts_at?.slice(0, 16) || ""} onChange={(event) => setProgram({ ...program, referral_starts_at: event.target.value ? new Date(event.target.value).toISOString() : null })} /></div>
          <div><Label>Campaign ends (optional)</Label><Input type="datetime-local" value={program.referral_ends_at?.slice(0, 16) || ""} onChange={(event) => setProgram({ ...program, referral_ends_at: event.target.value ? new Date(event.target.value).toISOString() : null })} /></div>
        </div>
      </Container>
      <Container className="px-6 py-4"><Heading level="h2">Earning rules</Heading><div className="mt-4 space-y-3">{query.data?.rules.map((rule) => <RuleEditor key={rule.id} rule={rule} />) || <Text size="small" className="text-ui-fg-subtle">Save the program to create its default editable rules.</Text>}</div></Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Rewards & Referrals",
  icon: Sparkles,
  rank: 16,
})

export default RewardsAdminPage
