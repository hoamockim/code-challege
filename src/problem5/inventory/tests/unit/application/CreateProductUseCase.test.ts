import { describe, expect, it, vi } from "vitest";
import { CreateProductUseCase } from "../../../src/application/use-cases/product/CreateProductUseCase";
import { ConflictError, NotFoundError } from "../../../src/domain/errors/AppError";
import {
  CATEGORY_ID,
  createMockCategoryRepository,
  createMockProductRepository,
  makeCategory,
  makeProduct,
} from "../../helpers/productFixtures";

describe("CreateProductUseCase", () => {
  it("builds a new entity and saves it with defaults", async () => {
    const category = makeCategory();
    const save = vi.fn(async (product) => {
      expect(product.isNew()).toBe(true);
      product.markPersisted();
      return product;
    });
    const useCase = new CreateProductUseCase(
      createMockProductRepository({
        findBySku: vi.fn().mockResolvedValue(null),
        save,
      }),
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(category),
      })
    );

    const result = await useCase.execute({
      sku: "  KB-001  ",
      name: "  Mechanical Keyboard  ",
      categoryId: CATEGORY_ID,
      priceCents: 12000,
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0]).toMatchObject({
      sku: "KB-001",
      categoryId: CATEGORY_ID,
      stockQuantity: 0,
      lowStockThreshold: 5,
    });
    expect(result.category).toEqual({ id: category.id, name: category.name });
    expect(result.isLowStock).toBe(true);
  });

  it("throws ConflictError when SKU already exists", async () => {
    const useCase = new CreateProductUseCase(
      createMockProductRepository({
        findBySku: vi.fn().mockResolvedValue(makeProduct()),
        save: vi.fn(),
      }),
      createMockCategoryRepository()
    );

    await expect(
      useCase.execute({
        sku: "KB-001",
        name: "Mechanical Keyboard",
        categoryId: CATEGORY_ID,
        priceCents: 12000,
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("throws NotFoundError when category does not exist", async () => {
    const save = vi.fn();
    const useCase = new CreateProductUseCase(
      createMockProductRepository({
        findBySku: vi.fn().mockResolvedValue(null),
        save,
      }),
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(null),
      })
    );

    await expect(
      useCase.execute({
        sku: "KB-001",
        name: "Mechanical Keyboard",
        categoryId: CATEGORY_ID,
        priceCents: 12000,
      })
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(save).not.toHaveBeenCalled();
  });
});
