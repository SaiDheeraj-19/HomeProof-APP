import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../features/auth/AuthContext";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, clientPersister } from '../shared/services/queryClient';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { hydrateStorage } from '../shared/platform/storage';
import { logger } from '../shared/logger';
import { supabase } from '../shared/services/supabase';
import { useSavedStore } from '../store/useSavedStore';
import { offlineQueue } from '../shared/services/offlineQueue';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  debug: __DEV__, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

// Kick off storage cache hydration before the app renders.
// This is a no-op on production native builds (MMKV is already synchronous).
hydrateStorage().catch((err) => {
  logger.warn('RootLayout', 'Storage hydration failed', err);
});
offlineQueue.init();

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Pre-fetch saved properties for the optimistic cache
  useEffect(() => {
    if (session?.user.id) {
      supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', session.user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            useSavedStore.getState().hydrate(data.map(d => d.property_id));
          }
        });
    }
  }, [session?.user.id]);

  useEffect(() => {
    // Defer navigation readiness to avoid navigating before the router mounts.
    // This single-run side-effect is intentional: it syncs external loading state
    // into a local ready gate, which is the documented Expo Router auth pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!loading) setIsReady(true);
  }, [loading]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to the onboarding page.
      router.replace('/(auth)/onboarding');
    } else if (session && inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/(tabs)');
    }
  }, [session, isReady, segments, router]);

  if (loading || !isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: clientPersister }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
