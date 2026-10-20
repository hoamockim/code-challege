import {
  HydratedProduct,
  ProductCategoryRef,
} from "../../domain/entities/Product";
import { toPaginatedResponse } from "../../shared/pagination";
import {
  PaginatedProductsResponseDto,
  ProductResponseDto,
} from "../dtos/ProductDto";

export class ProductMapper {
  static toDto(hydrated: HydratedProduct): ProductResponseDto {
    const { product, category } = hydrated;
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      category: {
        id: category.id,
        name: category.name,
      },
      priceCents: product.priceCents,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isLowStock: product.isLowStock(),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  static toDtoWithCategory(
    product: HydratedProduct["product"],
    category: ProductCategoryRef
  ): ProductResponseDto {
    return ProductMapper.toDto({ product, category });
  }

  static toPaginatedDto(
    items: HydratedProduct[],
    page: number,
    limit: number,
    total: number
  ): PaginatedProductsResponseDto {
    return toPaginatedResponse(
      items.map(ProductMapper.toDto),
      page,
      limit,
      total
    );
  }
}
