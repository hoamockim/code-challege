import { categoryPaths } from "./paths/category.paths";
import { healthPaths } from "./paths/health.paths";
import { productPaths } from "./paths/product.paths";
import { categorySchemas } from "./schemas/category.schemas";
import { commonSchemas } from "./schemas/common.schemas";
import { productSchemas } from "./schemas/product.schemas";

export type OpenApiDocumentOptions = {
  port?: number;
};

export function buildOpenApiDocument(options: OpenApiDocumentOptions = {}) {
  const port = options.port ?? 3000;

  return {
    openapi: "3.0.3",
    info: {
      title: "Inventory API",
      version: "1.0.0",
      description:
        "Inventory service with categories and products, SKU uniqueness, low-stock filtering, and pagination.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local development",
      },
    ],
    tags: [
      { name: "Health", description: "Service health" },
      { name: "Categories", description: "Product category operations" },
      { name: "Products", description: "Product inventory operations" },
    ],
    paths: {
      ...healthPaths,
      ...categoryPaths,
      ...productPaths,
    },
    components: {
      schemas: {
        ...commonSchemas,
        ...categorySchemas,
        ...productSchemas,
      },
    },
  };
}

export type OpenApiDocument = ReturnType<typeof buildOpenApiDocument>;
