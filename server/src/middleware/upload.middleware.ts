/**
 * File Upload Middleware
 *
 * Configures Multer for handling multipart/form-data requests,
 * specifically for profile photo uploads.
 *
 * Architecture Notes:
 * - Uses `memoryStorage` instead of `diskStorage`. The file is kept
 *   in RAM as a buffer, which is immediately streamed to Cloudinary
 *   in the service layer.
 * - This prevents the local server disk from filling up, avoids I/O
 *   bottlenecks, and ensures statelessness (critical for horizontal
 *   scaling in PM2 or Kubernetes).
 *
 * Security:
 * - Enforces a strict 5MB file size limit to prevent Denial of
 *   Service (DoS) attacks via memory exhaustion.
 */
import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max payload size
  },
});

export default upload;