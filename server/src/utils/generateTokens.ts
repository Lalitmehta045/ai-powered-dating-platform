import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (id: string) => {
  return jwt.sign(
    { id },
    env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (id: string) => {
  return jwt.sign(
    { id },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};