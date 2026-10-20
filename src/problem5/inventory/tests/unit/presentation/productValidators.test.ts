import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema,
} from "../../../src/presentation/http/validators/productValidators";
import { CATEGORY_ID } from "../../helpers/productFixtures";

describe("productValidators", () => {
  describe("createProductSchema", () => {
    it("accepts a valid payload and applies defaults", () => {
      const result = createProductSchema.parse({
        sku: "KB-001",
        name: "Mechanical Keyboard",
        categoryId: CATEGORY_ID,
        priceCents: 12000,
      });

      expect(result.stockQuantity).toBe(0);
      expect(result.lowStockThreshold).toBe(5);
      expect(result.categoryId).toBe(CATEGORY_ID);
    });

    it("rejects invalid categoryId", () => {
      const result = createProductSchema.safeParse({
        sku: "KB-001",
        name: "Mechanical Keyboard",
        categoryId: "not-a-uuid",
        priceCents: 100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateProductSchema", () => {
    it("accepts partial updates", () => {
      const result = updateProductSchema.parse({ stockQuantity: 3 });
      expect(result).toEqual({ stockQuantity: 3 });
    });

    it("rejects empty objects", () => {
      const result = updateProductSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("listProductsSchema", () => {
    it("parses categoryId filter and pagination", () => {
      const result = listProductsSchema.parse({
        categoryId: CATEGORY_ID,
        lowStock: "true",
        page: "2",
        limit: "10",
        sortBy: "categoryId",
      });

      expect(result).toMatchObject({
        categoryId: CATEGORY_ID,
        lowStock: true,
        page: 2,
        limit: 10,
        sortBy: "categoryId",
      });
    });

    it("applies default sort and pagination", () => {
      const result = listProductsSchema.parse({});
      expect(result).toMatchObject({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });
  });
});
