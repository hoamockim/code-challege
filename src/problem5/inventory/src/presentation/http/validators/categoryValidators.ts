import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from "../../../shared/pagination";

export const createCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    description: z.string().max(2000).nullable().optional(),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .refine((obj) => Object.values(obj).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const listCategoriesSchema = z
  .object({
    search: z.string().trim().min(1).max(200).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "name"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  })
  .strict();

export const categoryIdParamSchema = z.object({
  id: z.string().uuid("Invalid category id"),
});
