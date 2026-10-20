import { and, ilike, isNull, or, SQL } from "drizzle-orm";
import { CategoryListFilters } from "../../../domain/entities/Category";
import { categories } from "../../database/schema";

export function buildCategoryWhere(
  filters: CategoryListFilters
): SQL | undefined {
  const search = filters.search?.trim();

  return and(
    isNull(categories.deletedAt),
    search
      ? or(
          ilike(categories.name, `%${search}%`),
          ilike(categories.description, `%${search}%`)
        )
      : undefined
  );
}
