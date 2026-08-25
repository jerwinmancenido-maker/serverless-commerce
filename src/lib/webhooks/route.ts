import type { Marketplace } from "@/db/schema";

import { normalizeMarketplaceWebhook } from "./normalize";
import { processMarketplaceWebhook } from "./process";
import { verifyWebhookSignature } from "./signature";

const MAX_BODY_BYTES = 1_000_000;

const marketplaceConfig: Record<
  Marketplace,
  { secretEnv: string; signatureHeaders: string[] }
> = {
  lazada: {
    secretEnv: "LAZADA_WEBHOOK_SECRET",
    signatureHeaders: ["x-lazada-signature", "x-signature"],
  },
  tiktok: {
    secretEnv: "TIKTOK_WEBHOOK_SECRET",
    signatureHeaders: ["x-tts-signature", "x-tiktok-signature", "x-signature"],
  },
  shopee: {
    secretEnv: "SHOPEE_WEBHOOK_SECRET",
    signatureHeaders: ["x-shopee-signature", "x-signature"],
  },
};

function jsonResponse(body: unknown, status: number) {
  return Response.json(body, { status });
}

export function createMarketplaceWebhookHandler(marketplace: Marketplace) {
  return async function POST(request: Request) {
    const config = marketplaceConfig[marketplace];
    const secret = process.env[config.secretEnv];

    if (!secret) {
      console.error(`${config.secretEnv} is not configured`);
      return jsonResponse({ ok: false, error: "Webhook is not configured" }, 503);
    }

    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, error: "Payload too large" }, 413);
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return jsonResponse({ ok: false, error: "Payload too large" }, 413);
    }

    const signature = config.signatureHeaders
      .map((header) => request.headers.get(header))
      .find((value): value is string => Boolean(value));

    if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
      return jsonResponse({ ok: false, error: "Invalid signature" }, 401);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
    }

    let event;
    try {
      event = normalizeMarketplaceWebhook(marketplace, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unsupported payload";
      return jsonResponse({ ok: false, error: message }, 400);
    }

    try {
      const result = await processMarketplaceWebhook({
        marketplace,
        event,
        payload,
        rawBody,
      });
      return jsonResponse({ ok: true, ...result }, 200);
    } catch (error) {
      console.error(`${marketplace} webhook processing failed`, error);
      return jsonResponse({ ok: false, error: "Webhook processing failed" }, 500);
    }
  };
}

