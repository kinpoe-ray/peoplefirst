/**
 * Professional Logger Utility
 *
 * Features:
 * - Environment-aware logging (dev vs production)
 * - Multiple log levels: debug, info, warn, error
 * - Timestamp and source information
 * - Sensitive data masking
 * - Configurable via environment variables
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // Disable all logging
}

// Log level names for display
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE',
};

// Colors for console output (only in development)
const LOG_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '#7c3aed', // Purple
  [LogLevel.INFO]: '#2563eb',  // Blue
  [LogLevel.WARN]: '#d97706',  // Orange
  [LogLevel.ERROR]: '#dc2626', // Red
  [LogLevel.NONE]: '#6b7280',  // Gray
};

// Sensitive field patterns to mask
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /credit[_-]?card/i,
  /ssn/i,
  /social[_-]?security/i,
  /phone/i,
  /email/i,
  /address/i,
];

// Environment detection
const isDevelopment = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';
const isProduction = import.meta.env?.PROD ?? process.env.NODE_ENV === 'production';

// Parse log level from environment variable
function getLogLevelFromEnv(): LogLevel {
  const envLevel = import.meta.env?.VITE_LOG_LEVEL ?? process.env.VITE_LOG_LEVEL;

  if (envLevel) {
    const level = envLevel.toUpperCase();
    switch (level) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'NONE': return LogLevel.NONE;
      default: break;
    }
  }

  // Default: DEBUG in development, ERROR in production
  return isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  source: string;
  message: string;
  data?: unknown;
}

interface LoggerOptions {
  source?: string;
  minLevel?: LogLevel;
  enableRemoteLogging?: boolean;
  maskSensitiveData?: boolean;
}

class Logger {
  private source: string;
  private minLevel: LogLevel;
  private enableRemoteLogging: boolean;
  private maskSensitiveData: boolean;

  constructor(options: LoggerOptions = {}) {
    this.source = options.source ?? 'App';
    this.minLevel = options.minLevel ?? getLogLevelFromEnv();
    this.enableRemoteLogging = options.enableRemoteLogging ?? isProduction;
    this.maskSensitiveData = options.maskSensitiveData ?? true;
  }

  /**
   * Create a child logger with a specific source
   */
  child(source: string): Logger {
    return new Logger({
      source,
      minLevel: this.minLevel,
      enableRemoteLogging: this.enableRemoteLogging,
      maskSensitiveData: this.maskSensitiveData,
    });
  }

  /**
   * Mask sensitive data in objects
   */
  private maskData(data: unknown): unknown {
    if (!this.maskSensitiveData) return data;

    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      // Mask email addresses
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
        const [local, domain] = data.split('@');
        return `${local.substring(0, 2)}***@${domain}`;
      }
      // Mask potential tokens/keys (long strings)
      if (data.length > 20 && /^[A-Za-z0-9_-]+$/.test(data)) {
        return `${data.substring(0, 8)}...${data.substring(data.length - 4)}`;
      }
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.maskData(item));
    }

    if (typeof data === 'object') {
      const masked: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
        if (isSensitive && typeof value === 'string') {
          masked[key] = value.length > 0 ? '***REDACTED***' : '';
        } else {
          masked[key] = this.maskData(value);
        }
      }
      return masked;
    }

    return data;
  }

  /**
   * Format timestamp for log entry
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Create a log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      timestamp: this.getTimestamp(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      source: this.source,
      message,
      data: data !== undefined ? this.maskData(data) : undefined,
    };
  }

  /**
   * Output log to console (development only)
   */
  private consoleOutput(entry: LogEntry): void {
    if (isProduction && this.minLevel > LogLevel.DEBUG) {
      // In production, only output errors to console
      if (entry.level < LogLevel.ERROR) return;
    }

    const color = LOG_COLORS[entry.level];
    const prefix = `%c[${entry.timestamp}] [${entry.levelName}] [${entry.source}]`;
    const style = `color: ${color}; font-weight: bold;`;

    const args: unknown[] = [prefix, style, entry.message];
    if (entry.data !== undefined) {
      args.push(entry.data);
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(...args);
        break;
      case LogLevel.INFO:
        console.info(...args);
        break;
      case LogLevel.WARN:
        console.warn(...args);
        break;
      case LogLevel.ERROR:
        console.error(...args);
        break;
      default:
        console.log(...args);
    }
  }

  /**
   * Send log to remote monitoring service (production)
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.enableRemoteLogging) return;

    // TODO: Implement remote logging service integration
    // Examples: Sentry, LogRocket, Datadog, etc.
    //
    // Example implementation:
    // try {
    //   await fetch('/api/logs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(entry),
    //   });
    // } catch (error) {
    //   // Silently fail to avoid infinite loops
    // }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    if (level < this.minLevel) return;

    const entry = this.createLogEntry(level, message, data);

    // Console output
    this.consoleOutput(entry);

    // Remote logging for errors and above in production
    if (level >= LogLevel.ERROR && this.enableRemoteLogging) {
      this.sendToRemote(entry).catch(() => {
        // Silently fail
      });
    }
  }

  /**
   * Debug level logging - for development diagnostics
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging - general information
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging - potential issues
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging - errors and exceptions
   */
  error(message: string, error?: unknown): void {
    let errorData: unknown = error;

    // Extract useful information from Error objects
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
      };
    }

    this.log(LogLevel.ERROR, message, errorData);
  }

  /**
   * Log with explicit level
   */
  logWithLevel(level: LogLevel, message: string, data?: unknown): void {
    this.log(level, message, data);
  }

  /**
   * Group related logs (development only)
   */
  group(label: string): void {
    if (isDevelopment) {
      console.group(`[${this.source}] ${label}`);
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Time a specific operation
   */
  time(label: string): () => void {
    const start = performance.now();
    const fullLabel = `${this.source}:${label}`;

    if (isDevelopment) {
      console.time(fullLabel);
    }

    return () => {
      const duration = performance.now() - start;
      if (isDevelopment) {
        console.timeEnd(fullLabel);
      }
      this.debug(`${label} completed`, { durationMs: duration.toFixed(2) });
    };
  }

  /**
   * Create a performance marker
   */
  mark(name: string): void {
    if (isDevelopment && typeof performance !== 'undefined') {
      performance.mark(`${this.source}:${name}`);
    }
  }

  /**
   * Measure between two markers
   */
  measure(name: string, startMark: string, endMark?: string): void {
    if (isDevelopment && typeof performance !== 'undefined') {
      try {
        const measureName = `${this.source}:${name}`;
        const start = `${this.source}:${startMark}`;
        const end = endMark ? `${this.source}:${endMark}` : undefined;

        if (end) {
          performance.measure(measureName, start, end);
        } else {
          performance.measure(measureName, start);
        }
      } catch {
        // Silently fail if markers don't exist
      }
    }
  }
}

// Create default logger instance
const logger = new Logger({ source: 'App' });

// Export both the class and the default instance
export { Logger };
export default logger;

// Convenience factory function for creating module-specific loggers
export function createLogger(source: string): Logger {
  return new Logger({ source });
}

// Re-export LogLevel for external use
export { LogLevel as Level };
