/**
 * Saved Properties Store
 *
 * Manages the set of property IDs the current user has bookmarked.
 * Source of truth is Supabase (saved_properties table).
 * This store acts as a local cache for instant UI feedback (optimistic updates).
 */
import { create } from 'zustand';

interface SavedStore {
  /** Set of saved property IDs for quick O(1) lookup */
  savedIds: Set<string>;
  /** Initialize the store from a fetched array of IDs */
  hydrate: (ids: string[]) => void;
  /** Returns true if the property is saved */
  isSaved: (propertyId: string) => boolean;
  /** Optimistically add a saved property */
  save: (propertyId: string) => void;
  /** Optimistically remove a saved property */
  unsave: (propertyId: string) => void;
  /** Clear all saved (e.g. on sign out) */
  clear: () => void;
}

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedIds: new Set(),

  hydrate: (ids) =>
    set({ savedIds: new Set(ids) }),

  isSaved: (propertyId) =>
    get().savedIds.has(propertyId),

  save: (propertyId) =>
    set((state) => ({
      savedIds: new Set([...state.savedIds, propertyId]),
    })),

  unsave: (propertyId) =>
    set((state) => {
      const next = new Set(state.savedIds);
      next.delete(propertyId);
      return { savedIds: next };
    }),

  clear: () => set({ savedIds: new Set() }),
}));
