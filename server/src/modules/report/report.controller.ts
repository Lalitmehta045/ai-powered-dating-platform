import { Response, NextFunction } from "express";
import { reportService } from "./report.service";
import { AdminRequest } from "../../middleware/admin.auth";

export class ReportController {
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const { targetUserId, reason, description } = req.body;
      const reporterId = (req as any).userId;
      const report = await reportService.createReport(reporterId, targetUserId, reason, description);
      res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: any, res: Response, next: NextFunction) {
    try {
      const result = await reportService.getReports(req.query);
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async resolve(req: AdminRequest, res: Response, next: NextFunction) {
    try {
      const { action, suspensionDays } = req.body;
      const moderatorId = req.adminId || "";
      const ip = req.ip || "";
      const ua = req.headers["user-agent"] || "";
      const id = String(req.params.id);

      const report = await reportService.resolveReport(id, moderatorId, String(action), suspensionDays, ip, ua);
      
      res.status(200).json({
        success: true,
        message: `Report resolved with action: ${action}`,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
