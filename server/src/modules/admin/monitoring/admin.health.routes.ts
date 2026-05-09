import { Router } from "express";
import { monitoringService } from "./monitoring.service";
import { verifyAdmin } from "../../../middleware/admin.auth";

const router = Router();

router.get("/stats", verifyAdmin as any, async (req, res, next) => {
  try {
    const health = await monitoringService.getServerHealth();
    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
});

export default router;
