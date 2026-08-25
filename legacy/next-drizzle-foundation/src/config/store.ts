export const storeConfig = {
  name: "PepStack Labs",
  tagline: "Precision in Every Molecule",
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
