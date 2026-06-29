/**
 * ProfileScreen — Full user profile with stats, account info, and sign-out.
 * Fetches profile data from the `profiles` table and shows report + save counts.
 */
import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../shared/services/supabase';
import { useAuth } from '../auth/AuthContext';
import { useUserStore } from '../../store/useUserStore';
import { useSavedStore } from '../../store/useSavedStore';
import { Typography } from '../../shared/components/Typography';
import { Card } from '../../shared/components/Card';
import { SkeletonLoader } from '../../shared/components/SkeletonLoader';
import { logger } from '../../shared/logger';
import { haptics } from '../../shared/platform/haptics';

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  emoji: string;
  value: number | string;
  label: string;
}

function StatCard({ emoji, value, label }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Typography style={styles.statEmoji}>{emoji}</Typography>
      <Typography variant="h2" weight="bold" color="text-slate-900 dark:text-white">
        {value}
      </Typography>
      <Typography variant="caption" color="text-slate-500">
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
}

function MenuItem({ icon, label, subtitle, onPress, destructive = false }: MenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.menuIconWrap, destructive && styles.menuIconDestructive]}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? '#ef4444' : '#3B82F6'}
        />
      </View>
      <View style={styles.menuTextGroup}>
        <Typography
          variant="body"
          weight="medium"
          color={destructive ? 'text-red-500' : 'text-slate-900 dark:text-white'}
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
        <Ionicons name="chevron-forward" size={16} color="rgba(148,163,184,0.6)" />
      )}
    </Pressable>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useUserStore();
  const savedIds = useSavedStore((s) => s.savedIds);

  // Fetch / cache profile
  const { isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      // Auto-create profile row if it doesn't exist yet
      if (!data) {
        const { data: created, error: insertErr } = await supabase
          .from('profiles')
          .insert({ id: user.id })
          .select()
          .single();
        if (insertErr) throw insertErr;
        setProfile(created);
        return created;
      }
      setProfile(data);
      return data;
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Count reports filed by user
  const { data: reportCount = 0 } = useQuery({
    queryKey: ['my_report_count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('reporter_id', user.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = useCallback(() => {
    haptics.warning();
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
            try {
              await signOut();
              useUserStore.getState().clear();
              useSavedStore.getState().clear();
            } catch (err) {
              logger.error('ProfileScreen', 'Sign out failed', err);
            }
          },
        },
      ]
    );
  }, [signOut]);

  // Build avatar initials
  const getInitials = () => {
    if (profile?.first_name) {
      return `${profile.first_name[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() ?? '?';
  };

  const router = useRouter();
  const [tapCount, setTapCount] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  const handleAvatarPress = () => {
    const now = Date.now();
    if (now - lastTap > 1000) {
      setTapCount(1);
    } else {
      setTapCount(prev => prev + 1);
      if (tapCount + 1 >= 5) {
        setTapCount(0);
        router.push('/diagnostics');
      }
    }
    setLastTap(now);
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email ?? 'Anonymous';

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header gradient */}
        <LinearGradient
          colors={['#1E3A5F', '#0F172A']}
          style={styles.headerGradient}
        >
          {/* Avatar */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.avatarWrap}>
            <Pressable onPress={handleAvatarPress}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.avatar}>
                <Typography style={styles.avatarText}>{getInitials()}</Typography>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.headerText}>
            {profileLoading ? (
              <View style={styles.skeletonGroup}>
                <SkeletonLoader width={160} height={22} borderRadius={8} />
                <SkeletonLoader width={120} height={14} borderRadius={6} style={{ marginTop: 8, alignSelf: 'center' }} />
              </View>
            ) : (
              <>
                <Typography variant="h2" weight="bold" color="text-white" style={styles.displayName}>
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text-slate-400">
                  Member since {memberSince}
                </Typography>
              </>
            )}
          </Animated.View>
        </LinearGradient>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsRow}>
          <StatCard emoji="📋" value={reportCount} label="Reports Filed" />
          <View style={styles.statDivider} />
          <StatCard emoji="🔖" value={savedIds.size} label="Saved Properties" />
          <View style={styles.statDivider} />
          <StatCard emoji="⭐" value={profile?.reputation_score ?? 0} label="Reputation" />
        </Animated.View>

        {/* Account section */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Typography variant="label" color="text-slate-400 mb-2 ml-1">ACCOUNT</Typography>
          <Card padding="none" style={styles.menuCard}>
            <MenuItem
              icon="mail-outline"
              label="Email"
              subtitle={user?.email ?? '—'}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Verification"
              subtitle={user?.email_confirmed_at ? 'Email verified' : 'Unverified'}
            />
          </Card>
        </Animated.View>

        {/* Preferences section */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={{ marginTop: 24 }}>
          <Typography variant="label" color="text-slate-400 mb-2 ml-1">PREFERENCES</Typography>
          <Card padding="none" style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              subtitle="Manage alerts and updates"
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="moon-outline"
              label="Appearance"
              subtitle="Follow system theme"
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="lock-closed-outline"
              label="Privacy &amp; Data"
              subtitle="Manage your data"
            />
          </Card>
        </Animated.View>

        {/* Danger zone */}
        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ marginTop: 24 }}>
          <Card padding="none" style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleSignOut}
              destructive
            />
          </Card>
        </Animated.View>

        {/* Footer */}
        <Typography variant="caption" color="text-slate-300 dark:text-slate-600" style={styles.footer}>
          HomeProof v1.0.0
        </Typography>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },
  headerGradient: {
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: { alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFFFFF' },
  headerText: { alignItems: 'center', gap: 4 },
  displayName: { letterSpacing: -0.3 },
  skeletonGroup: { alignItems: 'center', gap: 8 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 22 },
  statDivider: {
    width: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  menuCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemPressed: { backgroundColor: '#f8fafc' },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDestructive: { backgroundColor: 'rgba(239,68,68,0.08)' },
  menuTextGroup: { flex: 1, gap: 2 },
  menuDivider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 64 },
  footer: { textAlign: 'center', marginTop: 32 },
});
