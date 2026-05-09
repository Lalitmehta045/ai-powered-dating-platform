import express from "express";

import { authLimiter } from "../../middleware/rateLimiter";
import protect from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { registerSchema, loginSchema } from "./auth.validation";
import { registerUser, loginUser } from "./auth.controller";

/**
 * Auth Router
 *
 * Defines authentication endpoints, applying specific middleware
 * layers (rate limiting, Zod validation) before reaching the controller.
 */
const router = express.Router();

// POST /auth/register — Create a new user account
// Protected by rate limiter against bot signups.
router.post(
  "/register",
  authLimiter,
  validateRequest({ body: registerSchema }),
  registerUser
);

// POST /auth/login — Authenticate existing user
// Protected by rate limiter against credential stuffing.
router.post(
  "/login",
  authLimiter,
  validateRequest({ body: loginSchema }),
  loginUser
);

// GET /auth/me — Verify token validity
// Lightweight endpoint for frontend initial load validation.
router.get("/me", protect, (_req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
  });
});

export default router;