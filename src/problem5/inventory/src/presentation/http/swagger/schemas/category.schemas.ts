export const categorySchemas = {
  Category: {
    type: "object",
    required: ["id", "name", "description", "createdAt", "updatedAt"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "22222222-2222-2222-2222-222222222222",
      },
      name: { type: "string", maxLength: 100, example: "Electronics" },
      description: {
        type: "string",
        nullable: true,
        maxLength: 2000,
        example: "Electronic devices and accessories",
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
  CreateCategoryRequest: {
    type: "object",
    additionalProperties: false,
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100, example: "Electronics" },
      description: {
        type: "string",
        nullable: true,
        maxLength: 2000,
        example: "Electronic devices and accessories",
      },
    },
  },
  UpdateCategoryRequest: {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
      name: { type: "string", minLength: 1, maxLength: 100 },
      description: { type: "string", nullable: true, maxLength: 2000 },
    },
  },
  CategoryResponse: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Category" },
    },
  },
  CategoryListResponse: {
    type: "object",
    required: ["data", "pagination"],
    properties: {
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Category" },
      },
      pagination: { $ref: "#/components/schemas/PaginationMeta" },
    },
  },
} as const;
