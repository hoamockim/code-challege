import { PaginationMeta } from "../../shared/pagination";
import { ProductSortBy, SortOrder } from "../../domain/entities/Product";

export interface ProductCategoryDto {
  id: string;
  name: string;
}

export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: ProductCategoryDto;
  priceCents: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequestDto {
  sku: string;
  name: string;
  description?: string | null;
  categoryId: string;
  priceCents: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface UpdateProductRequestDto {
  sku?: string;
  name?: string;
  description?: string | null;
  categoryId?: string;
  priceCents?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

/**
 * Query DTO for GET /api/products
 */
export interface ListProductsQueryDto {
  categoryId?: string;
  sku?: string;
  name?: string;
  search?: string;
  lowStock?: boolean;
  minPriceCents?: number;
  maxPriceCents?: number;
  minStockQuantity?: number;
  maxStockQuantity?: number;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface PaginatedProductsResponseDto {
  data: ProductResponseDto[];
  pagination: PaginationMeta;
}
