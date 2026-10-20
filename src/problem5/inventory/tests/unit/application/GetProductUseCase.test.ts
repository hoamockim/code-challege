import { describe, expect, it, vi } from "vitest";
import { GetProductUseCase } from "../../../src/application/use-cases/product/GetProductUseCase";
import { NotFoundError } from "../../../src/domain/errors/AppError";
import {
  createMockProductRepository,
  makeHydratedProduct,
} from "../../helpers/productFixtures";

describe("GetProductUseCase", () => {
  it("returns product DTO when found", async () => {
    const hydrated = makeHydratedProduct();
    const repository = createMockProductRepository({
      findById: vi.fn().mockResolvedValue(hydrated),
    });
    const useCase = new GetProductUseCase(repository);

    const result = await useCase.execute(hydrated.product.id);

    expect(result.id).toBe(hydrated.product.id);
    expect(result.categoryId).toBe(hydrated.category.id);
    expect(result.category.name).toBe("Electronics");
  });

  it("throws NotFoundError when product does not exist", async () => {
    const useCase = new GetProductUseCase(
      createMockProductRepository({
        findById: vi.fn().mockResolvedValue(null),
      })
    );

    await expect(useCase.execute("missing-id")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });
});
