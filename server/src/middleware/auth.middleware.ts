import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import User from "../modules/auth/auth.model";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * JWT Authentication Middleware with Status Verification
 */
const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
    };

    // Database Status Check
    const user = await User.findById(decoded.id).select("status suspensionExpiresAt");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Check for Ban
    if (user.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "Your account has been permanently banned.",
      });
    }

    // Check for Suspension
    if (user.status === "suspended") {
      if (user.suspensionExpiresAt && user.suspensionExpiresAt > new Date()) {
        return res.status(403).json({
          success: false,
          message: `Your account is suspended until ${user.suspensionExpiresAt.toLocaleDateString()}`,
        });
      } else {
        // Suspension expired, automatically lift it
        user.status = "active";
        user.suspensionExpiresAt = null;
        await user.save();
      }
    }

    req.userId = decoded.id;
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default protect;
