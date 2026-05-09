import { Request, Response, NextFunction } from "express";
import { notificationService } from "../../notification/notification.service";

export class AdminBroadcastController {
  async sendBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, message, target } = req.body;
      const result = await notificationService.broadcastNotification({
        title,
        message,
        target,
        senderId: (req as any).adminId
      });

      res.status(200).json({
        success: true,
        message: `Broadcast sent successfully to ${result.count} users`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminBroadcastController = new AdminBroadcastController();
