/**
 * @file    apps/backend/src/admin/components/logistics/jnt-quick-order-drawer.tsx
 * @module  JntQuickOrderDrawer (Medusa Admin Logistics Extension)
 * @purpose Drawer assistant providing 1-click clipboard formatting, field extraction, and batch CSV export for J&T VIP QuickOrder.
 * @contracts
 *   Service: OrderFulfillmentDispatchWidget · J&T Express Philippines VIP Integration
 */

import type { HttpTypes } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Copy,
  Drawer,
  Heading,
  Text,
  toast,
} from "@medusajs/ui"
import {
  ArrowDownTray,
  ArrowUpRightOnBox,
  SquareTwoStack,
} from "@medusajs/icons"
import {
  buildJntQuickOrderFields,
  generateJntBatchCsv,
} from "../../../lib/jnt-express-helper"

interface JntQuickOrderDrawerProps {
  order: HttpTypes.AdminOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const JntQuickOrderDrawer = ({
  order,
  open,
  onOpenChange,
}: JntQuickOrderDrawerProps) => {
  const fields = buildJntQuickOrderFields(order)
  const displayId = order.display_id || order.id.slice(-8)

  const copySmartRecognition = async () => {
    try {
      await navigator.clipboard.writeText(fields.smartRecognitionString)
      toast.success("Copied J&T Smart Recognition address to clipboard")
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadBatchCsv = () => {
    try {
      const csvContent = generateJntBatchCsv(order)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `JNT_VIP_Order_${displayId}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success(`Downloaded JNT_VIP_Order_${displayId}.csv`)
    } catch {
      toast.error("Failed to generate CSV export")
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-2xl">
        <Drawer.Header className="border-b border-ui-border-base pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h2">J&T Express VIP QuickOrder Assistant</Heading>
                <Badge color="red">J&T Express PH</Badge>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Order #{displayId} · Fast Ingestion for vip.jtexpress.ph/order/quickOrder
              </Text>
            </div>

            <Button
              size="small"
              variant="secondary"
              onClick={() =>
                window.open(
                  "https://vip.jtexpress.ph/order/quickOrder",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Open J&T VIP Portal
              <ArrowUpRightOnBox className="ml-1.5 h-3.5 w-3.5 text-slate-500" />
            </Button>
          </div>
        </Drawer.Header>

        <Drawer.Body className="bg-ui-bg-subtle p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {/* Smart Recognition Box */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  J&T AI Smart Recognition Text
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Paste into the &ldquo;Smart Address Recognition&rdquo; box on J&amp;T VIP QuickOrder.
                </Text>
              </div>
              <Button
                size="small"
                variant="primary"
                onClick={copySmartRecognition}
              >
                <SquareTwoStack className="mr-1.5 h-3.5 w-3.5" />
                Copy Smart Paste
              </Button>
            </div>

            <div className="rounded-lg border border-ui-border-subtle bg-ui-bg-subtle p-3 font-mono text-xs text-ui-fg-base select-all break-words">
              {fields.smartRecognitionString}
            </div>
          </div>

          {/* Batch CSV Export Box */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4 flex items-center justify-between shadow-sm">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-base">
                Official J&T VIP Batch CSV Template
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                RFC 4180 CSV with official headers ready for batch order upload.
              </Text>
            </div>
            <Button size="small" variant="secondary" onClick={downloadBatchCsv}>
              <ArrowDownTray className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
              Download CSV
            </Button>
          </div>

          {/* Discrete Fields Table */}
          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4 space-y-3 shadow-sm">
            <Text size="small" weight="plus" className="text-ui-fg-base">
              Discrete Consignee &amp; Shipment Fields
            </Text>
            <div className="divide-y divide-ui-border-subtle text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Receiver Name:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    {fields.recipientName}
                  </span>
                  <Copy content={fields.recipientName} />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Phone Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    {fields.recipientPhone || "N/A"}
                  </span>
                  {fields.recipientPhone && (
                    <Copy content={fields.recipientPhone} />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Province / State:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    {fields.province}
                  </span>
                  <Copy content={fields.province} />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">City / Municipality:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    {fields.city || "N/A"}
                  </span>
                  {fields.city && <Copy content={fields.city} />}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">District / Barangay:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    {fields.barangay || "N/A"}
                  </span>
                  {fields.barangay && <Copy content={fields.barangay} />}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Detailed Address:</span>
                <div className="flex items-center gap-2 max-w-xs text-right">
                  <span className="font-semibold text-ui-fg-base font-mono truncate">
                    {fields.streetAddress || "N/A"}
                  </span>
                  {fields.streetAddress && (
                    <Copy content={fields.streetAddress} />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Goods Description:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    {fields.goodsDescription}
                  </span>
                  <Copy content={fields.goodsDescription} />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Declared Value:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ui-fg-base font-mono">
                    PHP {fields.declaredValue.toLocaleString()}
                  </span>
                  <Copy content={String(fields.declaredValue)} />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">COD Amount:</span>
                <div className="flex items-center gap-2">
                  <Badge color={fields.codAmount === 0 ? "green" : "orange"}>
                    {fields.codAmount === 0
                      ? "PHP 0.00 (Prepaid)"
                      : `PHP ${fields.codAmount.toLocaleString()} (COD)`}
                  </Badge>
                  <Copy content={String(fields.codAmount)} />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-ui-fg-subtle font-medium">Remarks:</span>
                <div className="flex items-center gap-2 max-w-xs text-right">
                  <span className="font-semibold text-ui-fg-base font-mono truncate">
                    {fields.remarks}
                  </span>
                  <Copy content={fields.remarks} />
                </div>
              </div>
            </div>
          </div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  )
}
