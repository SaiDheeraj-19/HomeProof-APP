/**
 * Feature Flags Configuration
 * 
 * Centralizes all feature toggles to allow safe rollout of experimental features.
 */

export const FeatureFlags = {
  // Enables the AI integration for report analysis
  AI_ENABLED: true,
  
  // Enables the community reviews section on Property Details
  REVIEWS_ENABLED: false, // In development
  
  // Enables push notifications for property updates
  NOTIFICATIONS_ENABLED: false, // Pending Apple APNs setup
  
  // Enables the property comparison feature
  COMPARE_ENABLED: false, 
};

export type FeatureFlag = keyof typeof FeatureFlags;

/**
 * Checks if a specific feature is enabled.
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FeatureFlags[feature];
};
