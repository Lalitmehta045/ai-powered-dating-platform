import express from "express";

import protect from "../../middleware/auth.middleware";
import { getMatches } from "./match.controller";

/**
 * Match Router
 * 
 * Separated from Swipe Router. This handles read-operations
 * regarding the user's existing matches.
 */
const router = express.Router();

// GET /matches — Get all matches for the current user
router.get("/", protect, getMatches);

export default router;