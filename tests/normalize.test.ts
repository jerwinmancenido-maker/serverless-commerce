import { describe, expect, it } from "vitest";

import { normalizeMarketplaceWebhook } from "@/lib/webhooks/normalize";

describe("marketplace webhook normalization", () => {
  it("normalizes a Lazada-style order", () => {
    const event = normalizeMarketplaceWebhook("lazada", {
      event_id: "evt-lazada-1",
      message_type: "order.paid",
      data: {
        order_id: "order-1",
        order_items: [
          { order_item_id: "line-1", seller_sku: "LAZ-SKU", quantity: 2 },
        ],
      },
    });

    expect(event).toEqual({
      eventId: "evt-lazada-1",
      eventType: "lazada.order.paid",
      externalOrderId: "order-1",
      items: [
        {
          externalLineId: "line-1",
          externalSku: "LAZ-SKU",
          quantity: 2,
          unitPriceInCents: 0,
        },
      ],
    });
  });

  it("rejects an event without a usable SKU", () => {
    expect(() =>
      normalizeMarketplaceWebhook("shopee", {
        event_id: "evt-shopee-1",
        data: { ordersn: "order-2", item_list: [{ quantity: 1 }] },
      }),
    ).toThrow(/Unsupported shopee webhook payload/);
  });
});

