/**
 * Centralized Application Logger
 *
 * Usage:
 *   import { logger } from '@/shared/logger';
 *   logger.info('AuthContext', 'Session restored', { userId });
 *   logger.error('ReportForm', 'Upload failed', error);
 *
 * In production builds, debug logs are suppressed automatically.
 * This is the only place in the app that calls console.* directly.
 */

const IS_DEV = __DEV__;

// Optional import, fails gracefully if Sentry isn't fully set up yet
import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatMessage(level: LogLevel, tag: string, message: string): string {
  const timestamp = new Date().toISOString().slice(11, 23); // HH:mm:ss.mmm
  return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] [${tag}] ${message}`;
}

function log(level: LogLevel, tag: string, message: string, extra?: unknown): void {
  const formatted = formatMessage(level, tag, message);
  switch (level) {
    case 'debug':
      if (IS_DEV) console.debug(formatted, extra ?? '');
      break;
    case 'info':
      if (IS_DEV) console.info(formatted, extra ?? '');
      break;
    case 'warn':
      console.warn(formatted, extra ?? '');
      break;
    case 'error':
      console.error(formatted, extra ?? '');
      if (!IS_DEV) {
        Sentry.captureException(extra instanceof Error ? extra : new Error(message), {
          tags: { tag },
          extra: { extra }
        });
      }
      break;
  }
}

export const analytics = {
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    log('info', 'Analytics', `Event: ${eventName}`, properties);
    // In the future: PostHog.capture(eventName, properties)
  },
  trackScreen: (screenName: string) => {
    log('info', 'Analytics', `Screen View: ${screenName}`);
    // In the future: PostHog.screen(screenName)
  }
};

export const logger = {
  debug: (tag: string, message: string, extra?: unknown) => log('debug', tag, message, extra),
  info:  (tag: string, message: string, extra?: unknown) => log('info',  tag, message, extra),
  warn:  (tag: string, message: string, extra?: unknown) => log('warn',  tag, message, extra),
  error: (tag: string, message: string, extra?: unknown) => log('error', tag, message, extra),
};
