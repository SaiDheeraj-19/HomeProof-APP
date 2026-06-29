/**
 * NetworkError — Friendly error state with retry button for failed queries.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { Button } from './Button';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function NetworkError({
  message = 'Could not load data. Check your connection.',
  onRetry,
}: NetworkErrorProps) {
  return (
    <View style={styles.container}>
      <Typography variant="h1" style={styles.icon}>📡</Typography>
      <Typography variant="h3" weight="bold" color="text-slate-900 dark:text-white">
        Connection Error
      </Typography>
      <Typography variant="body" color="text-slate-500" style={styles.message}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          label="Try Again"
          variant="primary"
          onPress={onRetry}
          style={styles.button}
        />
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
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
  },
});
