import React from 'react';
import { Text, TextProps } from 'react-native';

export interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
}

export function Typography({
  variant = 'body',
  weight = 'normal',
  color = 'text-slate-900 dark:text-slate-100',
  className = '',
  children,
  ...props
}: TypographyProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'h1': return 'text-4xl tracking-tight';
      case 'h2': return 'text-2xl tracking-tight';
      case 'h3': return 'text-xl tracking-tight';
      case 'body': return 'text-base';
      case 'caption': return 'text-sm text-slate-500 dark:text-slate-400';
      case 'label': return 'text-xs uppercase tracking-wider text-slate-500';
      default: return 'text-base';
    }
  };

  const getWeightStyles = () => {
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-normal';
    }
  };

  return (
    <Text
      className={`${getVariantStyles()} ${getWeightStyles()} ${color} ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}
