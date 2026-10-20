import { describe, expect, it } from "vitest";
import {
  buildPaginationMeta,
  getOffset,
  toPaginatedResponse,
} from "../../../src/shared/pagination";

describe("pagination", () => {
  describe("getOffset", () => {
    it("computes offset from 1-based page", () => {
      expect(getOffset(1, 20)).toBe(0);
      expect(getOffset(2, 20)).toBe(20);
      expect(getOffset(3, 10)).toBe(20);
    });
  });

  describe("buildPaginationMeta", () => {
    it("builds meta for a middle page", () => {
      expect(buildPaginationMeta(2, 10, 25)).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: true,
      });
    });

    it("marks first page correctly", () => {
      expect(buildPaginationMeta(1, 20, 40)).toMatchObject({
        hasNext: true,
        hasPrevious: false,
        totalPages: 2,
      });
    });

    it("marks last page correctly", () => {
      expect(buildPaginationMeta(3, 10, 25)).toMatchObject({
        hasNext: false,
        hasPrevious: true,
        totalPages: 3,
      });
    });

    it("handles empty results", () => {
      expect(buildPaginationMeta(1, 20, 0)).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      });
    });
  });

  describe("toPaginatedResponse", () => {
    it("wraps items with pagination meta", () => {
      const result = toPaginatedResponse(["a", "b"], 1, 10, 2);
      expect(result.data).toEqual(["a", "b"]);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.hasNext).toBe(false);
    });
  });
});
