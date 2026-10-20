import { PaginationMeta } from "../../shared/pagination";
import { CategorySortBy, SortOrder } from "../../domain/entities/Category";

export interface CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequestDto {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryRequestDto {
  name?: string;
  description?: string | null;
}

export interface ListCategoriesQueryDto {
  search?: string;
  sortBy: CategorySortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export interface PaginatedCategoriesResponseDto {
  data: CategoryResponseDto[];
  pagination: PaginationMeta;
}
