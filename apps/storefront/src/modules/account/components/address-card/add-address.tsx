"use client"

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
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
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
      <button
        className="border border-ui-border-base rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">New address</span>
        <Plus />
      </button>

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
