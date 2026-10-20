import {
  and,
  eq,
  gte,
  gt,
  ilike,
  isNull,
  lte,
  or,
  SQL,
} from "drizzle-orm";
import { ProductListFilters } from "../../../domain/entities/Product";
import { categories, products } from "../../database/schema";

function contains(value: string): string {
  return `%${value.trim()}%`;
}

export function buildProductWhere(filters: ProductListFilters): SQL | undefined {
  const sku = filters.sku?.trim();
  const name = filters.name?.trim();
  const search = filters.search?.trim();

  return and(
    isNull(products.deletedAt),
    isNull(categories.deletedAt),
    filters.categoryId ? eq(products.categoryId, filters.categoryId) : undefined,
    sku ? ilike(products.sku, contains(sku)) : undefined,
    name ? ilike(products.name, contains(name)) : undefined,
    search
      ? or(ilike(products.name, contains(search)), ilike(products.sku, contains(search)))
      : undefined,
    filters.lowStock === true
      ? lte(products.stockQuantity, products.lowStockThreshold)
      : undefined,
    filters.lowStock === false
      ? gt(products.stockQuantity, products.lowStockThreshold)
      : undefined,
    filters.minPriceCents !== undefined
      ? gte(products.priceCents, filters.minPriceCents)
      : undefined,
    filters.maxPriceCents !== undefined
      ? lte(products.priceCents, filters.maxPriceCents)
      : undefined,
    filters.minStockQuantity !== undefined
      ? gte(products.stockQuantity, filters.minStockQuantity)
      : undefined,
    filters.maxStockQuantity !== undefined
      ? lte(products.stockQuantity, filters.maxStockQuantity)
      : undefined
  );
}
