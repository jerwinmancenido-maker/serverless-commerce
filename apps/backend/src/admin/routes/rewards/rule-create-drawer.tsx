/**
 * @file    apps/backend/src/admin/routes/rewards/rule-create-drawer.tsx
 * @module  RuleCreateDrawer
 * @purpose Slide-over drawer for creating custom reward earning rules dynamically with live point calibration.
 * @contracts
 *   Drawer:  RuleCreateDrawer
 *   API:     POST /admin/rewards/rules
 */

import React, { useState } from "react"
import {
  Drawer,
  Button,
  Input,
  Label,
  Select,
  toast,
} from "@medusajs/ui"
import { Sparkles, Plus } from "@medusajs/icons"
import { sdk } from "../../lib/sdk"

interface RuleCreateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const RuleCreateDrawer: React.FC<RuleCreateDrawerProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = useState("")
  const [eventType, setEventType] = useState("custom_action")
  const [awardType, setAwardType] = useState<"fixed" | "purchase_rate">("fixed")
  const [pointValue, setPointValue] = useState<number>(50)
  const [purchaseAmountPerPoint, setPurchaseAmountPerPoint] = useState<number>(100)
  const [dailyCap, setDailyCap] = useState<number | undefined>(undefined)
  const [lifetimeCap, setLifetimeCap] = useState<number | undefined>(undefined)
  const [showAsBadge, setShowAsBadge] = useState(false)
  const [badgeName, setBadgeName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Rule name is required.")
      return
    }

    setIsSubmitting(true)
    try {
      await sdk.client.fetch("/admin/rewards/rules", {
        method: "POST",
        body: {
          name: name.trim(),
          event_type: eventType.trim(),
          award_type: awardType,
          point_value: awardType === "fixed" ? Number(pointValue) : null,
          purchase_amount_per_point: awardType === "purchase_rate" ? Number(purchaseAmountPerPoint) : null,
          daily_cap: dailyCap ? Number(dailyCap) : null,
          lifetime_cap: lifetimeCap ? Number(lifetimeCap) : null,
          status: "active",
          show_as_badge: showAsBadge,
          badge_name: badgeName.trim() || null,
        },
      })

      toast.success("Reward rule created successfully.")
      onOpenChange(false)
      setName("")
      setBadgeName("")
      setShowAsBadge(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create reward rule.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="overflow-y-auto max-w-lg">
        <Drawer.Header>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Sparkles className="size-4" />
            </div>
            <div>
              <Drawer.Title className="text-base font-bold text-slate-900">
                New Earning Rule
              </Drawer.Title>
              <Drawer.Description className="text-xs text-slate-500">
                Add an automated customer reward trigger for research interactions or purchase milestones.
              </Drawer.Description>
            </div>
          </div>
        </Drawer.Header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 p-6 text-xs">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Rule Name</Label>
            <Input
              placeholder="e.g. Protocol Submission Bonus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Trigger Event</Label>
              <Input
                placeholder="e.g. order_completed"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1 font-mono text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Award Type</Label>
              <Select
                value={awardType}
                onValueChange={(val) => setAwardType(val as "fixed" | "purchase_rate")}
              >
                <Select.Trigger className="mt-1 w-full">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="fixed">Fixed Points</Select.Item>
                  <Select.Item value="purchase_rate">Purchase Rate (₱/pt)</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>

          {awardType === "fixed" ? (
            <div>
              <Label className="text-xs font-semibold text-slate-700">Points Awarded</Label>
              <Input
                type="number"
                min="1"
                value={pointValue}
                onChange={(e) => setPointValue(Number(e.target.value))}
                className="mt-1"
                required
              />
            </div>
          ) : (
            <div>
              <Label className="text-xs font-semibold text-slate-700">Pesos Per Point (₱)</Label>
              <Input
                type="number"
                min="1"
                value={purchaseAmountPerPoint}
                onChange={(e) => setPurchaseAmountPerPoint(Number(e.target.value))}
                className="mt-1"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Daily Cap (Optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={dailyCap ?? ""}
                onChange={(e) => setDailyCap(e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Lifetime Cap (Optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={lifetimeCap ?? ""}
                onChange={(e) => setLifetimeCap(e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAsBadge}
                onChange={(e) => setShowAsBadge(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-700">Display as achievement badge</span>
            </label>

            {showAsBadge && (
              <div className="mt-2">
                <Label className="text-xs font-semibold text-slate-700">Badge Label</Label>
                <Input
                  placeholder="e.g. Master Researcher"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              isLoading={isSubmitting}
            >
              <Plus className="size-3.5 mr-1" />
              Create Rule
            </Button>
          </div>
        </form>
      </Drawer.Content>
    </Drawer>
  )
}
