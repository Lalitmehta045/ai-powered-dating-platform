import Report from "./report.model";
import User from "../auth/auth.model";
import { AppError } from "../../errors/AppError";
import { adminUserService } from "../admin/users/admin.user.service";
import { auditService } from "../admin/audit/audit.service";

export class ReportService {
  /**
   * Create a new report (User action)
   */
  async createReport(reporterId: string, targetUserId: string, reason: string, description: string) {
    if (reporterId === targetUserId) {
      throw AppError.badRequest("You cannot report yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw AppError.notFound("Target user not found");
    }

    const report = await Report.create({
      reporterId,
      targetUserId,
      reason,
      description
    });

    // Increment target user report count
    await User.findByIdAndUpdate(targetUserId, { $inc: { reportCount: 1 } });

    return report;
  }

  /**
   * Get reports (Admin action)
   */
  async getReports(query: any) {
    const { page = 1, limit = 10, status, reason } = query;
    const filter: any = {};

    if (status) filter.status = status;
    if (reason) filter.reason = reason;

    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate("reporterId", "name email photos")
        .populate("targetUserId", "name email status reportCount photos")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter)
    ]);

    return {
      reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  /**
   * Resolve a report with action (Admin action)
   */
  async resolveReport(reportId: string, moderatorId: string, action: string, suspensionDays?: number, ip?: string, ua?: string) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw AppError.notFound("Report not found");
    }

    if (report.status !== "pending") {
      throw AppError.badRequest("Report already resolved");
    }

    let actionTaken: "none" | "warned" | "suspended" | "banned" = "none";

    switch (action) {
      case "warn":
        actionTaken = "warned";
        break;
      case "suspend":
        actionTaken = "suspended";
        await adminUserService.updateUserStatus(report.targetUserId.toString(), "suspended", suspensionDays, moderatorId, ip, ua);
        break;
      case "ban":
        actionTaken = "banned";
        await adminUserService.updateUserStatus(report.targetUserId.toString(), "banned", undefined, moderatorId, ip, ua);
        break;
      case "dismiss":
        actionTaken = "none";
        break;
      default:
        throw AppError.badRequest("Invalid action");
    }

    report.status = action === "dismiss" ? "dismissed" : "resolved";
    report.actionTaken = actionTaken;
    report.moderatorId = moderatorId as any;
    report.resolvedAt = new Date();

    await report.save();

    // Record Audit Log
    await auditService.recordLog({
      adminId: moderatorId,
      action: `REPORT_${action.toUpperCase()}`,
      targetType: "Report",
      targetId: reportId,
      details: { action, actionTaken, targetUserId: report.targetUserId },
      ipAddress: ip,
      userAgent: ua
    });

    return report;
  }
}

export const reportService = new ReportService();
