interface ErrorLog {
  id: string;
  timestamp: Date;
  level: "error" | "warning" | "info";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep only last 100 logs in memory

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private addLog(
    level: ErrorLog["level"],
    message: string,
    context?: Record<string, unknown>,
    stack?: string
  ): void {
    const log: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      stack,
      context,
      // In a real app, you'd get these from user session
      userId: process.env.NODE_ENV === "development" ? "dev_user" : "anonymous",
      sessionId: `session_${Date.now()}`,
    };

    this.logs.unshift(log); // Add to beginning

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console logging for development
    const logMessage = `[${level.toUpperCase()}] ${message}`;
    if (context) {
      console.log(logMessage, context);
    } else {
      console.log(logMessage);
    }

    // In production, you would send this to your error reporting service
    // this.sendToErrorService(log);
  }

  error(
    message: string,
    context?: Record<string, unknown>,
    stack?: string
  ): void {
    this.addLog("error", message, context, stack);
  }

  warning(message: string, context?: Record<string, unknown>): void {
    this.addLog("warning", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.addLog("info", message, context);
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(0, count);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
  }

  // Get logs by level
  getLogsByLevel(level: ErrorLog["level"]): ErrorLog[] {
    return this.logs.filter((log) => log.level === level);
  }

  // In a real app, this would send logs to your error reporting service
  private sendToErrorService(log: ErrorLog): void {
    // Example: Send to Sentry, Bugsnag, or your own API
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(log)
    // });
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Convenience functions
export const logError = (
  message: string,
  context?: Record<string, unknown>,
  stack?: string
) => {
  errorLogger.error(message, context, stack);
};

export const logWarning = (
  message: string,
  context?: Record<string, unknown>
) => {
  errorLogger.warning(message, context);
};

export const logInfo = (message: string, context?: Record<string, unknown>) => {
  errorLogger.info(message, context);
};
