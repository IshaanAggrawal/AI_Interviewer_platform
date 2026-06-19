import { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler";

/**
 * Wraps an async route handler so thrown errors are passed to the error middleware.
 * Eliminates try/catch boilerplate in every controller.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
