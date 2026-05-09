import mongoose from "mongoose";
import os from "os";
import { isRedisConnected } from "../../../redis/redis";
import { getAverageLatency } from "../../../middleware/latency.middleware";
import { getIO } from "../../../socket";

export class MonitoringService {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Get current server health snapshot
   */
  async getServerHealth() {
    const memory = process.memoryUsage();
    
    return {
      status: "online",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date(),
      services: {
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        redis: isRedisConnected() ? "connected" : "disconnected",
      },
      resources: {
        memoryUsed: Math.round(memory.rss / 1024 / 1024), // MB
        memoryHeap: Math.round(memory.heapUsed / 1024 / 1024), // MB
        cpuLoad: os.loadavg()[0].toFixed(2),
      },
      metrics: {
        avgLatency: getAverageLatency(),
        activeConnections: getIO().engine.clientsCount,
      }
    };
  }

  /**
   * Start broadcasting health updates to admin room
   */
  startMonitoring() {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        const health = await this.getServerHealth();
        const io = getIO();
        io.to("admin-room").emit("admin:server-health", health);
      } catch (error) {
        // Silently fail to not crash the server
      }
    }, 10000); // Every 10 seconds
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const monitoringService = new MonitoringService();
