import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { Typography } from '../../shared/components/Typography';
import { Ionicons } from '@expo/vector-icons';

export default function EmailSettingsScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Email Address' }} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Ionicons name="mail" size={40} color="#3B82F6" />
          </View>
        </View>

        <Typography variant="h2" weight="bold" color="text-white" style={styles.title}>
          Primary Email
        </Typography>
        
        <View style={styles.card}>
          <Typography variant="body" color="text-slate-100">
            {user?.email || 'No email attached'}
          </Typography>
          <Typography variant="caption" color="text-slate-400" style={{ marginTop: 8 }}>
            This email is used for logging in and receiving important account updates.
          </Typography>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
