/**
 * @file    apps/backend/src/admin/widgets/order-bot-qa-alert.tsx
 * @module  OrderBotQaAlertWidget (Autonomous Agent Runner Module)
 * @purpose Displays an unmistakable operational warning banner and 1-click purge action for synthetic bot QA orders.
 * @contracts
 *   API:     POST /admin/bot-missions/purge
 *   Widget:  zone: "order.details.before"
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowUpRightOnBox, CircleWarningSolid, Trash } from "@medusajs/icons"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"

const OrderBotQaAlertWidget = ({
  data: order,
}: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const queryClient = useQueryClient()

  const isBotQa = Boolean(
    order?.metadata?.is_bot_qa === true ||
    (typeof order?.email === "string" && order.email.startsWith("qa-bot-"))
  )

  const isPurged = Boolean(
    order?.metadata?.is_purged === true ||
    order?.status === "canceled"
  )

  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/admin/bot-missions/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: order.id }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to purge QA order")
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success("QA Order Cancelled", {
        description: "Synthetic test order purged and reservations released.",
      })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["order", order.id] })
    },
    onError: (err: Error) => {
      toast.error("Purge Failed", {
        description: err.message,
      })
    },
  })

  if (!isBotQa) {
    return null
  }

  const runId = (order?.metadata?.bot_run_id as string) || "Unknown Run"

  return (
    <div className="mb-4 rounded-xl border border-amber-300/80 bg-amber-50/80 p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
            <CircleWarningSolid className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h2" className="text-sm font-bold text-amber-900 tracking-tight">
                🧪 AUTONOMOUS BOT QA TEST ORDER — DO NOT DISPATCH
              </Heading>
              {isPurged ? (
                <Badge size="small" color="grey">
                  PURGED / CANCELED
                </Badge>
              ) : (
                <Badge size="small" color="orange" className="animate-pulse">
                  SYNTHETIC QA
                </Badge>
              )}
            </div>
            <Text className="text-xs text-amber-800 mt-1 max-w-2xl">
              This order was created autonomously by Bot Mission Control for end-to-end verification.
              Do not pull physical inventory or pack reference vials for this shipment.
            </Text>
            <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px] text-amber-900/80">
              <span className="bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                Run ID: {runId}
              </span>
              <span className="bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                Email: {order.email}
              </span>
              <span className="bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                Status: {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link to="/bot-lab">
            <Button size="small" variant="secondary" className="text-xs">
              <ArrowUpRightOnBox className="size-3.5" />
              Bot Lab
            </Button>
          </Link>
          {!isPurged && (
            <Button
              size="small"
              variant="danger"
              isLoading={purgeMutation.isPending}
              onClick={() => purgeMutation.mutate()}
              className="text-xs"
            >
              <Trash className="size-3.5" />
              Purge QA Order
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderBotQaAlertWidget
