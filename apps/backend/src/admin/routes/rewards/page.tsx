/**
 * @file    apps/backend/src/admin/routes/rewards/page.tsx
 * @module  RewardsAdminPage
 * @purpose Admin settings for customer rewards points, redemption limits, and referral programs with live SADS 2.0 CRUD rules.
 * @contracts
 *   Route:   /app/rewards
 *   API:     GET/POST /admin/rewards/program · POST /admin/rewards/rules · DELETE /admin/rewards/rules/:id
 *   Service: RewardsModuleService
 */

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles, Plus, Trash, CheckCircleSolid, ArrowPath } from "@medusajs/icons"
import { Button, Heading, Input, Label, Select, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { PageHeader } from "../../components/page-header"
import { AdminMetricCard } from "../../components/ui/admin-metric-card"
import { AdminTelemetryNotice } from "../../components/ui/admin-telemetry-notice"
import { SovereignPageSkeleton } from "../../components/ui/sovereign-page-skeleton"
import { RuleCreateDrawer } from "./rule-create-drawer"
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

const numberOrNull = (value: string) => (value.trim() ? Number(value) : null)

function RuleEditor({ rule }: { rule: Rule }) {
  const client = useQueryClient()
  const [value, setValue] = useState(rule)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => setValue(rule), [rule.id, rule.updated_at])

  const mutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/rewards/rules/${rule.id}`, {
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
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["rewards-program"] })
      toast.success("Reward rule saved.")
    },
    onError: (error: any) => toast.error(error?.message || "Reward rule could not be saved."),
  })

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove rule "${rule.name}"?`)) return
    setIsDeleting(true)
    try {
      await sdk.client.fetch(`/admin/rewards/rules/${rule.id}`, {
        method: "DELETE",
      })
      toast.success("Rule removed successfully.")
      await client.invalidateQueries({ queryKey: ["rewards-program"] })
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove rule.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{rule.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                value.status === "active"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {value.status}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-0.5 block">
            event: {rule.event_type}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={value.status}
            onValueChange={(status) =>
              setValue({ ...value, status: status as Rule["status"] })
            }
          >
            <Select.Trigger className="w-24 h-7 text-xs">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="active">Active</Select.Item>
              <Select.Item value="inactive">Inactive</Select.Item>
            </Select.Content>
          </Select>

          <Button
            size="small"
            variant="transparent"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete Rule"
          >
            <Trash className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <Label className="text-[10px] font-semibold text-slate-500">
            {rule.award_type === "fixed" ? "Points" : "₱ per point"}
          </Label>
          <Input
            type="number"
            min="1"
            className="h-7 text-xs mt-0.5"
            value={
              rule.award_type === "fixed"
                ? value.point_value || ""
                : value.purchase_amount_per_point || ""
            }
            onChange={(event) =>
              rule.award_type === "fixed"
                ? setValue({ ...value, point_value: numberOrNull(event.target.value) })
                : setValue({
                    ...value,
                    purchase_amount_per_point: numberOrNull(event.target.value),
                  })
            }
          />
        </div>
        <div>
          <Label className="text-[10px] font-semibold text-slate-500">Daily Cap</Label>
          <Input
            type="number"
            min="1"
            className="h-7 text-xs mt-0.5"
            value={value.daily_cap || ""}
            onChange={(event) =>
              setValue({ ...value, daily_cap: numberOrNull(event.target.value) })
            }
          />
        </div>
        <div>
          <Label className="text-[10px] font-semibold text-slate-500">Lifetime Cap</Label>
          <Input
            type="number"
            min="1"
            className="h-7 text-xs mt-0.5"
            value={value.lifetime_cap || ""}
            onChange={(event) =>
              setValue({ ...value, lifetime_cap: numberOrNull(event.target.value) })
            }
          />
        </div>
        <div className="flex items-end">
          <Button
            size="small"
            variant="secondary"
            className="h-7 text-xs w-full bg-slate-50 hover:bg-slate-100"
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Save Rule
          </Button>
        </div>
      </div>
    </div>
  )
}

