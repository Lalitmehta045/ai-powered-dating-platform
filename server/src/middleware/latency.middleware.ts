import { Request, Response, NextFunction } from "express";

// sliding window of recent latencies
const latencyHistory: number[] = [];
const MAX_HISTORY = 50;

export const recordLatency = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;
    
    latencyHistory.push(timeInMs);
    if (latencyHistory.length > MAX_HISTORY) {
      latencyHistory.shift();
    }
  });

  next();
};

export const getAverageLatency = () => {
  if (latencyHistory.length === 0) return 0;
  const sum = latencyHistory.reduce((a, b) => a + b, 0);
  return Number((sum / latencyHistory.length).toFixed(2));
};

export const getLatencyHistory = () => [...latencyHistory];
