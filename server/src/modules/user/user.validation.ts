import { z } from "zod";

// ── Profile update schema ────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  age: z.number().int().min(18).max(120).optional(),
  gender: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  interestedIn: z.string().optional(),
  interests: z.array(z.string()).optional(),
  settings: z.object({
    notificationsEnabled: z.boolean().optional(),
    theme: z.enum(["light", "dark"]).optional(),
  }).optional(),
});

// ── Recommendation query schema ──────────────────────────────

export const recommendationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  minAge: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  maxAge: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});
