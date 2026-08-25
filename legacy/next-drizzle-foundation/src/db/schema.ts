import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const marketplaceEnum = pgEnum("marketplace", [
  "lazada",
  "tiktok",
  "shopee",
]);

export const salesChannelEnum = pgEnum("sales_channel", [
  "storefront",
  "lazada",
  "tiktok",
  "shopee",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "fulfilled",
  "cancelled",
  "refunded",
]);

export const webhookStatusEnum = pgEnum("webhook_status", [
  "received",
  "processed",
  "failed",
  "ignored",
]);

export const cartStatusEnum = pgEnum("cart_status", [
  "active",
  "converted",
  "abandoned",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "awaiting_proof",
  "submitted",
  "verified",
  "rejected",
  "expired",
  "refunded",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "pending",
  "ready",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
]);

export const voucherDiscountTypeEnum = pgEnum("voucher_discount_type", [
  "fixed",
  "percentage",
]);

export const printableDocumentTypeEnum = pgEnum("printable_document_type", [
  "receipt",
  "packing_list",
  "box_label",
  "bottle_label",
]);

export const printableDocumentStatusEnum = pgEnum(
  "printable_document_status",
  ["pending", "generated", "failed", "void"],
);

export const inventoryReservationStatusEnum = pgEnum(
  "inventory_reservation_status",
  ["active", "consumed", "released", "expired"],
);

export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "receipt",
  "reservation",
  "release",
  "sale",
  "adjustment",
  "return",
  "damage",
]);

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    active: boolean("active").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("products_slug_uq").on(table.slug)],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    title: text("title").notNull(),
    priceInCents: integer("price_in_cents").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("PHP"),
    active: boolean("active").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("product_variants_sku_uq").on(table.sku),
    index("product_variants_product_idx").on(table.productId),
    check("product_variants_price_nonnegative", sql`${table.priceInCents} >= 0`),
  ],
);

export const rawInventoryItems = pgTable(
  "raw_inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    unit: text("unit").notNull(),
    quantityOnHand: numeric("quantity_on_hand", {
      precision: 18,
      scale: 6,
    })
      .notNull()
      .default("0"),
    reorderLevel: numeric("reorder_level", { precision: 18, scale: 6 })
      .notNull()
      .default("0"),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("raw_inventory_items_sku_uq").on(table.sku),
    check(
      "raw_inventory_items_quantity_nonnegative",
      sql`${table.quantityOnHand} >= 0`,
    ),
    check(
      "raw_inventory_items_reorder_nonnegative",
      sql`${table.reorderLevel} >= 0`,
    ),
  ],
);

export const variantRecipes = pgTable(
  "variant_recipes",
  {
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    rawInventoryItemId: uuid("raw_inventory_item_id")
      .notNull()
      .references(() => rawInventoryItems.id, { onDelete: "restrict" }),
    requiredQuantity: numeric("required_quantity", {
      precision: 18,
      scale: 6,
    }).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    primaryKey({ columns: [table.variantId, table.rawInventoryItemId] }),
    index("variant_recipes_raw_item_idx").on(table.rawInventoryItemId),
    check(
      "variant_recipes_required_positive",
      sql`${table.requiredQuantity} > 0`,
    ),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authSubject: text("auth_subject").notNull(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    active: boolean("active").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("customers_auth_subject_uq").on(table.authSubject),
    uniqueIndex("customers_email_uq").on(sql`lower(${table.email})`),
    check("customers_email_lowercase", sql`${table.email} = lower(${table.email})`),
  ],
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Shipping"),
    recipientName: text("recipient_name").notNull(),
    phone: text("phone").notNull(),
    line1: text("line_1").notNull(),
    line2: text("line_2"),
    barangay: text("barangay").notNull(),
    cityMunicipality: text("city_municipality").notNull(),
    province: text("province").notNull(),
    postalCode: text("postal_code").notNull(),
    countryCode: char("country_code", { length: 2 }).notNull().default("PH"),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("customer_addresses_customer_idx").on(table.customerId),
    uniqueIndex("customer_addresses_default_shipping_uq")
      .on(table.customerId)
      .where(sql`${table.isDefaultShipping} = true`),
  ],
);

