import React, { useState } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { TextInput, Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Linking } from 'react-native';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'store';
  timestamp: Date;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can we help you today?",
      sender: 'store',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    // Add more sample messages as needed
  ]);
  const [hasRedirected, setHasRedirected] = useState(false);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate store response
    setTimeout(() => {
      const storeResponse: Message = {
        id: messages.length + 2,
        text: "Thank you for your message! We'll be redirecting you to our support page for faster assistance.",
        sender: 'store',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, storeResponse]);
      
      // Only redirect if this is the first automatic reply
      if (!hasRedirected) {
        setTimeout(() => {
          Linking.openURL('https://your-support-url.com');
          setHasRedirected(true);
        }, 1500); // Wait 1.5 seconds before redirecting
      }
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Store Chat",
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.sender === 'user' ? styles.userMessage : styles.storeMessage,
              ]}
            >
              <View style={styles.messageBubble}>
                <Typography variant="p" style={styles.messageText}>
                  {msg.text}
                </Typography>
                <Typography variant="small" style={styles.timestamp}>
                  {formatTime(msg.timestamp)}
                </Typography>
              </View>
            </View>
          ))}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            style={styles.input}
            right={
              <TextInput.Icon 
                icon={() => (
                  <Button
                    mode="contained"
                    onPress={sendMessage}
                    style={styles.sendButton}
                  >
                    <Feather name="send" size={20} color="white" />
                  </Button>
                )}
              />
            }
          />
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  storeMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#007AFF',
  },
  messageText: {
    color: 'white',
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  input: {
    backgroundColor: 'white',
  },
  sendButton: {
    marginRight: -8,
  },
});
