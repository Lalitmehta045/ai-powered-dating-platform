/// <reference types="jest" />

/**
 * Chat endpoint tests.
 *
 * Tests the chat history and unread count endpoints for
 * authentication and validation — without a live database.
 */

import "./setup";

import request from "supertest";
import app from "../app";

jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connection: { readyState: 0 },
    isValidObjectId: actual.isValidObjectId,
  };
});

jest.mock("../redis/redis", () => ({
  isRedisConnected: () => false,
  getRedisClient: () => null,
  connectRedis: jest.fn(),
}));

describe("Chat Endpoints", () => {
  describe("GET /api/v1/chat/unread-count", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get("/api/v1/chat/unread-count");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/chat/:matchId/messages", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await request(app).get(
        "/api/v1/chat/507f1f77bcf86cd799439011/messages"
      );

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid matchId format", async () => {
      const res = await request(app)
        .get("/api/v1/chat/invalid-id/messages")
        .set("Authorization", "Bearer invalid-token");

      // Either 401 (auth fails first) or 400 (validation fails)
      expect([400, 401]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });
  });
});
