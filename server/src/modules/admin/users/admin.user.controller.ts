import { Request, Response, NextFunction } from "express";
import { adminUserService } from "./admin.user.service";

export class AdminUserController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminUserService.getUsers(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminUserService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, suspensionDays } = req.body;
      const adminId = (req as any).adminId;
      const ip = req.ip;
      const ua = req.headers["user-agent"];

      const user = await adminUserService.updateUserStatus(req.params.id, status, suspensionDays, adminId, ip, ua);
      
      res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async togglePremium(req: Request, res: Response, next: NextFunction) {
    try {
      const { isPremium } = req.body;
      const adminId = (req as any).adminId;
      const ip = req.ip;
      const ua = req.headers["user-agent"];

      const user = await adminUserService.togglePremium(req.params.id, isPremium, adminId, ip, ua);
      
      res.status(200).json({
        success: true,
        message: `User premium status updated to ${isPremium}`,
        user
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminUserController = new AdminUserController();
