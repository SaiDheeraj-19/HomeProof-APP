import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white dark:bg-slate-900 shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800';
      case 'outlined':
        return 'bg-transparent border border-slate-200 dark:border-slate-700';
      case 'glass':
        return 'bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/50';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none': return 'p-0';
      case 'sm': return 'p-3';
      case 'md': return 'p-5';
      case 'lg': return 'p-8';
      default: return 'p-5';
    }
  };

  return (
    <View
      className={`rounded-3xl overflow-hidden ${getVariantStyles()} ${getPaddingStyles()} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
