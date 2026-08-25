CREATE TYPE "public"."marketplace" AS ENUM('lazada', 'tiktok', 'shopee');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'processing', 'fulfilled', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."sales_channel" AS ENUM('storefront', 'lazada', 'tiktok', 'shopee');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('received', 'processed', 'failed', 'ignored');--> statement-breakpoint
CREATE TABLE "marketplace_sku_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marketplace" "marketplace" NOT NULL,
	"external_sku" text NOT NULL,
	"external_product_id" text,
	"variant_id" uuid,
	"raw_inventory_item_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_sku_mappings_one_target" CHECK (num_nonnulls("marketplace_sku_mappings"."variant_id", "marketplace_sku_mappings"."raw_inventory_item_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"external_line_id" text NOT NULL,
	"external_sku" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_in_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_price_nonnegative" CHECK ("order_items"."unit_price_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" "sales_channel" DEFAULT 'storefront' NOT NULL,
	"external_order_id" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"currency" char(3) DEFAULT 'PHP' NOT NULL,
	"total_amount_in_cents" integer DEFAULT 0 NOT NULL,
	"customer_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_total_nonnegative" CHECK ("orders"."total_amount_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"title" text NOT NULL,
	"price_in_cents" integer NOT NULL,
	"currency" char(3) DEFAULT 'PHP' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_price_nonnegative" CHECK ("product_variants"."price_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"quantity_on_hand" numeric(18, 6) DEFAULT '0' NOT NULL,
	"reorder_level" numeric(18, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "raw_inventory_items_quantity_nonnegative" CHECK ("raw_inventory_items"."quantity_on_hand" >= 0),
	CONSTRAINT "raw_inventory_items_reorder_nonnegative" CHECK ("raw_inventory_items"."reorder_level" >= 0)
);
--> statement-breakpoint
CREATE TABLE "variant_recipes" (
	"variant_id" uuid NOT NULL,
	"raw_inventory_item_id" uuid NOT NULL,
	"required_quantity" numeric(18, 6) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variant_recipes_variant_id_raw_inventory_item_id_pk" PRIMARY KEY("variant_id","raw_inventory_item_id"),
	CONSTRAINT "variant_recipes_required_positive" CHECK ("variant_recipes"."required_quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marketplace" "marketplace" NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"request_hash" char(64) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "webhook_status" DEFAULT 'received' NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"error" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "webhook_events_attempts_positive" CHECK ("webhook_events"."attempts" > 0)
);
--> statement-breakpoint
ALTER TABLE "marketplace_sku_mappings" ADD CONSTRAINT "marketplace_sku_mappings_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_sku_mappings" ADD CONSTRAINT "marketplace_sku_mappings_raw_inventory_item_id_raw_inventory_items_id_fk" FOREIGN KEY ("raw_inventory_item_id") REFERENCES "public"."raw_inventory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_recipes" ADD CONSTRAINT "variant_recipes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_recipes" ADD CONSTRAINT "variant_recipes_raw_inventory_item_id_raw_inventory_items_id_fk" FOREIGN KEY ("raw_inventory_item_id") REFERENCES "public"."raw_inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "marketplace_sku_mappings_external_sku_uq" ON "marketplace_sku_mappings" USING btree ("marketplace","external_sku");--> statement-breakpoint
CREATE INDEX "marketplace_sku_mappings_variant_idx" ON "marketplace_sku_mappings" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "marketplace_sku_mappings_raw_item_idx" ON "marketplace_sku_mappings" USING btree ("raw_inventory_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "order_items_order_external_line_uq" ON "order_items" USING btree ("order_id","external_line_id");--> statement-breakpoint
CREATE INDEX "order_items_variant_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_channel_external_id_uq" ON "orders" USING btree ("channel","external_order_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_uq" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_uq" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "raw_inventory_items_sku_uq" ON "raw_inventory_items" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "variant_recipes_raw_item_idx" ON "variant_recipes" USING btree ("raw_inventory_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_marketplace_event_uq" ON "webhook_events" USING btree ("marketplace","event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_status_received_idx" ON "webhook_events" USING btree ("status","received_at");