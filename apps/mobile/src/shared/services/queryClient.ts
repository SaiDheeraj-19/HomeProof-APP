/**
 * TanStack Query client + persistence configuration.
 *
 * Storage is provided through the platform storage abstraction
 * (`shared/platform/storage`), which automatically selects:
 *   - MMKV on native production/dev builds
 *   - AsyncStorage fallback on Expo Go
 *   - localStorage on web
 *
 * Business logic here never references any storage library directly.
 */
import { QueryClient, onlineManager } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import NetInfo from '@react-native-community/netinfo';
import { appStorage } from '../platform/storage';

// Automatically pause/resume queries when offline
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && state.isInternetReachable !== false);
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5,    // 5 minutes
      retry: 2,
    },
  },
});

export const clientPersister = createSyncStoragePersister({
  storage: appStorage,
});
