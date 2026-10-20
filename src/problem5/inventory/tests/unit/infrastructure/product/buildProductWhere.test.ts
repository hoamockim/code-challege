import { eq } from "drizzle-orm";
import { QueryBuilder } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { categories, products } from "../../../../src/infrastructure/database/schema";
import { buildProductWhere } from "../../../../src/infrastructure/repositories/product/buildProductWhere";
import { CATEGORY_ID } from "../../../helpers/productFixtures";

function whereSql(filters: Parameters<typeof buildProductWhere>[0]) {
  const query = new QueryBuilder()
    .select()
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(buildProductWhere(filters))
    .toSQL();

  return query;
}

describe("buildProductWhere", () => {
  it("always includes soft-delete guards for product and category", () => {
    const clause = whereSql({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 20,
    });

    expect(clause.sql).toContain('"products"."deleted_at" is null');
    expect(clause.sql).toContain('"categories"."deleted_at" is null');
    expect(clause.params).toEqual([]);
  });

  it("filters by categoryId", () => {
    const clause = whereSql({
      categoryId: CATEGORY_ID,
      sortBy: "priceCents",
      sortOrder: "asc",
      page: 1,
      limit: 10,
    });

    expect(clause.sql).toContain('"products"."category_id" =');
    expect(clause.params).toEqual([CATEGORY_ID]);
  });
});
