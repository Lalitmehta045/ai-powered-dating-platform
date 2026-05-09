import bcrypt from "bcryptjs";
import Admin from "./admin.model";
import { AppError } from "../../errors/AppError";
import { sanitizeAdmin } from "./admin.dto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens";

export class AdminService {
  /**
   * Authenticate an admin user.
   */
  async login(data: { email: string; password: string }) {
    const admin = await Admin.findOne({ email: data.email });

    if (!admin) {
      throw AppError.badRequest("Invalid credentials");
    }

    if (!admin.isActive) {
      throw AppError.forbidden("Account is disabled");
    }

    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      admin.password
    );

    if (!isPasswordCorrect) {
      throw AppError.badRequest("Invalid credentials");
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const accessToken = generateAccessToken(admin._id.toString());
    const refreshToken = generateRefreshToken(admin._id.toString());

    return {
      admin: sanitizeAdmin(admin),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get current admin details.
   */
  async getMe(adminId: string) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw AppError.notFound("Admin not found");
    }
    return sanitizeAdmin(admin);
  }
}

export const adminService = new AdminService();
