import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { Button } from '../../shared/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../shared/services/supabase';
import { useAuth } from '../auth/AuthContext';
import { haptics } from '../../shared/platform/haptics';

interface AddPropertyFormProps {
  onClose: () => void;
}

export function AddPropertyForm({ onClose }: AddPropertyFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [rentPrice, setRentPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sqft, setSqft] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          address,
          city,
          state,
          zip_code: zip,
          rent_price: parseInt(rentPrice) || null,
          bedrooms: parseInt(bedrooms) || null,
          bathrooms: parseFloat(bathrooms) || null,
          sqft: parseInt(sqft) || null,
          cover_image: coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          description: description || null,
          trust_score: 100,
          is_listed: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties_feed'] });
      onClose();
    },
    onError: (error: any) => {
      haptics.error();
      Alert.alert('Error adding property', error.message);
    }
  });

  const handleSubmit = () => {
    if (!address || !city || !state || !zip || !rentPrice) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Typography variant="h2" weight="bold" color="text-white">List Property</Typography>
        <Ionicons name="close" size={32} color="#94A3B8" onPress={onClose} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardDismissMode="interactive">
        
        <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionLabel}>
          LOCATION (REQUIRED)
        </Typography>
        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="Street Address" placeholderTextColor="#64748B" value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 2, marginRight: 12 }]} placeholder="City" placeholderTextColor="#64748B" value={city} onChangeText={setCity} />
            <TextInput style={[styles.input, { flex: 1, marginRight: 12 }]} placeholder="State" placeholderTextColor="#64748B" value={state} onChangeText={setState} maxLength={2} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="ZIP" placeholderTextColor="#64748B" value={zip} onChangeText={setZip} keyboardType="numeric" />
          </View>
        </View>

        <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionLabel}>
          LISTING DETAILS (REQUIRED)
        </Typography>
        <View style={styles.inputGroup}>
          <TextInput style={styles.input} placeholder="Monthly Rent Price ($)" placeholderTextColor="#64748B" value={rentPrice} onChangeText={setRentPrice} keyboardType="numeric" />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 12 }]} placeholder="Beds" placeholderTextColor="#64748B" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1, marginRight: 12 }]} placeholder="Baths" placeholderTextColor="#64748B" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Sqft" placeholderTextColor="#64748B" value={sqft} onChangeText={setSqft} keyboardType="numeric" />
          </View>
        </View>

        <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionLabel}>
          DESCRIPTION
        </Typography>
        <View style={styles.inputGroup}>
          <TextInput 
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} 
            placeholder="Describe your property. What makes it special?" 
            placeholderTextColor="#64748B" 
            value={description} 
            onChangeText={setDescription}
            multiline
          />
        </View>

        <Typography variant="caption" weight="bold" color="text-slate-400" style={styles.sectionLabel}>
          MEDIA (OPTIONAL)
        </Typography>
        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Cover Image URL (e.g. Unsplash link)" 
            placeholderTextColor="#64748B" 
            value={coverImage} 
            onChangeText={setCoverImage}
            autoCapitalize="none"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={submitMutation.isPending ? "Saving..." : "Add Property"} 
          onPress={handleSubmit} 
          disabled={submitMutation.isPending}
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
  sectionLabel: {
    marginBottom: 12,
    marginTop: 24,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(15,23,42,0.95)',
  }
});
