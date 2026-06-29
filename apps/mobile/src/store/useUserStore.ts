/**
 * User Profile Store
 *
 * Caches the current user's profile data from the `profiles` table.
 * Cleared on sign-out.
 */
import { create } from 'zustand';
import type { Profile } from '../types/database';

interface UserStore {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  clear: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clear: () => set({ profile: null }),
}));
