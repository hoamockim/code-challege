import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import {
  HydratedProduct,
  PaginatedProducts,
  Product,
  ProductListFilters,
  ProductSortBy,
} from "../../../domain/entities/Product";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";
import { getOffset } from "../../../shared/pagination";
import { Database } from "../../database/db";
import { categories, products } from "../../database/schema";
import { buildProductWhere } from "./buildProductWhere";

const productSortColumns = {
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
  name: products.name,
  sku: products.sku,
  priceCents: products.priceCents,
  stockQuantity: products.stockQuantity,
  categoryId: products.categoryId,
} as const satisfies Record<ProductSortBy, unknown>;

export class PostgresProductRepository implements IProductRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<HydratedProduct | null> {
    const [row] = await this.db
      .select({
        product: products,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(
        and(
          eq(products.id, id),
          isNull(products.deletedAt),
          isNull(categories.deletedAt)
        )
      )
      .limit(1);

    return row ? toHydratedProduct(row.product, row.categoryName) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [row] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.sku, sku), isNull(products.deletedAt)))
      .limit(1);

    return row ? Product.restore(row) : null;
  }

  async findMany(filters: ProductListFilters): Promise<PaginatedProducts> {
    const where = buildProductWhere(filters);
    const direction = filters.sortOrder === "asc" ? asc : desc;
    const sortColumn = productSortColumns[filters.sortBy];
    const offset = getOffset(filters.page, filters.limit);

    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(where);

    const rows = await this.db
      .select({
        product: products,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(where)
      .orderBy(direction(sortColumn), direction(products.id))
      .limit(filters.limit)
      .offset(offset);

    return {
      items: rows.map((row) => toHydratedProduct(row.product, row.categoryName)),
      total: Number(countRow?.count ?? 0),
      page: filters.page,
      limit: filters.limit,
    };
  }

  async countActiveByCategoryId(categoryId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(eq(products.categoryId, categoryId), isNull(products.deletedAt)));

    return Number(row?.count ?? 0);
  }

  async save(product: Product): Promise<Product> {
    if (product.isNew()) {
      return this.insert(product);
    }
    return this.updateDirty(product);
  }

  private async insert(product: Product): Promise<Product> {
    const [row] = await this.db
      .insert(products)
      .values({
        id: product.id,
        sku: product.sku,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        priceCents: product.priceCents,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        deletedAt: product.deletedAt,
      })
      .returning();

    if (!row) {
      throw new Error(`Failed to insert product "${product.id}"`);
    }

    product.markPersisted();
    return Product.restore(row);
  }

  private async updateDirty(product: Product): Promise<Product> {
    const changes = product.getDirtyChanges();
    if (Object.keys(changes).length === 0) {
      return product;
    }

    const [row] = await this.db
      .update(products)
      .set(changes)
      .where(eq(products.id, product.id))
      .returning();

    if (!row) {
      throw new Error(`Failed to save product "${product.id}"`);
    }

    product.clearDirty();
    return Product.restore(row);
  }
}

function toHydratedProduct(
  row: typeof products.$inferSelect,
  categoryName: string
): HydratedProduct {
  return {
    product: Product.restore(row),
    category: {
      id: row.categoryId,
      name: categoryName,
    },
  };
}
