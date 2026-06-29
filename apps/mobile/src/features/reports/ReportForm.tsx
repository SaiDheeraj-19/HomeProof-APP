import React, { useState } from 'react';
import { View, TextInput, Alert, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '../../shared/services/supabase';
import { useAuth } from '../auth/AuthContext';
import { Typography } from '../../shared/components/Typography';
import { Button } from '../../shared/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '../../shared/platform/haptics';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';

interface ReportFormProps {
  propertyId: string;
  onCancel: () => void;
}

export function ReportForm({ propertyId, onCancel }: ReportFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickMedia() {
    haptics.selection();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  }

  async function submitReport() {
    if (!description.trim()) {
      Alert.alert('Details Required', 'Please provide a description of the issue.');
      return;
    }

    setLoading(true);
    let uploadedMediaUrl: string | null = null;

    try {
      if (mediaUri) {
        // Upload photo logic goes here in a real app.
        // For this demo, we'll just pretend it succeeded or use the local URI for visual feedback.
        uploadedMediaUrl = 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&q=80&w=500';
      }

      const { error: insertError } = await supabase.from('reports').insert({
        property_id: propertyId,
        reporter_id: user?.id,
        description: description.trim(),
        media_urls: uploadedMediaUrl ? [uploadedMediaUrl] : [],
        report_type: 'other',
        ai_analysis_status: 'pending', // The DB trigger will pick this up!
      });

      if (insertError) throw insertError;

      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['property_reports', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      Alert.alert('Report Submitted', 'Our AI Trust Engine is analyzing your report. It will be posted shortly.');
      onCancel();
    } catch (err: any) {
      haptics.error();
      Alert.alert('Submission Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Typography variant="h2" weight="bold" color="text-white">Write a Report</Typography>
        <Ionicons name="close" size={32} color="#94A3B8" onPress={onCancel} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardDismissMode="interactive">
        
        <View style={styles.infoBox}>
          <Ionicons name="sparkles" size={24} color="#3B82F6" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Typography variant="body" weight="bold" color="text-white">AI Analyzed</Typography>
            <Typography variant="caption" color="text-slate-400">
              Just describe what happened. Our AI Trust Engine will automatically classify the severity and update the Trust Score.
            </Typography>
          </View>
        </View>

        <Pressable onPress={pickMedia} style={styles.mediaPicker}>
          {mediaUri ? (
            <>
              <Image source={{ uri: mediaUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              {loading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                </View>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="camera-outline" size={40} color="#64748B" />
              <Typography variant="body" weight="bold" color="text-slate-300" style={{ marginTop: 8 }}>Add Photo Evidence</Typography>
              <Typography variant="caption" color="text-slate-500">Optional but recommended</Typography>
            </View>
          )}
        </Pressable>

        <TextInput
          style={styles.textInput}
          placeholder="e.g., There is black mold growing on the bathroom ceiling..."
          placeholderTextColor="#64748B"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={loading ? "Analyzing..." : "Submit Report"} 
          onPress={submitReport} 
          disabled={loading}
          className="w-full"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: {
    padding: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59,130,246,0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    marginBottom: 24,
  },
  mediaPicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15,23,42,0.95)',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  }
});
