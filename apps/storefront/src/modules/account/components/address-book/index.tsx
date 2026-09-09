/**
 * @file apps/storefront/src/modules/account/components/address-book/index.tsx
 * @module CustomerPortal (Address Book)
 * @purpose Renders customer address cards or an actionable clinical empty state.
 * @contracts Medusa Store API: /store/customers/me/addresses | Route: /account/addresses
 */

import React from "react"
import { MapPin } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"

import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const { addresses } = customer

  if (!addresses || addresses.length === 0) {
    return (
      <div className="w-full">
        <div
          className="w-full flex flex-col items-center justify-center p-8 mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center gap-y-3"
          data-testid="no-addresses-container"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-slate-900">No Saved Addresses Found</h2>
          <p className="text-sm text-slate-500 max-w-md">
            Save your clinical facility or delivery destination address for 1-click checkout and automated temperature-controlled shipping.
          </p>
          <div className="mt-2">
            <AddAddress
              region={region}
              addresses={addresses || []}
              customTrigger={(open) => (
                <Button onClick={open} data-testid="add-address-button" className="font-medium">
                  Add Delivery Address →
                </Button>
              )}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 mt-4">
        <AddAddress region={region} addresses={addresses} />
        {addresses.map((address) => {
          return (
            <EditAddress region={region} address={address} key={address.id} />
          )
        })}
      </div>
    </div>
  )
}

export default AddressBook
