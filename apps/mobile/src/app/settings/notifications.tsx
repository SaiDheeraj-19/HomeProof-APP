import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Typography } from '../../shared/components/Typography';

export default function NotificationsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                Push Notifications
              </Typography>
              <Typography variant="caption" color="text-slate-400">
                Receive alerts on your device.
              </Typography>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                Email Updates
              </Typography>
              <Typography variant="caption" color="text-slate-400">
                Weekly digests and important news.
              </Typography>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#334155', true: '#3B82F6' }}
            />
          </View>

          <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                Community Alerts
              </Typography>
              <Typography variant="caption" color="text-slate-400">
                Alerts for properties you follow.
              </Typography>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={setAlertsEnabled}
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
