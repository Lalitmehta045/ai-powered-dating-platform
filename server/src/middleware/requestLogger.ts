import { Request, Response, NextFunction } from "express";

import { logger } from "../logger/logger";

/**
 * Structured Request Logger Middleware
 *
 * Logs method, route, status code, and response time for every
 * HTTP request. Replaces unstructured morgan output with JSON
 * entries that are easier to parse, index, and query in log
 * management systems (e.g., ELK, Datadog) in production.
 *
 * Architecture Notes:
 * - Attaches to the response `finish` event to capture the final
 *   status code and calculate total request duration.
 * - Does not log request bodies to prevent accidental exposure of
 *   PII or passwords in the logs.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("HTTP Request", {
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
