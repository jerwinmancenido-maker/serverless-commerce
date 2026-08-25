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

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: salesChannelEnum("channel").notNull().default("storefront"),
    externalOrderId: text("external_order_id").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    currency: char("currency", { length: 3 }).notNull().default("PHP"),
    totalAmountInCents: integer("total_amount_in_cents").notNull().default(0),
    customerEmail: text("customer_email"),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("orders_channel_external_id_uq").on(
      table.channel,
      table.externalOrderId,
    ),
    index("orders_status_idx").on(table.status),
    check(
      "orders_total_nonnegative",
      sql`${table.totalAmountInCents} >= 0`,
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

