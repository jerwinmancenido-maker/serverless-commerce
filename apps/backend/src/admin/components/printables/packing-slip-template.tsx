/**
 * @file    apps/backend/src/admin/components/printables/packing-slip-template.tsx
 * @module  PackingSlipTemplate (Printable Documents)
 * @purpose Printable laboratory packing slip for order fulfillment and constituent pick & pack verification.
 * @contracts
 *   Service: OrderFulfillmentDispatchWidget · J&T Express Philippines Standard Domestic Dispatch
 */

import type { HttpTypes } from "@medusajs/framework/types"

export const PackingSlipTemplate = ({ order }: { order: HttpTypes.AdminOrder }) => {
  const addr = order.shipping_address

  return (
    <div className="printable-document bg-white text-zinc-900 p-8 font-sans max-w-2xl mx-auto border border-zinc-200 print:border-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-zinc-950">
            LABORATORY PACKING SLIP
          </h1>
          <p className="text-xs text-zinc-600 font-mono mt-0.5">
            ORDER REF: #{order.display_id || order.id.slice(-8)}
          </p>
          <p className="text-xs text-zinc-500">
            Packing Date: {new Date().toLocaleDateString("en-PH", { dateStyle: "medium" })}
          </p>
        </div>
        <div className="text-right">
          <span className="border-2 border-zinc-900 text-zinc-900 text-xs font-bold px-3 py-1 uppercase tracking-widest">
            {order.fulfillment_status === "fulfilled" ? "FULFILLED" : "PACK & DISPATCH"}
          </span>
          <p className="text-xs text-zinc-600 mt-2 font-mono">
            Carrier: J&T Express
          </p>
        </div>
      </div>

      {/* Destination & Logistics */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-zinc-300 text-xs">
        <div>
          <span className="font-bold uppercase text-zinc-500 text-[10px] block">Shipment Recipient</span>
          <p className="font-bold text-zinc-900 text-sm mt-0.5">
            {addr?.first_name} {addr?.last_name || ""}
          </p>
          <p className="text-zinc-700">{addr?.address_1}</p>
          {addr?.address_2 && <p className="text-zinc-700">{addr?.address_2}</p>}
          <p className="text-zinc-700">
            {addr?.city}, {addr?.province} {addr?.postal_code}
          </p>
          <p className="text-zinc-700 font-mono mt-1">Tel: {addr?.phone || "N/A"}</p>
        </div>
        <div className="border-l border-zinc-200 pl-4 space-y-2">
          <div>
            <span className="font-bold uppercase text-zinc-500 text-[10px] block">Storage & Packaging Requirement</span>
            <span className="inline-block bg-zinc-100 text-zinc-900 text-[11px] font-semibold px-2 py-0.5 rounded mt-0.5 border border-zinc-200">
              📦 Protective Lab Packaging (Ambient Stable Lyophilized Vials)
            </span>
          </div>
          <div>
            <span className="font-bold uppercase text-zinc-500 text-[10px] block">Special Inspection</span>
            <p className="text-zinc-600 text-[11px]">
              Verify rubber septums, crimp seals, and lyophilized pellet integrity prior to sealing.
            </p>
          </div>
        </div>
      </div>

      {/* Item Checklist Table */}
      <div className="py-4 border-b-2 border-zinc-900">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
          Compounds Checklist & Verification
        </h2>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-300 text-zinc-600 uppercase text-[10px]">
              <th className="py-1.5 w-8 text-center">Pack</th>
              <th className="py-1.5">Compound Description</th>
              <th className="py-1.5">Specification / Presentation</th>
              <th className="py-1.5 text-center w-16">Qty</th>
              <th className="py-1.5 w-12 text-center">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {order.items?.map((item, idx) => (
              <tr key={item.id} className="py-3">
                <td className="py-3 text-center">
                  <div className="w-4 h-4 border-2 border-zinc-400 mx-auto rounded-sm" />
                </td>
                <td className="py-3 pr-2">
                  <p className="font-bold text-zinc-950 text-sm">{item.title}</p>
                  <p className="text-[10px] font-mono text-zinc-500">ID: {item.id.slice(-8)}</p>
                </td>
                <td className="py-3 text-zinc-700">
                  <p className="font-medium">{item.subtitle || "Standard Research Formulation"}</p>
                  <span className="text-[10px] text-zinc-500 font-mono">Lot: RC-2026-B{idx + 1}</span>
                </td>
                <td className="py-3 text-center">
                  <span className="inline-block bg-zinc-100 text-zinc-950 font-bold px-2.5 py-1 rounded text-sm font-mono">
                    {item.quantity}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="w-4 h-4 border border-zinc-300 mx-auto rounded-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Packer Sign-Off */}
      <div className="pt-6 grid grid-cols-2 gap-8 text-xs">
        <div>
          <p className="text-zinc-500 text-[11px] mb-6">Packed By (Laboratory Technician):</p>
          <div className="border-b border-zinc-400 pb-1 flex justify-between text-zinc-400 font-mono text-[10px]">
            <span>Signature</span>
            <span>Date / Time</span>
          </div>
        </div>
        <div>
          <p className="text-zinc-500 text-[11px] mb-6">QA / Verification Inspector:</p>
          <div className="border-b border-zinc-400 pb-1 flex justify-between text-zinc-400 font-mono text-[10px]">
            <span>Signature</span>
            <span>Date / Time</span>
          </div>
        </div>
      </div>
    </div>
  )
}
