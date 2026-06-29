/**
 * MMKV-backed storage implementation.
 * Used on native (non-Expo-Go) builds where MMKV is available.
 * MMKV is synchronous which is ideal for TanStack Query's SyncStoragePersister.
 *
 * Note: This version of react-native-mmkv uses the Nitro module API.
 * `MMKV` is a type only — instances are created via `createMMKV()`.
 */
import { createMMKV } from 'react-native-mmkv';
import type { StorageAdapter } from './index';

const storage = createMMKV();

export const mmkvStorageAdapter: StorageAdapter = {
  setItem(key: string, value: string): void {
    storage.set(key, value);
  },
  getItem(key: string): string | null {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem(key: string): void {
    storage.remove(key);
  },
};
