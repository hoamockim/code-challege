import { describe, expect, it } from "vitest";
import { Product } from "../../../src/domain/entities/Product";
import { CATEGORY_ID, makeProduct } from "../../helpers/productFixtures";

describe("Product entity", () => {
  describe("create", () => {
    it("builds a new entity marked as new", () => {
      const product = Product.create(
        {
          sku: "KB-001",
          name: "Mechanical Keyboard",
          categoryId: CATEGORY_ID,
          priceCents: 12000,
          stockQuantity: 0,
          lowStockThreshold: 5,
        },
        () => "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      );

      expect(product.isNew()).toBe(true);
      expect(product.id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
      expect(product.categoryId).toBe(CATEGORY_ID);
      expect(product.description).toBeNull();
      expect(product.deletedAt).toBeNull();
      expect(product.hasDirtyChanges()).toBe(false);
    });

    it("markPersisted clears the new flag", () => {
      const product = Product.create({
        sku: "KB-001",
        name: "Mechanical Keyboard",
        categoryId: CATEGORY_ID,
        priceCents: 100,
        stockQuantity: 1,
        lowStockThreshold: 5,
      });

      product.markPersisted();
      expect(product.isNew()).toBe(false);
    });
  });

  describe("isLowStock", () => {
    it("returns true when stock equals threshold", () => {
      const product = makeProduct({ stockQuantity: 5, lowStockThreshold: 5 });
      expect(product.isLowStock()).toBe(true);
    });

    it("returns true when stock is below threshold", () => {
      const product = makeProduct({ stockQuantity: 2, lowStockThreshold: 5 });
      expect(product.isLowStock()).toBe(true);
    });

    it("returns false when stock is above threshold", () => {
      const product = makeProduct({ stockQuantity: 8, lowStockThreshold: 5 });
      expect(product.isLowStock()).toBe(false);
    });
  });

  describe("dirty tracking via applyUpdate", () => {
    it("marks only changed fields plus updatedAt", () => {
      const product = makeProduct({
        stockQuantity: 8,
        updatedAt: new Date("2026-01-15T10:00:00.000Z"),
      });

      product.applyUpdate({ stockQuantity: 3, name: "New Name" });

      expect(product.getDirtyChanges()).toEqual({
        stockQuantity: 3,
        name: "New Name",
        updatedAt: product.updatedAt,
      });
      expect(product.hasDirtyChanges()).toBe(true);
    });

    it("tracks categoryId changes", () => {
      const product = makeProduct();
      const nextCategoryId = "33333333-3333-3333-3333-333333333333";
      product.applyUpdate({ categoryId: nextCategoryId });
      expect(product.getDirtyChanges()).toMatchObject({
        categoryId: nextCategoryId,
      });
    });
  });

  describe("softDelete", () => {
    it("marks deletedAt and updatedAt dirty", () => {
      const product = makeProduct();
      product.softDelete();
      expect(product.isDeleted).toBe(true);
      expect(product.getDirtyChanges()).toEqual({
        deletedAt: product.deletedAt,
        updatedAt: product.updatedAt,
      });
    });
  });
});
