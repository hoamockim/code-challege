import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../domain/errors/AppError";
import { env } from "../../../infrastructure/config/env";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: env.isProduction ? "Internal server error" : err.message,
    },
  });
}
