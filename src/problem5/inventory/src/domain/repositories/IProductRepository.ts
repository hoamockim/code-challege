import {
  HydratedProduct,
  PaginatedProducts,
  Product,
  ProductListFilters,
} from "../entities/Product";

export interface IProductRepository {
  findById(id: string): Promise<HydratedProduct | null>;
  findBySku(sku: string): Promise<Product | null>;
  findMany(filters: ProductListFilters): Promise<PaginatedProducts>;
  countActiveByCategoryId(categoryId: string): Promise<number>;
  /**
   * Persist entity state:
   * - new entity → INSERT
   * - existing entity → patch UPDATE of dirty fields only
   * - no dirty changes on existing → no-op
   */
  save(product: Product): Promise<Product>;
}
