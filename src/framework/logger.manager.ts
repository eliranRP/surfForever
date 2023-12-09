import winston, { Logger, transports } from 'winston';

class LoggerManager {
  private static instance: Logger | null = null;

  private constructor() {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`),
      ),
      transports: [new transports.Console()],
    });

    LoggerManager.instance = logger;
  }

  public static getInstance(): Logger {
    if (!LoggerManager.instance) {
      new LoggerManager();
    }

    return LoggerManager.instance;
  }
}

// Usage example
const logger = LoggerManager.getInstance();
export default logger;
