import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { DetailWidgetProps } from "@medusajs/framework/types"
import type { HttpTypes } from "@medusajs/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { sdk } from "../lib/sdk"
import {
  PackingStationDrawer,
  type PrintableDocumentType,
} from "../components/printables/packing-station-drawer"

function buildJntTrackingUrl(trackingNumber: string): string {
  const sanitized = trackingNumber.trim()
  if (!sanitized) return "https://www.jtexpress.ph/trajectoryQuery"
  return `https://www.jtexpress.ph/index/query/gzquery.html?bills=${encodeURIComponent(sanitized)}`
}

function fulfillmentBadgeColor(status: string) {
  if (["fulfilled", "shipped", "delivered"].includes(status)) {
    return "green" as const
  }
  if (status === "partially_fulfilled" || status === "partially_shipped") {
    return "orange" as const
  }
  if (status === "canceled") {
    return "red" as const
  }
  return "grey" as const
}

const OrderFulfillmentDispatchWidget = ({
  data: order,
}: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const queryClient = useQueryClient()
  const [waybillNumber, setWaybillNumber] = useState("")
  const [isFulfilling, setIsFulfilling] = useState(false)
  const [printDrawerOpen, setPrintDrawerOpen] = useState(false)
  const [activePrintDoc, setActivePrintDoc] = useState<PrintableDocumentType>("packing-slip")

  const openPrintStation = (doc: PrintableDocumentType) => {
    setActivePrintDoc(doc)
    setPrintDrawerOpen(true)
  }

  const fulfillments = order.fulfillments ?? []
  const hasFulfillments = fulfillments.length > 0
  const isFulfilledOrShipped = [
    "fulfilled",
    "partially_shipped",
    "shipped",
    "delivered",
  ].includes(order.fulfillment_status)

  // Mutation to fulfill & create J&T shipment with waybill number
  const dispatchMutation = useMutation({
    mutationFn: async () => {
      setIsFulfilling(true)
      const tracking = waybillNumber.trim()
      const trackingUrl = buildJntTrackingUrl(tracking)

      // 1. Pack items from the order
      const itemsToFulfill = (order.items ?? []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }))

      // Create Fulfillment
      const fulfillmentRes = await sdk.admin.order.createFulfillment(order.id, {
        items: itemsToFulfill,
        metadata: {
          courier: "J&T Express",
          waybill_number: tracking || null,
          tracking_url: tracking ? trackingUrl : null,
          dispatched_at: new Date().toISOString(),
        },
      })

      const fulfillmentId =
        (fulfillmentRes as { fulfillment?: { id: string } }).fulfillment?.id ??
        fulfillments[0]?.id

      // 2. If waybill is provided, create shipment record linking the tracking URL
      if (fulfillmentId && tracking) {
        await sdk.admin.order.createShipment(order.id, fulfillmentId, {
          items: itemsToFulfill,
          labels: [
            {
              tracking_number: tracking,
              tracking_url: trackingUrl,
              label_url: trackingUrl,
            },
          ],
        })
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] })
      await queryClient.invalidateQueries({ queryKey: ["order", order.id] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard-pack-ready"] })
      toast.success("Order dispatched via J&T Express")
      setWaybillNumber("")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to dispatch fulfillment")
    },
    onSettled: () => {
      setIsFulfilling(false)
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading level="h2">J&T Express Dispatch & Packing</Heading>
            <Badge color={fulfillmentBadgeColor(order.fulfillment_status)}>
              {order.fulfillment_status.replaceAll("_", " ")}
            </Badge>
          </div>
          <Text size="xsmall" className="mt-0.5 text-ui-fg-subtle">
            Philippine Courier Fulfillment & Temperature-Protected Dispatch
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("packing-slip")}
          >
            📋 Packing Slip
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("shipping-label")}
          >
            📦 Box Label
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("vial-labels")}
          >
            🧪 Vial Labels
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("receipt")}
          >
            🧾 Receipt
          </Button>
          {order.payment_status === "captured" && !isFulfilledOrShipped && (
            <Badge color="green">⚡ Pack Ready (Paid)</Badge>
          )}
        </div>
      </div>

      {/* Items Checklist to Pack */}
      <div className="px-6 py-4">
        <Text size="xsmall" weight="plus" className="mb-2 uppercase text-ui-fg-subtle">
          Packing Checklist ({order.items?.length ?? 0} items)
        </Text>
        <div className="divide-y divide-ui-border-base rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  {item.title}
                </Text>
                {item.subtitle && (
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {item.subtitle}
                  </Text>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge color="grey">Qty: {item.quantity}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Fulfillments / Tracking Section */}
      {hasFulfillments ? (
        <div className="space-y-3 px-6 py-4">
          <Text size="xsmall" weight="plus" className="uppercase text-ui-fg-subtle">
            Dispatched Shipments
          </Text>
          {fulfillments.map((fulfillment) => {
            const metadata = (fulfillment.metadata ?? {}) as Record<string, unknown>
            const waybill =
              (metadata.waybill_number as string) ||
              (fulfillment.labels?.[0]?.tracking_number as string) ||
              null
            const trackingUrl = waybill
              ? (metadata.tracking_url as string) || buildJntTrackingUrl(waybill)
              : null

            return (
              <div
                key={fulfillment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ui-border-base p-3 bg-ui-bg-base"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Text size="small" weight="plus">
                      J&T Express
                    </Text>
                    {fulfillment.shipped_at ? (
                      <Badge color="green">Shipped</Badge>
                    ) : (
                      <Badge color="orange">Packed / Dispatched</Badge>
                    )}
                  </div>
                  <Text size="xsmall" className="mt-0.5 text-ui-fg-subtle font-mono">
                    {waybill ? `Waybill #${waybill}` : "No Waybill Assigned"}
                  </Text>
                </div>

                {trackingUrl && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => window.open(trackingUrl, "_blank")}
                  >
                    🔍 Track on J&T Portal ↗
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      ) : null}

      {/* Dispatch Action Panel */}
      {!isFulfilledOrShipped ? (
        <div className="flex flex-col gap-3 px-6 py-4 bg-ui-bg-subtle/50">
          <div>
            <Text size="small" weight="plus" className="text-ui-fg-base">
              Dispatch with J&T Express
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Enter the J&T airway bill or barcode number printed on the parcel pouch.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-72">
              <Input
                placeholder="J&T Waybill (e.g. 781234567890)"
                size="small"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
              />
            </div>
            <Button
              size="small"
              variant="primary"
              isLoading={isFulfilling}
              onClick={() => dispatchMutation.mutate()}
            >
              🚀 Fulfill & Dispatch Parcel
            </Button>
          </div>
        </div>
      ) : null}

      <PackingStationDrawer
        order={order}
        open={printDrawerOpen}
        onOpenChange={setPrintDrawerOpen}
        initialDoc={activePrintDoc}
        waybillNumber={waybillNumber}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderFulfillmentDispatchWidget
