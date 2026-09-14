"use client"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"
import { storeConfig } from "@lib/store-config"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import PhilippineAddressFields from "@modules/common/components/philippine-address-fields"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import Spinner from "@modules/common/icons/spinner"
import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
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

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "rounded-2xl border border-slate-200/90 bg-white p-6 min-h-[220px] h-full w-full flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all duration-200",
          {
            "ring-2 ring-emerald-500/40 border-emerald-500/60": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div>
          {/* Top Destination Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                <svg className="size-4.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <Heading
                  className="text-left text-base font-bold text-slate-900 tracking-tight"
                  data-testid="address-name"
                >
                  {address.first_name} {address.last_name}
                </Heading>
                {address.company && (
                  <Text
                    className="text-xs font-medium text-slate-500"
                    data-testid="address-company"
                  >
                    {address.company}
                  </Text>
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Verified Destination
            </span>
          </div>

          {/* Formatted Address Details */}
          <div className="text-left mt-3 space-y-1 pl-0.5">
            <p className="text-sm font-medium text-slate-800 leading-snug" data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </p>
            <p className="text-xs text-slate-500" data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </p>
            <p className="text-xs text-slate-400 font-medium" data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </p>
            {address.phone && (
              <p className="text-[11px] text-slate-400 font-mono mt-1 pt-1">
                Tel: {address.phone}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit className="size-3.5 text-slate-400" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            onClick={removeAddress}
            disabled={removing}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash className="size-3.5 text-rose-500" />}
            <span>{removing ? "Removing…" : "Remove"}</span>
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label={storeConfig.address.companyLabel}
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label={storeConfig.address.addressLine1Label}
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <PhilippineAddressFields
                initialValues={{
                  province: address.province,
                  city: address.city,
                  barangay: address.address_2,
                }}
                testIdPrefix="edit-address"
              />
              <Input
                label={storeConfig.address.postalCodeLabel}
                name="postal_code"
                required
                autoComplete="postal-code"
                inputMode="numeric"
                pattern={storeConfig.address.postalCodePattern}
                title={storeConfig.address.postalCodeTitle}
                defaultValue={address.postal_code || undefined}
                data-testid="postal-code-input"
              />
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.country_code || undefined}
                data-testid="country-select"
              />
              <Input
                label={storeConfig.address.phoneLabel}
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
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

export default EditAddress
