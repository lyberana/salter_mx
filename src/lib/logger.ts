import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "salter-mx" },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});
