export const productSchemas = {
  ProductCategoryRef: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "22222222-2222-2222-2222-222222222222",
      },
      name: { type: "string", example: "Electronics" },
    },
  },
  Product: {
    type: "object",
    required: [
      "id",
      "sku",
      "name",
      "description",
      "categoryId",
      "category",
      "priceCents",
      "stockQuantity",
      "lowStockThreshold",
      "isLowStock",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "11111111-1111-1111-1111-111111111111",
      },
      sku: { type: "string", maxLength: 64, example: "KB-001" },
      name: {
        type: "string",
        maxLength: 200,
        example: "Mechanical Keyboard",
      },
      description: {
        type: "string",
        nullable: true,
        maxLength: 2000,
        example: "Wireless keyboard",
      },
      categoryId: {
        type: "string",
        format: "uuid",
        example: "22222222-2222-2222-2222-222222222222",
      },
      category: { $ref: "#/components/schemas/ProductCategoryRef" },
      priceCents: {
        type: "integer",
        minimum: 0,
        example: 12000,
        description: "Price in minor currency units (cents)",
      },
      stockQuantity: { type: "integer", minimum: 0, example: 8 },
      lowStockThreshold: { type: "integer", minimum: 0, example: 5 },
      isLowStock: {
        type: "boolean",
        example: false,
        description: "True when stockQuantity <= lowStockThreshold",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-01-15T10:00:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-01-15T10:00:00.000Z",
      },
    },
  },
  CreateProductRequest: {
    type: "object",
    additionalProperties: false,
    required: ["sku", "name", "categoryId", "priceCents"],
    properties: {
      sku: { type: "string", minLength: 1, maxLength: 64, example: "KB-001" },
      name: {
        type: "string",
        minLength: 1,
        maxLength: 200,
        example: "Mechanical Keyboard",
      },
      description: {
        type: "string",
        nullable: true,
        maxLength: 2000,
        example: "Wireless keyboard",
      },
      categoryId: {
        type: "string",
        format: "uuid",
        example: "22222222-2222-2222-2222-222222222222",
      },
      priceCents: { type: "integer", minimum: 0, example: 12000 },
      stockQuantity: {
        type: "integer",
        minimum: 0,
        default: 0,
        example: 8,
      },
      lowStockThreshold: {
        type: "integer",
        minimum: 0,
        default: 5,
        example: 5,
      },
    },
  },
  UpdateProductRequest: {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
      sku: { type: "string", minLength: 1, maxLength: 64 },
      name: { type: "string", minLength: 1, maxLength: 200 },
      description: { type: "string", nullable: true, maxLength: 2000 },
      categoryId: { type: "string", format: "uuid" },
      priceCents: { type: "integer", minimum: 0 },
      stockQuantity: { type: "integer", minimum: 0 },
      lowStockThreshold: { type: "integer", minimum: 0 },
    },
  },
  ProductResponse: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Product" },
    },
  },
  PaginationMeta: {
    type: "object",
    required: [
      "page",
      "limit",
      "total",
      "totalPages",
      "hasNext",
      "hasPrevious",
    ],
    properties: {
      page: { type: "integer", example: 1 },
      limit: { type: "integer", example: 20 },
      total: { type: "integer", example: 42 },
      totalPages: { type: "integer", example: 3 },
      hasNext: { type: "boolean", example: true },
      hasPrevious: { type: "boolean", example: false },
    },
  },
  ProductListResponse: {
    type: "object",
    required: ["data", "pagination"],
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Product" },
      },
      pagination: { $ref: "#/components/schemas/PaginationMeta" },
    },
  },
} as const;
