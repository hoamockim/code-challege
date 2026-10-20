import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { http } from "../../../shared/http";
import { buildOpenApiDocument, OpenApiDocumentOptions } from "./document";

export const SWAGGER_UI_PATH = "/api-docs";
export const OPENAPI_JSON_PATH = "/api-docs.json";

export function setupSwagger(
  app: Express,
  options: OpenApiDocumentOptions = {}
): void {
  const document = buildOpenApiDocument(options);

  app.get(OPENAPI_JSON_PATH, (_req: Request, res: Response) => {
    res.status(http.OK).json(document);
  });

  app.use(
    SWAGGER_UI_PATH,
    swaggerUi.serve,
    swaggerUi.setup(document, {
      explorer: true,
      customSiteTitle: "Inventory API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );
}
