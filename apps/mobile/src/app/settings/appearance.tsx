import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { Typography } from '../../shared/components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '../../shared/platform/haptics';

export default function AppearanceScreen() {
  const [theme, setTheme] = useState<'dark' | 'system'>('dark');

  const handleSelect = (selected: 'dark' | 'system') => {
    haptics.selection();
    setTheme(selected);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <Pressable style={styles.row} onPress={() => handleSelect('dark')}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                Dark Theme
              </Typography>
            </View>
            {theme === 'dark' && <Ionicons name="checkmark" size={20} color="#3B82F6" />}
          </Pressable>

          <Pressable style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]} onPress={() => handleSelect('system')}>
            <View style={styles.textWrap}>
              <Typography variant="body" weight="medium" color="text-white">
                System Default
              </Typography>
            </View>
            {theme === 'system' && <Ionicons name="checkmark" size={20} color="#3B82F6" />}
          </Pressable>
        </View>

        <Typography variant="caption" color="text-slate-500" style={{ marginTop: 16, textAlign: 'center' }}>
          HomeProof is currently optimized for Dark Mode.
        </Typography>

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
