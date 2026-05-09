import { Request, Response, NextFunction } from "express";
import { aiModerationService } from "./ai.moderation.service";

export class AIModerationController {
  async getFlaggedContent(req: Request, res: Response, next: NextFunction) {
    try {
      const flags = await aiModerationService.getFlaggedContent();
      res.status(200).json({
        success: true,
        data: flags
      });
    } catch (error) {
      next(error);
    }
  }

  async getSuspiciousUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await aiModerationService.getSuspiciousUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiModerationController = new AIModerationController();
