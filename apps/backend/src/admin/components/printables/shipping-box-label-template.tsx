/**
 * @file    apps/backend/src/admin/components/printables/shipping-box-label-template.tsx
 * @module  ShippingBoxLabelTemplate (Printable Documents)
 * @purpose Printable standard domestic dispatch box label with Philippine address hierarchy and fragile handling stickers.
 * @contracts
 *   Service: OrderFulfillmentDispatchWidget · J&T Express Philippines Standard Domestic Dispatch
 */

import type { HttpTypes } from "@medusajs/framework/types"
import { extractBarangay } from "../../../lib/jnt-express-helper"

export const ShippingBoxLabelTemplate = ({
  order,
  waybillNumber,
}: {
  order: HttpTypes.AdminOrder
  waybillNumber?: string
}) => {
  const addr = order.shipping_address
  const waybill =
    waybillNumber ||
    ((order.fulfillments?.[0] as any)?.labels?.[0]?.tracking_number as string) ||
    ((order.fulfillments?.[0]?.metadata?.waybill_number as string) ?? "JT-PH-PENDING")

  const barangay = extractBarangay(addr?.address_1, addr?.address_2)
  const hasBarangayInAddress1 = addr?.address_1
    ? /(?:b(?:aran)?g(?:a)?y\.?|brgy\.?)/i.test(addr.address_1)
    : false

  return (
    <div data-doc-type="shipping-label" className="printable-document printable-shipping-label bg-white text-zinc-950 p-6 font-sans max-w-md mx-auto border-2 border-zinc-950 rounded-lg print:border-2 print:p-3 print:max-w-none">
      {/* Carrier Top Bar */}
      <div className="flex justify-between items-center border-b-4 border-zinc-950 pb-3">
        <div>
          <span className="text-2xl font-black italic tracking-tighter text-red-600">
            J&T <span className="text-zinc-900 not-italic font-bold">EXPRESS</span>
          </span>
          <span className="block text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
            PHILIPPINES DOMESTIC DISPATCH
          </span>
        </div>
        <div className="text-right">
          <span className="bg-zinc-950 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
            STANDARD
          </span>
          <span className="block text-[10px] text-zinc-500 font-mono mt-1">
            NCR / PROV
          </span>
        </div>
      </div>

      {/* Barcode / Waybill representation */}
      <div className="py-4 text-center border-b-2 border-zinc-950">
        <div className="font-mono tracking-widest text-lg font-black uppercase text-zinc-950">
          {waybill}
        </div>
        {/* CSS Barcode simulation */}
        <div className="flex justify-center items-center gap-[2px] h-12 my-2 overflow-hidden px-4">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className={`h-full ${
                i % 2 === 0
                  ? i % 3 === 0
                    ? "w-1 bg-zinc-950"
                    : "w-[2px] bg-zinc-950"
                  : i % 5 === 0
                  ? "w-[3px] bg-zinc-950"
                  : "w-[1px] bg-zinc-950"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-zinc-500 font-mono">
          SCAN BARCODE FOR COURIER LOGISTICS INGESTION
        </p>
      </div>

      {/* Shipper & Consignee */}
      <div className="divide-y divide-zinc-300 text-xs">
        {/* Shipper */}
        <div className="py-2.5">
          <span className="text-[9px] font-black uppercase text-zinc-400 block">
            FROM (SHIPPER):
          </span>
          <p className="font-bold text-zinc-800 text-[11px]">
            RESEARCH COMPOUNDS PH · FULFILLMENT LAB
          </p>
          <p className="text-zinc-600 text-[10px]">
            Metro Manila Warehouse Logistics Hub, Philippines
          </p>
        </div>

        {/* Consignee */}
        <div className="py-3">
          <span className="text-[10px] font-black uppercase text-red-600 block">
            DELIVER TO (RECIPIENT):
          </span>
          <p className="font-black text-zinc-950 text-base mt-0.5">
            {addr?.first_name} {addr?.last_name || ""}
          </p>
          <p className="font-bold text-zinc-800 text-xs mt-0.5">
            {addr?.address_1}
          </p>
          {barangay && !hasBarangayInAddress1 && (
            <p className="font-bold text-zinc-800 text-xs">
              Brgy. {barangay}
            </p>
          )}
          <p className="font-bold text-zinc-900 text-xs">
            {addr?.city}, {addr?.province} {addr?.postal_code}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded font-mono font-bold text-xs text-zinc-900 border border-zinc-300">
            <span>TEL:</span>
            <span>{addr?.phone || "NO PHONE PROVIDED"}</span>
          </div>
        </div>
      </div>

      {/* Items Summary & Handling Checklist */}
      <div className="py-2.5 border-t border-zinc-300 text-[10px]">
        <div className="flex justify-between items-center text-zinc-600 font-bold uppercase text-[9px] mb-1">
          <span>Enclosed Contents ({order.items?.length ?? 0} items)</span>
          <span className="font-mono font-normal">Buffer: Insulation Foam</span>
        </div>
        <div className="space-y-0.5 text-zinc-800 font-medium">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <span className="truncate pr-2">{item.title}</span>
              <span className="font-mono font-bold shrink-0">x{item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Handling & Warnings Footer */}
      <div className="mt-2 pt-2 border-t-2 border-zinc-950 grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
        <div className="bg-amber-100 text-amber-950 p-1.5 rounded border border-amber-300 flex items-center justify-center gap-1">
          <span>FRAGILE: GLASS VIALS</span>
        </div>
        <div className="bg-zinc-100 text-zinc-900 p-1.5 rounded border border-zinc-300 flex items-center justify-center gap-1">
          <span>ANALYTICAL REAGENTS</span>
        </div>
      </div>

      <div className="mt-2 text-center text-[9px] text-zinc-400 font-mono">
        Ref #{order.display_id || order.id.slice(-8)} · Sealed Protective Lab Packaging
      </div>
    </div>
  )
}

