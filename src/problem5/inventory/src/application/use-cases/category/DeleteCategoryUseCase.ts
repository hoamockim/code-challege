import { ConflictError, NotFoundError } from "../../../domain/errors/AppError";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import { IProductRepository } from "../../../domain/repositories/IProductRepository";

export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly productRepository: IProductRepository
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const productCount =
      await this.productRepository.countActiveByCategoryId(id);
    if (productCount > 0) {
      throw new ConflictError(
        "Cannot delete category while active products still reference it"
      );
    }

    category.softDelete();
    await this.categoryRepository.save(category);
  }
}
