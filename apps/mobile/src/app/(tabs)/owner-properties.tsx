import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, Modal } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../shared/services/supabase';
import { AddPropertyForm } from '../../features/owner/AddPropertyForm';

export default function OwnerPropertiesScreen() {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#0F172A']} style={styles.headerBackground} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h1" weight="bold" color="text-white" style={styles.title}>
          My Listings
        </Typography>
        
        {properties.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Ionicons name="home" size={40} color="#3B82F6" />
            </View>
            <Typography variant="h3" weight="bold" color="text-white" style={{ marginTop: 16 }}>
              No Properties Listed
            </Typography>
            <Typography variant="body" color="text-slate-400" style={{ textAlign: 'center', marginTop: 8 }}>
              Claim your property to view insights, manage reputation, and respond to renter feedback.
            </Typography>
            <Pressable style={styles.addButton} onPress={() => setIsAdding(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Typography variant="body" weight="bold" color="text-white" style={{ marginLeft: 8 }}>
                Add Property
              </Typography>
            </Pressable>
          </View>
        ) : (
          <View>
            <Pressable style={[styles.addButton, { alignSelf: 'flex-start', marginBottom: 24 }]} onPress={() => setIsAdding(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Typography variant="body" weight="bold" color="text-white" style={{ marginLeft: 8 }}>
                Add Another Property
              </Typography>
            </Pressable>
            {properties.map(prop => (
              <View key={prop.id} style={styles.propertyCard}>
                <Typography variant="h2" weight="bold" color="text-white">{prop.address}</Typography>
                <Typography variant="body" color="text-slate-400" style={{ marginTop: 4 }}>
                  {prop.city}, {prop.state} {prop.zip_code}
                </Typography>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <Typography variant="h3" weight="bold" color="text-blue-400">
                    ${prop.rent_price?.toLocaleString() || 0}/mo
                  </Typography>
                  <View style={[styles.trustBadge, { backgroundColor: prop.trust_score >= 80 ? '#10B981' : '#F59E0B' }]}>
                    <Typography variant="caption" weight="bold" color="text-white">
                      {prop.trust_score} Trust
                    </Typography>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      <Modal visible={isAdding} animationType="slide" presentationStyle="pageSheet">
        <AddPropertyForm onClose={() => setIsAdding(false)} />
      </Modal>
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
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginTop: 40,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(59,130,246,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  propertyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  trustBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  }
});
