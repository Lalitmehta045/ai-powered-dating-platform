import { Request, Response, NextFunction } from "express";
import { analyticsService } from "./analytics.service";

export class AnalyticsController {
  /**
   * Get overview analytics
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getOverviewStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealtime(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getRealtimeStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
