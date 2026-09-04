import type { HttpTypes } from "@medusajs/types"

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
    (order.fulfillments?.[0]?.labels?.[0]?.tracking_number as string) ||
    ((order.fulfillments?.[0]?.metadata?.waybill_number as string) ?? "JT-PH-PENDING")

  return (
    <div className="printable-document bg-white text-zinc-950 p-6 font-sans max-w-md mx-auto border-2 border-zinc-950 rounded-lg print:border-2 print:p-4 print:max-w-none">
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
          {addr?.address_2 && (
            <p className="text-zinc-700 text-xs">{addr?.address_2}</p>
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

      {/* Handling & Warnings Footer */}
      <div className="mt-3 pt-3 border-t-2 border-zinc-950 grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
        <div className="bg-amber-100 text-amber-900 p-1.5 rounded border border-amber-300 flex items-center justify-center gap-1">
          <span>⚠️ FRAGILE / GLASS VIALS</span>
        </div>
        <div className="bg-blue-100 text-blue-900 p-1.5 rounded border border-blue-300 flex items-center justify-center gap-1">
          <span>❄ KEEP COOL / DO NOT HEAT</span>
        </div>
      </div>

      <div className="mt-2 text-center text-[9px] text-zinc-400 font-mono">
        Ref #{order.display_id || order.id.slice(-8)} · Sealed Packaging Guarantee
      </div>
    </div>
  )
}
