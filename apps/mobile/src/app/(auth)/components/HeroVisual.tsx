import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface HeroVisualProps {
  index: number;
}

export default function HeroVisual({ index }: HeroVisualProps) {
  const floatValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    // Gentle floating motion
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle pulsing for glows
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
    opacity: 0.6 / pulseValue.value,
  }));

  if (index === 0) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.glowRing, pulseStyle, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]} />
        <Animated.View style={[floatingStyle, styles.visualCore]}>
          <Ionicons name="home-outline" size={72} color="rgba(255,255,255,0.7)" />
          <View style={styles.floatingBadge}>
            <Ionicons name="shield-checkmark" size={24} color="#60A5FA" />
          </View>
        </Animated.View>
      </View>
    );
  }

  if (index === 1) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.glowRing, pulseStyle, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]} />
        <Animated.View style={[floatingStyle, styles.visualCore]}>
          <Ionicons name="scan-outline" size={80} color="rgba(255,255,255,0.8)" />
          <Animated.View entering={FadeIn.delay(500)} style={styles.innerElement}>
            <Ionicons name="document-text-outline" size={32} color="#A78BFA" />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowRing, pulseStyle, { backgroundColor: 'rgba(52, 211, 153, 0.15)' }]} />
      <Animated.View style={[floatingStyle, styles.visualCore]}>
        <Ionicons name="map-outline" size={76} color="rgba(255,255,255,0.7)" />
        <View style={[styles.floatingBadge, { right: -10, top: -10, backgroundColor: 'rgba(52, 211, 153, 0.2)', borderColor: '#34D399' }]}>
          <Ionicons name="location" size={20} color="#34D399" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  visualCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBadge: {
    position: 'absolute',
    bottom: -10,
    right: -15,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.8)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  innerElement: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
