export const commonSchemas = {
  ErrorResponse: {
    type: "object",
    required: ["success", "error"],
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: {
            type: "string",
            example: "VALIDATION_ERROR",
            enum: [
              "VALIDATION_ERROR",
              "NOT_FOUND",
              "CONFLICT",
              "INTERNAL_ERROR",
            ],
          },
          message: { type: "string", example: "Validation failed" },
        },
      },
    },
  },
  HealthResponse: {
    type: "object",
    required: ["success", "data"],
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        required: ["status", "timestamp"],
        properties: {
          status: { type: "string", example: "ok" },
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-01-15T10:00:00.000Z",
          },
        },
      },
    },
  },
} as const;
