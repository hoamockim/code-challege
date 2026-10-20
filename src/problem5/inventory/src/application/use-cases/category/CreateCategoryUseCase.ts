import { Category } from "../../../domain/entities/Category";
import { ConflictError } from "../../../domain/errors/AppError";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import {
  CategoryResponseDto,
  CreateCategoryRequestDto,
} from "../../dtos/CategoryDto";
import { CategoryMapper } from "../../mappers/CategoryMapper";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
    const name = input.name.trim();
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new ConflictError("Category name already exists");
    }

    const category = Category.create({
      name,
      description: input.description ?? null,
    });

    const saved = await this.categoryRepository.save(category);
    return CategoryMapper.toDto(saved);
  }
}
