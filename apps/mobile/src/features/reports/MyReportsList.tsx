/**
 * MyReportsList — Displays reports submitted by the authenticated user.
 */
import React from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { supabase } from '../../shared/services/supabase';
import { useAuth } from '../auth/AuthContext';
import { Typography } from '../../shared/components/Typography';
import { Card } from '../../shared/components/Card';
import { EmptyState } from '../../shared/components/EmptyState';
import { SkeletonLoader } from '../../shared/components/SkeletonLoader';
import { NetworkError } from '../../shared/components/NetworkError';
import type { Report, Property } from '../../types/database';

type ReportWithProperty = Report & { properties: Property };

export function MyReportsList() {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my_reports', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          properties (
            id,
            address,
            city,
            state
          )
        `)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any as ReportWithProperty[];
    },
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-500 bg-green-500/10';
      case 'resolving': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" style={styles.card}>
              <SkeletonLoader width="60%" height={16} style={{ marginBottom: 12 }} />
              <SkeletonLoader width="100%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="40%" height={20} />
            </Card>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return <NetworkError onRetry={() => refetch()} />;
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <EmptyState
          emoji="📋"
          title="No Reports Filed"
          subtitle="When you report property issues to the community, you'll track their status here."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const prop = item.properties;
          const date = new Date(item.created_at).toLocaleDateString();
          
          return (
            <Pressable onPress={() => router.push(`/properties/${prop?.id}`)}>
              {({ pressed }) => (
                <Card padding="md" style={[styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.header}>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.resolution_status).split(' ')[1] }]}>
                      <Typography variant="caption" weight="bold" className={`uppercase ${getStatusColor(item.resolution_status).split(' ')[0]}`}>
                        {item.resolution_status}
                      </Typography>
                    </View>
                    <Typography variant="caption" color="text-slate-400">
                      {date}
                    </Typography>
                  </View>
                  
                  <Typography variant="body" weight="semibold" color="text-slate-900 dark:text-white" style={styles.address}>
                    {prop?.address}
                  </Typography>
                  
                  <Typography variant="body" color="text-slate-600 dark:text-slate-300" numberOfLines={2}>
                    {item.description || 'No description provided.'}
                  </Typography>

                  {item.ai_analysis_status === 'completed' && (
                    <View style={styles.aiBadge}>
                      <Typography variant="caption" color="text-primary-600 font-semibold">
                        ✨ AI Analyzed
                      </Typography>
                    </View>
                  )}
                </Card>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centerContainer: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center' },
  list: { padding: 16, gap: 16 },
  card: { backgroundColor: '#ffffff', gap: 8 },
  cardPressed: { opacity: 0.7 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  address: { marginBottom: 2 },
  aiBadge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#eff6ff', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    marginTop: 4,
  },
});
