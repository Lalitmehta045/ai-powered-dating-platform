/**
 * JWT Authentication Middleware
 *
 * Secures API endpoints by validating JSON Web Tokens sent in
 * the Authorization header (`Bearer <token>`).
 *
 * Security:
 * - Rejects missing or malformed headers.
 * - Rejects expired or tampered tokens.
 * - Extracts the `userId` from the decoded token payload and
 *   attaches it to `req.userId` for downstream controllers.
 *
 * Architecture Notes:
 * - This middleware is stateless; it validates the token signature
 *   against the `JWT_SECRET` without hitting the database. This is
 *   highly performant but requires a separate token invalidation
 *   strategy (e.g., short-lived access tokens + refresh tokens)
 *   for handling immediate logouts or compromised accounts.
 */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
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

    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default protect;
