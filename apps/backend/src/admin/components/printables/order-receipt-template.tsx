import type { HttpTypes } from "@medusajs/types"

function formatPhp(amountInCentavos: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amountInCentavos / 100)
}

export const OrderReceiptTemplate = ({ order }: { order: HttpTypes.AdminOrder }) => {
  const addr = order.shipping_address
  const billing = order.billing_address || addr
  const payment = order.payment_collections?.[0]

  return (
    <div className="printable-document bg-white text-zinc-900 p-8 font-sans max-w-2xl mx-auto border border-zinc-200 print:border-none print:p-0">
      {/* Receipt Header */}
      <div className="flex justify-between items-start border-b border-zinc-300 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            RESEARCH COMPOUNDS
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">
            Philippines Formulation Laboratory
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Order Reference: <span className="font-mono font-semibold text-zinc-800">#{order.display_id || order.id.slice(-8)}</span>
          </p>
          <p className="text-xs text-zinc-500">
            Date: {new Date(order.created_at).toLocaleDateString("en-PH", { dateStyle: "long" })}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded">
            {order.payment_status === "captured" ? "OFFICIAL RECEIPT · PAID" : "INVOICE · AWAITING PAYMENT"}
          </span>
          <p className="text-xs text-zinc-500 mt-2">
            Payment: {payment?.payments?.[0]?.provider_id || "Manual QR / Bank Transfer"}
          </p>
        </div>
      </div>

      {/* Bill To & Ship To */}
      <div className="grid grid-cols-2 gap-6 py-6 border-b border-zinc-200 text-xs">
        <div>
          <h2 className="font-semibold text-zinc-700 uppercase tracking-wider mb-1">
            Billed To
          </h2>
          <p className="font-medium text-zinc-900">
            {billing?.first_name} {billing?.last_name || ""}
          </p>
          <p className="text-zinc-600">{billing?.address_1}</p>
          {billing?.address_2 && <p className="text-zinc-600">{billing?.address_2}</p>}
          <p className="text-zinc-600">
            {billing?.city}, {billing?.province} {billing?.postal_code}
          </p>
          <p className="text-zinc-600">{order.email || billing?.phone}</p>
        </div>

        <div>
          <h2 className="font-semibold text-zinc-700 uppercase tracking-wider mb-1">
            Ship To
          </h2>
          <p className="font-medium text-zinc-900">
            {addr?.first_name} {addr?.last_name || ""}
          </p>
          <p className="text-zinc-600">{addr?.address_1}</p>
          {addr?.address_2 && <p className="text-zinc-600">{addr?.address_2}</p>}
          <p className="text-zinc-600">
            {addr?.city}, {addr?.province} {addr?.postal_code}
          </p>
          <p className="text-zinc-600">{addr?.phone || order.email}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-6 border-b border-zinc-200">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-300 text-zinc-500 uppercase tracking-wider">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-center">Qty</th>
              <th className="pb-2 text-right">Unit Price</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {order.items?.map((item) => (
              <tr key={item.id} className="py-2.5">
                <td className="py-2.5 pr-2">
                  <p className="font-semibold text-zinc-900">{item.title}</p>
                  {item.subtitle && <p className="text-zinc-500 text-[11px]">{item.subtitle}</p>}
                </td>
                <td className="py-2.5 text-center text-zinc-700 font-mono">{item.quantity}</td>
                <td className="py-2.5 text-right text-zinc-700 font-mono">{formatPhp(item.unit_price)}</td>
                <td className="py-2.5 text-right font-semibold text-zinc-900 font-mono">
                  {formatPhp((item.unit_price ?? 0) * (item.quantity ?? 1))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="pt-6 flex justify-end">
        <div className="w-64 space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal:</span>
            <span className="font-mono">{formatPhp(order.item_subtotal ?? 0)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Shipping (J&T Express):</span>
            <span className="font-mono">{formatPhp(order.shipping_total ?? 0)}</span>
          </div>
          {(order.discount_total ?? 0) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Voucher Discount:</span>
              <span className="font-mono">-{formatPhp(order.discount_total ?? 0)}</span>
            </div>
          )}
          <div className="border-t border-zinc-300 pt-2 flex justify-between font-bold text-sm text-zinc-950">
            <span>Total Paid (PHP):</span>
            <span className="font-mono">{formatPhp(order.total ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-12 pt-4 border-t border-zinc-200 text-[10px] text-zinc-400 text-center">
        Research Compounds Philippines · For authorized clinical and laboratory research use only.
        <br />
        This receipt serves as proof of commercial purchase and fulfillment reference.
      </div>
    </div>
  )
}
