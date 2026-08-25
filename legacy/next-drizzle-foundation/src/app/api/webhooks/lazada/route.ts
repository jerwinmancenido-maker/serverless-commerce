import { createMarketplaceWebhookHandler } from "@/lib/webhooks/route";

export const runtime = "nodejs";
export const POST = createMarketplaceWebhookHandler("lazada");
