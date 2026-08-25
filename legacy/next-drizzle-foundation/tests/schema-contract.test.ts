import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  cartItems,
  carts,
  customerAddresses,
  customers,
  inventoryMovements,
  inventoryReservations,
  paymentMethods,
  payments,
  printableDocuments,
  shipments,
  shippingMethods,
  voucherRedemptions,
  vouchers,
} from "@/db/schema";

function columnNames(table: Parameters<typeof getTableConfig>[0]) {
  return getTableConfig(table).columns.map((column) => column.name);
}

describe("commerce v1 schema contract", () => {
  it("defines every new commerce workflow table", () => {
    expect([
      customers,
      customerAddresses,
      carts,
      cartItems,
      vouchers,
      voucherRedemptions,
      paymentMethods,
      payments,
      shippingMethods,
      shipments,
      printableDocuments,
      inventoryReservations,
      inventoryMovements,
    ]).toHaveLength(13);
  });

  it("keeps payment and shipping choices data-driven", () => {
    expect(columnNames(paymentMethods)).toEqual(
      expect.arrayContaining(["code", "name", "method_type", "active", "sort_order"]),
    );
    expect(columnNames(shippingMethods)).toEqual(
      expect.arrayContaining(["code", "name", "carrier", "active", "sort_order"]),
    );
  });

  it("records proof, tracking, printable, and inventory audit data", () => {
    expect(columnNames(payments)).toEqual(
      expect.arrayContaining(["payment_method_id", "proof_url", "reviewed_by"]),
    );
    expect(columnNames(shipments)).toEqual(
      expect.arrayContaining(["shipping_method_id", "tracking_number"]),
    );
    expect(columnNames(printableDocuments)).toContain("document_type");
    expect(columnNames(inventoryReservations)).toContain("status");
    expect(columnNames(inventoryMovements)).toEqual(
      expect.arrayContaining(["movement_type", "quantity_delta", "balance_after"]),
    );
  });
});
