import { Router } from "express";
import { auditService } from "./audit.service";
import { verifyAdmin, requireRole } from "../../../middleware/admin.auth";

const router = Router();

/**
 * Protected Admin Audit Routes
 * Restricted to super_admin for top-level transparency.
 */
router.use(verifyAdmin as any);
router.use(requireRole(["super_admin"]) as any);

router.get("/", async (req, res, next) => {
  try {
    const { page, limit, adminId, action } = req.query;
    const result = await auditService.getLogs({
      page: Number(page || 1),
      limit: Number(limit || 20),
      adminId: adminId as string,
      action: action as string
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

export default router;
