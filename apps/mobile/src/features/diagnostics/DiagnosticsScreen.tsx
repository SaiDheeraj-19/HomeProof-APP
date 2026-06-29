import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { Button } from '../../shared/components/Button';
import { getFullVersionString, APP_VERSION, BUILD_NUMBER, ENVIRONMENT } from '../../config/version';
import { useAuth } from '../auth/AuthContext';
import { useNetInfo } from '@react-native-community/netinfo';
import { supabase } from '../../shared/services/supabase';
import { queryClient } from '../../shared/services/queryClient';
import { offlineQueue } from '../../shared/services/offlineQueue';

export function DiagnosticsScreen() {
  const { session } = useAuth();
  const netInfo = useNetInfo();
  const [dbLatency, setDbLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkDbLatency = async () => {
      const start = Date.now();
      await supabase.from('properties').select('id').limit(1);
      setDbLatency(Date.now() - start);
    };
    checkDbLatency();
  }, []);

  const queueSize = offlineQueue.getQueue().length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Typography variant="h1" weight="bold" color="text-slate-900 dark:text-white" style={styles.title}>
        System Diagnostics
      </Typography>

      <View style={styles.section}>
        <Typography variant="h3" weight="semibold" color="text-slate-800 dark:text-slate-200">App Build</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Version: {APP_VERSION}</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Build Number: {BUILD_NUMBER}</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Environment: {ENVIRONMENT.toUpperCase()}</Typography>
        <Typography variant="caption" color="text-slate-500">Full Signature: {getFullVersionString()}</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="h3" weight="semibold" color="text-slate-800 dark:text-slate-200">Network & DB</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Status: {netInfo.isConnected ? 'Online' : 'Offline'}</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Connection Type: {netInfo.type}</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Supabase API Latency: {dbLatency ? `${dbLatency}ms` : 'Pinging...'}</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Offline Queue Size: {queueSize}</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="h3" weight="semibold" color="text-slate-800 dark:text-slate-200">Session</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">User ID: {session?.user?.id || 'Unauthenticated'}</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Provider: {session?.user?.app_metadata?.provider || 'N/A'}</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="h3" weight="semibold" color="text-slate-800 dark:text-slate-200">State Cache</Typography>
        <Typography variant="body" color="text-slate-600 dark:text-slate-400">Active Queries: {queryClient.isFetching()}</Typography>
        <Button 
          label="Clear React Query Cache"
          variant="secondary"
          onPress={() => queryClient.clear()}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  button: {
    marginTop: 12,
  }
});
