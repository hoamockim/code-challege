import { Category } from "../../src/domain/entities/Category";
import {
  HydratedProduct,
  Product,
} from "../../src/domain/entities/Product";
import { ICategoryRepository } from "../../src/domain/repositories/ICategoryRepository";
import { IProductRepository } from "../../src/domain/repositories/IProductRepository";

export const CATEGORY_ID = "22222222-2222-4222-8222-222222222222";

export function makeCategory(
  overrides: Partial<{
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> = {}
): Category {
  const now = new Date("2026-01-15T10:00:00.000Z");
  return Category.restore({
    id: CATEGORY_ID,
    name: "Electronics",
    description: "Electronic devices",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  });
}

export function makeProduct(
  overrides: Partial<{
    id: string;
    sku: string;
    name: string;
    description: string | null;
    categoryId: string;
    priceCents: number;
    stockQuantity: number;
    lowStockThreshold: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> = {}
): Product {
  const now = new Date("2026-01-15T10:00:00.000Z");
  return Product.restore({
    id: "11111111-1111-4111-8111-111111111111",
    sku: "KB-001",
    name: "Mechanical Keyboard",
    description: "Wireless keyboard",
    categoryId: CATEGORY_ID,
    priceCents: 12000,
    stockQuantity: 8,
    lowStockThreshold: 5,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  });
}

export function makeHydratedProduct(
  productOverrides: Parameters<typeof makeProduct>[0] = {},
  categoryOverrides: Parameters<typeof makeCategory>[0] = {}
): HydratedProduct {
  const category = makeCategory(categoryOverrides);
  const product = makeProduct({
    categoryId: category.id,
    ...productOverrides,
  });
  return {
    product,
    category: { id: category.id, name: category.name },
  };
}

export function createMockProductRepository(
  overrides: Partial<IProductRepository> = {}
): IProductRepository {
  return {
    findById: async () => null,
    findBySku: async () => null,
    findMany: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
    countActiveByCategoryId: async () => 0,
    save: async (product) => {
      if (product.isNew()) {
        product.markPersisted();
      }
      return product;
    },
    ...overrides,
  };
}

export function createMockCategoryRepository(
  overrides: Partial<ICategoryRepository> = {}
): ICategoryRepository {
  return {
    findById: async () => null,
    findByName: async () => null,
    findMany: async () => ({ items: [], total: 0, page: 1, limit: 20 }),
    save: async (category) => {
      if (category.isNew()) {
        category.markPersisted();
      }
      return category;
    },
    ...overrides,
  };
}
