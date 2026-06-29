import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Typography } from '../../shared/components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function VerificationScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verification Status' }} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)']}
          style={styles.shieldBackground}
        >
          <Ionicons name="shield-checkmark" size={60} color="#10B981" />
        </LinearGradient>

        <Typography variant="h1" weight="bold" color="text-white" style={styles.title}>
          Verified Renter
        </Typography>
        <Typography variant="body" color="text-emerald-400" style={styles.subtitle}>
          Your identity and reputation are secured.
        </Typography>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Typography variant="body" color="text-slate-200" style={styles.rowText}>
              Identity Verified
            </Typography>
          </View>
          <View style={styles.row}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Typography variant="body" color="text-slate-200" style={styles.rowText}>
              Email Confirmed
            </Typography>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Typography variant="body" color="text-slate-200" style={styles.rowText}>
              Community Trusted
            </Typography>
          </View>
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
  shieldBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowText: {
    marginLeft: 12,
  },
});
