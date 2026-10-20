import { describe, expect, it, vi } from "vitest";
import { CreateCategoryUseCase } from "../../../../src/application/use-cases/category/CreateCategoryUseCase";
import { ConflictError } from "../../../../src/domain/errors/AppError";
import {
  createMockCategoryRepository,
  makeCategory,
} from "../../../helpers/productFixtures";

describe("CreateCategoryUseCase", () => {
  it("creates and saves a new category", async () => {
    const save = vi.fn(async (category) => {
      category.markPersisted();
      return category;
    });
    const useCase = new CreateCategoryUseCase(
      createMockCategoryRepository({
        findByName: vi.fn().mockResolvedValue(null),
        save,
      })
    );

    const result = await useCase.execute({
      name: "  Electronics  ",
      description: "Devices",
    });

    expect(save.mock.calls[0][0]).toMatchObject({
      name: "Electronics",
      description: "Devices",
    });
    expect(result.name).toBe("Electronics");
  });

  it("throws ConflictError when name exists", async () => {
    const useCase = new CreateCategoryUseCase(
      createMockCategoryRepository({
        findByName: vi.fn().mockResolvedValue(makeCategory()),
        save: vi.fn(),
      })
    );

    await expect(
      useCase.execute({ name: "Electronics" })
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
