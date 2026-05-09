import express from "express";

import protect from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { swipeParamsSchema } from "../match/match.validation";
import { swipeLeft, swipeRight } from "../match/match.controller";

/**
 * Swipe Router
 * 
 * Separated from the Match Router. This handles the high-throughput
 * write operations (swiping right/left) from the discovery feed.
 */
const router = express.Router();

// POST /swipes/right/:id — Like a user
router.post(
  "/right/:id",
  protect,
  validateRequest({ params: swipeParamsSchema }),
  swipeRight
);

// POST /swipes/left/:id — Dislike a user
router.post(
  "/left/:id",
  protect,
  validateRequest({ params: swipeParamsSchema }),
  swipeLeft
);

export default router;
