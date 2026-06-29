import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../../shared/platform/haptics';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🛡️',
    title: 'Trust Before\nYou Sign',
    subtitle: 'Every property has a community-verified Trust Score based on real renter experiences, not marketing.',
    accent: '#3B82F6',
  },
  {
    emoji: '📸',
    title: 'Report in\nSeconds',
    subtitle: 'Snap a photo, record a voice note. Our AI handles the rest — categorizing, analyzing, and updating scores instantly.',
    accent: '#2563EB',
  },
  {
    emoji: '🗺️',
    title: 'See Risk on\nthe Map',
    subtitle: 'Color-coded trust overlays reveal which neighborhoods are thriving and which have unresolved issues.',
    accent: '#1D4ED8',
  },
];

// ─── AnimatedDot ─────────────────────────────────────────────────────────────
// Extracted into its own component so that useAnimatedStyle is called at the
// top-level of a component, satisfying the Rules of Hooks.
interface AnimatedDotProps {
  index: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
}

function AnimatedDot({ index, scrollX, pageWidth }: AnimatedDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];
    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP);
    return { width: dotWidth, opacity };
  });
  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

// ─── OnboardingScreen ─────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const handleNext = () => {
    haptics.light();
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Deep gradient background matching icon */}
      <LinearGradient
        colors={['#0F172A', '#1E3A5F', '#1D4ED8']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle glow orbs */}
      <View style={[styles.glowOrb, { top: -80, left: -80, backgroundColor: '#3B82F6' }]} />
      <View style={[styles.glowOrb, { bottom: 100, right: -80, backgroundColor: '#1D4ED8' }]} />

      {/* Skip button */}
      <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.skipContainer}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </Animated.View>

      {/* Logo */}
      <Animated.View entering={FadeInDown.delay(100).duration(800).springify()} style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>HomeProof</Text>
      </Animated.View>

      {/* Slides */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <Animated.View entering={FadeIn.delay(500 + index * 100).duration(800)} style={styles.emojiContainer}>
              <BlurView intensity={20} tint="light" style={styles.emojiBlur}>
                <Text style={styles.emoji}>{slide.emoji}</Text>
              </BlurView>
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(600 + index * 100).duration(800)}
              style={styles.slideTitle}
            >
              {slide.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.delay(700 + index * 100).duration(800)}
              style={styles.slideSubtitle}
            >
              {slide.subtitle}
            </Animated.Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Bottom CTA area */}
      <Animated.View entering={FadeInUp.delay(800).duration(600)} style={styles.bottomContainer}>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <AnimatedDot key={index} index={index} scrollX={scrollX} pageWidth={width} />
          ))}
        </View>

        {/* Primary CTA Button */}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>
              {activeIndex === SLIDES.length - 1 ? 'Get Started →' : 'Continue →'}
            </Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.legalText}>
          By continuing, you agree to our Terms & Privacy Policy.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.12,
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 110 : 90,
    marginBottom: 8,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  emojiContainer: {
    marginBottom: 8,
  },
  emojiBlur: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: {
    fontSize: 48,
  },
  slideTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    gap: 20,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  legalText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
  },
});
