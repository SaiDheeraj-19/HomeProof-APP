import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../shared/services/supabase';
import { Typography } from '../../shared/components/Typography';
import { NetworkError } from '../../shared/components/NetworkError';
import { useRouter } from 'expo-router';
import { tokens } from '../../design-system/tokens';

// In a real scenario with PostGIS, we'd use an RPC to get lat/lng from the geography column
// For this demo, we'll map existing properties to random coordinates near SF if they don't have lat/lng parsed
async function fetchProperties() {
  const { data, error } = await supabase.from('properties').select('id, address, trust_score').limit(50);
  if (error) throw error;
  
  // Mock lat/lng for display purposes since we are waiting on the PostGIS RPC
  return data.map((p, i) => ({
    ...p,
    latitude: 37.78825 + (Math.random() - 0.5) * 0.05,
    longitude: -122.4324 + (Math.random() - 0.5) * 0.05,
  }));
}

export default function DiscoverScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  
  const { data: properties, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties_map'],
    queryFn: fetchProperties,
  });

  const getMarkerColor = (score: number) => {
    if (score >= 80) return tokens.colors.trust.high;
    if (score >= 50) return tokens.colors.trust.medium;
    return tokens.colors.trust.low;
  };

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <NetworkError onRetry={() => refetch()} message="Unable to load properties." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
        customMapStyle={mapStyle} // A clean Apple-like map style
      >
        {properties?.map((prop) => (
          <Marker
            key={prop.id}
            coordinate={{ latitude: prop.latitude, longitude: prop.longitude }}
            onPress={() => {
              // Navigate to Property Details
              router.push(`/properties/${prop.id}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Property at ${prop.address}, trust score ${prop.trust_score}`}
          >
            <View className="items-center justify-center">
              <View 
                className="px-3 py-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900"
                style={{ backgroundColor: getMarkerColor(prop.trust_score) }}
              >
                <Typography variant="caption" weight="bold" color="text-white">
                  {prop.trust_score}
                </Typography>
              </View>
              {/* Pointer triangle */}
              <View 
                className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent"
                style={{ borderTopColor: getMarkerColor(prop.trust_score) }}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      <View className="absolute top-16 left-4 right-4 bg-white/90 dark:bg-slate-900/90 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-slate-800">
        <Typography variant="h2" weight="bold" color="text-slate-900 dark:text-white mb-1">Area Trust Radar</Typography>
        <Typography variant="body" color="text-slate-500">
          Green areas represent high community trust. Red indicates ongoing reports and issues.
        </Typography>
      </View>
      
      {isLoading && (
        <View className="absolute bottom-10 left-1/2 -translate-x-4">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
});

// Minimal, clean map style focusing on the data overlays
const mapStyle = [
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  }
];
