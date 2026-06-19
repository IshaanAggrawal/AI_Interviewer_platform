import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { getAuth } from "@clerk/express";
import { getOrCreateLocalUser } from "../services/user.service";
import { prisma } from "../lib/prisma";

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
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const localUser = await getOrCreateLocalUser(userId);

  res.json({
    success: true,
    data: localUser,
  });
});

/**
 * PUT /api/auth/me
 * Updates the current user's profile in the database.
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  const { name } = req.body;
  if (!name || name.trim() === "") {
    res.status(400).json({ success: false, message: "Name is required" });
    return;
  }

  const localUser = await getOrCreateLocalUser(userId);

  const updatedUser = await prisma.user.update({
    where: { id: localUser.id },
    data: { name: name.trim() },
  });

  res.json({
    success: true,
    data: updatedUser,
  });
});
