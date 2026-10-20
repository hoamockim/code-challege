import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import {
  ListCategoriesQueryDto,
  PaginatedCategoriesResponseDto,
} from "../../dtos/CategoryDto";
import { CategoryMapper } from "../../mappers/CategoryMapper";

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    query: ListCategoriesQueryDto
  ): Promise<PaginatedCategoriesResponseDto> {
    const result = await this.categoryRepository.findMany({
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    return CategoryMapper.toPaginatedDto(
      result.items,
      result.page,
      result.limit,
      result.total
    );
  }
}
