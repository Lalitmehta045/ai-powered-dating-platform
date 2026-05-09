import { Response, NextFunction } from "express";
import { adminPremiumService } from "./admin.premium.service";
import { AdminRequest } from "../../../middleware/admin.auth";

export class AdminPremiumController {
  async getRevenueDashboard(req: any, res: Response, next: NextFunction) {
    try {
      const stats = await adminPremiumService.getRevenueStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async listPremiumUsers(req: any, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await adminPremiumService.getPremiumUsers(Number(page || 1), Number(limit || 10));
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustSubscription(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.adminId || "";
      const ip = req.ip || "";
      const ua = req.headers["user-agent"] || "";
      const id = String(req.params.id);
      
      const user = await adminPremiumService.adjustSubscription(id, req.body, adminId, ip, ua);
      
      res.status(200).json({
        success: true,
        message: "Subscription adjusted successfully",
        user
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminPremiumController = new AdminPremiumController();