export const RewardsAdminPage = () => {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ["rewards-program"],
    queryFn: () => sdk.client.fetch<Response>("/admin/rewards/program"),
  })
  const [program, setProgram] = useState<Omit<Program, "id"> & { id?: string }>(defaultProgram)
  const [isRuleDrawerOpen, setIsRuleDrawerOpen] = useState(false)

  useEffect(() => {
    if (query.data?.program) setProgram(query.data.program)
  }, [query.data?.program?.id, query.data?.program?.updated_at])

  const mutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch("/admin/rewards/program", {
        method: "POST",
        body: {
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
        },
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["rewards-program"] })
      toast.success("Rewards program saved.")
    },
    onError: (error: any) => toast.error(error?.message || "Rewards program could not be saved."),
  })

  const setNumber = (key: keyof typeof program, raw: string) =>
    setProgram({ ...program, [key]: Number(raw) })

  if (query.isLoading) {
    return (
      <div className="sovereign-page px-6 pt-6 pb-8">
        <SovereignPageSkeleton cards={4} rows={6} />
      </div>
    )
  }

  const rulesList = query.data?.rules || []
  const activeRulesCount = rulesList.filter((r) => r.status === "active").length

  return (
    <div className="sovereign-page px-6 pt-6 pb-8 flex flex-col gap-y-6">
      <PageHeader
        title="Rewards & Referrals Studio"
        subtitle="Manage customer loyalty points, redemption rates, and automated research milestone rewards."
        eyebrowText="Customer Operations · Loyalty Engine"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => query.refetch()}
              className="h-8 rounded-xl px-3 text-xs font-bold"
            >
              <ArrowPath className="size-3.5 mr-1" />
              Refresh
            </Button>
            <Button
              size="small"
              onClick={() => setIsRuleDrawerOpen(true)}
              className="h-8 rounded-xl px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="size-3.5 mr-1" />
              Add Earning Rule
            </Button>
          </div>
        }
      />

      {/* 4-Tile Top Executive Metric Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Program Status"
          value={program.status.toUpperCase()}
          status={program.status === "active" ? "healthy" : "neutral"}
          subtext="PepStack Loyalty Engine"
        />
        <AdminMetricCard
          label="Earning Rate"
          value={`₱${program.purchase_amount_per_point} / pt`}
          status="healthy"
          subtext="Philippine Peso ratio"
        />
        <AdminMetricCard
          label="Redemption Floor"
          value={`${program.minimum_redemption_points} pts`}
          status="info"
          subtext={`= ₱${program.minimum_redemption_points * program.peso_value_per_point} discount`}
        />
        <AdminMetricCard
          label="Active Rules"
          value={`${activeRulesCount} / ${rulesList.length}`}
          status="healthy"
          subtext="Triggered milestones"
        />
      </div>

      {/* Telemetry Notice Banner */}
      <AdminTelemetryNotice
        title="Compliant Non-Monetary Loyalty Vault"
        description="All PepStack reward points and referral bonuses are accounted for as research discount credits for institutional peptide procurement."
        statusText="LOYALTY ENGINE ACTIVE"
        variant="indigo"
      />

      {/* Full-Width Operational Settings & Earning Matrix */}
      <div className="flex flex-col gap-6">
        {/* Top 2-Column Grid: Base Program Settings & Referral Program Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Base Program Settings */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Program Currency & Accrual</h3>
                <p className="text-xs text-slate-500">Core point generation and redemption limits.</p>
              </div>
              <Button
                size="small"
                className="h-8 bg-slate-900 text-white"
                isLoading={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                Save Settings
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Program Name</Label>
                <Input
                  value={program.name}
                  onChange={(e) => setProgram({ ...program, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Operational Status</Label>
                <Select
                  value={program.status}
                  onValueChange={(s) => setProgram({ ...program, status: s as Program["status"] })}
                >
                  <Select.Trigger className="mt-1 w-full">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="draft">Draft</Select.Item>
                    <Select.Item value="active">Active</Select.Item>
                    <Select.Item value="paused">Paused</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Spend per point (₱)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={program.purchase_amount_per_point}
                  onChange={(e) => setNumber("purchase_amount_per_point", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Peso value per point (₱)
                </Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={program.peso_value_per_point}
                  onChange={(e) => setNumber("peso_value_per_point", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Minimum redemption points
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={program.minimum_redemption_points}
                  onChange={(e) => setNumber("minimum_redemption_points", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Maximum redemption points
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={program.maximum_redemption_points || ""}
                  onChange={(e) =>
                    setProgram({
                      ...program,
                      maximum_redemption_points: numberOrNull(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Referral Program Settings */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Referral Program Engine</h3>
                <p className="text-xs text-slate-500">
                  Incentivize verified researcher invitations and laboratory network growth.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  program.referral_enabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {program.referral_enabled ? "REFERRALS ACTIVE" : "REFERRALS DISABLED"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Referral Switch</Label>
                <Select
                  value={program.referral_enabled ? "enabled" : "disabled"}
                  onValueChange={(val) =>
                    setProgram({ ...program, referral_enabled: val === "enabled" })
                  }
                >
                  <Select.Trigger className="mt-1 w-full">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="enabled">Enabled</Select.Item>
                    <Select.Item value="disabled">Disabled</Select.Item>
                  </Select.Content>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Min Qualifying Order (₱)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={program.referral_minimum_order_amount}
                  onChange={(e) => setNumber("referral_minimum_order_amount", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Waiting Period (Days)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="365"
                  value={program.referral_waiting_period_days}
                  onChange={(e) => setNumber("referral_waiting_period_days", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">
                  Max Referrals per Customer
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={program.referral_maximum_per_customer || ""}
                  onChange={(e) =>
                    setProgram({
                      ...program,
                      referral_maximum_per_customer: numberOrNull(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Section: Earning Rules Suite */}
        <div className="w-full">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Earning Rules ({rulesList.length})</h3>
                <p className="text-xs text-slate-500">Configured milestone triggers and fixed rewards.</p>
              </div>
              <Button
                size="small"
                onClick={() => setIsRuleDrawerOpen(true)}
                className="h-7 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
              >
                <Plus className="size-3.5 mr-1" />
                Add Rule
              </Button>
            </div>

            {rulesList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <Sparkles className="size-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No custom earning rules yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click "Add Earning Rule" to set up purchase points or account milestones.
                </p>
                <Button
                  size="small"
                  onClick={() => setIsRuleDrawerOpen(true)}
                  className="mt-3 bg-indigo-600 text-white"
                >
                  Create Rule Now
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rulesList.map((rule) => (
                  <RuleEditor key={rule.id} rule={rule} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-Over Drawer for Adding New Earning Rules */}
      <RuleCreateDrawer
        open={isRuleDrawerOpen}
        onOpenChange={setIsRuleDrawerOpen}
        onSuccess={() => client.invalidateQueries({ queryKey: ["rewards-program"] })}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Rewards & Referrals",
  icon: Sparkles,
  rank: 16,
})

export default RewardsAdminPage
