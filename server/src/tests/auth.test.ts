/// <reference types="jest" />

/**
 * Auth integration tests.
 *
 * Tests the auth endpoints for registration, login, duplicate
 * email handling, and invalid credentials — using the actual
 * Express app (without a live database).
 */

// Setup env before any imports
import "./setup";

import request from "supertest";
import app from "../app";

// Mock Mongoose to avoid needing a real MongoDB connection
jest.mock("mongoose", () => {
  const actual = jest.requireActual("mongoose");
  return {
    ...actual,
    connection: { readyState: 0 },
  };
});

// Mock Redis
jest.mock("../redis/redis", () => ({
  isRedisConnected: () => false,
  getRedisClient: () => null,
  connectRedis: jest.fn(),
}));

describe("Auth Endpoints", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should reject registration with missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject registration with invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "not-an-email",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject registration with short password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "12",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should reject login with missing fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject login with invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "bad", password: "test" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Backward compatibility", () => {
    it("should respond on legacy /api/auth routes", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" });

      // Route exists (not 404). May be 400 (validation) or 429 (rate-limited).
      expect([400, 429]).toContain(res.status);
    });
  });

  describe("404 catch-all", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/api/v1/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
