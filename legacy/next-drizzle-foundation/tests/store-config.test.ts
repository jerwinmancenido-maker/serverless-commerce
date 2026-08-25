import { describe, expect, it } from "vitest";

import { storeConfig } from "@/config/store";

describe("Research Compounds store configuration", () => {
  it("captures the accepted brand and checkout policies", () => {
    expect(storeConfig).toMatchObject({
      name: "Research Compounds",
      currency: "PHP",
      countryCode: "PH",
      customerAccountsRequired: true,
      vouchersEnabled: true,
    });
  });

  it("does not hardcode payment or shipping choices", () => {
    expect(storeConfig).not.toHaveProperty("paymentMethod");
    expect(storeConfig).not.toHaveProperty("shippingMethod");
  });

  it("requires the four accepted printable document types", () => {
    expect(storeConfig.printableDocumentTypes).toEqual([
      "receipt",
      "packing_list",
      "box_label",
      "bottle_label",
    ]);
  });
});
