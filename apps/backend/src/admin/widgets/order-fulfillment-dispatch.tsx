/**
 * @file    apps/backend/src/admin/widgets/order-fulfillment-dispatch.tsx
 * @module  OrderFulfillmentDispatchWidget (Medusa Admin Widget)
 * @purpose Admin order fulfillment widget with constituents pick & pack checklist, print station, and J&T VIP QuickOrder assistant.
 * @contracts
 *   Zone:    order.details.after
 *   Service: J&T Express Philippines Domestic Dispatch
 */

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
import {
  ArchiveBox,
  ArrowUpRightOnBox,
  Beaker,
  CheckCircleSolid,
  CurrencyDollar,
  DocumentText,
  SquaresPlus,
} from "@medusajs/icons"
import {
  PackingStationDrawer,
  type PrintableDocumentType,
} from "../components/printables/packing-station-drawer"
import { JntQuickOrderDrawer } from "../components/logistics/jnt-quick-order-drawer"
import {
  cleanJntWaybill,
  isValidJntWaybill,
} from "../../lib/jnt-express-helper"
import { sdk } from "../lib/sdk"

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

type DisaggregatedComponent = {
  title: string
  quantity: number
}

function disaggregatePackingItems(item: HttpTypes.AdminOrderLineItem): DisaggregatedComponent[] {
  const title = (item.title || "").toLowerCase()
  const subtitle = (item.subtitle || "").toLowerCase()
  const sku = (item.variant_sku || "").toUpperCase()
  const results: DisaggregatedComponent[] = []

  // Check 1: Multi-Compound Stacks
  if (sku.includes("BNDL-EGN") || (title.includes("epithalon") && title.includes("glutathione") && title.includes("nad"))) {
    results.push({ title: "Epithalon 10MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "NAD+ 500MG Lyophilized Research Vial", quantity: 1 })
  } else if (sku.includes("BNDL-GNG") || (title.includes("glutathione") && title.includes("nad") && title.includes("ghk"))) {
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "NAD+ 500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "GHK-Cu 100MG Lyophilized Research Vial", quantity: 1 })
  } else if (sku.includes("BNDL-GG") || (title.includes("ghk-cu") && title.includes("glutathione"))) {
    results.push({ title: "GHK-Cu 100MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
  } else if (sku.includes("BNDL-EG") || (title.includes("epithalon") && title.includes("glutathione"))) {
    results.push({ title: "Epithalon 10MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "Glutathione 1500MG Lyophilized Research Vial", quantity: 1 })
  } else if (sku.includes("BNDL-NG") || (title.includes("nad") && title.includes("ghk"))) {
    results.push({ title: "NAD+ 500MG Lyophilized Research Vial", quantity: 1 })
    results.push({ title: "GHK-Cu 100MG Lyophilized Research Vial", quantity: 1 })
  }

  // Check 2: Tier 1 Inclusions (BAC Water / Complete SubQ Set)
  if (subtitle.includes("subq") || title.includes("subq")) {
    results.push({ title: "10mL Bacteriostatic Water USP (Diluent)", quantity: 1 })
    results.push({ title: "10x 1mL Sterile Syringes (31G, 5/16\")", quantity: 1 })
    results.push({ title: "10x Sterile Alcohol Antiseptic Swabs", quantity: 1 })
  } else if (subtitle.includes("bac") || title.includes("bac")) {
    results.push({ title: "10mL Bacteriostatic Water USP (Diluent)", quantity: 1 })
  }

  return results
}

const OrderFulfillmentDispatchWidget = ({
  data: order,
}: DetailWidgetProps<HttpTypes.AdminOrder>) => {
  const queryClient = useQueryClient()
  const [waybillNumber, setWaybillNumber] = useState("")
  const [isFulfilling, setIsFulfilling] = useState(false)
  const [printDrawerOpen, setPrintDrawerOpen] = useState(false)
  const [quickOrderDrawerOpen, setQuickOrderDrawerOpen] = useState(false)
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
      const tracking = cleanJntWaybill(waybillNumber)

      if (waybillNumber.trim() && !isValidJntWaybill(tracking)) {
        toast.error("Please enter a valid 12-digit Philippine J&T waybill number (e.g. 781234567890)")
        setIsFulfilling(false)
        throw new Error("Invalid 12-digit Philippine J&T waybill number")
      }

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
            Philippine Courier Fulfillment &amp; Protective Ambient Dispatch
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => setQuickOrderDrawerOpen(true)}
          >
            🚚 J&amp;T VIP QuickOrder
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("packing-slip")}
          >
            <DocumentText className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Packing Slip
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("shipping-label")}
          >
            <ArchiveBox className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Box Label
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("vial-labels")}
          >
            <Beaker className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Vial Labels
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => openPrintStation("receipt")}
          >
            <CurrencyDollar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
            Receipt
          </Button>
          {order.payment_status === "captured" && !isFulfilledOrShipped && (
            <Badge color="blue">
              <CheckCircleSolid className="mr-1 h-3 w-3 text-blue-600" />
              Pack Ready (Paid)
            </Badge>
          )}
        </div>
      </div>

      {/* Items Checklist to Pack */}
      <div className="px-6 py-4">
        <div className="mb-3 flex items-center justify-between">
          <Text size="xsmall" weight="plus" className="uppercase tracking-wider text-slate-500">
            Fulfillment Packing Checklist ({order.items?.length ?? 0} line items)
          </Text>
          <Text size="xsmall" className="text-slate-400">
            Verify constituent vials before sealing protective lab packaging
          </Text>
        </div>
        <div className="divide-y divide-slate-200/80 rounded-xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
          {order.items?.map((item) => {
            const disaggregated = disaggregatePackingItems(item)
            const isBundle = disaggregated.length > 0

            return (
              <div key={item.id} className="p-3.5 bg-white space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Text size="small" weight="plus" className="text-slate-900 font-semibold">
                        {item.title}
                      </Text>
                      {isBundle && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          <SquaresPlus className="h-3 w-3" />
                          Multi-Item Stack
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <Text size="xsmall" className="text-slate-500 mt-0.5">
                        {item.subtitle}
                      </Text>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="grey">Ordered: {item.quantity}</Badge>
                  </div>
                </div>

                {isBundle ? (
                  <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
                        <Beaker className="h-3.5 w-3.5 text-indigo-600" />
                        Constituent Pick & Pack Checklist (Disaggregated)
                      </span>
                      <span className="text-[11px] font-medium text-indigo-700">
                        Total {disaggregated.reduce((acc, curr) => acc + curr.quantity * item.quantity, 0)} physical units
                      </span>
                    </div>
                    <div className="divide-y divide-indigo-100/70 rounded-md border border-indigo-100/70 bg-white overflow-hidden text-xs">
                      {disaggregated.map((comp, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50/60 transition-colors">
                          <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              defaultChecked={isFulfilledOrShipped}
                            />
                            <span className="text-slate-800 font-medium">{comp.title}</span>
                          </label>
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            x {comp.quantity * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        defaultChecked={isFulfilledOrShipped}
                      />
                      <span className="text-slate-700 font-medium">Verified single vial / item packed</span>
                    </label>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      x {item.quantity}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
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
              ((fulfillment as any).labels?.[0]?.tracking_number as string) ||
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
                    Track on J&T Portal
                    <ArrowUpRightOnBox className="ml-1.5 h-3.5 w-3.5 text-slate-500" />
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

          <div className="flex flex-wrap items-start gap-3">
            <div className="flex flex-col gap-1 w-full sm:w-72">
              <Input
                placeholder="J&T Waybill (e.g. 781234567890)"
                size="small"
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
              />
              {cleanJntWaybill(waybillNumber).length > 0 && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isValidJntWaybill(cleanJntWaybill(waybillNumber)) ? (
                    <Badge color="green">
                      ✓ Valid 12-Digit J&amp;T Waybill
                    </Badge>
                  ) : (
                    <Badge color="orange">
                      ⚠️ Standard J&amp;T waybill is 12 digits ({cleanJntWaybill(waybillNumber).length}/12)
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <Button
              size="small"
              variant="primary"
              isLoading={isFulfilling}
              onClick={() => dispatchMutation.mutate()}
            >
              <ArchiveBox className="mr-1.5 h-3.5 w-3.5" />
              Fulfill &amp; Dispatch Parcel
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

      <JntQuickOrderDrawer
        order={order}
        open={quickOrderDrawerOpen}
        onOpenChange={setQuickOrderDrawerOpen}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderFulfillmentDispatchWidget
