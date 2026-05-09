import { z } from "zod";

// ── Create order schema ──────────────────────────────────────

export const createOrderSchema = z.object({
  subscriptionType: z.enum(["monthly", "yearly"], {
    error: "Invalid subscription type. Must be 'monthly' or 'yearly'",
  }),
});

// ── Verify payment schema ────────────────────────────────────

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
  subscriptionType: z.enum(["monthly", "yearly"], {
    error: "Invalid subscription type",
  }),
});
