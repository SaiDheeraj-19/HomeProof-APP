import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform, TextInput, KeyboardAvoidingView, Pressable, Keyboard, Alert } from 'react-native';
import { Typography } from '../../shared/components/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../features/auth/AuthContext';
import { useUserStore } from '../../store/useUserStore';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const profile = useUserStore((s) => s.profile);
  const isOwner = profile?.role === 'owner';
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');

  // Initial mock messages
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender_id: isOwner ? 'renter' : user?.id,
      text: 'Hi, I had a question about the pet policy?',
      time: '10:42 AM',
      isMe: !isOwner
    },
    {
      id: '2',
      sender_id: isOwner ? user?.id : 'owner',
      text: 'Yes! Small pets under 20lbs are allowed with an additional $50/mo fee.',
      time: '10:45 AM',
      isMe: isOwner
    }
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender_id: user?.id || 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }]);
    
    setInputText('');
    Keyboard.dismiss();
    
    // Auto-scroll to bottom after state update
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerInfo}>
          <Typography variant="body" weight="bold" color="text-white">
            {isOwner ? 'Anjali D.' : 'Property Owner'}
          </Typography>
          <Typography variant="caption" color="text-slate-400">
            Plot 45, Nandyal Road
          </Typography>
        </View>
        <Pressable 
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(
              "Chat Options",
              "What would you like to do?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Report User", style: "destructive", onPress: () => console.log("Reported") },
                { text: "Block User", style: "destructive", onPress: () => console.log("Blocked") },
                { text: "Clear Chat", onPress: () => console.log("Cleared") }
              ]
            );
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Chat Area */}
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <Typography variant="caption" color="text-slate-500" style={styles.dateStamp}>
          TODAY
        </Typography>

        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}>
            <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleThem]}>
              <Typography variant="body" color={msg.isMe ? "text-white" : "text-slate-100"}>
                {msg.text}
              </Typography>
              <Typography variant="caption" color={msg.isMe ? "text-blue-200" : "text-slate-400"} style={styles.timeLabel}>
                {msg.time} {msg.isMe && <Ionicons name="checkmark-done" size={12} color="#93C5FD" style={{marginLeft: 4}} />}
              </Typography>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <Pressable style={styles.attachButton}>
          <Ionicons name="add" size={24} color="#64748B" />
        </Pressable>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
        </View>

        <Pressable 
          style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" style={{ marginLeft: 2 }} />
        </Pressable>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  moreButton: {
    padding: 8,
  },
  chatArea: {
    padding: 16,
    paddingBottom: 24,
  },
  dateStamp: {
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageWrapperMe: {
    justifyContent: 'flex-end',
  },
  messageWrapperThem: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  timeLabel: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 10,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  attachButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginHorizontal: 8,
    minHeight: 40,
    maxHeight: 100,
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
