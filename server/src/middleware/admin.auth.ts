import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import Admin from "../modules/admin/admin.model";
import { AppError } from "../errors/AppError";

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    role: string;
  };
  adminId?: string;
}

/**
 * Middleware to verify admin JWT token
 *
 * Security:
 * - Validates JWT signature and expiration.
 * - Performs live database check to ensure admin account still exists and is active.
 * - Attaches both req.admin and req.adminId for downstream audit logging.
 */
export const verifyAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw AppError.unauthorized("Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      role?: string;
    };

    const admin = await Admin.findById(decoded.id).select("role isActive");

    if (!admin) {
      throw AppError.unauthorized("Invalid admin account.");
    }

    if (!admin.isActive) {
      throw AppError.forbidden("Admin account is disabled.");
    }

    req.admin = {
      id: admin._id.toString(),
      role: admin.role,
    };

    // Consistent adminId for audit logging
    req.adminId = admin._id.toString();

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(AppError.unauthorized("Invalid or expired token."));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized("Token expired. Please login again."));
    }
    next(error);
  }
};

/**
 * Middleware to require specific admin roles
 */
export const requireRole = (roles: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      throw AppError.unauthorized("Authentication required.");
    }

    if (!roles.includes(req.admin.role)) {
      throw AppError.forbidden("Access denied. Insufficient permissions.");
    }

    next();
  };
};
