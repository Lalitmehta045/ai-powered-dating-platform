import { Router } from "express";
import { reportController } from "./report.controller";
import protect from "../../middleware/auth.middleware";

const router = Router();

/**
 * Public User Reporting Routes
 */
router.post("/", protect as any, reportController.create);

export default router;
