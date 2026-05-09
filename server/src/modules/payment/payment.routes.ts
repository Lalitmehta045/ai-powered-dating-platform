import express from "express";

import protect from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { createOrderSchema, verifyPaymentSchema } from "./payment.validation";
import { createOrder, paymentWebhook, verifyPayment } from "./payment.controller";

/**
 * Payment Router
 * 
 * Manages the checkout flow.
 */
const router = express.Router();

// POST /payments/create-order — Create a Razorpay order
router.post(
  "/create-order",
  protect,
  validateRequest({ body: createOrderSchema }),
  createOrder
);

// POST /payments/verify — Verify payment and activate premium
router.post(
  "/verify",
  protect,
  validateRequest({ body: verifyPaymentSchema }),
  verifyPayment
);

// POST /payments/webhook — Razorpay webhook endpoint
// Note: Intentionally NOT protected by JWT, as it receives requests
// directly from Razorpay servers, not clients. (Requires HMAC verification).
router.post("/webhook", paymentWebhook);

export default router;
