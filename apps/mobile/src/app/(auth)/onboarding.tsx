import React, { useRef, useState } from 'react';
import {
  View,
  Text,
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
  withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics } from '../../shared/platform/haptics';
import { Ionicons } from '@expo/vector-icons';
import AnimatedBackground from './components/AnimatedBackground';
import HeroVisual from './components/HeroVisual';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Know before\nyou move.',
    subtitle: 'Every property has a community-verified Trust Score based on real renter experiences, not marketing.',
  },
  {
    title: 'Report in\nseconds.',
    subtitle: 'Snap a photo or record a voice note. Our AI handles the rest — categorizing and analyzing instantly.',
  },
  {
    title: 'Find homes\nyou can trust.',
    subtitle: 'Color-coded trust overlays reveal which neighborhoods are thriving and which have unresolved issues.',
  },
];

// ─── Morphing Indicator ───────────────────────────────────────────────────────
interface IndicatorProps {
  scrollX: SharedValue<number>;
}

function ProgressIndicator({ scrollX }: IndicatorProps) {
  return (
    <View style={styles.indicatorContainer}>
      {SLIDES.map((_, index) => {
        const animatedStyle = useAnimatedStyle(() => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = interpolate(scrollX.value, inputRange, [8, 32, 8], Extrapolation.CLAMP);
          const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
          return { width: dotWidth, opacity };
        });
        return <Animated.View key={index} style={[styles.dot, animatedStyle]} />;
      })}
    </View>
  );
}

// ─── OnboardingScreen ─────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Button Physics
  const buttonScale = useSharedValue(1);
  const arrowTranslate = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const handlePressIn = () => {
    haptics.light();
    buttonScale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    arrowTranslate.value = withSpring(6, { damping: 10, stiffness: 150 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    arrowTranslate.value = withSpring(0, { damping: 10, stiffness: 150 });
  };

  const handleNext = () => {
    haptics.medium();
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

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AnimatedBackground />

      <Animated.View entering={FadeIn.delay(300).duration(600)} style={styles.skipContainer}>
        <Pressable onPress={handleSkip} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(1000).springify()} style={styles.headerContainer}>
        <Text style={styles.logoText}>HomeProof</Text>
        <Text style={styles.tagline}>Proof Before You Move</Text>
      </Animated.View>

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
            <Animated.View entering={FadeIn.delay(400 + index * 100).duration(1000)} style={styles.heroContainer}>
              <HeroVisual index={index} />
            </Animated.View>

            <View style={styles.textContainer}>
              <Animated.Text
                entering={FadeInUp.delay(500 + index * 100).duration(800).springify()}
                style={styles.slideTitle}
              >
                {slide.title}
              </Animated.Text>

              <Animated.Text
                entering={FadeInUp.delay(600 + index * 100).duration(800).springify()}
                style={styles.slideSubtitle}
              >
                {slide.subtitle}
              </Animated.Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <Animated.View entering={FadeInUp.delay(900).duration(800).springify()} style={styles.bottomContainer}>
        <ProgressIndicator scrollX={scrollX} />

        <Animated.View style={[styles.ctaWrapper, buttonAnimatedStyle]}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleNext}
            style={styles.ctaButton}
          >
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.9)', 'rgba(30, 58, 138, 0.9)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGlass}
            >
              <View style={styles.ctaContent}>
                <View style={styles.iconCircleWrapper}>
                  <View style={styles.arrowGlow} />
                  <View style={styles.iconCircle}>
                    <Animated.View style={arrowAnimatedStyle}>
                      <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </Animated.View>
                  </View>
                </View>
                
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaText}>
                    {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                  </Text>
                  <Text style={styles.ctaSubtitle}>
                    Let's get started
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

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
    backgroundColor: '#070B14', // Fallback for animated bg
  },
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 32,
    zIndex: 10,
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 70 : 50,
    marginBottom: 0,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.1,
  },
  heroContainer: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    gap: 16,
  },
  slideTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: '400',
  },
  bottomContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 56 : 40,
    gap: 32,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    height: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  ctaWrapper: {
    width: '100%',
    alignSelf: 'stretch',
  },
  ctaButton: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 100,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  ctaGlass: {
    width: '100%',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 100, 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
  },
  iconCircleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlow: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#60A5FA',
    borderRadius: 15,
    shadowColor: '#60A5FA',
    shadowRadius: 20,
    shadowOpacity: 1,
    shadowOffset: { width: -15, height: 0 },
    elevation: 10,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A1128',
    borderWidth: 1.5,
    borderColor: 'rgba(96, 165, 250, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ctaTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '400',
    marginTop: -2,
  },
  legalText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    textAlign: 'center',
  },
});
