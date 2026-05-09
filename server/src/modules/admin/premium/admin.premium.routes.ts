import { Router } from "express";
import { adminPremiumController } from "./admin.premium.controller";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected Admin Premium & Revenue Routes
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin"]) as any); // Revenue data restricted to super_admin

router.get("/revenue", adminPremiumController.getRevenueDashboard);
router.get("/users", adminPremiumController.listPremiumUsers);
router.patch("/adjust/:id", adminPremiumController.adjustSubscription);

export default router;
