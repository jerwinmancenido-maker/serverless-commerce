import { describe, expect, it } from "vitest";

import {
  createWebhookSignature,
  verifyWebhookSignature,
} from "@/lib/webhooks/signature";

describe("webhook signatures", () => {
  it("accepts the exact raw body", () => {
    const body = '{"event_id":"evt_1","quantity":2}';
    const signature = createWebhookSignature(body, "test-secret");

    expect(verifyWebhookSignature(body, signature, "test-secret")).toBe(true);
    expect(
      verifyWebhookSignature(body, `sha256=${signature}`, "test-secret"),
    ).toBe(true);
  });

  it("rejects changed bodies and malformed signatures", () => {
    const signature = createWebhookSignature("original", "test-secret");

    expect(verifyWebhookSignature("changed", signature, "test-secret")).toBe(false);
    expect(verifyWebhookSignature("original", "not-hex", "test-secret")).toBe(false);
  });
});

