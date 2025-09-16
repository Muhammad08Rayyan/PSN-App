import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';
import { useSocket } from '@/hooks/useSocket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/utils/api-config';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderProfilePic?: string;
  content: string;
  timestamp: string;
  createdAt: Date;
}

interface ConversationResponse {
  conversation: {
    _id: string;
    participants: {
      _id: string;
      name: string;
      profilePic?: string;
    }[];
  };
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const memberId = params.memberId as string;
  const memberName = params.memberName as string || 'Member';
  const memberImage = params.memberImage as string;

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Animated values
  const typingIndicatorPosition = useRef(new Animated.Value(0)).current;
  const inputAreaPosition = useRef(new Animated.Value(0)).current;

  // Socket
  const {
    isConnected,
    connectionState,
    newMessage,
    sendMessage: socketSendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    getTypingUsersForConversation,
    isUserOnline,
    reconnect,
  } = useSocket();

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user ID on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem('userData'); // Fixed: use 'userData' not 'user'
        console.log('Getting current user:', userStr);
        if (userStr) {
          const user = JSON.parse(userStr);
          const userId = user.id || user._id;
          console.log('Current user ID:', userId);
          setCurrentUserId(userId);
        } else {
          console.log('No user found in storage');
          setIsLoading(false);
          Alert.alert('Error', 'Please log in again');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setIsLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        const keyboardHeight = event.endCoordinates.height;

        // Move typing indicator up when keyboard shows
        Animated.timing(typingIndicatorPosition, {
          toValue: -60,
          duration: 250,
          useNativeDriver: true,
        }).start();

        // Move input area up when user is typing (WhatsApp style)
        if (isUserTyping) {
          Animated.timing(inputAreaPosition, {
            toValue: -keyboardHeight * 0.3, // Move up by 30% of keyboard height
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setIsUserTyping(false);

        // Move typing indicator back down when keyboard hides
        Animated.timing(typingIndicatorPosition, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();

        // Move input area back down when keyboard hides
        Animated.timing(inputAreaPosition, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, [isUserTyping, inputAreaPosition, typingIndicatorPosition]);

  // Initialize conversation
  useEffect(() => {
    const initializeChat = async () => {
      if (!memberId || !currentUserId) {
        console.log('Missing required data:', { memberId, currentUserId });
        return;
      }

      console.log('Initializing chat for member:', memberId, 'current user:', currentUserId);
      setIsLoading(true);

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Chat initialization timeout');
        setIsLoading(false);
        Alert.alert('Error', 'Chat loading timeout. Please try again.');
      }, 10000); // 10 second timeout

      try {
        // Skip socket connection for now, focus on getting basic functionality working
        console.log('Getting or creating conversation...');

        // Get or create conversation
        const conversation = await getOrCreateConversation(memberId);
        console.log('Conversation result:', conversation);

        if (conversation) {
          const newConversationId = conversation.conversation._id;
          console.log('Setting conversation ID to:', newConversationId);
          setConversationId(newConversationId);
          console.log('Loading messages for conversation:', newConversationId);
          // Load existing messages
          await loadMessages(newConversationId);
          console.log('Messages loaded successfully');
        } else {
          throw new Error('Failed to create or get conversation');
        }

        clearTimeout(timeoutId);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error initializing chat:', error);
        Alert.alert('Error', 'Failed to load chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [memberId, currentUserId, isConnected, leaveConversation, conversationId]);

  // Handle new messages from socket
  useEffect(() => {
    if (newMessage && newMessage.conversationId === conversationId) {
      setMessages(prev => {
        // Check if message already exists
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;

        // Add new message
        const updated = [newMessage, ...prev];

        // Mark messages as read if not from current user
        if (newMessage.senderId !== currentUserId) {
          setTimeout(() => {
            markMessagesAsRead(conversationId!);
          }, 1000);
        }

        return updated;
      });

      // Scroll to bottom for new messages
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [newMessage, conversationId, currentUserId, markMessagesAsRead]);

  // Join conversation room when socket connects
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);
    }
  }, [isConnected, conversationId, joinConversation]);

  // API functions
  const getOrCreateConversation = async (memberId: string): Promise<ConversationResponse | null> => {
    try {
      console.log('Getting token from storage...');
      const token = await AsyncStorage.getItem('userToken'); // Fixed: use 'userToken' not 'token'
      console.log('Token retrieved:', token ? 'exists' : 'missing');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making API request to create conversation with member:', memberId);
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: memberId }),
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Conversation created/retrieved:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create conversation: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      return null;
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log('Loading messages for conversation:', conversationId);
      const token = await AsyncStorage.getItem('userToken'); // Fixed: use 'userToken' not 'token'

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Messages API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Messages loaded:', data.messages?.length || 0, 'messages');
        // Reverse the messages to show newest at bottom
        setMessages(data.messages || []);
      } else {
        const errorText = await response.text();
        console.error('Messages API error response:', errorText);
        throw new Error(`Failed to load messages: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't fail completely, just set empty messages
      setMessages([]);
    }
  };

  // Message handling
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || !conversationId || isSending) return;

    const content = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      stopTyping(conversationId);

      // Send via socket for real-time delivery
      if (isConnected) {
        socketSendMessage(conversationId, content);
      } else {
        // Fallback to REST API if socket not connected
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          const data = await response.json();
          // Add message to local state
          setMessages(prev => [data.message, ...prev]);
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          }, 100);
        } else {
          throw new Error('Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Restore message text on error
      setMessageText(content);
    } finally {
      setIsSending(false);
    }
  }, [messageText, conversationId, isSending, isConnected, socketSendMessage, stopTyping]);

  // Typing indicator and input movement
  const handleTextChange = useCallback((text: string) => {
    setMessageText(text);

    // Track if user is typing for input animation
    const isTyping = text.length > 0;
    if (isTyping !== isUserTyping) {
      setIsUserTyping(isTyping);

      // Animate input area when user starts/stops typing
      if (isKeyboardVisible) {
        Animated.timing(inputAreaPosition, {
          toValue: isTyping ? -120 : 0, // Move up when typing, down when not
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    }

    if (!conversationId || !isConnected) return;

    // Socket typing indicator (only if socket is connected)
    if (text.length > 0) {
      startTyping(conversationId);

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId);
      }, 2000);
    } else {
      // Stop typing if text is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      stopTyping(conversationId);
    }
  }, [conversationId, isConnected, startTyping, stopTyping, isUserTyping, isKeyboardVisible, inputAreaPosition]);


  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;

    // Use the timestamp provided by backend (already formatted)
    const time = item.timestamp || 'No time';

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage
            ? [styles.myMessageBubble, { backgroundColor: primary }]
            : [styles.otherMessageBubble, { backgroundColor: accent }]
        ]}>
          {!isMyMessage && (
            <ThemedText style={styles.senderName}>{item.senderName}</ThemedText>
          )}
          <ThemedText style={[
            styles.messageText,
            { color: isMyMessage ? 'white' : textColor }
          ]}>
            {item.content}
          </ThemedText>
          <ThemedText style={[
            styles.messageTime,
            { color: isMyMessage ? 'rgba(255,255,255,0.7)' : `${textColor}70` }
          ]}>
            {time}
          </ThemedText>
        </View>
      </View>
    );
  };

  // Get typing users for this conversation
  const typingUsers = getTypingUsersForConversation(conversationId || '');
  const isOtherUserOnline = isUserOnline(memberId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <ThemedText style={styles.loadingText}>Loading chat...</ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backArrow}>‹</ThemedText>
          </TouchableOpacity>

          {/* Profile Picture */}
          <View style={styles.profilePicContainer}>
            <View style={[styles.profilePicBackground, { backgroundColor: accent }]}>
              <IconSymbol name="person.fill" size={24} color="white" />
            </View>
            {memberImage && (
              <Image
                source={{ uri: memberImage }}
                style={styles.profilePic}
              />
            )}
          </View>

          <View style={styles.headerInfo}>
            <ThemedText type="subtitle" style={styles.headerName}>
              {memberName}
            </ThemedText>
            <ThemedText style={styles.statusText}>
              {connectionState === 'connected'
                ? (isOtherUserOnline ? 'Online' : 'Offline')
                : connectionState === 'connecting'
                ? 'Connecting...'
                : 'Offline'
              }
            </ThemedText>
          </View>

          {/* Connection status indicator */}
          {connectionState !== 'connected' && (
            <TouchableOpacity onPress={reconnect} style={styles.connectionButton}>
              <IconSymbol
                name={connectionState === 'connecting' ? 'arrow.clockwise' : 'wifi.slash'}
                size={20}
                color={textColor}
              />
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          inverted
        />

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Animated.View
            style={[
              styles.typingContainer,
              {
                transform: [{ translateY: typingIndicatorPosition }]
              }
            ]}
          >
            <ThemedText style={styles.typingText}>
              {typingUsers[0].userName} is typing...
            </ThemedText>
          </Animated.View>
        )}

        {/* Input Area */}
        <Animated.View
          style={{
            transform: [{ translateY: inputAreaPosition }]
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <ThemedView style={[styles.inputContainer, { backgroundColor: accent }]}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.textInput, { color: textColor }]}
                  placeholder="Type a message..."
                  placeholderTextColor={`${textColor}80`}
                  value={messageText}
                  onChangeText={handleTextChange}
                  multiline
                  maxLength={1000}
                  editable={true}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: primary,
                      opacity: (messageText.trim() && !isSending) ? 1 : 0.5
                    }
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  activeOpacity={0.7}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <IconSymbol name="paperplane.fill" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </ThemedView>
          </KeyboardAvoidingView>
        </Animated.View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.0)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profilePicContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    position: 'relative',
  },
  profilePicBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  connectionButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});