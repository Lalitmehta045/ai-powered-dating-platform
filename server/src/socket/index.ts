/**
 * Socket.IO Initialization
 *
 * Orchestrates the realtime websocket server attached to the HTTP server.
 *
 * Architecture Notes:
 * - Uses CORS configuration aligned with the REST API.
 * - Acts as the centralized registry for socket event handlers
 *   from different domain modules (e.g., chat, notifications).
 *
 * Scalability / Future Proofing:
 * - Currently single-node. For multi-node scaling (Kubernetes/PM2 cluster),
 *   this file MUST integrate the `@socket.io/redis-adapter` so events
 *   emitted on Node A reach sockets connected to Node B.
 *
 * TODO: Integrate Redis adapter for multi-instance socket broadcasting.
 */
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getRedisClient, isRedisConnected } from "../redis/redis";
import { registerChatSocketHandlers } from "../modules/chat/chat.socket";
import { monitoringService } from "../modules/admin/monitoring/monitoring.service";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

let ioInstance: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HttpServer) => {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  if (isRedisConnected()) {
    try {
      const pubClient = getRedisClient().duplicate();
      const subClient = pubClient.duplicate();

      Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        if (ioInstance) {
          ioInstance.adapter(createAdapter(pubClient, subClient));
          console.log("[Socket.IO] Redis adapter initialized for multi-instance scaling.");
        }
      }).catch(err => {
        console.error("[Socket.IO] Redis adapter connection failed:", err);
      });
    } catch (error) {
      console.error("[Socket.IO] Failed to duplicate redis client for adapter:", error);
    }
  }

  // Register domain-specific socket handlers
  registerChatSocketHandlers(ioInstance);

  // Admin Room & Monitoring
  ioInstance.on("connection", (socket) => {
    socket.on("admin:join", (token) => {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        if (decoded.role) { // Basic check for admin token
          socket.join("admin-room");
          console.log(`[Socket.IO] Admin ${decoded.id} joined monitoring room.`);
        }
      } catch (err) {
        socket.emit("error", { message: "Unauthorized admin socket connection" });
      }
    });
  });

  monitoringService.startMonitoring();
  
  return ioInstance;
};

/**
 * Get the initialized Socket.IO instance.
 * Allows REST controllers/services to emit events to connected clients.
 * @throws Error if called before initializeSocket()
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO server is not initialized");
  }

  return ioInstance;
};
