import { createHmac, timingSafeEqual } from "node:crypto";

function normalizeSignature(value: string) {
  return value.trim().replace(/^sha256=/i, "").toLowerCase();
}

export function createWebhookSignature(rawBody: string, secret: string) {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyWebhookSignature(
  rawBody: string,
  suppliedSignature: string,
  secret: string,
) {
  const supplied = normalizeSignature(suppliedSignature);

  if (!/^[a-f0-9]{64}$/.test(supplied)) {
    return false;
  }

  const expected = createWebhookSignature(rawBody, secret);
  return timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
}

