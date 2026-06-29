import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Typography } from '../../shared/components/Typography';

export default function PrivacyScreen() {
  const [faceId, setFaceId] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Privacy & Security' }} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                Face ID / Touch ID
              </Typography>
              <Typography variant="caption" color="text-slate-400">
                Require biometric authentication to open the app.
              </Typography>
            </View>
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ false: '#334155', true: '#10B981' }}
            />
          </View>

          <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                Analytics Sharing
              </Typography>
              <Typography variant="caption" color="text-slate-400">
                Share anonymous usage data to help us improve HomeProof.
              </Typography>
            </View>
            <Switch
              value={dataSharing}
              onValueChange={setDataSharing}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
            />
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
    padding: 20,
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
    justifyContent: 'space-between',
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  textWrap: {
    flex: 1,
    marginRight: 16,
  },
});
