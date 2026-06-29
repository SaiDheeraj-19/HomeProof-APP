/**
 * App Versioning Configuration
 * 
 * Centralizes versioning logic. Useful for observability, bug reporting,
 * and the hidden diagnostics screen.
 */

// These would typically be injected by EAS or CI during the build process
export const APP_VERSION = '1.0.0';
export const BUILD_NUMBER = '1';
export const GIT_SHA = process.env.EXPO_PUBLIC_GIT_SHA || 'dev';
export const ENVIRONMENT = process.env.EXPO_PUBLIC_ENV || 'development';

export const getFullVersionString = () => {
  return `${APP_VERSION} (${BUILD_NUMBER}) - ${GIT_SHA}`;
};
