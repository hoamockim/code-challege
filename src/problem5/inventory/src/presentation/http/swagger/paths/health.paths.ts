export const healthPaths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Health check",
      description: "Returns API health status.",
      responses: {
        200: {
          description: "Service is healthy",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HealthResponse" },
            },
          },
        },
      },
    },
  },
} as const;
