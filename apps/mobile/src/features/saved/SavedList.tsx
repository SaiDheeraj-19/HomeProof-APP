/**
 * SavedList — Displays properties the user has saved.
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
import type { SavedProperty } from '../../types/database';

export function SavedList() {
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['saved_properties', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          property_id,
          properties (
            id,
            address,
            city,
            state,
            trust_score
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any as SavedProperty[];
    },
    enabled: !!user?.id,
  });

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" style={styles.card}>
              <SkeletonLoader width="70%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="40%" height={16} />
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
          emoji="🔖"
          title="No Saved Properties"
          subtitle="Properties you save while exploring will appear here for easy access."
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
          if (!prop) return null;
          
          return (
            <Pressable onPress={() => router.push(`/properties/${prop.id}`)}>
              {({ pressed }) => (
                <Card padding="md" style={[styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.cardContent}>
                    <View style={styles.textContainer}>
                      <Typography variant="h3" weight="bold" color="text-slate-900 dark:text-white" numberOfLines={1}>
                        {prop.address}
                      </Typography>
                      <Typography variant="body" color="text-slate-500">
                        {prop.city}, {prop.state}
                      </Typography>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Typography variant="h2" weight="bold" className={getTrustColor(prop.trust_score)}>
                        {prop.trust_score}
                      </Typography>
                      <Typography variant="caption" color="text-slate-400">Trust</Typography>
                    </View>
                  </View>
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
});
