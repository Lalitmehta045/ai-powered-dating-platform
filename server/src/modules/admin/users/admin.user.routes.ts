import { Router } from "express";
import { adminUserController } from "./admin.user.controller";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected Admin User Management Routes
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin", "moderator", "support_admin"]) as any);

router.get("/", adminUserController.listUsers);
router.get("/:id", adminUserController.getUserDetail);

// Only super_admin and moderator can change status
router.patch("/:id/status", requireRole(["super_admin", "moderator"]) as any, adminUserController.updateStatus);
router.patch("/:id/premium", requireRole(["super_admin", "moderator"]) as any, adminUserController.togglePremium);

export default router;
