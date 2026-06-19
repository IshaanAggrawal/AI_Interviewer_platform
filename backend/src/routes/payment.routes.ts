import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";

const router = Router();

router.post("/create-checkout-session", paymentController.createCheckoutSession);
router.post("/verify-session", paymentController.verifySession);

export default router;
