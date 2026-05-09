import crypto from "crypto";
import Razorpay from "razorpay";

import User from "../auth/auth.model";
import Transaction from "./transaction.model";
import { AppError } from "../../errors/AppError";
import { env } from "../../config/env";
import { sanitizeUser } from "../auth/user.dto";
import { logger } from "../../logger/logger";

// ── Razorpay client ──────────────────────────────────────────
const getRazorpayClient = () => {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ── Low-level Razorpay helpers ───────────────────────────────
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

  return order;
};

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
 */
export class PaymentService {
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
      throw AppError.badRequest("Invalid payment signature");
    }

    // 1. Record Transaction
    await Transaction.create({
      userId,
      amount: subscriptionAmountByType[data.subscriptionType],
      subscriptionType: data.subscriptionType,
      paymentId: data.razorpay_payment_id,
      orderId: data.razorpay_order_id,
      status: "success",
    });

    // 2. Activate Premium
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
