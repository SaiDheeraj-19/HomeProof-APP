import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { supabase } from '../../shared/services/supabase';
import { haptics } from '../../shared/platform/haptics';
import { Ionicons } from '@expo/vector-icons';

type AuthMode = 'signin' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    haptics.medium();
    setLoading(true);
    // Reanimated SharedValue mutation — this is the correct API, not React state.
    // eslint-disable-next-line react-hooks/immutability
    buttonScale.value = withSpring(0.96, { damping: 10 });

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Sign In Failed', error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert('Sign Up Failed', error.message);
        else Alert.alert('Check Your Email', 'We sent a confirmation link. Please verify before signing in.');
      }
    } finally {
      setLoading(false);
      buttonScale.value = withSpring(1, { damping: 10 });
    }
  }

  const switchMode = () => {
    haptics.selection();
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient matching icon */}
      <LinearGradient
        colors={['#0F172A', '#1E3A5F', '#1D4ED8']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow orbs */}
      <View style={[styles.glowOrb, { top: -60, right: -60 }]} />
      <View style={[styles.glowOrb2, { bottom: 200, left: -80 }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.header}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>HomeProof</Text>
            <Text style={styles.tagline}>Your trusted rental intelligence platform.</Text>
          </Animated.View>

          {/* Glass card */}
          <Animated.View entering={FadeInUp.delay(200).duration(700).springify()} style={styles.card}>
            <BlurView intensity={40} tint="dark" style={styles.blurCard}>

              {/* Mode Switcher Pill */}
              <View style={styles.modeSwitcher}>
                <Pressable
                  style={[styles.modeTab, mode === 'signin' && styles.modeTabActive]}
                  onPress={() => mode !== 'signin' && switchMode()}
                >
                  <Text style={[styles.modeTabText, mode === 'signin' && styles.modeTabTextActive]}>
                    Sign In
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modeTab, mode === 'signup' && styles.modeTabActive]}
                  onPress={() => mode !== 'signup' && switchMode()}
                >
                  <Text style={[styles.modeTabText, mode === 'signup' && styles.modeTabTextActive]}>
                    Create Account
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.cardTitle}>
                {mode === 'signin' ? 'Welcome Back 👋' : 'Join HomeProof 🏡'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {mode === 'signin'
                  ? 'Sign in to access your trusted properties and community insights.'
                  : 'Create a free account and start renting with confidence.'}
              </Text>

              {/* Email Field */}
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
                <Ionicons name="mail-outline" size={18} color={focusedField === 'email' ? '#3B82F6' : 'rgba(255,255,255,0.4)'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email to sign in or sign up"
                />
              </View>

              {/* Password Field */}
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputWrapperFocused]}>
                <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'password' ? '#3B82F6' : 'rgba(255,255,255,0.4)'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your secure password"
                />
                <Pressable 
                  onPress={() => setShowPassword(p => !p)} 
                  style={styles.eyeButton}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </View>

              {mode === 'signin' && (
                <Pressable 
                  style={styles.forgotButton}
                  accessibilityRole="button"
                  accessibilityLabel="Forgot Password?"
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              )}

              {/* CTA Button */}
              <Animated.View style={[buttonAnimatedStyle, styles.ctaContainer]}>
                <Pressable
                  onPress={handleAuth}
                  disabled={loading}
                  style={({ pressed }) => [pressed && { opacity: 0.9 }]}
                  accessibilityRole="button"
                  accessibilityLabel={mode === 'signin' ? "Sign In" : "Create Account"}
                  accessibilityState={{ disabled: loading }}
                >
                  <LinearGradient
                    colors={loading ? ['#374151', '#374151'] : ['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.ctaButton}
                  >
                    <Text style={styles.ctaText}>
                      {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Apple / Google Sign-in placeholders */}
              <View style={styles.socialRow}>
                <Pressable style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Apple</Text>
                </Pressable>
                <Pressable style={styles.socialButton}>
                  <Ionicons name="logo-google" size={20} color="#FFFFFF" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </Pressable>
              </View>

            </BlurView>
          </Animated.View>

          {/* Back to Onboarding */}
          <Animated.View entering={FadeIn.delay(600).duration(600)} style={styles.backRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.backText}>Back to Onboarding</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#3B82F6',
    opacity: 0.12,
  },
  glowOrb2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2563EB',
    opacity: 0.1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagline: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  blurCard: {
    padding: 24,
    gap: 16,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  modeTabActive: {
    backgroundColor: '#3B82F6',
  },
  modeTabText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 4,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  ctaContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 4,
  },
  ctaButton: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backRow: {
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  backText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
});
