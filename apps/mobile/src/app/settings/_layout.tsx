import { Stack, useRouter } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 8, padding: 8 }}>
            <Ionicons name="chevron-back" size={24} color="#3B82F6" />
          </Pressable>
        ),
        headerShadowVisible: false,
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade',
      }}
    />
  );
}
