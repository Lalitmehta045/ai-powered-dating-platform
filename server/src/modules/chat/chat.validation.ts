import { z } from "zod";
import mongoose from "mongoose";

// ── Chat params schema ───────────────────────────────

export const chatParamsSchema = z.object({
  matchId: z.string().refine(
    (val) => mongoose.isValidObjectId(val),
    { message: "Invalid matchId" }
  ),
});

// ── Send message schema ──────────────────────────────────

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

// ── Pagination query schema ──────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});
