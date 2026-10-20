import { IProductRepository } from "../../../domain/repositories/IProductRepository";
import {
  ListProductsQueryDto,
  PaginatedProductsResponseDto,
} from "../../dtos/ProductDto";
import { ProductMapper } from "../../mappers/ProductMapper";

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(
    query: ListProductsQueryDto
  ): Promise<PaginatedProductsResponseDto> {
    const result = await this.productRepository.findMany({
      categoryId: query.categoryId,
      sku: query.sku,
      name: query.name,
      search: query.search,
      lowStock: query.lowStock,
      minPriceCents: query.minPriceCents,
      maxPriceCents: query.maxPriceCents,
      minStockQuantity: query.minStockQuantity,
      maxStockQuantity: query.maxStockQuantity,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page,
      limit: query.limit,
    });

    return ProductMapper.toPaginatedDto(
      result.items,
      result.page,
      result.limit,
      result.total
    );
  }
}
