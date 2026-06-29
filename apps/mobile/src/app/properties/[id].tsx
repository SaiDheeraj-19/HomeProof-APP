import React from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { PropertyDetails } from '../../features/properties/PropertyDetails';
import { View } from 'react-native';

export default function PropertyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) return null;

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <Stack.Screen options={{ 
        title: 'Property Hub',
        headerBackTitle: 'Map',
        headerStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
      }} />
      <PropertyDetails propertyId={id} />
    </View>
  );
}
