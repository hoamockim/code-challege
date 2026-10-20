const categoryIdParam = {
  name: "id",
  in: "path" as const,
  required: true,
  description: "Category UUID",
  schema: { type: "string", format: "uuid" },
};

const errorResponse = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
});

export const categoryPaths = {
  "/api/categories": {
    get: {
      tags: ["Categories"],
      summary: "List categories",
      parameters: [
        {
          name: "search",
          in: "query",
          required: false,
          description: "Search by name or description",
          schema: { type: "string", minLength: 1 },
        },
        {
          name: "sortBy",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["createdAt", "updatedAt", "name"],
            default: "createdAt",
          },
        },
        {
          name: "sortOrder",
          in: "query",
          required: false,
          schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
        },
        {
          name: "page",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: {
          description: "Paginated category list",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryListResponse" },
            },
          },
        },
        400: errorResponse("Invalid query parameters"),
      },
    },
    post: {
      tags: ["Categories"],
      summary: "Create category",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateCategoryRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Category created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryResponse" },
            },
          },
        },
        400: errorResponse("Validation failed"),
        409: errorResponse("Category name already exists"),
      },
    },
  },
  "/api/categories/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Get category by id",
      parameters: [categoryIdParam],
      responses: {
        200: {
          description: "Category found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryResponse" },
            },
          },
        },
        400: errorResponse("Invalid category id"),
        404: errorResponse("Category not found"),
      },
    },
    patch: {
      tags: ["Categories"],
      summary: "Update category",
      parameters: [categoryIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCategoryRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Category updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryResponse" },
            },
          },
        },
        400: errorResponse("Validation failed"),
        404: errorResponse("Category not found"),
        409: errorResponse("Category name already exists"),
      },
    },
    delete: {
      tags: ["Categories"],
      summary: "Soft-delete category",
      description:
        "Fails with 409 when active products still reference the category.",
      parameters: [categoryIdParam],
      responses: {
        204: { description: "Category soft-deleted" },
        400: errorResponse("Invalid category id"),
        404: errorResponse("Category not found"),
        409: errorResponse("Category still referenced by products"),
      },
    },
  },
} as const;
