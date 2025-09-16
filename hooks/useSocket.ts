import { useEffect, useRef, useState } from 'react';
import socketService from '../services/socketService';

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

interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
}

interface OnlineUser {
  userId: string;
  name: string;
  profilePic?: string;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [socketError, setSocketError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    // Don't auto-connect, wait for explicit connect call

    // Event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionState('connected');
      setSocketError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionState('disconnected');
    };

    const handleConnectionError = (error: any) => {
      setIsConnected(false);
      setConnectionState('disconnected');
      setSocketError(error?.message || 'Connection error');
    };

    const handleReceiveMessage = (message: Message) => {
      setNewMessage(message);
      // Clear the message after a short delay to allow components to process it
      setTimeout(() => setNewMessage(null), 100);
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user =>
          !(user.userId === data.userId && user.conversationId === data.conversationId)
        );

        if (data.isTyping) {
          // Clear existing timeout for this user
          const timeoutKey = `${data.userId}_${data.conversationId}`;
          if (typingTimeoutRef.current[timeoutKey]) {
            clearTimeout(typingTimeoutRef.current[timeoutKey]);
          }

          // Set new timeout to auto-remove typing indicator after 3 seconds
          typingTimeoutRef.current[timeoutKey] = setTimeout(() => {
            setTypingUsers(prev => prev.filter(user =>
              !(user.userId === data.userId && user.conversationId === data.conversationId)
            ));
            delete typingTimeoutRef.current[timeoutKey];
          }, 3000);

          return [...filtered, data];
        }

        return filtered;
      });
    };

    const handleUserOnline = (user: OnlineUser) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.userId !== user.userId);
        return [...filtered, user];
      });
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleSocketError = (error: any) => {
      setSocketError(error?.message || 'Socket error');
    };

    // Register event listeners
    socketService.on('connected', handleConnected);
    socketService.on('disconnected', handleDisconnected);
    socketService.on('connection_error', handleConnectionError);
    socketService.on('receive_message', handleReceiveMessage);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_online', handleUserOnline);
    socketService.on('user_offline', handleUserOffline);
    socketService.on('socket_error', handleSocketError);

    // Cleanup function
    return () => {
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });

      // Remove event listeners
      socketService.off('connected', handleConnected);
      socketService.off('disconnected', handleDisconnected);
      socketService.off('connection_error', handleConnectionError);
      socketService.off('receive_message', handleReceiveMessage);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_online', handleUserOnline);
      socketService.off('user_offline', handleUserOffline);
      socketService.off('socket_error', handleSocketError);
    };
  }, []);

  // Socket action methods
  const joinConversation = (conversationId: string) => {
    socketService.joinConversation(conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketService.leaveConversation(conversationId);
  };

  const sendMessage = (conversationId: string, content: string) => {
    socketService.sendMessage(conversationId, content);
  };

  const startTyping = (conversationId: string) => {
    socketService.startTyping(conversationId);
  };

  const stopTyping = (conversationId: string) => {
    socketService.stopTyping(conversationId);
  };

  const markMessagesAsRead = (conversationId: string) => {
    socketService.markMessagesAsRead(conversationId);
  };

  const connect = async () => {
    try {
      setConnectionState('connecting');
      setSocketError(null);
      await socketService.connect();
    } catch (error) {
      console.error('Failed to connect socket:', error);
      setSocketError(error instanceof Error ? error.message : 'Connection failed');
      setConnectionState('disconnected');
      throw error;
    }
  };

  const reconnect = async () => {
    try {
      setConnectionState('connecting');
      setSocketError(null);
      await socketService.connect();
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setSocketError(error instanceof Error ? error.message : 'Reconnection failed');
      setConnectionState('disconnected');
    }
  };

  return {
    // Connection state
    isConnected,
    connectionState,
    socketError,

    // Data
    newMessage,
    typingUsers,
    onlineUsers,

    // Actions
    connect,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    reconnect,

    // Helper methods
    getTypingUsersForConversation: (conversationId: string) =>
      typingUsers.filter(user => user.conversationId === conversationId),

    isUserOnline: (userId: string) =>
      onlineUsers.some(user => user.userId === userId),
  };
};

export default useSocket;