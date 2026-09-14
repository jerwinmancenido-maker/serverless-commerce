"use client"

import { Heading, Text, clx } from "@modules/common/components/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()
  const [ruoAcknowledged, setRuoAcknowledged] = useState(false)

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          {/* Mandatory Laboratory Non-Human Research Compliance Gate */}
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ruoAcknowledged}
                onChange={(e) => setRuoAcknowledged(e.target.checked)}
                className="mt-0.5 size-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                data-testid="ruo-acknowledgment-checkbox"
              />
              <span className="text-xs text-amber-900 leading-relaxed">
                <strong>Mandatory Laboratory Declaration:</strong> I certify that all purchased compounds will be utilized strictly for qualified in-vitro laboratory research and analytical characterization. I acknowledge these materials are <u>NOT</u> for human administration, diagnosis, therapy, or clinical consumption.
              </span>
            </label>
          </div>

          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read PepStack Labs
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} disabled={!ruoAcknowledged} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
