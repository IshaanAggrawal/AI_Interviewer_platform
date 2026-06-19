import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { AppError } from "../middlewares/error-handler";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma";
import Stripe from "stripe";
import { getOrCreateLocalUser } from "../services/user.service";

// Initialize Stripe (uses a dummy key if env var is missing during dev)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-05-27.dahlia",
});

const PRICING = {
  PRO: { amount: 999, name: "Pro Plan - AI Interviewer" }, // $9.99
  PRO_MAX: { amount: 1999, name: "Pro Max Plan - AI Interviewer" }, // $19.99
};

/**
 * POST /api/payments/create-checkout-session
 * Generates a Stripe checkout URL for the selected tier.
 */
export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw new AppError(401, "Unauthorized");

  const { tier } = req.body;
  if (!tier || (tier !== "PRO" && tier !== "PRO_MAX")) {
    throw new AppError(400, "Invalid subscription tier");
  }

  const localUser = await getOrCreateLocalUser(userId);

  const priceDetails = PRICING[tier as keyof typeof PRICING];
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Create Checkout Sessions from body params
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: localUser.email,
    client_reference_id: localUser.id,
    metadata: {
      userId: localUser.id,
      tier,
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: priceDetails.name,
            description: `Upgrade your account to the ${tier} tier.`,
          },
          unit_amount: priceDetails.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${frontendUrl}/dashboard/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/dashboard/pricing`,
  });

  if (!session.url) {
    throw new AppError(500, "Failed to create Stripe checkout session");
  }

  res.json({ success: true, url: session.url });
});

/**
 * POST /api/payments/verify-session
 * Verifies a checkout session and upgrades the user's tier.
 */
export const verifySession = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) throw new AppError(401, "Unauthorized");

  const { session_id } = req.body;
  if (!session_id) throw new AppError(400, "Session ID is required");

  // Retrieve the session from Stripe
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    throw new AppError(400, "Payment has not been completed");
  }

  const localUser = await getOrCreateLocalUser(userId);
  const targetTier = session.metadata?.tier;

  if (!targetTier || (targetTier !== "PRO" && targetTier !== "PRO_MAX")) {
    throw new AppError(400, "Invalid tier in session metadata");
  }

  // Ensure this session belongs to the requesting user
  if (!session.metadata || session.metadata.userId !== localUser.id) {
    throw new AppError(403, "You do not have permission to verify this session");
  }

  // Upgrade the user in the database
  await prisma.user.update({
    where: { id: localUser.id },
    data: { 
      tier: targetTier,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
    },
  });

  res.json({ success: true, message: `Successfully upgraded to ${targetTier}` });
});
