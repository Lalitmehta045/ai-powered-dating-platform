import bcrypt from "bcryptjs";

import User from "./auth.model";
import { AppError } from "../../errors/AppError";
import { sanitizeUserForAuth } from "./user.dto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/generateTokens";

/**
 * Auth Service
 *
 * Encapsulates authentication business logic. Keeps controllers
 * lean and highly testable without mocking HTTP request/response
 * objects.
 *
 * Architecture Notes:
 * - Employs a dual-token strategy: short-lived Access Tokens
 *   returned in JSON, and long-lived Refresh Tokens intended
 *   for HTTP-only cookies.
 * - Password hashing happens here instead of Mongoose pre-save
 *   hooks to keep model logic purely data-driven and predictable.
 */
export class AuthService {
  /**
   * Register a new user.
   * 
   * Security:
   * - Uses bcrypt with a work factor of 12 for strong password hashing.
   * - Checks for existing email to prevent enumeration/duplicate accounts.
   * 
   * @throws AppError 409 if the email is already taken.
   */
  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw AppError.conflict("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: sanitizeUserForAuth(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate an existing user.
   * 
   * Security:
   * - Generic "Invalid credentials" error message prevents email
   *   enumeration attacks (attackers can't tell if the email is wrong
   *   or the password is wrong).
   * 
   * @throws AppError 400 if credentials are invalid.
   */
  async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email });

    if (!user) {
      throw AppError.badRequest("Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw AppError.badRequest("Invalid credentials");
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      user: sanitizeUserForAuth(user),
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
