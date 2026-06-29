import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function AnimatedBackground() {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation1.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1
    );
    rotation2.value = withRepeat(
      withTiming(-360, { duration: 40000, easing: Easing.linear }),
      -1
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value}deg` }, { scale: scale.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation2.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Base deep space color */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#070B14' }]} />
      
      {/* Primary vast gradient */}
      <LinearGradient
        colors={['transparent', '#172B57', '#0A152E']}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.6, 1]}
      />

      {/* Slow rotating light pools */}
      <Animated.View style={[styles.orbContainer, animatedStyle1]}>
        <View style={[styles.orb, { backgroundColor: 'rgba(59, 130, 246, 0.15)', top: -height * 0.2, left: -width * 0.5 }]} />
      </Animated.View>

      <Animated.View style={[styles.orbContainer, animatedStyle2]}>
        <View style={[styles.orb, { backgroundColor: 'rgba(29, 78, 216, 0.15)', bottom: -height * 0.1, right: -width * 0.3 }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    zIndex: -1,
  },
  orbContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    filter: 'blur(60px)', // Web/New RN prop, but falls back gracefully or requires BlurView. We use large soft shapes.
  },
});
