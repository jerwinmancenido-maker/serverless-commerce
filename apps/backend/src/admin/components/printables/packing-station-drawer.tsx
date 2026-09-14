/**
 * @file    apps/backend/src/admin/components/printables/packing-station-drawer.tsx
 * @module  PackingStationDrawer (Admin Warehouse Printables)
 * @purpose Warehouse packing station drawer with isolated print window dispatch for 4x6 thermal labels, packing slips, and receipts.
 * @contracts
 *   Component: PackingStationDrawer
 *   Parent:    OrderFulfillmentDispatchWidget
 */

import type { HttpTypes } from "@medusajs/types"
import { Badge, Button, Drawer, Heading, Text } from "@medusajs/ui"
import { useState } from "react"

import { OrderReceiptTemplate } from "./order-receipt-template"
import { PackingSlipTemplate } from "./packing-slip-template"
import { ShippingBoxLabelTemplate } from "./shipping-box-label-template"
import { VialLabelsTemplate } from "./vial-labels-template"

export type PrintableDocumentType =
  | "receipt"
  | "packing-slip"
  | "shipping-label"
  | "vial-labels"

interface PackingStationDrawerProps {
  order: HttpTypes.AdminOrder
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDoc?: PrintableDocumentType
  waybillNumber?: string
}

export const PackingStationDrawer = ({
  order,
  open,
  onOpenChange,
  initialDoc = "packing-slip",
  waybillNumber,
}: PackingStationDrawerProps) => {
  const [activeDoc, setActiveDoc] = useState<PrintableDocumentType>(initialDoc)

  const handlePrintIsolated = (docType: PrintableDocumentType) => {
    const printArea = document.getElementById("rc-printable-area")
    if (!printArea) {
      window.print()
      return
    }

    const printWindow = window.open("", "_blank", "width=850,height=900,menubar=no,toolbar=no,location=no,status=no")
    if (!printWindow) {
      window.print()
      return
    }

    const isThermal = docType === "shipping-label" || docType === "vial-labels"
    const pageStyle = isThermal
      ? "@page { size: 4in 6in; margin: 2mm; }"
      : "@page { size: letter portrait; margin: 8mm 10mm; }"

    const docTitle = isThermal
      ? `J&T Thermal Label - #${order.display_id || order.id.slice(-8)}`
      : `Packing Slip - #${order.display_id || order.id.slice(-8)}`

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${docTitle}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${pageStyle}
            body {
              background: #FFFFFF !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .printable-document {
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>
          <div style="padding: 10px;">
            ${printArea.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                window.close();
              }, 350);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const isThermalFormat = activeDoc === "shipping-label" || activeDoc === "vial-labels"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-4xl">
        <Drawer.Header className="border-b border-ui-border-base pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Drawer.Title className="text-base font-bold">
                  Laboratory Packing &amp; Dispatch Station
                </Drawer.Title>
                <Badge color="blue">Order #{order.display_id || order.id.slice(-8)}</Badge>
              </div>
              <Drawer.Description className="text-xs text-ui-fg-subtle mt-0.5">
                Thermal labels (4x6in), packing slips, and customer receipts with single-tap isolated printing.
              </Drawer.Description>
            </div>

            <div className="flex items-center gap-2">
              <Button size="small" variant="secondary" onClick={() => window.print()}>
                Print Dialog
              </Button>
              <Button size="small" variant="primary" onClick={() => handlePrintIsolated(activeDoc)}>
                {isThermalFormat ? "1-Click Thermal Print" : "1-Click Print"}
              </Button>
            </div>
          </div>

          {/* Document Format Tabs */}
          <div className="mt-3 flex flex-wrap gap-1.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-1">
            <Button
              size="small"
              variant={activeDoc === "packing-slip" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("packing-slip")}
            >
              Packing Slip
            </Button>
            <Button
              size="small"
              variant={activeDoc === "shipping-label" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("shipping-label")}
            >
              J&amp;T 4x6 Box Label
            </Button>
            <Button
              size="small"
              variant={activeDoc === "vial-labels" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("vial-labels")}
            >
              Vial Labels
            </Button>
            <Button
              size="small"
              variant={activeDoc === "receipt" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("receipt")}
            >
              Sales Receipt
            </Button>
          </div>
        </Drawer.Header>

        <Drawer.Body className="bg-ui-bg-subtle p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div id="rc-printable-area" className="mx-auto rounded-lg shadow-sm">
            {activeDoc === "receipt" && <OrderReceiptTemplate order={order} />}
            {activeDoc === "packing-slip" && <PackingSlipTemplate order={order} />}
            {activeDoc === "shipping-label" && (
              <ShippingBoxLabelTemplate order={order} waybillNumber={waybillNumber} />
            )}
            {activeDoc === "vial-labels" && <VialLabelsTemplate order={order} />}
          </div>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  )
}
