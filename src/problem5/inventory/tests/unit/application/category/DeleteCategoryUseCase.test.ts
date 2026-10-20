import { describe, expect, it, vi } from "vitest";
import { DeleteCategoryUseCase } from "../../../../src/application/use-cases/category/DeleteCategoryUseCase";
import {
  ConflictError,
  NotFoundError,
} from "../../../../src/domain/errors/AppError";
import {
  createMockCategoryRepository,
  createMockProductRepository,
  makeCategory,
} from "../../../helpers/productFixtures";

describe("DeleteCategoryUseCase", () => {
  it("soft-deletes when no active products reference it", async () => {
    const category = makeCategory();
    const save = vi.fn(async (entity) => entity);
    const useCase = new DeleteCategoryUseCase(
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(category),
        save,
      }),
      createMockProductRepository({
        countActiveByCategoryId: vi.fn().mockResolvedValue(0),
      })
    );

    await useCase.execute(category.id);

    expect(category.isDeleted).toBe(true);
    expect(save).toHaveBeenCalledWith(category);
  });

  it("throws ConflictError when products still reference the category", async () => {
    const category = makeCategory();
    const save = vi.fn();
    const useCase = new DeleteCategoryUseCase(
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(category),
        save,
      }),
      createMockProductRepository({
        countActiveByCategoryId: vi.fn().mockResolvedValue(2),
      })
    );

    await expect(useCase.execute(category.id)).rejects.toBeInstanceOf(
      ConflictError
    );
    expect(save).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when category is missing", async () => {
    const useCase = new DeleteCategoryUseCase(
      createMockCategoryRepository({
        findById: vi.fn().mockResolvedValue(null),
      }),
      createMockProductRepository()
    );

    await expect(useCase.execute("missing")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
