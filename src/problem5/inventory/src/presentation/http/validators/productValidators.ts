import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../shared/pagination";

const booleanQuery = z
  .enum(["true", "false"])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === "true"));

const nonNegativeIntQuery = z.coerce.number().int().nonnegative();

export const createProductSchema = z
  .object({
    sku: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1).max(200),
    description: z.string().max(2000).nullable().optional(),
    categoryId: z.string().uuid("Invalid category id"),
    priceCents: z.number().int().nonnegative(),
    stockQuantity: z.number().int().nonnegative().optional().default(0),
    lowStockThreshold: z.number().int().nonnegative().optional().default(5),
  })
  .strict();

export const updateProductSchema = z
  .object({
    sku: z.string().trim().min(1).max(64).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
    categoryId: z.string().uuid("Invalid category id").optional(),
    priceCents: z.number().int().nonnegative().optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    lowStockThreshold: z.number().int().nonnegative().optional(),
  })
  .strict()
  .refine((obj) => Object.values(obj).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const listProductsSchema = z
  .object({
    categoryId: z.string().uuid("Invalid category id").optional(),
    sku: z.string().trim().min(1).max(64).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    search: z.string().trim().min(1).max(200).optional(),
    lowStock: booleanQuery,
    minPriceCents: nonNegativeIntQuery.optional(),
    maxPriceCents: nonNegativeIntQuery.optional(),
    minStockQuantity: nonNegativeIntQuery.optional(),
    maxStockQuantity: nonNegativeIntQuery.optional(),
    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "name",
        "sku",
        "priceCents",
        "stockQuantity",
        "categoryId",
      ])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_LIMIT)
      .default(DEFAULT_LIMIT),
  })
  .strict()
  .refine(
    (query) =>
      query.minPriceCents === undefined ||
      query.maxPriceCents === undefined ||
      query.minPriceCents <= query.maxPriceCents,
    { message: "minPriceCents must be less than or equal to maxPriceCents" }
  )
  .refine(
    (query) =>
      query.minStockQuantity === undefined ||
      query.maxStockQuantity === undefined ||
      query.minStockQuantity <= query.maxStockQuantity,
    {
      message:
        "minStockQuantity must be less than or equal to maxStockQuantity",
    }
  );

export const productIdParamSchema = z.object({
  id: z.string().uuid("Invalid product id"),
});
