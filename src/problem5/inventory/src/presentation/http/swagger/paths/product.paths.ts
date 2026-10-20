const productIdParam = {
  name: "id",
  in: "path" as const,
  required: true,
  description: "Product UUID",
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

export const productPaths = {
  "/api/products": {
    get: {
      tags: ["Products"],
      summary: "List products",
      description:
        "Filter, sort, and paginate products. All filters are optional and combined with AND.",
      parameters: [
        {
          name: "categoryId",
          in: "query",
          required: false,
          description: "Filter by category UUID",
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "sku",
          in: "query",
          required: false,
          description: "Case-insensitive partial SKU match",
          schema: { type: "string", minLength: 1, maxLength: 64 },
          example: "KB",
        },
        {
          name: "name",
          in: "query",
          required: false,
          description: "Case-insensitive partial name match",
          schema: { type: "string", minLength: 1, maxLength: 200 },
          example: "Keyboard",
        },
        {
          name: "search",
          in: "query",
          required: false,
          description: "Case-insensitive search across name OR SKU",
          schema: { type: "string", minLength: 1, maxLength: 200 },
          example: "Keyboard",
        },
        {
          name: "lowStock",
          in: "query",
          required: false,
          description:
            "true = stockQuantity <= lowStockThreshold; false = above threshold",
          schema: { type: "string", enum: ["true", "false"] },
          example: "false",
        },
        {
          name: "minPriceCents",
          in: "query",
          required: false,
          description: "Inclusive minimum price (cents)",
          schema: { type: "integer", minimum: 0 },
          example: 1000,
        },
        {
          name: "maxPriceCents",
          in: "query",
          required: false,
          description: "Inclusive maximum price (cents)",
          schema: { type: "integer", minimum: 0 },
          example: 20000,
        },
        {
          name: "minStockQuantity",
          in: "query",
          required: false,
          description: "Inclusive minimum stock quantity",
          schema: { type: "integer", minimum: 0 },
          example: 0,
        },
        {
          name: "maxStockQuantity",
          in: "query",
          required: false,
          description: "Inclusive maximum stock quantity",
          schema: { type: "integer", minimum: 0 },
          example: 100,
        },
        {
          name: "sortBy",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: [
              "createdAt",
              "updatedAt",
              "name",
              "sku",
              "priceCents",
              "stockQuantity",
              "categoryId",
            ],
            default: "createdAt",
          },
        },
        {
          name: "sortOrder",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "desc",
          },
        },
        {
          name: "page",
          in: "query",
          required: false,
          description: "1-based page number",
          schema: { type: "integer", minimum: 1, default: 1 },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Page size (max 100)",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
      ],
      responses: {
        200: {
          description: "Paginated product list",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductListResponse" },
            },
          },
        },
        400: errorResponse("Invalid query parameters"),
      },
    },
    post: {
      tags: ["Products"],
      summary: "Create product",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateProductRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Product created",
          headers: {
            Location: {
              description: "URL of the created product",
              schema: { type: "string", example: "/api/products/{id}" },
            },
          },
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductResponse" },
            },
          },
        },
        400: errorResponse("Validation failed"),
        409: errorResponse("SKU already exists"),
      },
    },
  },
  "/api/products/{id}": {
    get: {
      tags: ["Products"],
      summary: "Get product by id",
      parameters: [productIdParam],
      responses: {
        200: {
          description: "Product found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductResponse" },
            },
          },
        },
        400: errorResponse("Invalid product id"),
        404: errorResponse("Product not found"),
      },
    },
    patch: {
      tags: ["Products"],
      summary: "Update product",
      description: "Partial update. At least one field is required.",
      parameters: [productIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateProductRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductResponse" },
            },
          },
        },
        400: errorResponse("Validation failed"),
        404: errorResponse("Product not found"),
        409: errorResponse("SKU already exists"),
      },
    },
    delete: {
      tags: ["Products"],
      summary: "Soft-delete product",
      description:
        "Marks the product as deleted (sets deletedAt). Soft-deleted products are hidden from list/get/update. The SKU can be reused afterward.",
      parameters: [productIdParam],
      responses: {
        204: { description: "Product soft-deleted" },
        400: errorResponse("Invalid product id"),
        404: errorResponse("Product not found or already deleted"),
      },
    },
  },
} as const;
