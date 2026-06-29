import React, { useState } from 'react';
import { View, ScrollView, Modal, Pressable, StyleSheet, Image } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { ReportForm } from '../reports/ReportForm';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../shared/services/supabase';
import { SkeletonLoader } from '../../shared/components/SkeletonLoader';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { useSavedStore } from '../../store/useSavedStore';
import { haptics } from '../../shared/platform/haptics';
import { logger } from '../../shared/logger';

interface PropertyDetailsProps {
  propertyId: string;
}

export function PropertyDetails({ propertyId }: PropertyDetailsProps) {
  const { user } = useAuth();
  const [isReporting, setIsReporting] = useState(false);
  
  const savedStore = useSavedStore();
  const isSaved = savedStore.isSaved(propertyId);

  const toggleSaveMutation = useMutation({
    mutationFn: async (saving: boolean) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (saving) {
        const { error } = await supabase
          .from('saved_properties')
          .insert({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        if (error) throw error;
      }
    },
    onMutate: async (saving) => {
      haptics.selection();
      if (saving) savedStore.save(propertyId);
      else savedStore.unsave(propertyId);
    },
    onError: (error, saving) => {
      // Revert optimistic update
      logger.error('PropertyDetails', 'Toggle save failed', error);
      if (saving) savedStore.unsave(propertyId);
      else savedStore.save(propertyId);
    }
  });

  const handleToggleSave = () => {
    toggleSaveMutation.mutate(!isSaved);
  };

  // Fetch Property & Trust Score
  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Fetch Reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const trustScore = property?.trust_score ?? 100;
  
  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={handleToggleSave}
              hitSlop={8}
              style={{ marginRight: 8 }}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? "Unsave property" : "Save property"}
              accessibilityState={{ selected: isSaved }}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isSaved ? "#3B82F6" : "#64748b"} 
              />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Giant Trust Score Section */}
        <Animated.View entering={FadeIn.delay(100)} className="items-center mt-8 mb-10">
          <Typography variant="h3" color="text-slate-500 uppercase tracking-widest mb-2 font-bold">
            Trust Score
          </Typography>
          <Typography variant="h1" className={`text-8xl font-black tracking-tighter ${getTrustColor(trustScore)}`}>
            {trustScore}
          </Typography>
          <Typography variant="body" color="text-slate-400 mt-2 text-center max-w-[250px]">
            {trustScore >= 80 ? "Highly trusted by the community. No recent critical issues." : 
             trustScore >= 50 ? "Moderate risk. Some unresolved community reports." : 
             "High risk property. Multiple critical or unresolved issues."}
          </Typography>
        </Animated.View>

        <View className="flex-row items-center justify-between mb-6">
          <Typography variant="h2" weight="semibold" color="text-slate-900 dark:text-white">Community Intelligence</Typography>
          <Button label="Report Issue" variant="primary" onPress={() => setIsReporting(true)} />
        </View>

        {isLoading ? (
          <View className="gap-4">
            {[1, 2].map((i) => (
              <Card key={i} padding="md" className="bg-white dark:bg-slate-900">
                <SkeletonLoader width={100} height={16} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="80%" height={16} style={{ marginBottom: 16 }} />
                <SkeletonLoader width="100%" height={60} borderRadius={8} />
              </Card>
            ))}
          </View>
        ) : reports?.length === 0 ? (
          <Card padding="md" className="bg-slate-100 dark:bg-slate-900 border-0 items-center justify-center p-8">
            <Typography variant="body" color="text-slate-500 text-center">
              No reports yet. A blank slate is generally a good sign.
            </Typography>
          </Card>
        ) : (
          <View className="gap-4">
            {reports?.map((report, index) => (
              <Animated.View key={report.id} entering={FadeIn.delay(index * 100)}>
                <Card padding="md" className="bg-white dark:bg-slate-900">
                  <View className="flex-row justify-between mb-2">
                    <Typography variant="caption" className="uppercase" color="text-primary-500 font-bold">
                      {report.risk_level === 'high' ? '🚨 HIGH SEVERITY' : report.risk_level === 'medium' ? '⚠️ MEDIUM SEVERITY' : 'ℹ️ FEEDBACK'}
                    </Typography>
                    <Typography variant="caption" color={report.resolution_status === 'resolved' ? 'text-green-500' : 'text-slate-400'}>
                      {report.resolution_status.toUpperCase()}
                    </Typography>
                  </View>
                  
                  {report.media_urls && report.media_urls.length > 0 && (
                    <Image 
                      source={{ uri: report.media_urls[0] }} 
                      className="w-full h-32 rounded-lg mb-3" 
                      resizeMode="cover" 
                    />
                  )}

                  <Typography variant="body" color="text-slate-800 dark:text-slate-200">
                    {report.description || "No description provided."}
                  </Typography>
                  
                  {report.ai_analysis_status === 'completed' && report.ai_summary && (
                    <View className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Typography variant="caption" color="text-slate-500 font-semibold mb-1">AI Risk Breakdown</Typography>
                      <Typography variant="body" color="text-slate-700 dark:text-slate-300">
                        {report.ai_summary}
                      </Typography>
                    </View>
                  )}
                </Card>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isReporting}
        transparent
        animationType="none"
        onRequestClose={() => setIsReporting(false)}
      >
        <Animated.View 
          entering={FadeIn}
          exiting={FadeOut}
          className="flex-1 justify-end bg-black/40"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsReporting(false)} />
          <ReportForm 
            propertyId={propertyId} 
            onSuccess={() => {
              setIsReporting(false);
            }} 
            onCancel={() => setIsReporting(false)} 
          />
        </Animated.View>
      </Modal>
    </View>
  );
}
