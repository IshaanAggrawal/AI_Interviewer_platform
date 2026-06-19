import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * POST /api/auth/webhook
 * Clerk sends user events here (user.created, user.updated, user.deleted).
 * We sync the user data into our PostgreSQL database.
 */
export const clerkWebhook = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Verify Clerk webhook signature
  // TODO: Extract user data from event payload
  // TODO: Upsert user in database via Prisma
  const { type, data } = req.body;

  console.log(`📩 Clerk webhook received: ${type}`);

  res.json({ success: true, received: true });
});

/**
 * GET /api/auth/me
 * Returns the current user's profile from the database.
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Extract Clerk userId from auth middleware
  // TODO: Fetch user from database

  res.json({
    success: true,
    data: {
      id: "placeholder",
      email: "ishaan@email.com",
      name: "Ishaan Aggrawal",
    },
  });
});
