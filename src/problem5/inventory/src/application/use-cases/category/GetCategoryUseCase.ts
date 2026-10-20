import { NotFoundError } from "../../../domain/errors/AppError";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import { CategoryResponseDto } from "../../dtos/CategoryDto";
import { CategoryMapper } from "../../mappers/CategoryMapper";

export class GetCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }
    return CategoryMapper.toDto(category);
  }
}
