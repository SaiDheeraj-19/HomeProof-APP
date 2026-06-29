/**
 * Root Error Boundary
 *
 * Catches unexpected runtime errors that propagate to the top of the tree
 * and renders a friendly recovery UI instead of a blank/red screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <RootLayoutNav />
 *   </ErrorBoundary>
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { logger } from '../logger';

interface Props {
  children: ReactNode;
  /** Optional custom fallback — if not provided, a default screen is shown. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary', 'Uncaught runtime error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. Please try restarting the app.
            </Text>
            {__DEV__ && (
              <View style={styles.debugBox}>
                <Text style={styles.debugText}>{this.state.errorMessage}</Text>
              </View>
            )}
            <Pressable
              style={styles.button}
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  debugBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    width: '100%',
  },
  debugText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
