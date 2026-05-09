import { Router } from "express";
import { reportController } from "../../report/report.controller";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected Admin Moderation Routes
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin", "moderator"]) as any);

router.get("/", reportController.list);
router.patch("/:id/resolve", reportController.resolve);

export default router;
