import { Response, NextFunction } from "express";
import { adminUserService } from "./admin.user.service";
import { AdminRequest } from "../../../middleware/admin.auth";

export class AdminUserController {
  async listUsers(req: any, res: Response, next: NextFunction) {
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

  async getUserDetail(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const result = await adminUserService.getUserById(id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { status, suspensionDays } = req.body;
      const adminId = req.adminId;
      const ip = req.ip || "";
      const ua = req.headers["user-agent"] || "";
      const id = String(req.params.id);

      const user = await adminUserService.updateUserStatus(id, String(status), suspensionDays, adminId || "", ip, ua);
      
      res.status(200).json({
        success: true,
        message: `User status updated to ${status}`,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  async togglePremium(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { isPremium } = req.body;
      const adminId = req.adminId;
      const ip = req.ip || "";
      const ua = req.headers["user-agent"] || "";
      const id = String(req.params.id);

      const user = await adminUserService.togglePremium(id, Boolean(isPremium), adminId || "", ip, ua);
      
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
