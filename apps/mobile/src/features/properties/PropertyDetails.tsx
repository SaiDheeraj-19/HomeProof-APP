import React, { useState } from 'react';
import { View, ScrollView, Modal, Pressable, StyleSheet, Image, Platform, ActivityIndicator, Share, Alert } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { Button } from '../../shared/components/Button';
import { ReportForm } from '../reports/ReportForm';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../../shared/services/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { useSavedStore } from '../../store/useSavedStore';
import { haptics } from '../../shared/platform/haptics';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

interface PropertyDetailsProps {
  propertyId: string;
}

const TrustCategory = ({ name, rating }: { name: string; rating: number }) => {
  return (
    <View style={styles.trustCategoryRow}>
      <Typography variant="caption" weight="bold" color="text-slate-300" style={{ flex: 1 }}>{name}</Typography>
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons 
            key={star} 
            name={star <= rating ? "star" : "star-outline"} 
            size={12} 
            color={star <= rating ? "#F59E0B" : "#475569"} 
            style={{ marginLeft: 2 }}
          />
        ))}
      </View>
    </View>
  );
};

export function PropertyDetails({ propertyId }: PropertyDetailsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isReporting, setIsReporting] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  
  const savedStore = useSavedStore();
  const isSaved = savedStore.isSaved(propertyId);

  const toggleSaveMutation = useMutation({
    mutationFn: async (saving: boolean) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (propertyId.startsWith('mock-')) return; 

      if (saving) {
        await supabase.from('saved_properties').insert({ user_id: user.id, property_id: propertyId });
      } else {
        await supabase.from('saved_properties').delete().eq('user_id', user.id).eq('property_id', propertyId);
      }
    },
    onMutate: (saving) => {
      haptics.selection();
      if (saving) savedStore.save(propertyId);
      else savedStore.unsave(propertyId);
    }
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (propertyId.startsWith('mock-')) {
        const kurnoolMocks: Record<string, any> = {
          'mock-1': { id: 'mock-1', address: 'Plot 45, Nandyal Road', city: 'Kurnool', state: 'AP', zip_code: '518002', rent_price: 1800, bedrooms: 3, bathrooms: 2, sqft: 1500, trust_score: 98, cover_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80', is_listed: true },
          'mock-2': { id: 'mock-2', address: 'Apt 12B, C-Camp Center', city: 'Kurnool', state: 'AP', zip_code: '518003', rent_price: 1200, bedrooms: 2, bathrooms: 2, sqft: 1100, trust_score: 100, cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80', is_listed: true },
          'mock-3': { id: 'mock-3', address: 'Villa 7, Venkataramana Colony', city: 'Kurnool', state: 'AP', zip_code: '518004', rent_price: 2500, bedrooms: 4, bathrooms: 3.5, sqft: 2800, trust_score: 85, cover_image: 'https://images.unsplash.com/photo-1613490908236-4c4c23f2b4bc?auto=format&fit=crop&w=1000&q=80', is_listed: true },
          'mock-4': { id: 'mock-4', address: 'Flat 304, B-Camp Area', city: 'Kurnool', state: 'AP', zip_code: '518005', rent_price: 900, bedrooms: 1, bathrooms: 1, sqft: 800, trust_score: 92, cover_image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80', is_listed: true }
        };
        return kurnoolMocks[propertyId];
      }

      try {
        const { data, error } = await supabase.from('properties').select('*').eq('id', propertyId).single();
        if (error) throw error;
        return data;
      } catch (err) {
        return null;
      }
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['property_reports', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from('reports').select('*, profiles(first_name)').eq('property_id', propertyId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['property_reviews', propertyId],
    queryFn: async () => {
      if (propertyId.startsWith('mock-')) {
        return [
          {
            id: 'mock-rev-1', property_id: propertyId, renter_name: 'Anjali D.',
            pros: 'Beautiful spacious living room. Great water pressure in the showers.',
            cons: 'The street gets a bit noisy during festival season.',
            rating: 4.5, created_at: new Date().toISOString()
          },
          {
            id: 'mock-rev-2', property_id: propertyId, renter_name: 'Rajesh K.',
            pros: 'The owner is incredibly responsive. They fixed the AC within 2 hours of me reporting it!',
            cons: 'Parking space is a little tight for a large SUV.',
            rating: 5.0, created_at: new Date().toISOString()
          }
        ];
      }

      const { data, error } = await supabase.from('renter_reviews').select('*').eq('property_id', propertyId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !property) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const getTrustColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 70) return '#3B82F6';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getRiskColor = (risk: string | null) => {
    if (risk === 'high') return '#EF4444';
    if (risk === 'medium') return '#F59E0B';
    return '#10B981';
  };

  const handleShare = async () => {
    haptics.selection();
    try {
      await Share.share({
        message: `Check out this amazing property at ${property.address}, ${property.city} on HomeProof! Trust Score: ${property.trust_score}.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const latitude = 15.8281 + (Math.random() - 0.5) * 0.01;
  const longitude = 78.0373 + (Math.random() - 0.5) * 0.01;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} bounces={false} scrollEventThrottle={16}>
        
        {/* HERO IMAGE */}
        <Animated.View style={styles.heroContainer}>
          <Image 
            source={{ uri: property.cover_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.heroImage}
          />
          <LinearGradient 
            colors={['transparent', 'rgba(15,23,42,0.4)', '#0F172A']} 
            style={StyleSheet.absoluteFill}
          />  
          <View style={styles.headerControls}>
            <Pressable style={styles.circleBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable style={styles.circleBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.circleBtn} onPress={() => toggleSaveMutation.mutate(!isSaved)}>
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color={isSaved ? '#EF4444' : '#fff'} />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <View style={styles.content}>
          
          {/* 1. TRUST DASHBOARD */}
          <Animated.View entering={FadeInUp.delay(100).duration(500).springify()} style={[styles.trustDashboard, { borderColor: getTrustColor(property.trust_score) }]}>
            <View style={styles.trustDashboardHeader}>
              <View>
                <Typography variant="h2" weight="bold" color="text-white">Trust Score</Typography>
                <View style={styles.communityVerifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                  <Typography variant="caption" weight="bold" color="text-green-500" style={{marginLeft: 4}}>Community Verified</Typography>
                </View>
              </View>
              <View style={[styles.largeTrustBadge, { backgroundColor: getTrustColor(property.trust_score) }]}>
                <Typography variant="h1" weight="bold" color="text-white">{property.trust_score}</Typography>
                <Typography variant="caption" weight="bold" color="rgba(255,255,255,0.7)">/ 100</Typography>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.trustGrid}>
              <View style={styles.trustColumn}>
                <TrustCategory name="Water Supply" rating={5} />
                <TrustCategory name="Internet" rating={5} />
                <TrustCategory name="Noise" rating={3} />
              </View>
              <View style={styles.trustColumn}>
                <TrustCategory name="Crime" rating={5} />
                <TrustCategory name="Parking" rating={4} />
                <TrustCategory name="Women Safety" rating={5} />
              </View>
            </View>
          </Animated.View>

          {/* 2. AI SUMMARY */}
          <Animated.View entering={FadeInUp.delay(200).duration(500).springify()} style={styles.aiSummaryCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
              <Ionicons name="sparkles" size={20} color="#EAB308" style={{marginRight: 8}} />
              <Typography variant="h2" weight="bold" color="text-white">AI Summary</Typography>
            </View>
            
            <View style={{marginLeft: 8, marginBottom: 16, gap: 6}}>
              <Typography variant="body" color="text-slate-300">• Quiet neighbourhood</Typography>
              <Typography variant="body" color="text-slate-300">• Fast broadband available</Typography>
              <Typography variant="body" color="text-slate-300">• Excellent schools nearby</Typography>
              <Typography variant="body" color="text-slate-300">• Highly responsive landlord</Typography>
              <Typography variant="body" color="text-slate-300">• No recent water complaints</Typography>
            </View>
            
            <View style={styles.aiQuoteBox}>
              <Typography variant="body" color="text-amber-100" style={{fontStyle: 'italic', lineHeight: 22}}>
                "This property is excellent for families. Very responsive landlord. Minor traffic noise during peak hours."
              </Typography>
            </View>
            
            <Pressable onPress={() => setIsSummaryExpanded(!isSummaryExpanded)} style={{marginTop: 12, alignItems: 'center'}}>
              <Typography variant="caption" weight="bold" color="text-slate-400">
                {isSummaryExpanded ? "Show Less" : "Expand Full Details"}
              </Typography>
            </Pressable>
          </Animated.View>

          {/* 3. PROPERTY FACTS */}
          <Animated.View entering={FadeInUp.delay(300).duration(500).springify()} style={{ marginTop: 32 }}>
            <Typography variant="h1" weight="bold" color="text-white">
              {property.address}
            </Typography>
            <Typography variant="body" color="text-slate-400" style={{ marginTop: 4 }}>
              {property.city}, {property.state} {property.zip_code}
            </Typography>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specScroll} contentContainerStyle={{ gap: 12 }}>
              <View style={styles.specChip}>
                <Ionicons name="bed-outline" size={16} color="#94A3B8" />
                <Typography variant="body" weight="bold" color="text-white" style={{ marginLeft: 6 }}>{property.bedrooms} Beds</Typography>
              </View>
              <View style={styles.specChip}>
                <Ionicons name="water-outline" size={16} color="#94A3B8" />
                <Typography variant="body" weight="bold" color="text-white" style={{ marginLeft: 6 }}>{property.bathrooms} Baths</Typography>
              </View>
              <View style={styles.specChip}>
                <Ionicons name="expand-outline" size={16} color="#94A3B8" />
                <Typography variant="body" weight="bold" color="text-white" style={{ marginLeft: 6 }}>{property.sqft?.toLocaleString()} Sq Ft</Typography>
              </View>
            </ScrollView>
          </Animated.View>

          {/* 4. PREVIOUS RENTERS (PROS/CONS) SECTION */}
          <Animated.View entering={FadeInUp.delay(400).duration(500).springify()} style={[styles.reportsSection, { marginTop: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="h2" weight="bold" color="text-white">Previous Renters</Typography>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyReports}>
                <Ionicons name="people-outline" size={32} color="#64748B" />
                <Typography variant="body" weight="bold" color="text-white" style={{ marginTop: 12 }}>No Reviews Yet</Typography>
                <Typography variant="caption" color="text-slate-400" style={{ marginTop: 4, textAlign: 'center' }}>
                  Be the first to share your experience living here.
                </Typography>
              </View>
            ) : (
              reviews.map((review: any) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Typography variant="body" weight="bold" color="text-white">
                      {review.renter_name}
                    </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Typography variant="caption" weight="bold" color="text-amber-500" style={{ marginLeft: 4 }}>
                        {review.rating}/5
                      </Typography>
                    </View>
                  </View>
                  
                  {review.pros && (
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <Ionicons name="add-circle" size={18} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" weight="bold" color="text-green-400">PROS</Typography>
                        <Typography variant="body" color="text-slate-300">{review.pros}</Typography>
                      </View>
                    </View>
                  )}
                  
                  {review.cons && (
                    <View style={{ flexDirection: 'row' }}>
                      <Ionicons name="remove-circle" size={18} color="#EF4444" style={{ marginRight: 8, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" weight="bold" color="text-red-400">CONS</Typography>
                        <Typography variant="body" color="text-slate-300">{review.cons}</Typography>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </Animated.View>

          {/* 5. REPORTS SECTION */}
          <Animated.View entering={FadeInUp.delay(500).duration(500).springify()} style={styles.reportsSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="h2" weight="bold" color="text-white">Community Reports</Typography>
              <Pressable onPress={() => setIsReporting(true)} style={styles.reportBtn}>
                <Typography variant="caption" weight="bold" color="text-blue-500">File Report</Typography>
              </Pressable>
            </View>

            {reports.length === 0 ? (
              <View style={styles.emptyReports}>
                <Ionicons name="shield-checkmark-outline" size={36} color="#10B981" />
                <Typography variant="body" weight="bold" color="text-white" style={{ marginTop: 12 }}>Clean Record</Typography>
                <Typography variant="caption" color="text-slate-400" style={{ marginTop: 4, textAlign: 'center' }}>
                  No issues have been reported for this community.
                </Typography>
              </View>
            ) : (
              reports.map((report) => (
                <View key={report.id} style={styles.reviewCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Typography variant="caption" weight="bold" color="text-slate-300">
                      {report.profiles?.first_name || 'Anonymous'} • {new Date(report.created_at).toLocaleDateString()}
                    </Typography>
                    <View style={[styles.riskBadge, { backgroundColor: getRiskColor(report.risk_level) + '20' }]}>
                      <Typography variant="caption" weight="bold" style={{ color: getRiskColor(report.risk_level) }}>
                        {report.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="body" color="text-white" style={{ lineHeight: 22 }}>
                    {report.description}
                  </Typography>
                  {report.resolution_status === 'resolved' && (
                    <View style={styles.resolutionBox}>
                      <Typography variant="caption" weight="bold" color="text-green-400" style={{ marginBottom: 4 }}>
                        <Ionicons name="checkmark-circle" size={12} /> Resolved by Owner
                      </Typography>
                      <Typography variant="caption" color="text-slate-300">
                        {report.resolution_text}
                      </Typography>
                    </View>
                  )}
                </View>
              ))
            )}
          </Animated.View>

          {/* 6. LOCATION (MAP) SECTION */}
          <Animated.View entering={FadeInUp.delay(600).duration(500).springify()} style={{ marginBottom: 40 }}>
            <Typography variant="h2" weight="bold" color="text-white" style={{ marginBottom: 12 }}>Location</Typography>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker coordinate={{ latitude, longitude }}>
                  <View style={styles.markerCircle}>
                    <Ionicons name="home" size={16} color="#fff" />
                  </View>
                </Marker>
              </MapView>
            </View>
          </Animated.View>

        </View>
      </ScrollView>

      {/* 7. STICKY PRICE BAR */}
      <Animated.View entering={FadeInUp.delay(700).duration(600).springify()} style={styles.stickyPriceBar}>
        <View>
          <Typography variant="h2" weight="bold" color="text-white">
            ${property.rent_price?.toLocaleString()}<Typography variant="body" color="text-slate-400">/mo</Typography>
          </Typography>
          <Typography variant="caption" color="text-slate-400">Available Now</Typography>
        </View>
        <Button 
          label="Contact Owner" 
          onPress={() => {
            haptics.selection();
            router.push('/chat/mock-chat-1');
          }} 
          className="px-6 rounded-full"
        />
      </Animated.View>

      <Modal visible={isReporting} animationType="slide" presentationStyle="pageSheet">
        <ReportForm propertyId={propertyId} onCancel={() => setIsReporting(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  heroContainer: {
    height: 350,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: {
    padding: 24,
    marginTop: -40, 
    zIndex: 2,
  },
  trustDashboard: {
    backgroundColor: 'rgba(30,58,138,0.3)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  trustDashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  communityVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  largeTrustBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  trustGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  trustColumn: {
    flex: 1,
    gap: 12,
  },
  trustCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiSummaryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  aiQuoteBox: {
    backgroundColor: 'rgba(234,179,8,0.08)',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EAB308'
  },
  specScroll: {
    marginTop: 20,
    marginBottom: 32,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reportsSection: {
    marginBottom: 40,
  },
  reportBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 12,
  },
  emptyReports: {
    alignItems: 'center', padding: 32,
    backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  reviewCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20, borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  riskBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  resolutionBox: {
    marginTop: 12, padding: 12,
    backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 8,
    borderLeftWidth: 3, borderLeftColor: '#10B981',
  },
  stickyPriceBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(15,23,42,0.95)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});
