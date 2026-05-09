import { z } from "zod";
import mongoose from "mongoose";

// ── Notification ID params schema ────────────────────────────

export const notificationIdParamsSchema = z.object({
  id: z.string().refine(
    (val) => mongoose.isValidObjectId(val),
    { message: "Invalid notification ID" }
  ),
});
