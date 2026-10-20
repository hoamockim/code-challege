import { describe, expect, it, vi } from "vitest";
import { UpdateProductUseCase } from "../../../src/application/use-cases/product/UpdateProductUseCase";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../src/domain/errors/AppError";
import {
  createMockCategoryRepository,
  createMockProductRepository,
  makeCategory,
  makeHydratedProduct,
  makeProduct,
} from "../../helpers/productFixtures";

describe("UpdateProductUseCase", () => {
  it("loads entity, applies changes, then saves", async () => {
    const hydrated = makeHydratedProduct({ stockQuantity: 8 });
    const save = vi.fn(async (product) => product);
    const useCase = new UpdateProductUseCase(
      createMockProductRepository({
        findById: vi.fn().mockResolvedValue(hydrated),
        save,
      }),
      createMockCategoryRepository()
    );

    const result = await useCase.execute(hydrated.product.id, {
      stockQuantity: 3,
    });

    expect(save).toHaveBeenCalledWith(hydrated.product);
    expect(result.stockQuantity).toBe(3);
    expect(result.isLowStock).toBe(true);
    expect(result.category.name).toBe("Electronics");
  });

  it("validates category when categoryId changes", async () => {
    const hydrated = makeHydratedProduct();
    const nextCategory = makeCategory({
      id: "33333333-3333-3333-3333-333333333333",
      name: "Accessories",
    });
    const save = vi.fn(async (product) => product);
    const useCase = new UpdateProductUseCase(
      createMockProductRepository({
        findById: vi.fn().mockResolvedValue(hydrated),
        save,
      }),
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(nextCategory),
      })
    );

    const result = await useCase.execute(hydrated.product.id, {
      categoryId: nextCategory.id,
    });

    expect(result.categoryId).toBe(nextCategory.id);
    expect(result.category.name).toBe("Accessories");
  });

  it("throws ValidationError when no fields are provided", async () => {
    const useCase = new UpdateProductUseCase(
      createMockProductRepository(),
      createMockCategoryRepository()
    );

    await expect(useCase.execute("any-id", {})).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it("throws NotFoundError when product does not exist", async () => {
    const useCase = new UpdateProductUseCase(
      createMockProductRepository({
        findById: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      }),
      createMockCategoryRepository()
    );

    await expect(
      useCase.execute("missing-id", { name: "New Name" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws ConflictError when new SKU belongs to another product", async () => {
    const hydrated = makeHydratedProduct({ id: "product-1", sku: "OLD-SKU" });
    const other = makeProduct({ id: "product-2", sku: "TAKEN" });
    const save = vi.fn();
    const useCase = new UpdateProductUseCase(
      createMockProductRepository({
        findById: vi.fn().mockResolvedValue(hydrated),
        findBySku: vi.fn().mockResolvedValue(other),
        save,
      }),
      createMockCategoryRepository()
    );

    await expect(
      useCase.execute(hydrated.product.id, { sku: "TAKEN" })
    ).rejects.toBeInstanceOf(ConflictError);
    expect(save).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when new category does not exist", async () => {
    const hydrated = makeHydratedProduct();
    const save = vi.fn();
    const useCase = new UpdateProductUseCase(
      createMockProductRepository({
        findById: vi.fn().mockResolvedValue(hydrated),
        save,
      }),
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(null),
      })
    );

    await expect(
      useCase.execute(hydrated.product.id, {
        categoryId: "33333333-3333-3333-3333-333333333333",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(save).not.toHaveBeenCalled();
  });
});
