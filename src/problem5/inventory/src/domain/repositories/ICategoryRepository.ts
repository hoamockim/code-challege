import {
  Category,
  CategoryListFilters,
  PaginatedCategories,
} from "../entities/Category";

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findMany(filters: CategoryListFilters): Promise<PaginatedCategories>;
  save(category: Category): Promise<Category>;
}
