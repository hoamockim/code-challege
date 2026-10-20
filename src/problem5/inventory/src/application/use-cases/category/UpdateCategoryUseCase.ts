import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../domain/errors/AppError";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import {
  CategoryResponseDto,
  UpdateCategoryRequestDto,
} from "../../dtos/CategoryDto";
import { CategoryMapper } from "../../mappers/CategoryMapper";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    id: string,
    input: UpdateCategoryRequestDto
  ): Promise<CategoryResponseDto> {
    const hasFields = Object.values(input).some((value) => value !== undefined);
    if (!hasFields) {
      throw new ValidationError("At least one field is required");
    }

    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    if (input.name !== undefined) {
      const nameOwner = await this.categoryRepository.findByName(
        input.name.trim()
      );
      if (nameOwner && nameOwner.id !== id) {
        throw new ConflictError("Category name already exists");
      }
    }

    category.applyUpdate({
      name: input.name?.trim(),
      description: input.description,
    });

    const saved = await this.categoryRepository.save(category);
    return CategoryMapper.toDto(saved);
  }
}
