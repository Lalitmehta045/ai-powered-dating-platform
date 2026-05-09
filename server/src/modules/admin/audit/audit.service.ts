import AuditLog from "./audit.model";
import { logger } from "../../../logger/logger";

export class AuditService {
  /**
   * Record a new administrative action
   */
  async recordLog(data: {
    adminId: string;
    action: string;
    targetType: string;
    targetId?: any;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const log = await AuditLog.create(data);
      return log;
    } catch (error) {
      logger.error("Failed to record audit log", { error, data });
      // We don't throw here to avoid breaking the main business flow
    }
  }

  /**
   * Retrieve audit logs with pagination and filters
   */
  async getLogs(params: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
  }) {
    const { page = 1, limit = 20, adminId, action } = params;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (adminId) query.adminId = adminId;
    if (action) query.action = action;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("adminId", "name email role"),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const auditService = new AuditService();
