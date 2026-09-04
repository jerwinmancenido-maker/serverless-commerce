import type { HttpTypes } from "@medusajs/types"
import { Button, Drawer, Heading, Text } from "@medusajs/ui"
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

  const handlePrint = () => {
    window.print()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content className="max-w-4xl">
        <Drawer.Header className="border-b border-ui-border-base pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h2">Warehouse Packing & Print Station</Heading>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Order #{order.display_id || order.id.slice(-8)} · Immutable Print Document Generator
              </Text>
            </div>

            <div className="flex items-center gap-2">
              <Button size="small" variant="primary" onClick={handlePrint}>
                🖨️ Print Document
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
              📋 Packing Slip
            </Button>
            <Button
              size="small"
              variant={activeDoc === "shipping-label" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("shipping-label")}
            >
              📦 J&T Box Label
            </Button>
            <Button
              size="small"
              variant={activeDoc === "vial-labels" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("vial-labels")}
            >
              🧪 Vial Labels
            </Button>
            <Button
              size="small"
              variant={activeDoc === "receipt" ? "primary" : "transparent"}
              onClick={() => setActiveDoc("receipt")}
            >
              🧾 Sales Receipt
            </Button>
          </div>
        </Drawer.Header>

        <Drawer.Body className="bg-ui-bg-subtle p-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="mx-auto rounded-lg shadow-sm">
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
