import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Pressable, Image, Alert } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { useUserStore } from '../../store/useUserStore';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const profile = useUserStore((s) => s.profile);
  const isOwner = profile?.role === 'owner';

  // Mock Conversations
  const conversations = [
    {
      id: 'mock-chat-1',
      participant_name: isOwner ? 'Anjali D.' : 'Property Owner',
      property_name: 'Plot 45, Nandyal Road',
      last_message: 'Hi, I had a question about the pet policy?',
      time: '10:42 AM',
      unread: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 'mock-chat-2',
      participant_name: isOwner ? 'Rajesh K.' : 'Villa 7 Manager',
      property_name: isOwner ? 'Apt 12B, C-Camp Center' : 'Villa 7, Venkataramana Colony',
      last_message: 'The maintenance team will be there tomorrow at 10am.',
      time: 'Yesterday',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#0F172A']} style={styles.headerBackground} />
      
      <View style={styles.header}>
        <Typography variant="h1" weight="bold" color="text-white">
          Messages
        </Typography>
        <Pressable 
          style={styles.iconCircle}
          onPress={() => {
            Alert.alert("New Message", "Select a contact to start a new conversation.");
          }}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {conversations.map((chat) => (
          <Pressable 
            key={chat.id} 
            style={({ pressed }) => [pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => router.push(`/chat/${chat.id}`)}
          >
            <View style={styles.chatRow}>
              <Image source={{ uri: chat.avatar }} style={styles.avatar} />
              
              <View style={styles.chatDetails}>
                <View style={styles.chatHeaderRow}>
                  <Typography variant="body" weight="bold" color="text-white">
                    {chat.participant_name}
                  </Typography>
                  <Typography variant="caption" color={chat.unread > 0 ? "text-blue-400" : "text-slate-500"} weight={chat.unread > 0 ? "bold" : "normal"}>
                    {chat.time}
                  </Typography>
                </View>
                
                <Typography variant="caption" color="text-slate-400" style={{ marginBottom: 4 }}>
                  {chat.property_name}
                </Typography>
                
                <View style={styles.messagePreviewRow}>
                  <Typography variant="body" color="text-slate-400" numberOfLines={1} style={{ flex: 1 }}>
                    {chat.last_message}
                  </Typography>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Typography variant="caption" weight="bold" color="text-white">
                        {chat.unread}
                      </Typography>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
        ))}
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
    top: 0, left: 0, right: 0, height: 150,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: {
    paddingBottom: 120,
  },
  chatRow: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    marginRight: 16,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  }
});
