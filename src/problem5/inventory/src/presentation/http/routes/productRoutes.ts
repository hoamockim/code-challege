import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { asyncHandler } from "../middlewares/asyncHandler";

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.getById));
  router.post("/", asyncHandler(controller.create));
  router.patch("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.delete));

  return router;
}
