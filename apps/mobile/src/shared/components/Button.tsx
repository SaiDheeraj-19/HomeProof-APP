import React from 'react';
import { Pressable, PressableProps, AccessibilityRole } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { haptics } from '../platform/haptics';
import { Typography } from './Typography';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  accessibilityRole?: AccessibilityRole;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  accessibilityRole = 'button',
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
    if (!disabled) {
      haptics.light();
      scale.value = withSpring(0.96, { damping: 10, stiffness: 400 });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    }
    onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyles = () => {
    if (disabled) return 'bg-slate-200 dark:bg-slate-800 opacity-50';
    switch (variant) {
      case 'primary':   return 'bg-primary-500';
      case 'secondary': return 'bg-slate-100 dark:bg-slate-800';
      case 'outline':   return 'border-2 border-primary-500 bg-transparent';
      case 'ghost':     return 'bg-transparent';
      default:          return 'bg-primary-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':  return 'py-2 px-4 rounded-xl';
      case 'md':  return 'py-3 px-6 rounded-2xl';
      case 'lg':  return 'py-4 px-8 rounded-2xl';
      default:    return 'py-3 px-6 rounded-2xl';
    }
  };

  const getTextColor = () => {
    if (disabled) return 'text-slate-400 dark:text-slate-500';
    switch (variant) {
      case 'primary':   return 'text-white';
      case 'secondary': return 'text-slate-900 dark:text-slate-100';
      case 'outline':   return 'text-primary-500';
      case 'ghost':     return 'text-primary-500';
      default:          return 'text-white';
    }
  };

  return (
    <Animated.View style={animatedStyle} className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        className={`flex-row items-center justify-center overflow-hidden ${getVariantStyles()} ${getSizeStyles()}`}
        {...props}
      >
        <Typography weight="semibold" color={getTextColor()}>
          {label}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}
