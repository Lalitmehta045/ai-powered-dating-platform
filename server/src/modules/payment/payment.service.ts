import crypto from "crypto";
import Razorpay from "razorpay";

import User from "../auth/auth.model";
import { AppError } from "../../errors/AppError";
import { env } from "../../config/env";
import { sanitizeUser } from "../auth/user.dto";
import { logger } from "../../logger/logger";

// ── Razorpay client ──────────────────────────────────────────

/**
 * Initializes the Razorpay SDK instance.
 * Gracefully returns null if keys are missing (allows the app to run
 * locally without payment gateway configuration).
 */
const getRazorpayClient = () => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ── Low-level Razorpay helpers ───────────────────────────────

/**
 * Communicates with Razorpay APIs to generate a new order ID.
 */
export const createRazorpayOrder = async (
  amountInRupees: number,
  receipt: string
) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new Error("Razorpay not configured");
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
    payment_capture: true,
  });

  logger.info("Razorpay order created", { orderId: order.id, amount: order.amount });
  return order;
};

/**
 * Security: Validates the HMAC SHA256 signature returned by Razorpay
 * to mathematically prove the payment payload wasn't tampered with
 * by a malicious client before reaching our backend.
 */
export const verifyRazorpaySignature = (params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) => {
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;

  const payload = `${params.orderId}|${params.paymentId}`;
  const generated = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  return generated === params.signature;
};

// ── Constants ────────────────────────────────────────────────

const subscriptionAmountByType = {
  monthly: 499,
  yearly: 3999,
} as const;

/**
 * Calculates the expiration date based on the chosen subscription tier.
 */
const getPremiumExpiry = (subscriptionType: "monthly" | "yearly") => {
  const now = new Date();
  if (subscriptionType === "monthly") {
    now.setMonth(now.getMonth() + 1);
    return now;
  }
  now.setFullYear(now.getFullYear() + 1);
  return now;
};

/**
 * Payment Service
 *
 * High-level orchestration of the payment flow, combining Razorpay
 * integration with internal database state updates (activating Premium).
 * 
 * TODO: Abstract payment gateway interfaces to support Stripe/PayPal
 *       alongside Razorpay in the future.
 */
export class PaymentService {
  /**
   * Generates a payment order for the frontend SDK to consume.
   */
  async createOrder(userId: string, subscriptionType: "monthly" | "yearly") {
    const amount = subscriptionAmountByType[subscriptionType];
    const order = await createRazorpayOrder(
      amount,
      `sub-${userId}-${Date.now()}`
    );

    return {
      keyId: env.RAZORPAY_KEY_ID || "",
      order,
      subscriptionType,
    };
  }

  /**
   * Finalizes the transaction and activates premium access.
   * 
   * Flow:
   * 1. Cryptographically verify signature from client payload.
   * 2. Calculate expiration date.
   * 3. Update User document atomically.
   * 4. Return sanitized user profile for immediate frontend sync.
   * 
   * @throws AppError 400 if signature validation fails.
   */
  async verifyPayment(
    userId: string,
    data: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      subscriptionType: "monthly" | "yearly";
    }
  ) {
    const valid = verifyRazorpaySignature({
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
    });

    if (!valid) {
      logger.warn("Payment signature verification failed", { userId });
      throw AppError.badRequest("Invalid payment signature");
    }

    const premiumExpiresAt = getPremiumExpiry(data.subscriptionType);
    const updated = await User.findByIdAndUpdate(
      userId,
      { isPremium: true, subscriptionType: data.subscriptionType, premiumExpiresAt },
      { new: true }
    ).select("-password");

    return sanitizeUser(updated!);
  }
}

export const paymentService = new PaymentService();
