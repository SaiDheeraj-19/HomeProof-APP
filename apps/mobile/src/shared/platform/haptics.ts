/**
 * Platform Haptics Abstraction
 *
 * Wraps `expo-haptics` in a safe no-op on web (where haptics aren't supported).
 * Business logic calls these functions and never imports expo-haptics directly.
 *
 * Usage:
 *   import { haptics } from '@/shared/platform/haptics';
 *   haptics.light();
 *   haptics.success();
 *   haptics.selection();
 */
import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

// expo-haptics is a no-op on unsupported platforms but only ships on native.
// Guard all calls so web never reaches the haptic API.
const isNative = Platform.OS !== 'web';

export const haptics = {
  light(): void {
    if (isNative) ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium(): void {
    if (isNative) ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  heavy(): void {
    if (isNative) ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },
  selection(): void {
    if (isNative) ExpoHaptics.selectionAsync().catch(() => {});
  },
  success(): void {
    if (isNative) ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success).catch(() => {});
  },
  warning(): void {
    if (isNative) ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning).catch(() => {});
  },
  error(): void {
    if (isNative) ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
