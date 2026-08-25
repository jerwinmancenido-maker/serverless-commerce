export const storeConfig = {
  name: "Research Compounds",
  countryCode: "ph",
  currencyCode: "php",
  customerAccountsRequired: true,
  vouchersRequired: true,
  address: {
    companyLabel: "Company (optional)",
    addressLine1Label: "House no., unit, building, and street",
    addressLine2Label: "Barangay / Subdivision",
    postalCodeLabel: "ZIP code",
    postalCodePattern: "[0-9]{4}",
    postalCodeTitle: "Enter a 4-digit Philippine ZIP code",
    cityLabel: "City / Municipality",
    provinceLabel: "Province",
    phoneLabel: "Mobile number",
  },
  printableDocumentTypes: [
    "receipt",
    "packing-list",
    "box-label",
    "bottle-label",
  ],
} as const
