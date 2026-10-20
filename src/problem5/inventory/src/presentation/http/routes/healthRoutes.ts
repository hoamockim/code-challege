import { Router } from "express";

export function createHealthRoutes(): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
}
