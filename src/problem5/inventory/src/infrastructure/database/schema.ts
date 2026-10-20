import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    description: varchar("description", { length: 2000 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_categories_name_active")
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
    index("idx_categories_deleted_at").on(table.deletedAt),
  ]
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: varchar("sku", { length: 64 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    description: varchar("description", { length: 2000 }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    priceCents: integer("price_cents").notNull(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_products_sku_active")
      .on(table.sku)
      .where(sql`${table.deletedAt} is null`),
    index("idx_products_category_id").on(table.categoryId),
    index("idx_products_deleted_at").on(table.deletedAt),
    check("products_price_cents_check", sql`${table.priceCents} >= 0`),
    check("products_stock_quantity_check", sql`${table.stockQuantity} >= 0`),
    check(
      "products_low_stock_threshold_check",
      sql`${table.lowStockThreshold} >= 0`
    ),
  ]
);
