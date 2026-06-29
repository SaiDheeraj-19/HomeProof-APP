/**
 * AsyncStorage-backed storage implementation.
 * Used as fallback for Expo Go and Web where native MMKV is unavailable.
 * Note: AsyncStorage is async, but we expose a sync-like interface backed
 * by a synchronous in-memory cache that is pre-populated on startup.
 * This satisfies TanStack Query's SyncStoragePersister requirements.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from './index';

const memCache: Record<string, string> = {};

// Call this once at app startup so the in-memory cache is ready for sync reads.
export async function hydrateAsyncStorageCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    for (const [key, value] of pairs) {
      if (value !== null) {
        memCache[key] = value;
      }
    }
  } catch {
    // Non-fatal — cache starts empty, writes will persist going forward.
  }
}

export const asyncStorageAdapter: StorageAdapter = {
  setItem(key: string, value: string): void {
    memCache[key] = value;
    // Fire-and-forget — write through to persistent storage in background.
    AsyncStorage.setItem(key, value).catch(() => {});
  },
  getItem(key: string): string | null {
    return memCache[key] ?? null;
  },
  removeItem(key: string): void {
    delete memCache[key];
    AsyncStorage.removeItem(key).catch(() => {});
  },
};
