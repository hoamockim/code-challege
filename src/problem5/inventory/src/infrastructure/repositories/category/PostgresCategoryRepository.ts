import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import {
  Category,
  CategoryListFilters,
  CategorySortBy,
  PaginatedCategories,
} from "../../../domain/entities/Category";
import { ICategoryRepository } from "../../../domain/repositories/ICategoryRepository";
import { getOffset } from "../../../shared/pagination";
import { Database } from "../../database/db";
import { categories } from "../../database/schema";
import { buildCategoryWhere } from "./buildCategoryWhere";

const categorySortColumns = {
  createdAt: categories.createdAt,
  updatedAt: categories.updatedAt,
  name: categories.name,
} as const satisfies Record<CategorySortBy, unknown>;

export class PostgresCategoryRepository implements ICategoryRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Category | null> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .limit(1);

    return row ? Category.restore(row) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          sql`lower(${categories.name}) = lower(${name})`,
          isNull(categories.deletedAt)
        )
      )
      .limit(1);

    return row ? Category.restore(row) : null;
  }

  async findMany(filters: CategoryListFilters): Promise<PaginatedCategories> {
    const where = buildCategoryWhere(filters);
    const direction = filters.sortOrder === "asc" ? asc : desc;
    const sortColumn = categorySortColumns[filters.sortBy];
    const offset = getOffset(filters.page, filters.limit);

    const [countRow] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(where);

    const rows = await this.db
      .select()
      .from(categories)
      .where(where)
      .orderBy(direction(sortColumn), direction(categories.id))
      .limit(filters.limit)
      .offset(offset);

    return {
      items: rows.map((row) => Category.restore(row)),
      total: Number(countRow?.count ?? 0),
      page: filters.page,
      limit: filters.limit,
    };
  }

  async save(category: Category): Promise<Category> {
    if (category.isNew()) {
      return this.insert(category);
    }
    return this.updateDirty(category);
  }

  private async insert(category: Category): Promise<Category> {
    const [row] = await this.db
      .insert(categories)
      .values({
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        deletedAt: category.deletedAt,
      })
      .returning();

    if (!row) {
      throw new Error(`Failed to insert category "${category.id}"`);
    }

    category.markPersisted();
    return Category.restore(row);
  }

  private async updateDirty(category: Category): Promise<Category> {
    const changes = category.getDirtyChanges();
    if (Object.keys(changes).length === 0) {
      return category;
    }

    const [row] = await this.db
      .update(categories)
      .set(changes)
      .where(eq(categories.id, category.id))
      .returning();

    if (!row) {
      throw new Error(`Failed to save category "${category.id}"`);
    }

    category.clearDirty();
    return Category.restore(row);
  }
}
