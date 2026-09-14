"use client"

/**
 * @file apps/storefront/src/modules/account/components/address-card/add-address.tsx
 * @module CustomerPortal (Address Book)
 * @purpose Modal and trigger for adding a new clinical delivery address.
 * @contracts Medusa Store API: POST /store/customers/me/addresses | Route: /account/addresses
 */

import { Plus } from "@medusajs/icons"
import { Button, Heading } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { storeConfig } from "@lib/store-config"
import { HttpTypes } from "@medusajs/types"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import PhilippineAddressFields from "@modules/common/components/philippine-address-fields"

const AddAddress = ({
  region,
  customTrigger,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
  customTrigger?: (open: () => void) => React.ReactNode
}) => {
  const defaultCountryCode =
    region.countries?.find((country) => country.iso_2 === "ph")?.iso_2 ||
    region.countries?.[0]?.iso_2
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  return (
    <>
      {customTrigger ? (
        customTrigger(open)
      ) : (
        <button
          type="button"
          className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500/70 bg-slate-50/40 hover:bg-emerald-50/20 p-6 min-h-[220px] h-full w-full flex flex-col justify-between items-start text-left group transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs"
          onClick={open}
          data-testid="add-address-button"
        >
          <div className="w-full">
            <div className="flex items-center justify-between mb-3 w-full">
              <div className="size-10 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
                <Plus className="size-5 transition-transform group-hover:scale-110" />
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 group-hover:bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-slate-500 group-hover:text-emerald-800 border border-slate-200/80 group-hover:border-emerald-200/80 transition-colors">
                New Destination
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
              Register New Delivery Address
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Add a clinical facility, clean-bench lab, or personal address for 1-click checkout.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors pt-3">
            <span>+ Add Address</span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
          </div>
        </button>
      )}

      <Modal isOpen={state} close={close} data-testid="add-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Add address</Heading>
        </Modal.Title>
        <form action={formAction} className="min-h-0">
          <input
            type="hidden"
            name="country_code"
            value={defaultCountryCode}
          />
          <Modal.Body>
            <div className="max-h-[calc(75vh-9rem)] w-full overflow-y-auto pr-1">
              <div className="flex flex-col gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label={storeConfig.address.addressLine1Label}
                name="address_1"
                required
                autoComplete="address-line1"
                data-testid="address-1-input"
              />
              <PhilippineAddressFields
                testIdPrefix="new-address"
                layout="two-column"
              >
                <Input
                  label={storeConfig.address.postalCodeLabel}
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  inputMode="numeric"
                  pattern={storeConfig.address.postalCodePattern}
                  title={storeConfig.address.postalCodeTitle}
                  data-testid="postal-code-input"
                />
              </PhilippineAddressFields>
              <Input
                label={storeConfig.address.phoneLabel}
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                data-testid="phone-input"
              />
              </div>
            </div>
            {formState.error && (
              <div
                className="text-rose-500 text-small-regular py-2"
                data-testid="address-error"
              >
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default AddAddress
