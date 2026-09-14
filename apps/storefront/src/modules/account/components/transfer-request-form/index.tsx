"use client"
import { createTransferRequest } from "@lib/data/orders"
import { CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { Heading, IconButton, Input } from "@modules/common/components/ui"
import { useActionState } from "react"
// TODO: Re-add Toaster component when needed
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
              #
            </div>
            <Heading level="h3" className="text-sm sm:text-base font-bold text-slate-900">
              Link Previous Research Order
            </Heading>
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            Purchased before account registration or under an alternate email? Link your existing Medusa order ID to consolidate order telemetry and access tokens.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto"
        >
          <div className="relative min-w-[240px]">
            <Input
              className="w-full text-xs font-mono"
              name="order_id"
              placeholder="order_01M..."
              required
            />
          </div>
          <SubmitButton
            variant="secondary"
            size="small"
            className="whitespace-nowrap h-9 text-xs font-semibold px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Connect Order
          </SubmitButton>
        </form>
      </div>

      {!state.success && state.error && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700">
          {state.error}
        </div>
      )}

      {showSuccess && (
        <div className="mt-4 flex items-center justify-between gap-3 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-900">
          <div className="flex items-center gap-2.5">
            <CheckCircleMiniSolid className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Transfer request sent for {state.order?.id}
              </p>
              <p className="text-[11px] text-slate-600">
                Verification link dispatched to {state.order?.email}. Confirm the link in your inbox to finalize.
              </p>
            </div>
          </div>
          <IconButton
            className="h-fit text-slate-400 hover:text-slate-600"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
