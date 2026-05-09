import { env } from "./env";

export const corsConfig = {
  origin: env.CLIENT_URL,
  credentials: true,
};
