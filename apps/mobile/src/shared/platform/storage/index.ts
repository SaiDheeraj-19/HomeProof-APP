/**
 * Platform Storage Abstraction
 *
 * Selects the correct synchronous storage backend depending on the runtime:
 *   - Native dev/production build → MMKV (fast, synchronous)
 *   - Expo Go                    → AsyncStorage with in-memory cache
 *   - Web                        → localStorage wrapper
 *
 * Business logic should import `appStorage` from this file only.
 * No file outside this module should reference MMKV or AsyncStorage directly
 * for query persistence purposes.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/** The synchronous storage interface used by TanStack Query's persister. */
export interface StorageAdapter {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

function createWebStorage(): StorageAdapter {
  return {
    setItem: (key, value) => {
      try { localStorage.setItem(key, value); } catch { /* noop on private mode */ }
    },
    getItem: (key) => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    removeItem: (key) => {
      try { localStorage.removeItem(key); } catch { /* noop */ }
    },
  };
}

/**
 * Detects whether the app is running inside Expo Go.
 * Expo Go sets `Constants.appOwnership` to `'expo'`.
 */
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

// ─── Module-level lazy references ────────────────────────────────────────────
// We conditionally import adapters using separate, non-dynamic import statements
// guarded by runtime checks. The ESLint no-require-imports rule does not apply
// to the `import()` function in a conditional context; we use module-level
// optional resolution via a pattern that Metro handles natively.

let _adapter: StorageAdapter | null = null;

function buildStorage(): StorageAdapter {
  if (Platform.OS === 'web') {
    return createWebStorage();
  }

  if (isExpoGo()) {
    // Expo Go bundles AsyncStorage but not MMKV.
    // asyncStorageAdapter uses an in-memory cache so reads remain synchronous.
    return getAsyncStorageAdapter();
  }

  // Native production/development build — MMKV for synchronous, high-performance I/O.
  return getMmkvStorageAdapter();
}

// These thin wrappers are the only place module boundaries are crossed.
// They are top-level functions (not inline require calls) to satisfy lint rules.
function getAsyncStorageAdapter(): StorageAdapter {
  // This file is only evaluated once at startup. The import is always the same
  // module — there is no dynamic string or user input involved.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('./asyncStorage') as typeof import('./asyncStorage');
  return mod.asyncStorageAdapter;
}

function getMmkvStorageAdapter(): StorageAdapter {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('./mmkvStorage') as typeof import('./mmkvStorage');
  return mod.mmkvStorageAdapter;
}

export function getAppStorage(): StorageAdapter {
  if (!_adapter) {
    _adapter = buildStorage();
  }
  return _adapter;
}

// Exported singleton — the only storage reference business logic should use.
export const appStorage: StorageAdapter = getAppStorage();

/**
 * Call once at application startup to pre-populate the AsyncStorage cache
 * so that sync reads are accurate.
 * This is a no-op on native production builds (MMKV is already synchronous).
 */
export async function hydrateStorage(): Promise<void> {
  if (Platform.OS !== 'web' && isExpoGo()) {
    const { hydrateAsyncStorageCache } = await import('./asyncStorage');
    await hydrateAsyncStorageCache();
  }
}
