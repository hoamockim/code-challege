import { describe, expect, it, vi } from "vitest";
import { DeleteProductUseCase } from "../../../src/application/use-cases/product/DeleteProductUseCase";
import { NotFoundError } from "../../../src/domain/errors/AppError";
import {
  createMockProductRepository,
  makeHydratedProduct,
} from "../../helpers/productFixtures";

describe("DeleteProductUseCase", () => {
  it("loads entity, soft-deletes it, then saves", async () => {
    const hydrated = makeHydratedProduct();
    const save = vi.fn(async (entity) => entity);
    const repository = createMockProductRepository({
      findById: vi.fn().mockResolvedValue(hydrated),
      save,
    });
    const useCase = new DeleteProductUseCase(repository);

    await expect(useCase.execute(hydrated.product.id)).resolves.toBeUndefined();

    expect(hydrated.product.isDeleted).toBe(true);
    expect(save).toHaveBeenCalledWith(hydrated.product);
  });

  it("throws NotFoundError when product is missing", async () => {
    const repository = createMockProductRepository({
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    });
    const useCase = new DeleteProductUseCase(repository);

    await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
      NotFoundError
    );
    expect(repository.save).not.toHaveBeenCalled();
  });
});
