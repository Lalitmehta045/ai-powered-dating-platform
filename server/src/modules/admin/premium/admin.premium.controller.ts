import { Request, Response, NextFunction } from "express";
import { adminPremiumService } from "./admin.premium.service";

export class AdminPremiumController {
  async getRevenueDashboard(req: Request, res: Response, next: NextFunction) {
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

  async listPremiumUsers(req: Request, res: Response, next: NextFunction) {
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

  async adjustSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).adminId;
      const ip = req.ip;
      const ua = req.headers["user-agent"];
      
      const user = await adminPremiumService.adjustSubscription(req.params.id, req.body, adminId, ip, ua);
      
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
