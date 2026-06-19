import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { clerkMiddleware } from "@clerk/express";

import config from "./config";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { requireAuth } from "./middlewares/require-auth";

// ─── Route Imports ───
import authRoutes from "./routes/auth.routes";
import interviewRoutes from "./routes/interview.routes";
import resumeRoutes from "./routes/resume.routes";
import aiRoutes from "./routes/ai.routes";
import analyticsRoutes from "./routes/analytics.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

// ─── Global Middlewares ───
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(morgan(config.env === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// ─── Health Check ───
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───
// Webhooks shouldn't require auth (Clerk signs them)
app.use("/api/auth", authRoutes);

// Protect all other routes
app.use("/api/interviews", requireAuth, interviewRoutes);
app.use("/api/resumes", requireAuth, resumeRoutes);
app.use("/api/ai", requireAuth, aiRoutes);
app.use("/api/analytics", requireAuth, analyticsRoutes);
app.use("/api/payments", requireAuth, paymentRoutes);

// ─── Error Handling ───
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
