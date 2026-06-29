import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../shared/services/supabase';
import { useAuth } from '../auth/AuthContext';
import { useUserStore } from '../../store/useUserStore';
import { useSavedStore } from '../../store/useSavedStore';
import { Typography } from '../../shared/components/Typography';
import { haptics } from '../../shared/platform/haptics';

// ─── Stat Box ───────────────────────────────────────────────────────────────
interface StatBoxProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}

function StatBox({ icon, value, label, color }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Typography variant="h3" weight="bold" color="text-white" style={{ marginTop: 8 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text-slate-400">
        {label}
      </Typography>
    </View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  destructive?: boolean;
  isLast?: boolean;
  color?: string;
}

function MenuItem({ icon, label, subtitle, onPress, destructive = false, isLast = false, color = '#3B82F6' }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItemWrapper,
        pressed && styles.menuItemPressed,
      ]}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
    >
      <View style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}>
        <View style={[styles.menuIconWrap, destructive ? { backgroundColor: '#ef444415' } : { backgroundColor: `${color}15` }]}>
          <Ionicons
            name={icon}
            size={18}
            color={destructive ? '#ef4444' : color}
          />
        </View>
        <View style={styles.menuTextGroup}>
          <Typography
            variant="body"
            weight="medium"
            color={destructive ? 'text-red-500' : 'text-slate-100'}
          >
            {label}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text-slate-400">
              {subtitle}
            </Typography>
          )}
        </View>
        {!destructive && (
          <Ionicons name="chevron-forward" size={16} color="rgba(148,163,184,0.4)" />
        )}
      </View>
    </Pressable>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile } = useUserStore();
  const savedIds = useSavedStore((s) => s.savedIds);
  const router = useRouter();

  const { data: reportCount = 0 } = useQuery({
    queryKey: ['reportCount', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('reporter_id', user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            haptics.medium();
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert(feature, 'This settings page is coming soon!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Immersive Header Gradient */}
      <LinearGradient
        colors={['#1E3A8A', '#0F172A']}
        locations={[0, 1]}
        style={styles.headerBackground}
      />
      <View style={styles.glowOrb} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Identity Area */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.identitySection}>
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.avatarGradient}
            >
              <Typography variant="h1" color="text-white" weight="bold">
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </Typography>
            </LinearGradient>
          </View>
          <Typography variant="h2" weight="bold" color="text-white" style={{ marginTop: 16 }}>
            {user?.email || 'Anonymous User'}
          </Typography>
          <Typography variant="caption" color="text-blue-300" style={{ marginTop: 4 }}>
            Member since {new Date(user?.created_at || Date.now()).getFullYear()}
          </Typography>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInUp.delay(100).duration(600).springify()} style={styles.statsContainer}>
          <BlurView intensity={20} tint="light" style={styles.statsGlass}>
            {profile?.role === 'owner' ? (
              <>
                <StatBox icon="home" value="4" label="Listings" color="#10B981" />
                <View style={styles.statDivider} />
                <StatBox icon="wallet" value="$4.5k" label="Monthly" color="#8B5CF6" />
                <View style={styles.statDivider} />
                <StatBox icon="star" value={profile?.reputation_score || 0} label="Trust" color="#FBBF24" />
              </>
            ) : (
              <>
                <StatBox icon="document-text" value={reportCount} label="Reports" color="#60A5FA" />
                <View style={styles.statDivider} />
                <StatBox icon="bookmark" value={savedIds.size} label="Saved" color="#A78BFA" />
                <View style={styles.statDivider} />
                <StatBox icon="star" value={profile?.reputation_score || 0} label="Trust" color="#FBBF24" />
              </>
            )}
          </BlurView>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View entering={FadeInUp.delay(200).duration(600).springify()} style={styles.sectionGroup}>
          <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionHeader}>
            ACCOUNT
          </Typography>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="mail" 
              label="Email Address" 
              subtitle={user?.email || ''} 
              color="#3B82F6"
              onPress={() => router.push('/settings/email')}
              isLast={profile?.role === 'owner'}
            />
            {profile?.role !== 'owner' && (
              <MenuItem 
                icon="shield-checkmark" 
                label="Verification Status" 
                subtitle="Verified Renter" 
                color="#10B981"
                isLast
                onPress={() => router.push('/settings/verification')}
              />
            )}
          </View>
        </Animated.View>

        {/* Owner Settings (Conditionally Rendered) */}
        {profile?.role === 'owner' && (
          <Animated.View entering={FadeInUp.delay(250).duration(600).springify()} style={styles.sectionGroup}>
            <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionHeader}>
              LANDLORD TOOLS
            </Typography>
            <View style={styles.menuCard}>
              <MenuItem icon="card" label="Payout Methods" subtitle="Bank Account linked" color="#10B981" onPress={() => handleComingSoon('Payout Methods')} />
              <MenuItem icon="document-text" label="Lease Templates" subtitle="Manage agreements" color="#3B82F6" onPress={() => handleComingSoon('Lease Templates')} />
              <MenuItem icon="people" label="Tenant Screening" subtitle="Background check APIs" color="#8B5CF6" isLast onPress={() => handleComingSoon('Tenant Screening')} />
            </View>
          </Animated.View>
        )}

        {/* Preferences Settings */}
        <Animated.View entering={FadeInUp.delay(300).duration(600).springify()} style={styles.sectionGroup}>
          <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionHeader}>
            PREFERENCES
          </Typography>
          <View style={styles.menuCard}>
            <MenuItem icon="notifications" label="Notifications" subtitle="Push, Email" color="#F59E0B" onPress={() => router.push('/settings/notifications')} />
            <MenuItem icon="color-palette" label="Appearance" subtitle="Dark Theme" color="#8B5CF6" onPress={() => router.push('/settings/appearance')} />
            <MenuItem icon="lock-closed" label="Privacy & Security" subtitle="Face ID Enabled" color="#6366F1" isLast onPress={() => router.push('/settings/privacy')} />
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} style={styles.sectionGroup}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out"
              label="Sign Out"
              destructive
              isLast
              onPress={handleSignOut}
            />
          </View>
        </Animated.View>

        {/* App Version Footer */}
        <View style={styles.footer}>
          <Typography variant="caption" color="text-slate-500">
            HomeProof v1.0.0 (Build 42)
          </Typography>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 350,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    zIndex: -2,
  },
  glowOrb: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#3B82F6',
    opacity: 0.15,
    zIndex: -1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  identitySection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1E3A8A',
    padding: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  statsGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionGroup: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  menuItemWrapper: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextGroup: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
