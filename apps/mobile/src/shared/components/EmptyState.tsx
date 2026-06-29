/**
 * EmptyState — Centered illustration + message for empty list/data states.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.emojiWrapper}>
        <Typography variant="h1" style={styles.emoji}>{emoji}</Typography>
      </View>
      <Typography variant="h3" weight="bold" color="text-slate-900 dark:text-white" style={styles.title}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body" color="text-slate-500" style={styles.subtitle}>
          {subtitle}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  emojiWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(59,130,246,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
