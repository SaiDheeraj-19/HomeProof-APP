import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../shared/services/supabase';

export default function OwnerLeaderboardScreen() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['city-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('trust_score', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#0F172A']} style={styles.headerBackground} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h1" weight="bold" color="text-white" style={styles.title}>
          City Rank
        </Typography>

        <Typography variant="body" color="text-slate-400" style={{ marginBottom: 24 }}>
          Top 10 highest-rated properties in your area.
        </Typography>
        
        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy" size={40} color="#FBBF24" />
            <Typography variant="h3" weight="bold" color="text-white" style={{ marginTop: 16 }}>
              No Data Available
            </Typography>
          </View>
        ) : (
          leaderboard.map((prop, idx) => (
            <View key={prop.id} style={styles.card}>
              <View style={styles.rankCircle}>
                <Typography variant="h3" weight="bold" color={idx === 0 ? '#FBBF24' : '#fff'}>
                  #{idx + 1}
                </Typography>
              </View>
              <View style={styles.cardInfo}>
                <Typography variant="body" weight="bold" color="text-white">
                  {prop.address}
                </Typography>
                <Typography variant="caption" color="text-slate-400">
                  Trust Score: {prop.trust_score}/100
                </Typography>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 200,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  title: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rankCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
});
