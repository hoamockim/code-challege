import { describe, expect, it } from "vitest";
import { ProductMapper } from "../../../src/application/mappers/ProductMapper";
import { makeHydratedProduct } from "../../helpers/productFixtures";

describe("ProductMapper", () => {
  it("maps hydrated product to response DTO", () => {
    const hydrated = makeHydratedProduct({
      stockQuantity: 3,
      lowStockThreshold: 5,
    });

    expect(ProductMapper.toDto(hydrated)).toEqual({
      id: hydrated.product.id,
      sku: "KB-001",
      name: "Mechanical Keyboard",
      description: "Wireless keyboard",
      categoryId: hydrated.category.id,
      category: {
        id: hydrated.category.id,
        name: "Electronics",
      },
      priceCents: 12000,
      stockQuantity: 3,
      lowStockThreshold: 5,
      isLowStock: true,
      createdAt: "2026-01-15T10:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    });
  });

  it("builds paginated response with navigation flags", () => {
    const items = [
      makeHydratedProduct({ id: "1", sku: "A-1" }),
      makeHydratedProduct({ id: "2", sku: "A-2" }),
    ];

    const result = ProductMapper.toPaginatedDto(items, 2, 10, 25);

    expect(result.data).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrevious: true,
    });
  });
});
