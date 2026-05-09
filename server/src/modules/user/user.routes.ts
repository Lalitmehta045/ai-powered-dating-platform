import express from "express";

import protect from "../../middleware/auth.middleware";
import upload from "../../middleware/upload.middleware";
import { validateRequest } from "../../middleware/validateRequest";
import { updateProfileSchema } from "./user.validation";
import {
  boostProfile,
  discoverUsers,
  getMyProfile,
  getRecommendations,
  updateProfile,
  uploadProfilePhoto,
} from "./user.controller";

/**
 * User Router
 *
 * Exposes endpoints for managing the authenticated user's profile
 * and generating the matchmaking feed.
 */
const router = express.Router();

// GET /users/me — Get current user's profile
router.get("/me", protect, getMyProfile);

// PATCH /users/update — Update profile fields
router.patch(
  "/update",
  protect,
  validateRequest({ body: updateProfileSchema }),
  updateProfile
);

// GET /users/discover — Basic discover feed
router.get("/discover", protect, discoverUsers);

// GET /users/recommendations — Ranked recommendation engine
router.get("/recommendations", protect, getRecommendations);

// POST /users/boost — Activate profile boost (premium)
router.post("/boost", protect, boostProfile);

// POST /users/upload-photo — Upload a profile photo
// Utilizes Multer memory storage middleware
router.post(
  "/upload-photo",
  protect,
  upload.single("photo"),
  uploadProfilePhoto
);

export default router;