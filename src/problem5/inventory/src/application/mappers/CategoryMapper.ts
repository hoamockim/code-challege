import { Category } from "../../domain/entities/Category";
import { toPaginatedResponse } from "../../shared/pagination";
import {
  CategoryResponseDto,
  PaginatedCategoriesResponseDto,
} from "../dtos/CategoryDto";

export class CategoryMapper {
  static toDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  static toPaginatedDto(
    items: Category[],
    page: number,
    limit: number,
    total: number
  ): PaginatedCategoriesResponseDto {
    return toPaginatedResponse(
      items.map(CategoryMapper.toDto),
      page,
      limit,
      total
    );
  }
}