export const vouchers = pgTable(
  "vouchers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    description: text("description"),
    discountType: voucherDiscountTypeEnum("discount_type").notNull(),
    discountValue: integer("discount_value").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("PHP"),
    minimumOrderAmountInCents: integer("minimum_order_amount_in_cents")
      .notNull()
      .default(0),
    maximumDiscountInCents: integer("maximum_discount_in_cents"),
    usageLimit: integer("usage_limit"),
    perCustomerLimit: integer("per_customer_limit").notNull().default(1),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("vouchers_code_uq").on(sql`upper(${table.code})`),
    index("vouchers_active_period_idx").on(table.active, table.startsAt, table.endsAt),
    check("vouchers_code_uppercase", sql`${table.code} = upper(${table.code})`),
    check("vouchers_discount_positive", sql`${table.discountValue} > 0`),
    check(
      "vouchers_percentage_limit",
      sql`${table.discountType} <> 'percentage' OR ${table.discountValue} <= 10000`,
    ),
    check(
      "vouchers_minimum_nonnegative",
      sql`${table.minimumOrderAmountInCents} >= 0`,
    ),
    check(
      "vouchers_maximum_nonnegative",
      sql`${table.maximumDiscountInCents} IS NULL OR ${table.maximumDiscountInCents} >= 0`,
    ),
    check(
      "vouchers_usage_limit_positive",
      sql`${table.usageLimit} IS NULL OR ${table.usageLimit} > 0`,
    ),
    check("vouchers_customer_limit_positive", sql`${table.perCustomerLimit} > 0`),
    check(
      "vouchers_valid_period",
      sql`${table.startsAt} IS NULL OR ${table.endsAt} IS NULL OR ${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    voucherId: uuid("voucher_id").references(() => vouchers.id, {
      onDelete: "set null",
    }),
    status: cartStatusEnum("status").notNull().default("active"),
    currency: char("currency", { length: 3 }).notNull().default("PHP"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("carts_customer_active_uq")
      .on(table.customerId)
      .where(sql`${table.status} = 'active'`),
    index("carts_voucher_idx").on(table.voucherId),
    index("carts_status_expires_idx").on(table.status, table.expiresAt),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPriceInCents: integer("unit_price_in_cents").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("cart_items_cart_variant_uq").on(table.cartId, table.variantId),
    index("cart_items_variant_idx").on(table.variantId),
    check("cart_items_quantity_positive", sql`${table.quantity} > 0`),
    check("cart_items_price_nonnegative", sql`${table.unitPriceInCents} >= 0`),
  ],
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    methodType: text("method_type").notNull(),
    description: text("description"),
    instructions: text("instructions"),
    publicConfig: jsonb("public_config")
      .$type<Record<string, string | number | boolean | null>>()
      .notNull()
      .default({}),
    feeAmountInCents: integer("fee_amount_in_cents").notNull().default(0),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("payment_methods_code_uq").on(table.code),
    index("payment_methods_active_sort_idx").on(table.active, table.sortOrder),
    check("payment_methods_code_lowercase", sql`${table.code} = lower(${table.code})`),
    check(
      "payment_methods_fee_nonnegative",
      sql`${table.feeAmountInCents} >= 0`,
    ),
  ],
);

export const shippingMethods = pgTable(
  "shipping_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    carrier: text("carrier").notNull(),
    serviceLevel: text("service_level"),
    description: text("description"),
    publicConfig: jsonb("public_config")
      .$type<Record<string, string | number | boolean | null>>()
      .notNull()
      .default({}),
    baseRateInCents: integer("base_rate_in_cents").notNull().default(0),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("shipping_methods_code_uq").on(table.code),
    index("shipping_methods_active_sort_idx").on(table.active, table.sortOrder),
    check("shipping_methods_code_lowercase", sql`${table.code} = lower(${table.code})`),
    check(
      "shipping_methods_rate_nonnegative",
      sql`${table.baseRateInCents} >= 0`,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "restrict",
    }),
    paymentMethodId: uuid("payment_method_id").references(
      () => paymentMethods.id,
      { onDelete: "restrict" },
    ),
    shippingMethodId: uuid("shipping_method_id").references(
      () => shippingMethods.id,
      { onDelete: "restrict" },
    ),
    channel: salesChannelEnum("channel").notNull().default("storefront"),
    externalOrderId: text("external_order_id").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    currency: char("currency", { length: 3 }).notNull().default("PHP"),
    subtotalAmountInCents: integer("subtotal_amount_in_cents")
      .notNull()
      .default(0),
    discountAmountInCents: integer("discount_amount_in_cents")
      .notNull()
      .default(0),
    shippingAmountInCents: integer("shipping_amount_in_cents")
      .notNull()
      .default(0),
    totalAmountInCents: integer("total_amount_in_cents").notNull().default(0),
    customerEmail: text("customer_email"),
    paymentMethodSnapshot: jsonb("payment_method_snapshot").$type<{
      code: string;
      name: string;
      methodType: string;
    }>(),
    shippingMethodSnapshot: jsonb("shipping_method_snapshot").$type<{
      code: string;
      name: string;
      carrier: string;
      serviceLevel?: string;
    }>(),
    shippingAddress: jsonb("shipping_address").$type<{
      recipientName: string;
      phone: string;
      line1: string;
      line2?: string;
      barangay: string;
      cityMunicipality: string;
      province: string;
      postalCode: string;
      countryCode: string;
    }>(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("orders_channel_external_id_uq").on(
      table.channel,
      table.externalOrderId,
    ),
    index("orders_customer_idx").on(table.customerId),
    index("orders_payment_method_idx").on(table.paymentMethodId),
    index("orders_shipping_method_idx").on(table.shippingMethodId),
    index("orders_status_idx").on(table.status),
    check(
      "orders_subtotal_nonnegative",
      sql`${table.subtotalAmountInCents} >= 0`,
    ),
    check(
      "orders_discount_nonnegative",
      sql`${table.discountAmountInCents} >= 0`,
    ),
    check(
      "orders_shipping_nonnegative",
      sql`${table.shippingAmountInCents} >= 0`,
    ),
    check(
      "orders_total_nonnegative",
      sql`${table.totalAmountInCents} >= 0`,
    ),
    check(
      "orders_total_components",
      sql`${table.totalAmountInCents} = ${table.subtotalAmountInCents} - ${table.discountAmountInCents} + ${table.shippingAmountInCents}`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    externalLineId: text("external_line_id").notNull(),
    externalSku: text("external_sku").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceInCents: integer("unit_price_in_cents").notNull().default(0),
    createdAt,
  },
  (table) => [
    uniqueIndex("order_items_order_external_line_uq").on(
      table.orderId,
      table.externalLineId,
    ),
    index("order_items_variant_idx").on(table.variantId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "order_items_price_nonnegative",
      sql`${table.unitPriceInCents} >= 0`,
    ),
  ],
);

export const voucherRedemptions = pgTable(
  "voucher_redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    voucherId: uuid("voucher_id")
      .notNull()
      .references(() => vouchers.id, { onDelete: "restrict" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    discountAmountInCents: integer("discount_amount_in_cents").notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("voucher_redemptions_voucher_order_uq").on(
      table.voucherId,
      table.orderId,
    ),
    index("voucher_redemptions_customer_idx").on(
      table.voucherId,
      table.customerId,
    ),
    check(
      "voucher_redemptions_discount_nonnegative",
      sql`${table.discountAmountInCents} >= 0`,
    ),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    paymentMethodId: uuid("payment_method_id")
      .notNull()
      .references(() => paymentMethods.id, { onDelete: "restrict" }),
    status: paymentStatusEnum("status").notNull().default("awaiting_proof"),
    amountInCents: integer("amount_in_cents").notNull(),
    customerReference: text("customer_reference"),
    proofUrl: text("proof_url"),
    customerNote: text("customer_note"),
    reviewedBy: text("reviewed_by"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("payments_order_idx").on(table.orderId),
    index("payments_status_created_idx").on(table.status, table.createdAt),
    check("payments_amount_nonnegative", sql`${table.amountInCents} >= 0`),
  ],
);

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    shippingMethodId: uuid("shipping_method_id")
      .notNull()
      .references(() => shippingMethods.id, { onDelete: "restrict" }),
    status: shipmentStatusEnum("status").notNull().default("pending"),
    carrier: text("carrier").notNull(),
    serviceLevel: text("service_level"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("shipments_order_idx").on(table.orderId),
    index("shipments_status_created_idx").on(table.status, table.createdAt),
    uniqueIndex("shipments_tracking_uq")
      .on(table.carrier, table.trackingNumber)
      .where(sql`${table.trackingNumber} IS NOT NULL`),
  ],
);

export const printableDocuments = pgTable(
  "printable_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    documentType: printableDocumentTypeEnum("document_type").notNull(),
    status: printableDocumentStatusEnum("status").notNull().default("pending"),
    version: integer("version").notNull().default(1),
    fileUrl: text("file_url"),
    error: text("error"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("printable_documents_order_type_version_uq").on(
      table.orderId,
      table.documentType,
      table.version,
    ),
    index("printable_documents_status_idx").on(table.status, table.createdAt),
    check("printable_documents_version_positive", sql`${table.version} > 0`),
  ],
);

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rawInventoryItemId: uuid("raw_inventory_item_id")
      .notNull()
      .references(() => rawInventoryItems.id, { onDelete: "restrict" }),
    cartId: uuid("cart_id").references(() => carts.id, {
      onDelete: "cascade",
    }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "cascade",
    }),
    quantity: numeric("quantity", { precision: 18, scale: 6 }).notNull(),
    status: inventoryReservationStatusEnum("status")
      .notNull()
      .default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("inventory_reservations_raw_status_idx").on(
      table.rawInventoryItemId,
      table.status,
    ),
    index("inventory_reservations_cart_idx").on(table.cartId),
    index("inventory_reservations_order_idx").on(table.orderId),
    check("inventory_reservations_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "inventory_reservations_one_owner",
      sql`num_nonnulls(${table.cartId}, ${table.orderId}) = 1`,
    ),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rawInventoryItemId: uuid("raw_inventory_item_id")
      .notNull()
      .references(() => rawInventoryItems.id, { onDelete: "restrict" }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    reservationId: uuid("reservation_id").references(
      () => inventoryReservations.id,
      { onDelete: "set null" },
    ),
    movementType: inventoryMovementTypeEnum("movement_type").notNull(),
    quantityDelta: numeric("quantity_delta", {
      precision: 18,
      scale: 6,
    }).notNull(),
    balanceAfter: numeric("balance_after", {
      precision: 18,
      scale: 6,
    }).notNull(),
    reference: text("reference"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt,
  },
  (table) => [
    index("inventory_movements_raw_created_idx").on(
      table.rawInventoryItemId,
      table.createdAt,
    ),
    index("inventory_movements_order_idx").on(table.orderId),
    check("inventory_movements_delta_nonzero", sql`${table.quantityDelta} <> 0`),
    check("inventory_movements_balance_nonnegative", sql`${table.balanceAfter} >= 0`),
  ],
);

export const marketplaceSkuMappings = pgTable(
  "marketplace_sku_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    marketplace: marketplaceEnum("marketplace").notNull(),
    externalSku: text("external_sku").notNull(),
    externalProductId: text("external_product_id"),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    rawInventoryItemId: uuid("raw_inventory_item_id").references(
      () => rawInventoryItems.id,
      { onDelete: "cascade" },
    ),
    active: boolean("active").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("marketplace_sku_mappings_external_sku_uq").on(
      table.marketplace,
      table.externalSku,
    ),
    index("marketplace_sku_mappings_variant_idx").on(table.variantId),
    index("marketplace_sku_mappings_raw_item_idx").on(
      table.rawInventoryItemId,
    ),
    check(
      "marketplace_sku_mappings_one_target",
      sql`num_nonnulls(${table.variantId}, ${table.rawInventoryItemId}) = 1`,
    ),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    marketplace: marketplaceEnum("marketplace").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    requestHash: char("request_hash", { length: 64 }).notNull(),
    payload: jsonb("payload").$type<unknown>().notNull(),
    status: webhookStatusEnum("status").notNull().default("received"),
    attempts: integer("attempts").notNull().default(1),
    error: text("error"),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("webhook_events_marketplace_event_uq").on(
      table.marketplace,
      table.eventId,
    ),
    index("webhook_events_status_received_idx").on(
      table.status,
      table.receivedAt,
    ),
    check("webhook_events_attempts_positive", sql`${table.attempts} > 0`),
  ],
);

export type Marketplace = (typeof marketplaceEnum.enumValues)[number];
