export const storeConfig = {
  name: "Research Compounds",
  currency: "PHP",
  countryCode: "PH",
  customerAccountsRequired: true,
  vouchersEnabled: true,
  printableDocumentTypes: [
    "receipt",
    "packing_list",
    "box_label",
    "bottle_label",
  ],
} as const;
