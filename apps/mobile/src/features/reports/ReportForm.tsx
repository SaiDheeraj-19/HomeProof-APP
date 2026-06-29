import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '../../shared/services/supabase';
import { useAuth } from '../auth/AuthContext';
import { Typography } from '../../shared/components/Typography';
import { Button } from '../../shared/components/Button';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { haptics } from '../../shared/platform/haptics';
import { logger } from '../../shared/logger';
import * as ImagePicker from 'expo-image-picker';
import { useNetInfo } from '@react-native-community/netinfo';
import { offlineQueue } from '../../shared/services/offlineQueue';

interface ReportFormProps {
  propertyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReportForm({ propertyId, onSuccess, onCancel }: ReportFormProps) {
  const { session } = useAuth();
  const [description, setDescription] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const netInfo = useNetInfo();

  async function pickMedia() {
    haptics.selection();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      
      // 1. Size Validation (Max 10MB)
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
        return;
      }

      // 2. MIME/Extension Validation
      const uri = asset.uri.toLowerCase();
      const isValid = uri.endsWith('.jpg') || uri.endsWith('.jpeg') || 
                     uri.endsWith('.png') || uri.endsWith('.mp4') || 
                     uri.endsWith('.mov');
                     
      if (!isValid) {
        Alert.alert('Invalid Format', 'Only JPG, PNG, MP4, and MOV files are allowed.');
        return;
      }

      setMediaUri(asset.uri);
    }
  }

  async function submitReport() {
    if (!description.trim() && !mediaUri) {
      Alert.alert('Details Required', 'Please provide a photo or description of the issue.');
      return;
    }

    setLoading(true);
    let uploadedMediaUrl: string | null = null;

    try {
      const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

      // 1. Upload Media if present & Online
      if (mediaUri && !isOffline) {
        const ext = mediaUri.substring(mediaUri.lastIndexOf('.') + 1).toLowerCase();
        const fileName = `${session?.user.id ?? 'anon'}_${Date.now()}.${ext}`;

        // Fetch the file as a blob for a reliable upload from a local URI.
        const response = await fetch(mediaUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('report_media')
          .upload(fileName, blob, {
            contentType: `image/${ext}`,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('report_media')
          .getPublicUrl(fileName);

        uploadedMediaUrl = publicUrlData.publicUrl;
        logger.info('ReportForm', 'Media uploaded successfully', { fileName });
      }

      if (isOffline) {
        // 2a. Offline Queue
        offlineQueue.addReport({
          property_id: propertyId,
          reporter_id: session?.user.id,
          description: description.trim(),
          media_urls: [], // Note: Offline media upload is deferred in this version
        });
        
        haptics.success();
        Alert.alert('Saved Offline', 'You are offline. Your report has been saved and will automatically submit when you reconnect.');
        onSuccess();
        return;
      }

      // 2b. Insert Report (Online)
      const { error: insertError } = await supabase.from('reports').insert({
        property_id: propertyId,
        reporter_id: session?.user.id,
        description: description.trim(),
        media_urls: uploadedMediaUrl ? [uploadedMediaUrl] : [],
        report_type: 'other',
        ai_analysis_status: 'pending',
      });

      if (insertError) throw insertError;

      haptics.success();
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      logger.error('ReportForm', 'Report submission failed', err);
      Alert.alert('Submission Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Animated.View
      entering={SlideInDown.springify().damping(15)}
      className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-xl w-full"
    >
      <View className="flex-row justify-between items-center mb-6">
        <Typography variant="h2" weight="bold" color="text-slate-900 dark:text-white">
          Report an Issue
        </Typography>
        <Pressable
          onPress={onCancel}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close report form"
        >
          <Typography variant="body" color="text-slate-500">Close</Typography>
        </Pressable>
      </View>

      <Typography variant="body" color="text-slate-500" className="mb-6">
        Don&apos;t worry about categories—our AI will analyze the photo and description
        to classify the risk level automatically.
      </Typography>

      <Pressable
        onPress={pickMedia}
        style={styles.mediaPicker}
        accessibilityRole="button"
        accessibilityLabel={mediaUri ? 'Change photo or video' : 'Add photo or video'}
      >
        {mediaUri ? (
          <Image
            source={{ uri: mediaUri }}
            style={styles.mediaPreview}
            resizeMode="cover"
            accessibilityLabel="Selected media preview"
          />
        ) : (
          <View className="items-center">
            <Typography variant="h3" color="text-primary-500 mb-1">📸 Add Photo or Video</Typography>
            <Typography variant="caption" color="text-slate-400">Required for severe issues</Typography>
          </View>
        )}
      </Pressable>

      <TextInput
        style={styles.textInput}
        placeholder="Add any extra details..."
        placeholderTextColor="#94a3b8"
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
        accessibilityLabel="Issue description"
        accessibilityHint="Describe the issue in detail"
      />

      <Button
        label={loading ? 'Submitting...' : 'Submit Report'}
        onPress={submitReport}
        disabled={loading}
        fullWidth
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(148,163,184,0.1)',
    borderRadius: 999,
  },
  mediaPicker: {
    width: '100%',
    height: 128,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    color: '#0f172a',
    fontSize: 16,
    marginBottom: 24,
  },
});
