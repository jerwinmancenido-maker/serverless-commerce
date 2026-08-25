import { HttpTypes } from "@medusajs/types"
import { storeConfig } from "@lib/store-config"
import Input from "@modules/common/components/input"
import PhilippineAddressFields from "@modules/common/components/philippine-address-fields"
import React, { useState } from "react"
import CountrySelect from "../country-select"

const BillingAddress = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    "billing_address.first_name": cart?.billing_address?.first_name || "",
    "billing_address.last_name": cart?.billing_address?.last_name || "",
    "billing_address.address_1": cart?.billing_address?.address_1 || "",
    "billing_address.address_2": cart?.billing_address?.address_2 || "",
    "billing_address.company": cart?.billing_address?.company || "",
    "billing_address.postal_code": cart?.billing_address?.postal_code || "",
    "billing_address.city": cart?.billing_address?.city || "",
    "billing_address.country_code":
      cart?.billing_address?.country_code ||
      cart?.region?.countries?.[0]?.iso_2 ||
      "",
    "billing_address.province": cart?.billing_address?.province || "",
    "billing_address.phone": cart?.billing_address?.phone || "",
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="billing_address.first_name"
          autoComplete="given-name"
          value={formData["billing_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="Last name"
          name="billing_address.last_name"
          autoComplete="family-name"
          value={formData["billing_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label={storeConfig.address.addressLine1Label}
          name="billing_address.address_1"
          autoComplete="address-line1"
          value={formData["billing_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="billing-address-input"
        />
        <Input
          label={storeConfig.address.companyLabel}
          name="billing_address.company"
          value={formData["billing_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="billing-company-input"
        />
        <Input
          label={storeConfig.address.postalCodeLabel}
          name="billing_address.postal_code"
          autoComplete="postal-code"
          value={formData["billing_address.postal_code"]}
          onChange={handleChange}
          required
          inputMode="numeric"
          pattern={storeConfig.address.postalCodePattern}
          title={storeConfig.address.postalCodeTitle}
          data-testid="billing-postal-input"
        />
        <CountrySelect
          name="billing_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["billing_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="billing-country-select"
        />
        <Input
          label={storeConfig.address.phoneLabel}
          name="billing_address.phone"
          type="tel"
          autoComplete="tel"
          value={formData["billing_address.phone"]}
          onChange={handleChange}
          required
          data-testid="billing-phone-input"
        />
      </div>
      <div className="mt-4">
        <PhilippineAddressFields
          fieldNames={{
            province: "billing_address.province",
            city: "billing_address.city",
            barangay: "billing_address.address_2",
          }}
          initialValues={{
            province: formData["billing_address.province"],
            city: formData["billing_address.city"],
            barangay: formData["billing_address.address_2"],
          }}
          testIdPrefix="billing-address"
        />
      </div>
    </>
  )
}

export default BillingAddress
