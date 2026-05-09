import { Router } from "express";
import { aiModerationController } from "./ai.moderation.controller";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected AI Moderation Routes
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin", "moderator"]) as any);

router.get("/flags", aiModerationController.getFlaggedContent);
router.get("/suspicious-users", aiModerationController.getSuspiciousUsers);

export default router;
