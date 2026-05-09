import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";
import { auditService } from "./audit/audit.service";

export class AdminController {
  /**
   * Admin login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { admin, accessToken, refreshToken } = await adminService.login(req.body);

      // Record Audit Log
      await auditService.recordLog({
        adminId: admin.id,
        action: "ADMIN_LOGIN",
        targetType: "Admin",
        targetId: admin.id,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]
      });

      // Set Refresh Token in cookie
      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        admin,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current admin info
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await adminService.getMe(req.admin.id);
      res.status(200).json({
        success: true,
        admin,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).adminId;
      if (adminId) {
        await auditService.recordLog({
          adminId,
          action: "ADMIN_LOGOUT",
          targetType: "Admin",
          targetId: adminId,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"]
        });
      }

      res.clearCookie("adminRefreshToken");
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
