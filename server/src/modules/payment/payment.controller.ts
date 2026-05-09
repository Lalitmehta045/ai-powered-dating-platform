import { Response } from "express";

import { paymentService } from "./payment.service";
import { AppError } from "../../errors/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

/**
 * Payment Controller
 *
 * REST endpoints facilitating the checkout lifecycle.
 */

/**
 * Create a Razorpay payment order.
 * 
 * Flow:
 * 1. Zod validation ensures valid subscription tier.
 * 2. Service generates Razorpay Order ID.
 * 3. Frontend uses Order ID to initialize Razorpay checkout widget.
 * 
 * POST /api/v1/payments/create-order
 */
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const result = await paymentService.createOrder(
      req.userId,
      req.body.subscriptionType
    );

    return ApiResponse.ok(res, "Order created", result as unknown as Record<string, unknown>);
  }
);

/**
 * Verify payment and activate premium.
 * 
 * Flow:
 * 1. Frontend submits success payload from Razorpay widget.
 * 2. Service validates cryptographic signature and upgrades user.
 * 
 * POST /api/v1/payments/verify
 */
export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw AppError.unauthorized();

    const user = await paymentService.verifyPayment(req.userId, req.body);
    return ApiResponse.ok(res, "Premium activated", { user });
  }
);

/**
 * Webhook endpoint for asynchronous Razorpay server-to-server events.
 * 
 * Future Scaling:
 * - Essential for handling recurring subscription renewals or
 *   refunds that occur outside of active user sessions.
 * 
 * POST /api/v1/payments/webhook
 */
export const paymentWebhook = asyncHandler(
  async (_req: AuthRequest, res: Response) => {
    // Placeholder for future webhook event persistence/queueing.
    return ApiResponse.ok(res, "Webhook received");
  }
);
