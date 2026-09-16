/**
 * @file    apps/backend/src/admin/components/printables/vial-labels-template.tsx
 * @module  VialLabelsTemplate (Printable Documents)
 * @purpose Printable individual research vial labels with lot numbers and item identifiers.
 * @contracts
 *   Service: OrderFulfillmentDispatchWidget · Laboratory Vial Packaging
 */

import type { HttpTypes } from "@medusajs/framework/types"

export const VialLabelsTemplate = ({ order }: { order: HttpTypes.AdminOrder }) => {
  // Expand line items into individual units to print 1 label per vial/bottle
  const units: Array<{
    id: string
    title: string
    subtitle: string | null
    lotNumber: string
    unitIndex: number
    totalUnits: number
  }> = []

  order.items?.forEach((item, itemIdx) => {
    const qty = item.quantity || 1
    for (let u = 1; u <= qty; u++) {
      units.push({
        id: `${item.id}-${u}`,
        title: item.title,
        subtitle: item.subtitle,
        lotNumber: `RC-${new Date().getFullYear()}-L${itemIdx + 1}`,
        unitIndex: u,
        totalUnits: qty,
      })
    }
  })

  return (
    <div className="printable-document bg-white text-zinc-950 p-6 font-sans max-w-2xl mx-auto print:p-0 print:max-w-none">
      <div className="mb-4 pb-2 border-b border-zinc-300 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-sm font-bold uppercase text-zinc-800">
            Compound Vial / Bottle Labels (Grid)
          </h2>
          <p className="text-xs text-zinc-500">
            Standard 2" x 1.25" Vial Adhesive Labels · {units.length} total units
          </p>
        </div>
      </div>

      {/* Grid of labels */}
      <div className="grid grid-cols-2 gap-3 print:gap-2">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="border border-zinc-900 rounded p-2.5 bg-white text-zinc-950 flex flex-col justify-between h-32 break-inside-avoid print:border-zinc-950"
          >
            {/* Top row */}
            <div className="flex justify-between items-start border-b border-zinc-200 pb-1">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-800 block">
                  RESEARCH COMPOUNDS
                </span>
                <span className="text-[8px] font-mono text-zinc-500">
                  REF: #{order.display_id || order.id.slice(-6)}
                </span>
              </div>
              <span className="text-[9px] font-mono bg-zinc-100 px-1 py-0.5 rounded border border-zinc-300 font-bold">
                {unit.unitIndex}/{unit.totalUnits}
              </span>
            </div>

            {/* Compound Title & Strength */}
            <div className="my-auto py-1">
              <h3 className="font-extrabold text-xs tracking-tight line-clamp-1 text-zinc-950">
                {unit.title}
              </h3>
              <p className="text-[10px] font-bold text-emerald-800">
                {unit.subtitle || "Lyophilized Powder · Pure Formulation"}
              </p>
            </div>

            {/* Bottom Lot & Disclaimers */}
            <div className="border-t border-zinc-200 pt-1 flex justify-between items-end text-[8px] font-mono text-zinc-600">
              <div>
                <span className="block font-bold text-zinc-900">LOT: {unit.lotNumber}</span>
                <span className="block text-[7px] text-zinc-400">STORAGE: 20°C-25°C AMBIENT</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-red-600 uppercase block">RESEARCH ONLY</span>
                <span className="text-[7px] text-zinc-400">NOT FOR HUMAN USE</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
