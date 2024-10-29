import React, { useState, useRef } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Typography } from '@/components/ui/typography';
import { BlurView } from 'expo-blur';
import { IconButton } from 'react-native-paper';
import { getStoreById } from '@/data/stores';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'store';
  timestamp: Date;
};

export default function StoreChatScreen() {
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const store = getStoreById(Number(id));

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.storeMessage
    ]}>
      <Typography 
        variant="p" 
        style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.storeMessageText
        ]}
      >
        {item.text}
      </Typography>
      <Typography variant="small" style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: store?.name || 'Chat',
          headerTransparent: true,
          headerBackground: () => (
            <BlurView intensity={100} style={StyleSheet.absoluteFill} />
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
          style={styles.inputContainer}
        >
          <BlurView intensity={100} style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <IconButton
              icon="send"
              size={28}
              mode="contained"
              onPress={handleSend}
              style={styles.sendButton}
              accessibilityLabel="Send message"
            />
          </BlurView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  storeMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9ECEF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  storeMessageText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    margin: 0,
    backgroundColor: '#007AFF',
  },
});
