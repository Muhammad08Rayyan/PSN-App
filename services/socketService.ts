import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/api-config';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  // Event listeners
  private eventListeners: { [key: string]: Function[] } = {};

  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem('userToken'); // Fixed: use 'userToken' not 'token'
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Extract server URL from API_BASE_URL (remove /api suffix)
      const serverUrl = API_BASE_URL.replace('/api', '');

      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.setupEventListeners();
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      console.log('Socket connection initiated');
    } catch (error) {
      this.isConnecting = false;
      console.error('Socket connection error:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.reconnectAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('disconnected', reason);

      // Auto-reconnect logic
      if (reason === 'io server disconnect') {
        // Server disconnected, don't auto-reconnect
        return;
      }

      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('connection_error', error);
      this.handleReconnect();
    });

    // Chat-specific events
    this.socket.on('receive_message', (message) => {
      console.log('Message received:', message);
      this.emit('receive_message', message);
    });

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });

    this.socket.on('user_joined_conversation', (data) => {
      this.emit('user_joined_conversation', data);
    });

    this.socket.on('user_left_conversation', (data) => {
      this.emit('user_left_conversation', data);
    });

    this.socket.on('messages_read', (data) => {
      this.emit('messages_read', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('socket_error', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.socket?.connected) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners = {};
    console.log('Socket disconnected manually');
  }

  // Chat methods
  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendMessage(conversationId: string, content: string): void {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        conversationId,
        content,
      });
    } else {
      console.error('Socket not connected, cannot send message');
      this.emit('send_message_failed', { conversationId, content });
    }
  }

  startTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  markMessagesAsRead(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_messages_read', { conversationId });
    }
  }

  // Event handling methods
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners[event]) return;

    if (callback) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (listener) => listener !== callback
      );
    } else {
      delete this.eventListeners[event];
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionState(): string {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;