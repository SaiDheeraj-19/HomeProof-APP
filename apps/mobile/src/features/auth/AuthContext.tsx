import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../shared/services/supabase';
import { useUserStore } from '../../store/useUserStore';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  bypassLogin: (role?: 'renter' | 'owner') => void;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  bypassLogin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // If it's a mock session, just clear it
    if (session?.access_token === 'mock-token') {
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const bypassLogin = (role: 'renter' | 'owner' = 'renter') => {
    setSession({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'ceo@homeproof.app'
      }
    } as any);

    useUserStore.getState().setProfile({
      id: '00000000-0000-0000-0000-000000000000',
      first_name: 'HomeProof',
      last_name: 'CEO',
      reputation_score: 950,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const value = {
    session,
    user: session?.user || null,
    loading,
    signOut,
    bypassLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
