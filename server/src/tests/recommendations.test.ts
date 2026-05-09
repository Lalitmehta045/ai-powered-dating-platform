/// <reference types="jest" />

/**
 * Recommendations endpoint tests.
 *
 * Tests the recommendations endpoint for authentication and
 * proper error responses — without a live database.
 */

import "./setup";

import request from "supertest";
import app from "../app";

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connection: { readyState: 0 },
  };
});

jest.mock("../redis/redis", () => ({
  isRedisConnected: () => false,
  getRedisClient: () => null,
  connectRedis: jest.fn(),
}));

describe("Recommendations Endpoint", () => {
  describe("GET /api/v1/users/recommendations", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/v1/users/recommendations");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject requests with invalid tokens", async () => {
      const res = await request(app)
        .get("/api/v1/users/recommendations")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/users/discover", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/v1/users/discover");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
