type LogMeta = Record<string, unknown>;

const writeLog = (
  level: "info" | "warn" | "error",
  message: string,
  meta?: LogMeta
) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

export const logger = {
  info: (message: string, meta?: LogMeta) =>
    writeLog("info", message, meta),
  warn: (message: string, meta?: LogMeta) =>
    writeLog("warn", message, meta),
  error: (message: string, meta?: LogMeta) =>
    writeLog("error", message, meta),
};
