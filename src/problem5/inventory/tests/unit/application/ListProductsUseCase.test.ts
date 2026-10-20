import { describe, expect, it, vi } from "vitest";
import { ListProductsUseCase } from "../../../src/application/use-cases/product/ListProductsUseCase";
import {
  CATEGORY_ID,
  createMockProductRepository,
  makeHydratedProduct,
} from "../../helpers/productFixtures";

const baseQuery = {
  sortBy: "createdAt" as const,
  sortOrder: "desc" as const,
  page: 1,
  limit: 20,
};

describe("ListProductsUseCase", () => {
  it("forwards filters and returns hydrated products", async () => {
    const items = [
      makeHydratedProduct({ id: "1", sku: "A-1", stockQuantity: 2 }),
      makeHydratedProduct({ id: "2", sku: "A-2", stockQuantity: 20 }),
    ];
    const findMany = vi.fn().mockResolvedValue({
      items,
      total: 2,
      page: 1,
      limit: 20,
    });
    const useCase = new ListProductsUseCase(
      createMockProductRepository({ findMany })
    );

    const result = await useCase.execute({
      ...baseQuery,
      categoryId: CATEGORY_ID,
      search: "KB",
      lowStock: true,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: CATEGORY_ID,
        search: "KB",
        lowStock: true,
      })
    );
    expect(result.data).toHaveLength(2);
    expect(result.data[0].category.name).toBe("Electronics");
    expect(result.pagination.total).toBe(2);
  });
});
