import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { AppError } from "./error-handler";

/**
 * Custom requireAuth middleware to replace Clerk's deprecated requireAuth()
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }
    next();
  } catch (error) {
    next(error);
  }
};
