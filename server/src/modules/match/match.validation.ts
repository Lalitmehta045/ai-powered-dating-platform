import { z } from "zod";
import mongoose from "mongoose";

// ── Swipe params schema ──────────────────────────────────────

export const swipeParamsSchema = z.object({
  id: z.string().refine(
    (val) => mongoose.isValidObjectId(val),
    { message: "Invalid user ID" }
  ),
});
