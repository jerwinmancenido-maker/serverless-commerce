CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."inventory_movement_type" AS ENUM('receipt', 'reservation', 'release', 'sale', 'adjustment', 'return', 'damage');--> statement-breakpoint
CREATE TYPE "public"."inventory_reservation_status" AS ENUM('active', 'consumed', 'released', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('awaiting_proof', 'submitted', 'verified', 'rejected', 'expired', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."printable_document_status" AS ENUM('pending', 'generated', 'failed', 'void');--> statement-breakpoint
CREATE TYPE "public"."printable_document_type" AS ENUM('receipt', 'packing_list', 'box_label', 'bottle_label');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('pending', 'ready', 'shipped', 'delivered', 'returned', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."voucher_discount_type" AS ENUM('fixed', 'percentage');--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_in_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_items_quantity_positive" CHECK ("cart_items"."quantity" > 0),
	CONSTRAINT "cart_items_price_nonnegative" CHECK ("cart_items"."unit_price_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"voucher_id" uuid,
	"status" "cart_status" DEFAULT 'active' NOT NULL,
	"currency" char(3) DEFAULT 'PHP' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"label" text DEFAULT 'Shipping' NOT NULL,
	"recipient_name" text NOT NULL,
	"phone" text NOT NULL,
	"line_1" text NOT NULL,
	"line_2" text,
	"barangay" text NOT NULL,
	"city_municipality" text NOT NULL,
	"province" text NOT NULL,
	"postal_code" text NOT NULL,
	"country_code" char(2) DEFAULT 'PH' NOT NULL,
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_subject" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_email_lowercase" CHECK ("customers"."email" = lower("customers"."email"))
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_inventory_item_id" uuid NOT NULL,
	"order_id" uuid,
	"reservation_id" uuid,
	"movement_type" "inventory_movement_type" NOT NULL,
	"quantity_delta" numeric(18, 6) NOT NULL,
	"balance_after" numeric(18, 6) NOT NULL,
	"reference" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_movements_delta_nonzero" CHECK ("inventory_movements"."quantity_delta" <> 0),
	CONSTRAINT "inventory_movements_balance_nonnegative" CHECK ("inventory_movements"."balance_after" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"raw_inventory_item_id" uuid NOT NULL,
	"cart_id" uuid,
	"order_id" uuid,
	"quantity" numeric(18, 6) NOT NULL,
	"status" "inventory_reservation_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_quantity_positive" CHECK ("inventory_reservations"."quantity" > 0),
	CONSTRAINT "inventory_reservations_one_owner" CHECK (num_nonnulls("inventory_reservations"."cart_id", "inventory_reservations"."order_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"method_type" text NOT NULL,
	"description" text,
	"instructions" text,
	"public_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"fee_amount_in_cents" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_code_lowercase" CHECK ("payment_methods"."code" = lower("payment_methods"."code")),
	CONSTRAINT "payment_methods_fee_nonnegative" CHECK ("payment_methods"."fee_amount_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_method_id" uuid NOT NULL,
	"status" "payment_status" DEFAULT 'awaiting_proof' NOT NULL,
	"amount_in_cents" integer NOT NULL,
	"customer_reference" text,
	"proof_url" text,
	"customer_note" text,
	"reviewed_by" text,
	"submitted_at" timestamp with time zone,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_nonnegative" CHECK ("payments"."amount_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "printable_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"document_type" "printable_document_type" NOT NULL,
	"status" "printable_document_status" DEFAULT 'pending' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"file_url" text,
	"error" text,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "printable_documents_version_positive" CHECK ("printable_documents"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"shipping_method_id" uuid NOT NULL,
	"status" "shipment_status" DEFAULT 'pending' NOT NULL,
	"carrier" text NOT NULL,
	"service_level" text,
	"tracking_number" text,
	"tracking_url" text,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"carrier" text NOT NULL,
	"service_level" text,
	"description" text,
	"public_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"base_rate_in_cents" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_methods_code_lowercase" CHECK ("shipping_methods"."code" = lower("shipping_methods"."code")),
	CONSTRAINT "shipping_methods_rate_nonnegative" CHECK ("shipping_methods"."base_rate_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "voucher_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"voucher_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"discount_amount_in_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voucher_redemptions_discount_nonnegative" CHECK ("voucher_redemptions"."discount_amount_in_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"discount_type" "voucher_discount_type" NOT NULL,
	"discount_value" integer NOT NULL,
	"currency" char(3) DEFAULT 'PHP' NOT NULL,
	"minimum_order_amount_in_cents" integer DEFAULT 0 NOT NULL,
	"maximum_discount_in_cents" integer,
	"usage_limit" integer,
	"per_customer_limit" integer DEFAULT 1 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vouchers_code_uppercase" CHECK ("vouchers"."code" = upper("vouchers"."code")),
	CONSTRAINT "vouchers_discount_positive" CHECK ("vouchers"."discount_value" > 0),
	CONSTRAINT "vouchers_percentage_limit" CHECK ("vouchers"."discount_type" <> 'percentage' OR "vouchers"."discount_value" <= 10000),
	CONSTRAINT "vouchers_minimum_nonnegative" CHECK ("vouchers"."minimum_order_amount_in_cents" >= 0),
	CONSTRAINT "vouchers_maximum_nonnegative" CHECK ("vouchers"."maximum_discount_in_cents" IS NULL OR "vouchers"."maximum_discount_in_cents" >= 0),
	CONSTRAINT "vouchers_usage_limit_positive" CHECK ("vouchers"."usage_limit" IS NULL OR "vouchers"."usage_limit" > 0),
	CONSTRAINT "vouchers_customer_limit_positive" CHECK ("vouchers"."per_customer_limit" > 0),
	CONSTRAINT "vouchers_valid_period" CHECK ("vouchers"."starts_at" IS NULL OR "vouchers"."ends_at" IS NULL OR "vouchers"."ends_at" > "vouchers"."starts_at")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_method_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal_amount_in_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount_in_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_amount_in_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_method_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" jsonb;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_raw_inventory_item_id_raw_inventory_items_id_fk" FOREIGN KEY ("raw_inventory_item_id") REFERENCES "public"."raw_inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_reservation_id_inventory_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."inventory_reservations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_raw_inventory_item_id_raw_inventory_items_id_fk" FOREIGN KEY ("raw_inventory_item_id") REFERENCES "public"."raw_inventory_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "printable_documents" ADD CONSTRAINT "printable_documents_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipping_method_id_shipping_methods_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_voucher_id_vouchers_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."vouchers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voucher_redemptions" ADD CONSTRAINT "voucher_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_variant_uq" ON "cart_items" USING btree ("cart_id","variant_id");--> statement-breakpoint
CREATE INDEX "cart_items_variant_idx" ON "cart_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_customer_active_uq" ON "carts" USING btree ("customer_id") WHERE "carts"."status" = 'active';--> statement-breakpoint
CREATE INDEX "carts_voucher_idx" ON "carts" USING btree ("voucher_id");--> statement-breakpoint
CREATE INDEX "carts_status_expires_idx" ON "carts" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "customer_addresses_customer_idx" ON "customer_addresses" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_addresses_default_shipping_uq" ON "customer_addresses" USING btree ("customer_id") WHERE "customer_addresses"."is_default_shipping" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_auth_subject_uq" ON "customers" USING btree ("auth_subject");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_uq" ON "customers" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "inventory_movements_raw_created_idx" ON "inventory_movements" USING btree ("raw_inventory_item_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_order_idx" ON "inventory_movements" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_raw_status_idx" ON "inventory_reservations" USING btree ("raw_inventory_item_id","status");--> statement-breakpoint
CREATE INDEX "inventory_reservations_cart_idx" ON "inventory_reservations" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_order_idx" ON "inventory_reservations" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_code_uq" ON "payment_methods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "payment_methods_active_sort_idx" ON "payment_methods" USING btree ("active","sort_order");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_status_created_idx" ON "payments" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "printable_documents_order_type_version_uq" ON "printable_documents" USING btree ("order_id","document_type","version");--> statement-breakpoint
CREATE INDEX "printable_documents_status_idx" ON "printable_documents" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "shipments_order_idx" ON "shipments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "shipments_status_created_idx" ON "shipments" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "shipments_tracking_uq" ON "shipments" USING btree ("carrier","tracking_number") WHERE "shipments"."tracking_number" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "shipping_methods_code_uq" ON "shipping_methods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "shipping_methods_active_sort_idx" ON "shipping_methods" USING btree ("active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "voucher_redemptions_voucher_order_uq" ON "voucher_redemptions" USING btree ("voucher_id","order_id");--> statement-breakpoint
CREATE INDEX "voucher_redemptions_customer_idx" ON "voucher_redemptions" USING btree ("voucher_id","customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vouchers_code_uq" ON "vouchers" USING btree (upper("code"));--> statement-breakpoint
CREATE INDEX "vouchers_active_period_idx" ON "vouchers" USING btree ("active","starts_at","ends_at");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_method_id_shipping_methods_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_methods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_payment_method_idx" ON "orders" USING btree ("payment_method_id");--> statement-breakpoint
CREATE INDEX "orders_shipping_method_idx" ON "orders" USING btree ("shipping_method_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_subtotal_nonnegative" CHECK ("orders"."subtotal_amount_in_cents" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_nonnegative" CHECK ("orders"."discount_amount_in_cents" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_nonnegative" CHECK ("orders"."shipping_amount_in_cents" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_components" CHECK ("orders"."total_amount_in_cents" = "orders"."subtotal_amount_in_cents" - "orders"."discount_amount_in_cents" + "orders"."shipping_amount_in_cents");