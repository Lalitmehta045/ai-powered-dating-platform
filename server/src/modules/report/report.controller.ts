import { Request, Response, NextFunction } from "express";
import { reportService } from "./report.service";

export class ReportController {
  async create(req: Request, res: Response, next: NextFunction) {
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

  async list(req: Request, res: Response, next: NextFunction) {
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

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, suspensionDays } = req.body;
      const moderatorId = (req as any).adminId;
      const ip = req.ip;
      const ua = req.headers["user-agent"];

      const report = await reportService.resolveReport(req.params.id, moderatorId, action, suspensionDays, ip, ua);
      
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
